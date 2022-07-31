module.exports = class QueryError extends Error{
    constructor(status, message){
        super()
        this.status = status || 400;
        this.message = message || 'There was an error with your request'
    }
}