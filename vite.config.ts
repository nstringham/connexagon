import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import virtual from "vite-plugin-virtual";

export default defineConfig({
	plugins: [
		sveltekit(),
		virtual({
			"virtual:triangle-numbers": [...getTriangleNumbers()],
		}),
	],

	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
});

function* getTriangleNumbers() {
	let total = 0;
	for (let i = 0; i < 7 + 7; i++) {
		total += i;
		yield total;
	}
}
