class ThrottlingClient {
    constructor(twitterClient) {
        this.twitterClient = twitterClient;
        this.nextCallDate = null,
        this.remainingCallsPerPeriod = null,
        this.throttledCall = { throttled: true };
    }
    
    requestShouldBeThrottled() { return this.nextCallDate != null && Date.now() < this.nextCallDate }

    async get(timelineUri, timelineQuery) {       
      if (this.requestShouldBeThrottled()) {
        console.log(`Throttling to avoid rate limits. Currently ${this.remainingCallsPerPeriod} calls remaining.`);
        console.log(`Next request at: ${this.nextCallDate}.`);      
        return this.throttledCall;
      }
      
      const result = await this.twitterClient.get(timelineUri, timelineQuery).catch(err => { });
      
      this.calculateNextCallTime(result);
      return result;
    }
    
    calculateNextCallTime(result) {
      const resetsAt = new Date(result.resp.headers['x-rate-limit-reset']*1000);    
      this.remainingCallsPerPeriod = result.resp.headers['x-rate-limit-remaining'];
      this.nextCallDate = new Date(Date.now() + ((resetsAt - Date.now()) / this.remainingCallsPerPeriod));
    }
};

module.exports = ThrottlingClient;