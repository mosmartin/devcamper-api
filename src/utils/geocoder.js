const NodeGeocoder = require("node-geocoder");
const debug = require("debug")("worker:node-geocoder");
require("supports-color");

const options = {
  provider: process.env.GEOCODER_PROVIDER,

  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: process.env.MAP_QUEST_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
