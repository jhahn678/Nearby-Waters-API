export class CoordinateError extends Error{
    status: number
    message: string

    constructor(status: number, message: string){
        super()
        this.status = status || 400;
        this.message = message || 'There was an error with the location you provided'
    }
}