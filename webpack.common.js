const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	mode: 'production',
	entry: [
		'./src/index.js'
	],
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'msapi-wrapper.js',
		library: 'MSAPI',
		libraryTarget: 'umd',
		globalObject: 'this'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [/src/],
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										ie: '11'
									}
								}
							]
						]
					}
				}
			}
		]
	},
	stats: {
		colors: true
	},
	devtool: 'source-map'
};