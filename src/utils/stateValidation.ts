import { StateAbbreviation, StateName } from "../types/enums/states"

export const statesAbbr: StateAbbreviation[] = [
    'AK', 'AL', 'TX', 'SC', 'VA', 'WV', 'MS', 'KS', 'AR', 'FL', 'DC',
    'DE', 'GA', 'IL', 'IN', 'MD', 'KY', 'LA', 'MO', 'OH', 'NC', 'NJ',
    'PA', 'OK', 'TN', 'IA', 'CT', 'WI', 'MA', 'ME', 'MI', 'MN', 'NE',
    'ND', 'NY', 'NH', 'RI', 'SD', 'VT', 'CA', 'AZ', 'CO', 'NM', 'NV',
    'UT', 'ID', 'MT', 'OR', 'WA', 'WY', 'HI'
]


export const states: StateName[] = [
    'Arkansas', 'District of Columbia', 'Delaware', 'Florida',
    'Georgia', 'Kansas', 'Louisiana', 'Maryland', 'Missouri',
    'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina',
    'Tennessee', 'Texas', 'West Virginia', 'Alabama', 'Connecticut',
    'Iowa', 'Illinois', 'Indiana', 'Maine', 'Michigan', 'Minnesota',
    'Nebraska', 'New Hampshire', 'New Jersey', 'New York', 'Ohio',
    'Rhode Island', 'Vermont', 'Wisconsin', 'California', 'Colorado',
    'New Mexico', 'Nevada', 'Utah', 'Arizona', 'Idaho', 'Montana',
    'North Dakota', 'Oregon', 'South Dakota', 'Washington', 'Wyoming',
    'Hawaii', 'Alaska', 'Kentucky', 'Massachusetts', 'Pennsylvania',
    'Virginia'
]

export const statesMap: { name: StateName, abbr: StateAbbreviation}[] = [
    { name: 'Arkansas', abbr: 'AR' },
    { name: 'District of Columbia', abbr: 'DC' },
    { name: 'Delaware', abbr: 'DE' },
    { name: 'Florida', abbr: 'FL' },
    { name: 'Georgia', abbr: 'GA' },
    { name: 'Kansas', abbr: 'KS' },
    { name: 'Louisiana', abbr: 'LA' },
    { name: 'Maryland', abbr: 'MD' },
    { name: 'Missouri', abbr: 'MO' },
    { name: 'Mississippi', abbr: 'MS' },
    { name: 'North Carolina', abbr: 'NC' },
    { name: 'Oklahoma', abbr: 'OK' },
    { name: 'South Carolina', abbr: 'SC' },
    { name: 'Tennessee', abbr: 'TN' },
    { name: 'Texas', abbr: 'TX' },
    { name: 'West Virginia', abbr: 'WV' },
    { name: 'Alabama', abbr: 'AL' },
    { name: 'Connecticut', abbr: 'CT' },
    { name: 'Iowa', abbr: 'IA' },
    { name: 'Illinois', abbr: 'IL' },
    { name: 'Indiana', abbr: 'IN' },
    { name: 'Maine', abbr: 'ME' },
    { name: 'Michigan', abbr: 'MI' },
    { name: 'Minnesota', abbr: 'MN' },
    { name: 'Nebraska', abbr: 'NE' },
    { name: 'New Hampshire', abbr: 'NH' },
    { name: 'New Jersey', abbr: 'NJ' },
    { name: 'New York', abbr: 'NY' },
    { name: 'Ohio', abbr: 'OH' },
    { name: 'Rhode Island', abbr: 'RI' },
    { name: 'Vermont', abbr: 'VT' },
    { name: 'Wisconsin', abbr: 'WI' },
    { name: 'California', abbr: 'CA' },
    { name: 'Colorado', abbr: 'CO' },
    { name: 'New Mexico', abbr: 'NM' },
    { name: 'Nevada', abbr: 'NV' },
    { name: 'Utah', abbr: 'UT' },
    { name: 'Arizona', abbr: 'AZ' },
    { name: 'Idaho', abbr: 'ID' },
    { name: 'Montana', abbr: 'MT' },
    { name: 'North Dakota', abbr: 'ND' },
    { name: 'Oregon', abbr: 'OR' },
    { name: 'South Dakota', abbr: 'SD' },
    { name: 'Washington', abbr: 'WA' },
    { name: 'Wyoming', abbr: 'WY' },
    { name: 'Hawaii', abbr: 'HI' },
    { name: 'Alaska', abbr: 'AK' },
    { name: 'Kentucky', abbr: 'KY' },
    { name: 'Massachusetts', abbr: 'MA' },
    { name: 'Pennsylvania', abbr: 'PA' },
    { name: 'Virginia', abbr: 'VA' }
  ]




export const validateState = (value: string): StateAbbreviation | null  => {
    if(value.length === 2){
        return validateStateAbbr(value)
    }
    for(let state of statesMap){
        if(state.name.toLowerCase() === value.toLowerCase()){
            return state.abbr;
        }
    }
    return null;
}

export const validateStateAbbr = (value: string): StateAbbreviation | null  => {
    for(let abbr of statesAbbr){
        if(value.toUpperCase() === abbr){
            return abbr;
        }
    }
    return null;
}
