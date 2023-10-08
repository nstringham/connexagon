/* because a bunch of webGL stuff says it's nullable but never actually is */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function createWebGLProgram(
	gl: WebGLRenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string
) {
	const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(vertexShader)!);
	}

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(fragmentShader)!);
	}

	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program)!);
	}

	return program;
}

export function points(...points: [number, number][]): Float32Array {
	const array = new Float32Array(points.length * 2);
	for (let i = 0; i < array.length / 2; i++) {
		array.set(points[i], i * 2);
	}
	return array;
}

export function color(hex: string | CSSStyleValue | undefined): Float32Array {
	const match = /#(\w{2})(\w{2})(\w{2})/.exec(String(hex));
	if (match == null) {
		throw new Error(`invalid color ${hex}`);
	}
	return new Float32Array(match.slice(1).map((channel) => parseInt(channel, 16) / 256));
}
