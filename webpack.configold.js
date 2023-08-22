const path = require("path");
const webpack = require("webpack");

const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ESBuildPlugin } = require('esbuild-loader');

module.exports = {
    mode: "development",
    devtool: "cheap-module-eval-source-map",
    entry: {
        main: path.resolve(process.cwd(), "static", "main.js")
    },
    output: {
        path: path.resolve(process.cwd(), "docs"),
        publicPath: ""
    },
    node: {
        fs: "empty",
        net: "empty"
    },
    watchOptions: {
        // ignored: /node_modules/,
        aggregateTimeout: 300, // After seeing an edit, wait .3 seconds to recompile
        poll: 500 // Check for edits every 5 seconds
    },

    module: {
        rules: [
          // JavaScript: Use Babel to transpile JavaScript files
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        esmodules: true
                      }
                    }
                  ],
                ]
              }
            }
          },
        ]
      },
    
      resolve: {
        modules: [path.resolve(process.cwd(), "static"), 'node_modules'],
        extensions: ['.js', '.json', ".mjs"],
      },
    // module: {
    //     rules: [
    //       {
    //         test: /\.js$/,
    //         exclude: /node_modules/,
    //         use: {
    //           loader: 'esbuild-loader',
    //           options: {
    //             loader: 'js', // Handle JavaScript files
    //             target: 'es2015'
    //           }
    //         }
    //       },
    //     ],
    //   },
    //   resolve: {
    //     extensions: ['.js'], // Resolve .js extensions
    //   },
    plugins: [
        new FriendlyErrorsWebpackPlugin(),
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(process.cwd(), "public", "index.html")
        }),
        new ESBuildPlugin()
    ],
}
