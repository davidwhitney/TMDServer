const twitterClient = require("./lib/configuredtwitterclient");
const ThrottlingClient = require('./lib/throttlingclient');
const values = require('./lib/colourmap');

let lastValidColour = values['white'];
const client = new ThrottlingClient(twitterClient);
const screen_name = 'david_whitney';

const ok = color => { return { status: 200, body: color } };
const twitterIsRateLimiting = err => typeof err !== 'undefined' && err.statusCode === 429 && err.code === 88;
const responseIsInvalid = r => r === null || r === client.throttledCall || typeof r === 'undefined' || twitterIsRateLimiting(r.err);

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