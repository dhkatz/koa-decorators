const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: 'node',
  target: 'node14',
  plugins: [nodeExternalsPlugin()],
}).catch(console.error)
