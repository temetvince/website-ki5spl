const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

/**
 * Webpack owns the bundle; `tsc` runs separately as a typecheck-only gate.
 *
 * The mode is taken from the CLI rather than hardcoded — `npm run build` passes
 * `--mode production` and `npm start` passes `--mode development`. Hardcoding it
 * is how a project ends up publishing an unminified bundle with its source maps
 * attached.
 */
module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',

    /* Inline source maps are a development convenience. Shipping them would
       publish the original source to every visitor. */
    devtool: isProduction ? false : 'inline-source-map',

    output: {
      path: path.resolve(__dirname, './dist'),
      /* The content hash lets a host cache the bundle indefinitely: the name
         changes whenever the contents do. `clean` is what stops previously
         hashed bundles from accumulating in `dist`. */
      filename:
        isProduction ? 'index_bundle.[contenthash].js' : 'index_bundle.js',
      assetModuleFilename: 'assets/[name].[contenthash][ext]',
      clean: true,
    },

    target: 'web',

    /* A real budget, not a silenced warning: exceeding it fails the build.
       Webpack's 244 KiB default counts uncompressed bytes, which no host
       serves. The entry bundle is ~319 KiB raw but ~88 KiB gzipped and ~75 KiB
       brotli, so the budget is set against raw size with modest headroom. React
       and react-dom account for about 250 KiB of it and the two data tables
       for most of the rest. Raise this only after measuring the compressed
       size, never to make a warning go away. */
    performance: {
      hints: isProduction ? 'error' : false,
      maxAssetSize: 360 * 1024,
      maxEntrypointSize: 360 * 1024,
    },

    devServer: {
      port: '3000',
      static: {
        directory: path.join(__dirname, 'public'),
      },
      open: true,
      hot: true,
      liveReload: true,
      historyApiFallback: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            /* Babel picks its environment from `BABEL_ENV`/`NODE_ENV`, and
               `webpack --mode production` sets neither in the Node process. Left
               to itself Babel would assume "development" and emit the debug JSX
               runtime (`jsxDEV`), which React's production build does not
               export — the page then dies with
               `(0, x.jsxDEV) is not a function`. Handing Babel the mode
               explicitly is what keeps the two in step. */
            options: { envName: argv.mode },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          /* Webpack 5 asset modules, not `url-loader`: an image under 8 KB is
             inlined as a data URI, and anything larger is emitted as its own
             file the browser can cache separately from the bundle. */
          test: /\.(jpe?g|png|gif|webp|avif)$/i,
          type: 'asset',
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'public', 'index.html'),
      }),

      /* Everything in `public/` except the HTML template is a static file that
         must reach `dist` byte-for-byte — `favicon.ico` today, and a `robots.txt` or a
         `robots.txt` tomorrow. Without this, `public/` is served in development
         and silently absent from the published site.

         Images imported from `src/` are handled by the asset module above, so
         they do not belong in `public/` and are not copied here. */
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: { ignore: ['**/index.html'] },
          },
        ],
      }),
    ],
  };
};
