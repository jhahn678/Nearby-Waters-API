export class RequestError extends Error{
    status: number
    message: string

    constructor(
        status: number = 400, 
        message: string = 'There was an error with the request you sent'
    ){
        super();
        this.status = status;
        this.message = message;
    }
}