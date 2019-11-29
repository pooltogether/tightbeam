import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: '.',
    format: 'cjs',
  },
  preserveModules: true,
  external: [
    'apollo-client',
    'apollo-cache-inmemory',
    'graphql-tag',
    'graphql',
    'ethers',
    'ethers/providers',
    'ethers/utils/interface',
    'ethers/utils',
    'ethers/contract',
    'date-fns',
    'lodash',
    'zen-observable-ts'
  ],
  plugins: [
    typescript()
  ]
}
