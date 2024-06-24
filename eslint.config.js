import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  jsdoc.configs["flat/recommended-typescript-flavor"],
  {
    rules: {
      "jsdoc/require-param-description": "off",
      "jsdoc/require-property-description": "off",
      "jsdoc/require-returns-description": "off",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
];
