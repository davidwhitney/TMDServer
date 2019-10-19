module.exports = {
    response: null,
    get: async function(path, query) { 
        return this.response;
    }
}