import vertexShaderSource from './board.vert';
import fragmentShaderSource from './board.frag';
import { color, createWebGLProgram, points } from './util';
import type { Game } from '../../../../functions/src/types';

export class BoardGraphics {
	private readonly gl: WebGL2RenderingContext;

	private readonly resizeObserver = new ResizeObserver((entries) => {
		const size = entries[0].devicePixelContentBoxSize[0];

		requestAnimationFrame(() => {
			this.canvas.width = size.inlineSize;
			this.canvas.height = size.blockSize;

			this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

			this.render();

			this.pickBufferResolutionNeedsUpdating = true;
		});
	});

	private readonly prefersLightMode = window.matchMedia('(prefers-color-scheme: light)');
	private readonly onColorChange = () => {
		this.updateColors();
		requestAnimationFrame(() => this.render());
	};

	private readonly vertexBuffer: WebGLBuffer;
	private hexagons!: number;

	private readonly colorAttribute: number;
	private readonly colorBuffer: WebGLBuffer;

	private pickBufferResolutionNeedsUpdating = true;
	private pickBufferColorsNeedUpdating = true;
	private readonly pickColorBuffer: WebGLBuffer;
	private readonly pickFrameBuffer: WebGLFramebuffer;
	private readonly pickTexture: WebGLTexture;

	constructor(private readonly canvas: HTMLCanvasElement) {
		const webGlContext = this.canvas.getContext('webgl2');

		if (webGlContext != null) {
			this.gl = webGlContext;
		} else {
			throw new Error('unable to create WebGL context');
		}

		this.gl.clearColor(0, 0, 0, 0);

		const program = createWebGLProgram(this.gl, vertexShaderSource, fragmentShaderSource);
		this.gl.useProgram(program);

		this.vertexBuffer = this.gl.createBuffer() as WebGLBuffer;
		const positionAttribute = this.gl.getAttribLocation(program, 'aPosition');
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.vertexAttribPointer(positionAttribute, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(positionAttribute);

		this.colorBuffer = this.gl.createBuffer() as WebGLBuffer;
		this.colorAttribute = this.gl.getAttribLocation(program, 'aColor');
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.vertexAttribPointer(this.colorAttribute, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.colorAttribute);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		this.pickColorBuffer = this.gl.createBuffer() as WebGLBuffer;

		this.pickFrameBuffer = this.gl.createFramebuffer() as WebGLFramebuffer;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pickFrameBuffer);
		this.pickTexture = this.gl.createTexture() as WebGLTexture;
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pickTexture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			1,
			1,
			0,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			null
		);
		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			this.pickTexture,
			0
		);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

		this.resizeObserver.observe(this.canvas);
		this.prefersLightMode.addEventListener('change', this.onColorChange);
	}

	public destroy() {
		this.resizeObserver.unobserve(this.canvas);
		this.prefersLightMode.removeEventListener('change', this.onColorChange);
	}

	private game!: Game;
	private user!: number;
	setGame(game: Game, user: number) {
		if (this.game?.board.length != game.board.length) {
			this.pickBufferColorsNeedUpdating = true;
		}

		this.game = game;
		this.user = user;

		if (
			(game.board.length + game.board.filter((cell) => cell.tower).length) * 16 + 4 * 32 !=
			this.hexagons
		) {
			this.updateSize();
		}

		this.updateColors();

		requestAnimationFrame(() => this.render());
	}

	private selected: number[] = [];
	setSelected(selected: number[]) {
		this.selected = selected;

		const selectionVertexes = getSelectionVertexes(7 + this.game.players.length, this.selected);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 4 * (this.hexagons - 4 * 32), selectionVertexes);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		requestAnimationFrame(() => this.render());
	}

	private updateSize() {
		const towers = this.game.board.flatMap((cell, i) => (cell.tower ? i : []));
		const vertexes = getVertexes(7 + this.game.players.length, towers);

		const selectionVertexes = getSelectionVertexes(7 + this.game.players.length, this.selected);
		vertexes.set(selectionVertexes, vertexes.length - 4 * 32);

		this.hexagons = vertexes.length;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexes, this.gl.DYNAMIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	private updateColors() {
		const colors = getColors(this.game, this.user);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.DYNAMIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	private render = () => {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.hexagons / 2);
	};

	private resizePickTexture() {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pickTexture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			this.canvas.width,
			this.canvas.height,
			0,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			null
		);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}

	private updatePickColors() {
		const pickColors = getPickColors(this.game);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pickColorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, pickColors, this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	private renderPickBuffer() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pickColorBuffer);
		this.gl.vertexAttribPointer(this.colorAttribute, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pickFrameBuffer);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 8 * this.game.board.length);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.vertexAttribPointer(this.colorAttribute, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	public getClickedCell({ offsetX, offsetY }: MouseEvent): number | undefined {
		if (this.pickBufferResolutionNeedsUpdating) {
			this.resizePickTexture();
		}
		if (this.pickBufferColorsNeedUpdating) {
			this.updatePickColors();
		}
		if (this.pickBufferResolutionNeedsUpdating || this.pickBufferColorsNeedUpdating) {
			this.renderPickBuffer();
			this.pickBufferResolutionNeedsUpdating = false;
			this.pickBufferColorsNeedUpdating = false;
		}

		const pixel = new Uint8Array(4);

		this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.pickFrameBuffer);

		this.gl.readPixels(
			(offsetX / this.canvas.clientWidth) * this.canvas.width,
			(1 - offsetY / this.canvas.clientHeight) * this.canvas.height,
			1,
			1,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			pixel
		);

		this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);

		if (pixel[3] == 0) {
			return undefined;
		}

		return (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];
	}
}

const halfSqrt3 = Math.sqrt(3) / 2;

const hexagon = points(
	[0, 1],
	[0, 1],
	[-halfSqrt3, 0.5],
	[halfSqrt3, 0.5],
	[-halfSqrt3, -0.5],
	[halfSqrt3, -0.5],
	[0, -1],
	[0, -1]
);

const layoutCache = new Map<number, Float32Array>();

function getLayout(size: number): Float32Array {
	const cached = layoutCache.get(size);
	if (cached != null) {
		return cached;
	}

	const locations: [number, number][] = [];

	const rows = size * 2 - 1;
	const rowOffset = (rows - 1) / 2;

	const horizontalSpacing = (1 / rows) * 2;
	const verticalSpacing = (-0.75 / halfSqrt3 / rows) * 2;

	for (let row = 0; row < rows; row++) {
		const columns = rows - Math.abs(size - (row + 1));
		const columnOffset = (columns - 1) / 2;

		for (let column = 0; column < columns; column++) {
			locations.push([
				(column - columnOffset) * horizontalSpacing,
				(row - rowOffset) * verticalSpacing
			]);
		}
	}

	const layout = points(...locations);
	layoutCache.set(size, layout);
	return layout;
}

function getVertexes(size: number, towers: number[]): Float32Array {
	const layout = getLayout(size);

	const scale = 1 / (size * 2 - 1);

	const vertexes = new Float32Array(8 * layout.length + 16 * towers.length + 32 * 4);
	let top = 0;

	function drawHexagon(location: number, scale: number) {
		for (let i = 0; i < 16; i++) {
			vertexes[top++] = hexagon[i] * scale + layout[location * 2 + (i % 2)];
		}
	}

	for (let i = 0; i < layout.length / 2; i++) {
		drawHexagon(i, scale);
	}

	for (const tower of towers) {
		drawHexagon(tower, scale * 0.5);
	}

	return vertexes;
}

function getSelectionVertexes(size: number, selected: number[]) {
	const vertexes = new Float32Array(32 * 4);
	let top = 0;

	if (selected.length == 0) {
		return vertexes;
	}

	const layout = getLayout(size);

	const outerScale = 1 / (size * 2 - 1);
	const innerScale = outerScale * (1 - 1 / 6);

	function plotPoint(location: number, scale: number, vertex: number) {
		vertexes[top++] = hexagon[vertex * 2] * scale + layout[location * 2];
		vertexes[top++] = hexagon[vertex * 2 + 1] * scale + layout[location * 2 + 1];
	}

	for (const selection of selected) {
		plotPoint(selection, outerScale, 1);
		for (const vertex of [1, 3, 5, 6, 4, 2, 1]) {
			plotPoint(selection, outerScale, vertex);
			plotPoint(selection, innerScale, vertex);
		}
		plotPoint(selection, innerScale, 1);
	}

	return vertexes;
}

function getColors({ board, players }: Game, user: number): Float32Array {
	const styleMap = document.documentElement.computedStyleMap();

	const playerColors = players.map((player) => color(styleMap.get(`--${player.color}-container`)));
	const emptyColor = color(styleMap.get('--md-sys-color-surface-container'));
	const towerColor = color(styleMap.get('--md-sys-color-on-surface'));

	const towers = board.filter((cell) => cell.tower);

	const colors = new Float32Array(3 * 8 * (board.length + towers.length) + 3 * 16 * 4);

	for (const [i, cell] of board.entries()) {
		for (let j = 0; j < 8; j++) {
			colors.set(cell.tower ? towerColor : playerColors[cell.owner] ?? emptyColor, (i * 8 + j) * 3);
		}
	}

	for (const [i, cell] of towers.entries()) {
		for (let j = 0; j < 8; j++) {
			colors.set(playerColors[cell.owner] ?? towerColor, ((board.length + i) * 8 + j) * 3);
		}
	}

	for (let i = 0; i < 16 * 4; i++) {
		colors.set(playerColors[user], ((board.length + towers.length) * 8 + i) * 3);
	}

	return colors;
}

function getPickColors({ board }: Game) {
	const colors = new Float32Array(3 * 8 * board.length);

	const currentColor = new Float32Array(3);

	for (let i = 0; i < board.length; i++) {
		currentColor.set([((i >> 16) & 0xff) / 0xff, ((i >> 8) & 0xff) / 0xff, (i & 0xff) / 0xff]);

		for (let j = 0; j < 8; j++) {
			colors.set(currentColor, (i * 8 + j) * 3);
		}
	}

	return colors;
}
