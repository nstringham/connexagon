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
		});
	});

	private readonly prefersLightMode = window.matchMedia('(prefers-color-scheme: light)');
	private readonly onColorChange = () => {
		this.updateColors();
		requestAnimationFrame(() => this.render());
	};

	private readonly vertexBuffer: WebGLBuffer;
	private hexagons!: number;

	private readonly colorBuffer: WebGLBuffer;

	constructor(private readonly canvas: HTMLCanvasElement) {
		const webGlContext = this.canvas.getContext('webgl2');

		if (webGlContext != null) {
			this.gl = webGlContext;
		} else {
			throw new Error('unable to create WebGL context');
		}

		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.clearColor(0, 0, 0, 0);

		const program = createWebGLProgram(this.gl, vertexShaderSource, fragmentShaderSource);
		this.gl.useProgram(program);

		this.vertexBuffer = this.gl.createBuffer() as WebGLBuffer;
		const aPosition = this.gl.getAttribLocation(program, 'aPosition');
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(aPosition);

		this.colorBuffer = this.gl.createBuffer() as WebGLBuffer;
		const aColor = this.gl.getAttribLocation(program, 'aColor');
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.vertexAttribPointer(aColor, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(aColor);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

		this.resizeObserver.observe(this.canvas);
		this.prefersLightMode.addEventListener('change', this.onColorChange);
	}

	public destroy() {
		this.resizeObserver.unobserve(this.canvas);
		this.prefersLightMode.removeEventListener('change', this.onColorChange);
	}

	#game!: Game;
	set game(game: Game) {
		this.#game = game;

		if (game.board.length + game.board.filter((cell) => cell.tower).length != this.hexagons) {
			this.updateSize();
		}

		this.updateColors();

		requestAnimationFrame(() => this.render());
	}

	private updateSize() {
		const towers = this.#game.board.flatMap((cell, i) => (cell.tower ? i : []));
		const vertexes = getVertexes(7 + this.#game.players.length, towers);

		this.hexagons = vertexes.length;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexes, this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	updateColors() {
		const colors = getColors(this.#game);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	private render = () => {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 8 * this.hexagons);
	};
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

	const vertexes = new Float32Array(8 * layout.length + 16 * towers.length);
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

function getColors({ board, players }: Game): Float32Array {
	const styleMap = document.documentElement.computedStyleMap();

	const playerColors = players.map((player) => color(styleMap.get(`--${player.color}-container`)));
	const emptyColor = color(styleMap.get('--md-sys-color-surface-container'));
	const towerColor = color(styleMap.get('--md-sys-color-on-surface'));

	const towers = board.filter((cell) => cell.tower);

	const colors = new Float32Array(3 * 8 * (board.length + towers.length));

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

	return colors;
}
