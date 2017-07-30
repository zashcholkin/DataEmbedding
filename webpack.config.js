var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        "bundle": ["./client-src/view", "./client-src/ajax-submit"]
    },

    output: {
        filename: "./client/[name].js"
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: "css-loader"
                })
            }
        ]
    },


    plugins: [
        new CopyWebpackPlugin([
            {from: "./client-src/index.html", to: "./client/index.html"},
            {from: "./client-src/icons", to: "./client/icons"}
        ]),
        new ExtractTextPlugin("./client/bundle.css")
    ]

};
