class ColourFetcher {
    constructor(client, values, screen_name) {
        this.client = client;
        this.values = values;
        this.screen_name = screen_name;
        this.lastValidColour = values['white'];
    };

    async execute() {
        const query = { screen_name: this.screen_name, count: 30, trim_user: true };  
        const response = await this.client.get('statuses/mentions_timeline', query);
        
        if (this.responseIsInvalid(response)) {
          return this.ok(this.lastValidColour);
        }
      
        const lastestValidTweetOrUndefined = response.data.find(x => {
          x['colour'] = this.tryExtractColourFrom(x.text);
          return this.values.hasOwnProperty(x.colour);
        });
        
        this.lastValidColour = this.selectColourFrom(lastestValidTweetOrUndefined);
        return this.ok(this.lastValidColour);
    };
    
    ok(color) { return { status: 200, body: color } };
    twitterIsRateLimiting(err){ return typeof err !== 'undefined' && err.statusCode === 429 && err.code === 88;}
    responseIsInvalid(r) { 
      return r === null || r.data === null || r === this.client.throttledCall || typeof r === 'undefined' || this.twitterIsRateLimiting(r.err) 
    };
    
    tryExtractColourFrom(body) { return body.replace(`@${this.screen_name}`, '').trim().toLowerCase(); };
    selectColourFrom(tweet) { return typeof tweet !== 'undefined' ? this.values[tweet.colour] : this.lastValidColour };
}

module.exports = ColourFetcher;