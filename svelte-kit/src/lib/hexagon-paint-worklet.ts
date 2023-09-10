type Size = { height: number; width: number };

interface PaintWorklet {
	paint(ctx: CanvasRenderingContext2D, size: Size, styleMap: { [key: string]: unknown }): void;
}

interface PaintWorkletConstructor {
	new (): PaintWorklet;
	readonly inputProperties?: string[];
	readonly inputArguments?: string[];
	readonly contextOptions?: { alpha: boolean };
}

declare function registerPaint(name: string, painter: PaintWorkletConstructor): void;

const sqrt3 = Math.sqrt(3);

class HexagonPaintWorklet implements PaintWorklet {
	paint(ctx: CanvasRenderingContext2D, { width, height }: Size): void {
		const inset = height / 2 / sqrt3;
		ctx.moveTo(0, height / 2);
		ctx.lineTo(inset, 0);
		ctx.lineTo(width - inset, 0);
		ctx.lineTo(width, height / 2);
		ctx.lineTo(width - inset, height);
		ctx.lineTo(inset, height);
		ctx.closePath();
		ctx.fill();
	}
}

registerPaint('hexagon', HexagonPaintWorklet);
