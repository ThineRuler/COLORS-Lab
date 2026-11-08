import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.commonjs,
      },
    },
    rules: {
      "no-unused-vars": ["error", { vars: "local" }],
    },
  },
];
