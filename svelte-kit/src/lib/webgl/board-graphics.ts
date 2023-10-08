import vertexShaderSource from './board.vert';
import fragmentShaderSource from './board.frag';
import { createWebGLProgram, points } from './util';
import type { Color, Game } from '../../../../functions/src/types';

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

	private readonly vertexBuffer: WebGLBuffer;
	private hexagons!: number;

	private readonly colorBuffer: WebGLBuffer;

	constructor(private readonly canvas: HTMLCanvasElement, game: Game) {
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
	}

	public destroy() {
		this.resizeObserver.unobserve(this.canvas);
	}

	set game(game: Game) {
		if (game.board.length != this.hexagons) {
			this.updateSize(game);
		}

		const colors = getColors(game);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}

	private updateSize(game: Game) {
		const vertexes = getVertexes(7 + game.players.length);

		this.hexagons = vertexes.length;

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexes, this.gl.STATIC_DRAW);
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
	const verticalSpacing = (0.75 / halfSqrt3 / rows) * 2;

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

function getVertexes(size: number): Float32Array {
	const layout = getLayout(size);

	const scale = 1 / (size * 2 - 1);

	const vertexes = new Float32Array(8 * layout.length);

	for (let i = 0; i < vertexes.length; i++) {
		vertexes[i] = hexagon[i % 16] * scale + layout[(i >> 4) * 2 + (i % 2)];
	}

	return vertexes;
}

const colorNames: { readonly [color in Color]: Float32Array } = {
	red: new Float32Array([1, 0, 0]),
	orange: new Float32Array([1, 0.5, 0]),
	yellow: new Float32Array([1, 1, 0]),
	green: new Float32Array([0, 1, 0]),
	blue: new Float32Array([0, 0, 1]),
	purple: new Float32Array([0.5, 0, 1])
};

function getColors({ board, players }: Game): Float32Array {
	const playerColors = players.map(({ color }) => colorNames[color]);
	const grey = new Float32Array([0.1, 0.1, 0.1]);

	const colors = new Float32Array(3 * 8 * board.length);

	for (const [i, cell] of board.entries()) {
		for (let j = 0; j < 8; j++) {
			colors.set(playerColors[cell.owner] ?? grey, (i * 8 + j) * 3);
		}
	}

	console.log(colors);

	return colors;
}
