const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        "bundle": ["./client-src/view", "./client-src/ajax-submit", "./client-src/ws-progress"]
    },

    output: {
        filename: "./client/[name].js"
    },

    watch: true,

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
        new ExtractTextPlugin("./client/bundle.css"),
        new webpack.ProvidePlugin({ //include jquery for all modules
            $: "jquery"
        })
    ]
};
