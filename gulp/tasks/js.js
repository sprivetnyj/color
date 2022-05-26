import webpack from "webpack-stream";

export const js = () => {
	return app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
		.pipe(webpack({
			mode: app.isBuild ? 'production' : 'development',
			output: {
				filename: 'index.min.js',
			},
			module: {
				rules: [
					{
						test: /\.(wav|mp3)$/,
						loader: 'file-loader',
						options: {
							name: '../audio/[name].[ext]',

						}
					}
				]
			}
		}))
		.pipe(app.gulp.dest(app.path.build.js))
		.pipe(app.plugins.browsersync.stream());
}