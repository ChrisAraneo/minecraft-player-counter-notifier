// @ts-nocheck
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:jsonc/recommended-with-jsonc',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    overrides: [
        {
            files: ['*.json'],
            parser: 'jsonc-eslint-parser',
        },
    ],
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': [
            'error',
            { ignoreParameters: true, ignoreProperties: true },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            { accessibility: 'no-public' },
        ],
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/method-signature-style': 'error',
        'jsonc/sort-keys': 'error',
    },
};
