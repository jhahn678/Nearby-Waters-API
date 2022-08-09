export class UnknownReferenceError extends Error {
    status: number = 400
    message: string
    unknownReferences: string[]

    constructor(references: string[] = []){
        super()
        this.unknownReferences = references
        if(references.length > 0){
            this.message = `
                Could not find the following references:
                ${references.join(', ')}
            `
        }else{
            this.message = 'Provided references do not exist'
        }
    }
}