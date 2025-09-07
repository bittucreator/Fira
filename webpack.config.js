const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    target: 'web',
    
    node: {
      __dirname: false,
      __filename: false,
    },
    
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          }
        },
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader'
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    
    resolve: {
      extensions: ['.js', '.jsx', '.mjs'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      fallback: {
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util"),
        "url": require.resolve("url"),
        "querystring": require.resolve("querystring-es3"),
        "process": require.resolve("process/browser.js"),
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "events": require.resolve("events"),
        "fs": false,
        "net": false,
        "tls": false,
        "child_process": false
      }
    },
    
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      globalObject: 'globalThis',
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'global': 'globalThis',
        'globalThis': 'globalThis',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js',
        global: 'globalThis',
      }),
    ],
    
    devServer: {
      port: 3000,
      hot: false,
      liveReload: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      client: {
        webSocketURL: 'ws://localhost:3000/ws',
      },
    },
    
    devtool: isProduction ? false : 'source-map',
  };
};
