jest.mock('./lib/configuredtwitterclient');
const mock = require('./lib/configuredtwitterclient');
const api = require('./index');

describe('The API', () => {
    beforeEach(() => {
        mock.response = {
            resp: { headers: { 'x-rate-limit-reset': '1571496333', 'x-rate-limit-remaining': '100' } },
            data: []
        }; 
    })
    
    it('returns the safe default when no valid tweets are found', async () => {
        mock.response.data.push({text: '@david_whitney you\'re awesome!'});

        const result = await api({}, {});
        
        expect(result.body).toBe('[255, 255, 255]');
    });
    
    it('returns the first valid tweet if it\'s "hidden" by a more recent invalid one', async () => {
        mock.response.data.push({text: '@david_whitney you\'re awesome!'});
        mock.response.data.push({text: '@david_whitney orange'});

        const result = await api({}, {});
        
        expect(result.body).toBe('[255, 165, 0]');
    });
    
    it('returns the safe default when invalid responses returned', async () => {
        mock.response = null;

        const result = await api({}, {});
        
        expect(result.body).toBe('[255, 255, 255]');
    });

    it('when tweeted a known colour, responds with the hex code', async () => {
        mock.response.data.push({text: '@david_whitney orange'});

        const result = await api({}, {});

        expect(result.body).toBe('[255, 165, 0]');
    });

});