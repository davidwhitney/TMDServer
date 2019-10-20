const Twit = require("twit");
const ThrottlingClient = require('./throttlingclient');
const ColourFetcher = require('./colourfetcher');
const colourmap = require('./colourmap');

const screen_name = process.env.SCREEN_NAME;
const client = new ThrottlingClient(new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true // optional - requires SSL certificates to be valid.
}));

const colourFetcher = new ColourFetcher(client, colourmap, screen_name);

module.exports = async (context, req) => {
  return colourFetcher.execute();
};