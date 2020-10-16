module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        '@ecomfe/eslint-config/typescript'
    ],
    rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        'comma-dangle': 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error'
    }
};
