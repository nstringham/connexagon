import { halfSqrt3, round } from "./hexagon";

export type Point = [number, number];

export function getSize(area: number): number {
	return 0.5 + Math.sqrt(12 * area - 3) / 6;
}

export function getLayout(size: number): Point[] {
	const layout: Point[] = [];

	const rows = size * 2 - 1;
	const rowOffset = (rows - 1) / 2;

	const horizontalSpacing = 2 * halfSqrt3;
	const verticalSpacing = 1.5;

	for (let row = 0; row < rows; row++) {
		const columns = rows - Math.abs(row - (size - 1));
		const columnOffset = (columns - 1) / 2;

		for (let column = 0; column < columns; column++) {
			layout.push([
				round((column - columnOffset) * horizontalSpacing),
				(row - rowOffset) * verticalSpacing,
			]);
		}
	}

	return layout;
}
