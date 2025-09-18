import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import autoprefixer from 'autoprefixer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'

export default {
  mode: isProduction ? 'production' : 'development',
  entry: {
    bootstrap: './src/scripts/bootstrap.js'
  },
  output: {
    filename: 'scripts/[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body'
    }),
    ...(isProduction
      ? [new MiniCssExtractPlugin({ filename: 'styles/[name].css' })]
      : [])
  ],
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          isProduction
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer
                ]
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                silenceDeprecations: [
                  'mixed-decls',
                  'color-functions',
                  'global-builtin',
                  'import'
                ]
              }
            }
          }
        ]
      }
    ]
  }
}