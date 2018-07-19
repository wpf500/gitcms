var webpack = require('webpack');

var isProd = process.env.NODE_ENV === 'production';

var plugins =  isProd ? [new webpack.optimize.UglifyJsPlugin()] : [];

module.exports = {
    devtool: 'source-map',
    entry: './public/javascripts/main.js',
    output: {
        filename: 'main.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }]
       }]
    },
    plugins: plugins
};
