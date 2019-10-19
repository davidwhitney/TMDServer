const Twit = require("twit");
const values = require('./colourmap');
const ThrottlingClient = require('./throttlingclient');

const client = new ThrottlingClient(new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: true // optional - requires SSL certificates to be valid.
  })
);

let lastValidColour = values['white'];
const screen_name = 'david_whitney';

const ok = color => { return { status: 200, body: color } };
const twitterIsRateLimiting = err => typeof err !== 'undefined' && err.statusCode === 429 && err.code === 88;
const responseIsInvalid = r => r === client.throttledCall || typeof r === 'undefined' || twitterIsRateLimiting(r.err);

const tryExtractColourFrom = body => { return body.replace(`@${screen_name}`, '').trim().toLowerCase(); };
const selectColourFrom = tweet => { return typeof tweet !== 'undefined' ? values[tweet.colour] : lastValidColour };

module.exports = async (context, req) => {
  const query = { screen_name, count: 30, trim_user: true };  
  const response = await client.get('statuses/mentions_timeline', query);
  
  if (responseIsInvalid(response)) {
    return ok(lastValidColour);
  }

  const lastestValidTweetOrUndefined = response.data.find(x => {
    x['colour'] = tryExtractColourFrom(x.text);
    return values.hasOwnProperty(x.colour);
  });
  
  lastValidColour = selectColourFrom(lastestValidTweetOrUndefined);
  return ok(lastValidColour);
};