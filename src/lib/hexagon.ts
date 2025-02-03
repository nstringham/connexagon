export const halfSqrt3 = Math.sqrt(3) / 2;

export function round(n: number, fractionDigits = 5) {
	return Number(n.toFixed(fractionDigits));
}

/** creates an SVG path for a hexagon circumscribed inside of a circle with a given radius */
export function getHexagonSvgPath(radius: number) {
	/*
	 *              ⎽⎼⎻⎺|⎺⎻⎼⎽
	 *          ⎽⎼⎻⎺    |    ⎺⎻⎼⎽ l
	 *      ⎽⎼⎻⎺      lx|        ⎺⎻⎼⎽
	 *  ⎽⎼⎻⎺            |     ly     ⎺⎻⎼⎽
	 * |                ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
	 * |                                |
	 * |                                |
	 * |                               v|
	 * |                                |
	 * |                                |
	 * |                                |
	 * |                                |
	 *  ⎺⎻⎼⎽                         ⎽⎼⎻⎺
	 *      ⎺⎻⎼⎽                 ⎽⎼⎻⎺
	 *          ⎺⎻⎼⎽         ⎽⎼⎻⎺
	 *              ⎺⎻⎼⎽_⎽⎼⎻⎺
	 */

	/** the side length of the hexagon */
	const v = round(radius);

	/** the x component of the sloped line l */
	const lx = round(radius / 2);

	/** the y component of the sloped line l */
	const ly = round(radius * halfSqrt3);

	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- safe because numbers are rounded
	return `m0,${v}l${ly},-${lx}v-${v}l-${ly},-${lx}l-${ly},${lx}v${v}z`;
}
