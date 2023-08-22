let path = require("path");
let webpack = require("webpack");
let webpackDevServer = require("webpack-dev-server");
let webpackConfig = require("./webpack.configold");

let webpackDevServerOptions = {
    publicPath: "/",
    contentBase: path.join(process.cwd(), "dist"),
    historyApiFallback: true,
    hot: true,
    host: "0.0.0.0"
};

webpackDevServer.addDevServerEntrypoints(webpackConfig, webpackDevServerOptions);
let webpackCompiler = webpack(webpackConfig);

let app = new webpackDevServer(webpackCompiler, webpackDevServerOptions);

// let port = process.env.PORT || 3000;
let port = 4040;
app.listen(port, () => console.log(`App listening on ${port}`));
