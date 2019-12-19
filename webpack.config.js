
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js'
  },
  devtool: 'inline-source-map',

};