const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

const config = (env, argv) => {
    console.log('argv.mode:', argv.mode)
    const isProd = argv.mode === 'production'

    const backend_url = isProd
        ? 'https://notes2023.fly.dev/api/notes'
        : 'http://localhost:3001/notes'

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: isProd ? '[name].[contenthash].js' : '[name].js',
            chunkFilename: isProd ? '[name].[contenthash].js' : '[name].chunk.js',
            clean: true,
            publicPath: '/'
        },
        devServer: {
            static: path.resolve(__dirname, 'build'),
            compress: true,
            port: 3000,
            historyApiFallback: true
        },
        devtool: isProd ? 'source-map' : 'eval-source-map',
        optimization: {
            minimize: isProd,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProd,
                        },
                    },
                }),
            ],
            splitChunks: {
                chunks: 'all',
                maxInitialRequests: Infinity,
                minSize: 20000,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            // Get the name of the npm package from the module path
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `npm.${packageName.replace('@', '')}`;
                        },
                    },
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                    },
                }
            },
            runtimeChunk: 'single',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'public', 'index.html'),
                inject: true,
                minify: isProd ? {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                } : false
            }),
            new webpack.DefinePlugin({
                BACKEND_URL: JSON.stringify(backend_url)
            }),
            isProd && new CompressionPlugin({
                algorithm: 'gzip',
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8,
            }),
        ].filter(Boolean)
    }
}

module.exports = config