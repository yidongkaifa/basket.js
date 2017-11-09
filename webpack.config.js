const path = require('path')
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        a: path.join(__dirname, './src/basket.js'),
        b: path.join(__dirname, './src/init.js'),
    },
    output: {
        filename: "[name].min.js",
        path: __dirname + "/dist"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "basketjs",
            filename: "index.html",
            template: "./src/index.html",
            inject: "head"
        }),
        new webpack.optimize.UglifyJsPlugin(),

        new ScriptExtHtmlWebpackPlugin({
            inline: ['a','b']
        }),

        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, './src/static'),
                to: './static',
                ignore: ['.*']
            }
        ])

    ]
}