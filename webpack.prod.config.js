const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

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
                    use: ["css-loader", "autoprefixer-loader"]
                })
            },

            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {presets: ['es2015']}
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
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
