module.exports = {
	entry: './src/Components/HOC.jsx',
	output: {
		path: __dirname,
		filename: './public/bundle.js',
		libraryTarget: 'umd'
	},
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
				loader: 'style-loader'
			}, {
				test: /\.css$/,
				loader: 'css-loader',
				query: {
					modules: true,
					localIdentName: '[name]__[local]___[hash:base64:5]'
				}
			}
		]
	}
}
