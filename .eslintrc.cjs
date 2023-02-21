const fs = require("fs/promises");
const path = require("path");

const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": "latest",
    "sourceType": "module",
    tsconfigRootDir: __dirname // <-- this did the trick for me
  },
  "plugins": [
    "@typescript-eslint",
    "prettier",
    "import",
    "unicorn"
  ],
  "root": true,
  "extends": [
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "settings": {
    "import/resolver": {
      "typescript": true,
      "node": true
    }
  },
  "rules": {
    "unicorn/prefer-node-protocol": "error",
    "unicorn/prefer-module": "error",
    "@typescript-eslint/no-var-requires": "off",
    "prettier/prettier": [
      "error",
      {
        "quoteProps": "consistent",
        "arrowParens": "always",
        "singleQuote": true,
        "trailingComma": "es5",
        "semi": false,
        "bracketSpacing": true
      }
    ],
    "import/newline-after-import": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ],
    "arrow-body-style": [
      "error",
      "always"
    ],
    "func-style": [
      "error"
    ],
    "array-callback-return": "error",
    "getter-return": "error",
    "no-await-in-loop": "error",
    "no-const-assign": "error",
    "no-duplicate-imports": "error",
    "no-irregular-whitespace": "error",
    "no-multiple-empty-lines": "error",
    "no-misleading-character-class": "error",
    "no-self-assign": "error",
    "no-self-compare": "error",
    "no-unexpected-multiline": "error",
    "no-unsafe-optional-chaining": "error",
    "no-useless-catch": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "no-use-before-define": "error",
    "require-await": "error",
    "require-atomic-updates": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
    "no-unreachable": "error",
    "no-unmodified-loop-condition": "error",
    "camelcase": "error",
    "consistent-return": "error",
    "complexity": "error",
    "consistent-this": "error",
    "curly": "error",
    "default-case": "error",
    "default-case-last": "error",
    "default-param-last": "error",
    "func-name-matching": "error",
    "id-length": "error",
    "max-depth": "error",
    "no-else-return": "error",
    "no-eq-null": "error",
    "no-confusing-arrow": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-extra-semi": "error",
    "no-implicit-coercion": "error",
    "no-inline-comments": "error",
    "no-invalid-this": "error",
    "no-lonely-if": "error",
    "no-loop-func": "error",
    "no-multi-str": "error",
    "no-nested-ternary": "error",
    "no-new-func": "error",
    "no-return-assign": "error",
    "no-unneeded-ternary": "error",
    "no-var": "error",
    "no-with": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-numeric-literals": "error",
    "spaced-comment": "error",
    "yoda": "error",
    "arrow-parens": "error",
    "arrow-spacing": "error",
    "block-spacing": "error",
    "comma-style": "error",
    "linebreak-style": "error",
    "no-mixed-spaces-and-tabs": "error",
    "padding-line-between-statements": "error",
    "space-before-blocks": "error",
    "template-curly-spacing": "error",
    "template-tag-spacing": "error",
    "max-params": "warn",
    "max-statements": "warn",
    "prefer-destructuring": "warn",
    "prefer-template": "warn",
    "prefer-object-spread": "warn",
    "no-console": "warn",
    "no-debugger": "warn",
    "class-methods-use-this": "warn",
    "max-lines-per-function": "warn",
    "no-continue": "warn"
  }
};

module.exports = config;
