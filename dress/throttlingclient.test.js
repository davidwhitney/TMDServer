const ThrottlingClient = require('./throttlingclient');

const apiUrl = '/this/doesnt/matter';
const someData = [{foo: 'bar'}];
const someRequest = { some: 'request'};

describe('The Twitter Throttler', () => {   
    it('For the first call, will always contact the remote server and return it\'s response.', async () => {
        const sut = new ThrottlingClient(twitterResponseWith(someData, aReallyPermissiveRateLimit()));

        const response = await sut.get(apiUrl, someRequest);
        
        expect(response.data).toBe(someData);
    });

    it('For the second call, throttles are enforced when the second call interval is too soon.', async () => {
        const sut = new ThrottlingClient(twitterResponseWith(someData, throttledToOneRequestMinuteForTheNextTen()));

        const response1 = await sut.get(apiUrl, someRequest);
        const response2 = await sut.get(apiUrl, someRequest);

        expect(response1).not.toBe(sut.throttledCall);
        expect(response2).toBe(sut.throttledCall);
    });

    it('Once enough time has elapsed, subsequent calls can be made.', async () => {      
        const sut = new ThrottlingClient(twitterResponseWith(someData, throttledToOneRequestPerSecondForTheNextMinute()));

        const response1 = await sut.get(apiUrl, someRequest);
        const response2 = await sut.get(apiUrl, someRequest);
        await sleep(1200);
        const response3 = await sut.get(apiUrl, someRequest);

        expect(response1).not.toBe(sut.throttledCall);
        expect(response2).toBe(sut.throttledCall);
        expect(response3).not.toBe(sut.throttledCall);
    });
});

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const aReallyPermissiveRateLimit = () => { return { 'x-rate-limit-reset': minutesFromNow(0), 'x-rate-limit-remaining': '100' }};   
const throttledToOneRequestMinuteForTheNextTen = () => { return { 'x-rate-limit-reset': minutesFromNow(10), 'x-rate-limit-remaining': 10 }};   
const throttledToOneRequestPerSecondForTheNextMinute = () => { return { 'x-rate-limit-reset': minutesFromNow(1), 'x-rate-limit-remaining': 60 }};

const minutesFromNow = (minutes) => (new Date(Date.now() + minutes*60000).getTime() / 1000).toFixed();

const twitterResponseWith = (data, headers) => {
    return {
        response:  { resp: { headers: headers }, data: data },
        get: async function(path, query) { return this.response; }
    };
}