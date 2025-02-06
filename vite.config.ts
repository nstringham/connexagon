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
  const maxNumberOfPlayers = 7;
  const maxTriangleSize = (7 + maxNumberOfPlayers) * 2 - 1;
  let total = 0;
  for (let i = 0; i <= maxTriangleSize; i++) {
    total += i;
    yield total;
  }
}
