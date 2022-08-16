type AccessPointErrorTypes = 
| 'NAME_NOT_PROVIDED' | 'ACCESS_TYPE_NOT_PROVIDED'
| 'WATERBODY_NOT_PROVIDED' | 'COORDINATES_NOT_PROVIDED'
| 'ACCESS_TYPE_NOT_VALID'


export class AccessPointCreationError extends Error{
    status = 400
    message: string

    constructor(type: AccessPointErrorTypes){
        super()
        switch(type){
            case 'NAME_NOT_PROVIDED':
                this.message = 'Access point name is a required';
                break;
            case 'ACCESS_TYPE_NOT_PROVIDED':
                this.message = 'Access point type is required';
                break;
            case 'WATERBODY_NOT_PROVIDED':
                this.message = 'Waterbody ID is required';
                break;
            case 'COORDINATES_NOT_PROVIDED':
                this.message = 'Coordinates for the access point are required';
                break;
            case 'ACCESS_TYPE_NOT_VALID':;
                this.message = 'The provided access type is not valid'
                break;
            default:
                this.message = 'Access point could not be created';
        }
    }
}