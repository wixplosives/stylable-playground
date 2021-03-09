const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @type import('webpack').Configuration */
module.exports = {
    mode: 'development',
    devtool: 'source-map',
    output: {
        filename: '[contenthash].[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'file-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            process: require.resolve('process/browser')
        },
        fallback: {
            os: false,
            path: require.resolve('@file-services/path')
        }
    },
    plugins: [
        new StylableWebpackPlugin({
            filename: '[contenthash].[name].css',
        }),
        new HtmlWebpackPlugin({ title: 'Stylable Playground', favicon: './favicon.ico' }),
    ],
};
