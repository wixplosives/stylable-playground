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
                options: {
                    transpileOnly: true,
                },
            },
            {
                test: /\.css?/,
                exclude: /\.st\.css?/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ttf)/,
                type: 'asset/resource',
            },
        ],
        noParse: [require.resolve('typescript/lib/typescript.js')],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            process: require.resolve('process/browser'),
        },
        fallback: {
            os: false,
            path: require.resolve('@file-services/path'),
        },
    },
    plugins: [
        new StylableWebpackPlugin({
            filename: 'stylable.[contenthash].css',
        }),
        new HtmlWebpackPlugin({ title: 'Stylable Playground', favicon: './favicon.ico' }),
    ],
    performance: {
        hints: false,
    },
};
