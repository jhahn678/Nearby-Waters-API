type ReferenceType = 
| 'WATERBODY' | 'GEOMETRY' | "GEOPLACE"

export class UnknownReferenceError extends Error {
    status: number = 400
    message: string
    referenceType: ReferenceType | undefined
    unknownReferences: string[] | number[]

    constructor(referenceType?: ReferenceType, references: string[] | number[] = []){
        super()
        if(referenceType){
            this.referenceType = referenceType
        }
        this.unknownReferences = references
        if(references.length > 0){
            this.message = `
                Could not find the following ${referenceType} references:
                ${references.join(', ')}
            `
        }else{
            this.message = 'Provided references do not exist'
        }
    }
}