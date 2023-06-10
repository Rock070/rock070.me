// .eslintrc.js
process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  extends: '@antfu',
  ignorePatterns: [
    '!.*',
    'node_modules',
    'dist',
    'public',
    'coverage',
    '.nuxt',
    'content/**/*.md',
  ],
}
