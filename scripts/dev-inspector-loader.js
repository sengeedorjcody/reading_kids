/**
 * Webpack loader that injects data-inspector-* attributes into JSX elements.
 * Runs before SWC so SWC still handles actual compilation.
 * Only active in development — no-ops in production.
 */
const babel = require('@babel/core')
const inspectorPlugin = require('@react-dev-inspector/babel-plugin').default

module.exports = function devInspectorLoader(source) {
  if (process.env.NODE_ENV !== 'development') return source

  try {
    const result = babel.transformSync(source, {
      filename: this.resourcePath,
      plugins: [inspectorPlugin],
      // Enable JSX + TS parsing without any transpilation presets
      parserOpts: { plugins: ['jsx', 'typescript'] },
      // Keep original formatting as much as possible
      generatorOpts: { retainLines: true, compact: false },
      configFile: false,
      babelrc: false,
      sourceMaps: 'inline',
    })
    return result?.code ?? source
  } catch {
    // If the file can't be parsed (e.g. plain .ts without JSX), pass through untouched
    return source
  }
}
