type QueryErrorType = 
| 'ID_REQUIRED' | 'INVALID_COUNTRY' | 'NAME_REQUIRED'
| 'COORDS_REQUIRED' | 'VALUE_REQUIRED'

export class QueryError extends Error{
    status: number = 400
    message: string = 'There was an error with your request'

    constructor(queryErrorType: QueryErrorType, value?: string){
        super()
        switch(queryErrorType){
            case 'ID_REQUIRED':
                this.message = 'Parameter "id" is required';
                break;
            case 'INVALID_COUNTRY':
                if(value){
                    this.message = `The country you provided, ${value}, is not valid.`
                }else{
                    this.message = 'The country you provided is not valid'
                }
                break;
            case 'NAME_REQUIRED':
                this.message = 'Name is a required for this route';
                break;
            case 'COORDS_REQUIRED':
                this.message = 'Coordinates parameter is required';
                break;
            case 'VALUE_REQUIRED':
                this.message = 'Value parameter is required';
                break;
            default:
                return;
        }
    }
}