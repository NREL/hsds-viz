var webpack = require('webpack');
var path = require('path');
const ENV = process.env.NODE_ENV;

const BUNDLE_ANALYZER = false;
const LINTER = false;

let config = module.exports = {
  entry: {
    'app': __dirname + '/src/App.js',
    'page': ['jquery', 'd3-quadtree' , 'd3-scale', 'd3-timer', 'jBox', 'jBox/Source/jBox.css', 'date-fns/difference_in_hours', 'pikaday', 'pikaday/css/pikaday.css'],
    'map': ['leaflet', 'proj4', 'leaflet-geometryutil', 'leaflet/dist/leaflet.css']
  },
  devtool: 'source-map',
  output: {
    path: __dirname+'/dist/',
    publicPath: '/dist/',
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['page', 'map']
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),

    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),

  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.png$/, loader: 'url-loader' }
    ]
  }
};

if (ENV === 'development'){
  config.output.sourceMapFilename = '[name].bundle.map';
}

if (ENV === 'production'){
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  );
}

if (BUNDLE_ANALYZER) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  config.plugins.push(
    new BundleAnalyzerPlugin()
  );
}

if (LINTER) {
  config.module.rules.push({
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          failOnWarning: false,
          failOnError: false,
          outputReport: {
            filePath: 'checkstyle.xml',
            formatter: require('eslint/lib/formatters/checkstyle')
          }
        },
    });
}
