const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')
const inlineImportPlugin = require('esbuild-plugin-inline-import');

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: 'node',
  target: 'node14',
  plugins: [inlineImportPlugin(), nodeExternalsPlugin()],
}).catch(() => process.exit(1))
