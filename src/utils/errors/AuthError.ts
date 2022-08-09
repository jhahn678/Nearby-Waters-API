export class AuthError extends Error{
    status: number
    message: string

    constructor(
        status: number = 400, 
        message: string = 'Authentication error'
    ){
        super()
        this.status = status;
        this.message = message;
    }
}