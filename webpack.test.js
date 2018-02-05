var path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: ['babel-polyfill', './tests'], // the starting point for our program
  output: {
    path: __dirname + '/public', // the absolute path for the directory where we want the output to be placed
    filename: 'bundle-test.js' // the name of the file that will contain our output - we could name this whatever we want, but bundle.js is typical
	},
  context: __dirname,
  devtool: 'source-map',
  module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				loader: 'ignore-loader'
			}
		]
	}
}
