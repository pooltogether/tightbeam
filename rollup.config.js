import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  external: [
    'apollo-client',
    'apollo-cache-inmemory',
    'graphql-tag',
    'ethers',
    'date-fns',
    'lodash'
  ],
  plugins: [
    typescript()
  ]
}
