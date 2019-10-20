const ColourFetcher = require('./colourfetcher');
const colours = require('./colourmap');
const ThrottlingClient = require('./throttlingclient');

describe('The Colour Fetcher', () => {   
    it('returns the safe default when no valid tweets are found', async () => {
        const twitter = new ThrottlingClient(twitterResponseWith([{text: '@screen_name you\'re awesome!'}]));
        const sut = new ColourFetcher(twitter, colours, "screen_name");

        const result = await sut.execute();
        
        expect(result.body).toBe('[255, 255, 255]');
    });
    
    it('returns the first valid tweet if it\'s "hidden" by a more recent invalid one', async () => {        
        const twitter = new ThrottlingClient(twitterResponseWith([
            {text: '@screen_name you\'re awesome!'},
            {text: '@screen_name orange'}
        ]));
        const sut = new ColourFetcher(twitter, colours, "screen_name");

        const result = await sut.execute();
        
        expect(result.body).toBe('[255, 165, 0]');
    });
    
    it('returns the safe default when invalid responses returned', async () => {
        const twitter = new ThrottlingClient(twitterResponseWith(null));
        const sut = new ColourFetcher(twitter, colours, "screen_name");

        const result = await sut.execute();
        
        expect(result.body).toBe('[255, 255, 255]');
    });

    it('when tweeted a known colour, responds with the hex code', async () => {
        const twitter = new ThrottlingClient(twitterResponseWith([{text: '@screen_name orange'}]));
        const sut = new ColourFetcher(twitter, colours, "screen_name");

        const result = await sut.execute();

        expect(result.body).toBe('[255, 165, 0]');
    });

});

const twitterResponseWith = (data) => {
    return {
        response:  {
            resp: { headers: { 'x-rate-limit-reset': '1571496333', 'x-rate-limit-remaining': '100' } },
            data: data
        },
        get: async function(path, query) { 
            return this.response;
        }
    };
}