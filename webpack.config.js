const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        a: path.join(__dirname, './src/rsvp-latest.min.js'),
        b: path.join(__dirname, './src/basket.js'),
        c: path.join(__dirname, './src/init.js'),
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
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async',
            // preload: ['a','b'],

            inline: ['a','b']
        }),

        // new HtmlWebpackPlugin({
        //     title: "basketjs",
        //     filename: "index.html",
        //     template: "./src/index.html",
        //     inject: "body"
        // }),
        // new ScriptExtHtmlWebpackPlugin({
        //     inline: ['c']
        // }),
        // new ScriptExtHtmlWebpackPlugin({
        //     inline: ['b']
        // }),
        // new ScriptExtHtmlWebpackPlugin({
        //     inline: ['c']
        // }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, './src/static'),
                to: './static',
                ignore: ['.*']
            }
        ])

    ]
}