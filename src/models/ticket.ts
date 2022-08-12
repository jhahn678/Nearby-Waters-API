import mongoose from 'mongoose'

type TicketType = 
| 'MERGE_WATERBODY'
| 'EDIT_WATERBODY' 
| 'DELETE_WATERBODY' 
| 'EDIT_ACCESS_POINT' 
| 'REMOVE_ACCESS_POINT'


interface ITicket {
    type: TicketType
    /** ObjectId of resource */
    resource: string
    resourceType: 'Waterbody' | 'AccessPoint'
    comment: string
    payload: Object
}

const ticketSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'MERGE_WATERBODY',
            'EDIT_WATERBODY', 
            'DELETE_WATERBODY', 
            'EDIT_ACCESS_POINT', 
            'REMOVE_ACCESS_POINT'
        ]
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resourceModel'
    },
    resourceType: {
        type: String,
        required: true,
        enum: ['Waterbody', 'AccessPoint']
    },
    comment: String,
    payload: {}
})

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema)

export default Ticket;