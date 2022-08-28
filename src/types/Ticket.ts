type TicketType = 
| 'MERGE_WATERBODY'
| 'EDIT_WATERBODY' 
| 'DELETE_WATERBODY' 
| 'EDIT_ACCESS_POINT' 
| 'REMOVE_ACCESS_POINT'


export interface ITicket {
    type: TicketType
    /** ObjectId of resource */
    resource: string
    resourceType: 'Waterbody' | 'AccessPoint'
    comment: string
    payload: Object
}