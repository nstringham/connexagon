// @ts-check
import prettier from "eslint-config-prettier";
import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";
const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    rules: {
      curly: "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-definitions": ["off"],
      "@typescript-eslint/consistent-indexed-object-style": ["error", "index-signature"],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: true },
      ],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "svelte/block-lang": ["error", { script: ["ts"] }],
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: { allowDefaultProject: ["*.config.js"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.svelte"],

    extends: [ts.configs.disableTypeChecked],

    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  { ignores: ["src/lib/database-types.ts"] },
);
