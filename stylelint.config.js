// @ts-check

/** @type {import('stylelint').Config} */
export default {
  plugins: ["stylelint-no-unsupported-browser-features"],
  extends: ["stylelint-config-standard"],
  rules: {
    "plugin/no-unsupported-browser-features": [true, { ignore: ["css-clip-path"] }],
  },
  overrides: [
    {
      files: ["**/*.svelte"],
      customSyntax: "postcss-html",
      rules: {
        "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global"] }],
      },
    },
  ],
};
