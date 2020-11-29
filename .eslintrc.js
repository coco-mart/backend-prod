module.exports = {
    extends: "airbnb-base",
    plugins: ["import"],
    parser: "babel-eslint",
    rules: {
        indent: ["error", 4],
        quotes: ["warn", "double"],
    },
    ignorePatterns: ["temp.js", "**/models/*.js"],
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 6,
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
        },
    },
};
