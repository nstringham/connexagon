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
	...ts.configs.recommendedTypeChecked,
	...svelte.configs["flat/recommended"],
	prettier,
	...svelte.configs["flat/prettier"],
	{
		rules: {
			"svelte/block-lang": ["error", { script: ["ts"] }],
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				extraFileExtensions: [".svelte"],
				projectService: { allowDefaultProject: ["*.config.js"] },
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["**/*.svelte"],

		languageOptions: {
			parserOptions: {
				parser: ts.parser,
			},
		},

		rules: {
			// incompatible with svelte's generic props
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",

			// not consistent in svelte files
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unnecessary-condition": "off",
		},
	},
);
