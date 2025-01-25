export const halfSqrt3 = Math.sqrt(3) / 2;

export type Point = [number, number];

export function getSize(area: number): number {
	return 0.5 + Math.sqrt(12 * area - 3) / 6;
}

export function getLayout(size: number): Point[] {
	const layout: Point[] = [];

	console.log("here");

	const rows = size * 2 - 1;
	const rowOffset = (rows - 1) / 2;

	const horizontalSpacing = 2 / rows;
	const verticalSpacing = 0.75 * (horizontalSpacing / halfSqrt3);

	for (let row = 0; row < rows; row++) {
		const columns = rows - Math.abs(row - (size - 1));
		const columnOffset = (columns - 1) / 2;

		for (let column = 0; column < columns; column++) {
			layout.push([
				(column - columnOffset) * horizontalSpacing,
				(row - rowOffset) * verticalSpacing,
			]);
		}
	}

	return layout;
}
