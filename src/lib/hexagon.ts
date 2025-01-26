export const halfSqrt3 = Math.sqrt(3) / 2;

export function round(n: number, fractionDigits: number = 5) {
	return Number(n.toFixed(fractionDigits));
}

/** creates an SVG path for a hexagon circumscribed inside of a circle with a given radius */
export function getHexagonSvgPath(radius: number) {
	/** small vertical distance (the vertical distance from one of the top side points to the top point) */
	const sv = round(radius / 2);

	/** small vertical distance (the distance between 2 side points) */
	const lv = round(radius);

	/** the horizontal distance between a side point and the center line */
	const h = round(radius * halfSqrt3);

	return `m0,${lv}l${h},-${sv}v-${lv}l-${h},-${sv}l-${h},${sv}v${lv}z`;
}
