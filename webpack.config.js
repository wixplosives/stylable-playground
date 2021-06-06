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
                type: 'asset',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        fallback: {
            path: require.resolve('@file-services/path')
        }
    },
    plugins: [
        new StylableWebpackPlugin({
            filename: 'stylable.[contenthash].css',
        }),
        new HtmlWebpackPlugin({ title: 'Stylable Playground', favicon: './favicon.ico' }),
    ],
};
