module.exports = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  arrowParens: "always",
  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
        singleQuote: false,
        explicitTypes: "always",
        printWidth: 120
      }
    }
  ]
}
