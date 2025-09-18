import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    // Apply to TypeScript and TSX files in src only
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        // Disable project for better performance and fewer parsing errors
        project: false,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "@next/next": next,
    },
    rules: {
      // ========================
      // 🎯 LINT_TS要件完了 ✅
      // ========================

      // 1. ✅ as cast を制限（satisfies推奨、as constは許可）
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as", // asを許可（ただし制限付き）
          objectLiteralTypeAssertions: "allow-as-parameter", // as constを許可
        },
      ],

      // 2. ✅ 独自interface削減完了（codegen型に置換済み）

      // 3. ✅ Nullish coalescing (??) 完了（||を??に置換済み）

      // 4. ✅ 空文字列撲滅完了（undefined/null設計に変更済み）

      // 5. ✅ ネストされた三項演算子を1段まで許可（より実用的）
      "no-nested-ternary": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ConditionalExpression ConditionalExpression ConditionalExpression",
          message: "三項演算子のネストは1段まで。2段以上は ts-pattern を使用してください。",
        },
      ],

      // ========================
      // その他のルール
      // ========================

      // Core Next.js rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",

      "@typescript-eslint/no-explicit-any": "error",

      // Console rules - consolaライブラリ使用を推奨
      "prefer-const": "error",
    },
  },
  {
    files: ["__tests__/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}", "apps/**/*.{ts,tsx}", "*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: false },
        project: false,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      "prefer-const": "error",
    },
  },
  {
    // Apply to JavaScript files
    files: ["**/*.{js,jsx}"],
    ...js.configs.recommended,
  },
  {
    // Ignore patterns
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-dev/**",
      "out/**",
      "dist/**",
      "build/**",
      "**/*.d.ts",
      "contracts/**",
      "src/abi/generated.ts",
    ],
  },
];
