const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')
const { copy } = require('esbuild-plugin-copy')

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: 'node',
  target: 'node14',
  plugins: [
    copy({
      assets: {
        from: './assets/*',
        to: ['./dist']
      }
    }),
    nodeExternalsPlugin()
  ],
}).catch(() => process.exit(1))
