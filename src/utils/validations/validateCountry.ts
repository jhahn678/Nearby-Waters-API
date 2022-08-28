export const COUNTRY_CODE_MAP = {
    'us': 'US',
    'ca': 'CA',
    'mx': 'MX',
    'gl': 'GL',
    'united states': 'US',
    'usa': 'US',
    'canada': 'CA',
    'greenland': 'GL',
    'mexico': 'MX'
}

export type CountryCode = 
| 'US' | 'MX' | 'CA' | 'GL'

export const validateCountry = (value: string): CountryCode | null => {
    const ccode = COUNTRY_CODE_MAP[value.toLowerCase()]
    if(ccode) return ccode
    return null
}