export type AdminOneAbbreviation  = 
    'AK' | 'AL'| 'TX'| 'SC'| 'VA'| 'WV'| 'MS'| 'KS'| 'AR'| 'FL'| 'DC'|
    'DE'| 'GA'| 'IL'| 'IN'| 'MD'| 'KY'| 'LA'| 'MO'| 'OH'| 'NC'| 'NJ'|
    'PA'| 'OK'| 'TN'| 'IA'| 'CT'| 'WI'| 'MA'| 'ME'| 'MI'| 'MN'| 'NE'|
    'ND'| 'NY'| 'NH'| 'RI'| 'SD'| 'VT'| 'CA'| 'AZ'| 'CO'| 'NM'| 'NV'|
    'UT'| 'ID'| 'MT'| 'OR'| 'WA'| 'WY'| 'HI' | "AB" | "BC" | "MB" | 
    "NB" | "NT" | "NL" | "NS" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT" | 
    "AGU" | "BCN" | "BCS" | "CAM" | "CHP" | "CHH" | "COA" | "COL" | "CMX" | 
    "DUR" | "GUA" | "GRO" | "HID" | "JAL" | "MEX" | "MIC" | "MOR" | 
    "NAY" | "NLE" | "OAX" | "PUE" | "QUE" | "ROO" | "SLP" | "SIN" | "SON" | 
    "TAB" | "TAM" | "TLA" | "VER" | "YUC" | "ZAC"


export type AdminOneName =
    "Aguascalientes" | "Baja California" | "Baja California Sur" | "Campeche" | "Chiapas" | "Chihuahua" | 
    "Coahuila" | "Colima" | "Mexico" | "Durango" | "Guanajuato" | "Guerrero" | "Hidalgo" | "Jalisco" | 
    "México" | "Michoacán" | "Morelos" | "Nayarit" | "Nuevo León" | "Oaxaca" | "Puebla" | "Querétaro" | 
    "Quintana Roo" | "San Luis Potosí" | "Sinaloa" | "Sonora" | "Tabasco" | "Tamaulipas" | "Tlaxcala" | 
    "Veracruz" | "Yucatán" | "Zacatecas" | "Distrito Federal" | "Alberta" | "British Columbia" | "Manitoba" | 
    "New Brunswick" | "Northwest Territories" | "Newfoundland and Labrador" | "Nova Scotia" | "Nunavat" | "Ontario" | 
    "Prince Edward Island" | "Québec" | "Saskatchewan" | "Yukon" | "Nationalparken" | "Nunavut" | "Kommune Kujalleq" | 
    "Kommuneqarfik Sermersooq" | "Pituffik" | "Qaasuitsup Kommunia" | "Qeqqata Kommunia" | "Arkansas" | "District of Columbia" | 
    "Delaware" | "Florida" | "Georgia" | "Kansas" | "Louisiana" | "Maryland" | "Missouri" | "Mississippi" | "North Carolina" | 
    "Oklahoma" | "South Carolina" | "Tennessee" | "Texas" | "West Virginia" | "Alabama" | "Connecticut" | "Iowa" | "Illinois" | 
    "Indiana" | "Maine" | "Michigan" | "Minnesota" | "Nebraska" | "New Hampshire" | "New Jersey" | "New York" | "Ohio" | 
    "Rhode Island" | "Vermont" | "Wisconsin" | "California" | "Colorado" | "New Mexico" | "Nevada" | "Utah" | "Arizona" | 
    "Idaho" | "Montana" | "North Dakota" | "Oregon" | "South Dakota" | "Washington" | "Wyoming" | "Hawaii" | "Alaska" | 
    "Kentucky" | "Massachusetts" | "Pennsylvania" | "Virginia" | "Tennesse"



export const ADMIN_ONE_MAP = {
    "agu": "Aguascalientes",
    "bcn": "Baja California",
    "bcs": "Baja California Sur",
    "cam": "Campeche",
    "chp": "Chiapas",
    "chh": "Chihuahua",
    "coa": "Coahuila",
    "col": "Colima",
    "cmx": "Mexico",
    "dur": "Durango",
    "gua": "Guanajuato",
    "gro": "Guerrero",
    "hid": "Hidalgo",
    "jal": "Jalisco",
    "mex": "México",
    "mic": "Michoacán",
    "mor": "Morelos",
    "nay": "Nayarit",
    "nle": "Nuevo León",
    "oax": "Oaxaca",
    "pue": "Puebla",
    "que": "Querétaro",
    "roo": "Quintana Roo",
    "slp": "San Luis Potosí",
    "sin": "Sinaloa",
    "son": "Sonora",
    "tab": "Tabasco",
    "tam": "Tamaulipas",
    "tla": "Tlaxcala",
    "ver": "Veracruz",
    "yuc": "Yucatán",
    "zac": "Zacatecas",
    "aguascalientes": "Aguascalientes",
    "baja california": "Baja California",
    "baja california sur": "Baja California Sur",
    "campeche": "Campeche",
    "chiapas": "Chiapas",
    "chihuahua": "Chihuahua",
    "coahuila": "Coahuila",
    "colima": "Colima",
    "mexico": "Mexico",
    "durango": "Durango",
    'distrito federal': 'Distrito Federal',
    "guanajuato": "Guanajuato",
    "guerrero": "Guerrero",
    "hidalgo": "Hidalgo",
    "jalisco": "Jalisco",
    "méxico": "México",
    "michoacán": "Michoacán",
    "michoacan": "Michoacán",
    "morelos": "Morelos",
    "nayarit": "Nayarit",
    "nuevo león": "Nuevo León",
    "nuevo leon": "Nuevo León",
    "oaxaca": "Oaxaca",
    "puebla": "Puebla",
    "querétaro": "Querétaro",
    "queretaro": "Querétaro",
    "quintana Roo": "Quintana Roo",
    "san luis potosí" : "San Luis Potosí",
    "san luis potosi" : "San Luis Potosí",
    "sinaloa": "Sinaloa",
    "sonora": "Sonora",
    "tabasco": "Tabasco",
    "tamaulipas": "Tamaulipas",
    "tlaxcala": "Tlaxcala",
    "veracruz": "Veracruz",
    "yucatán": "Yucatán",
    "yucatan": "Yucatán",
    "zacatecas": "Zacatecas",
    "ab": "Alberta",
    "bc": "British Columbia",
    "mb": 'Manitoba',
    "nb": 'New Brunswick',
    "nt": 'Northwest Territories',
    "nl": 'Newfoundland and Labrador',
    "ns": "Nova Scotia",
    "nu": "Nunavat",
    "on": "Ontario",
    "pe": 'Prince Edward Island',
    "qc": 'Québec',
    "sk": 'Saskatchewan',
    "yt": "Yukon",
    'alberta': 'Alberta',
    'british columbia': 'British Columbia',
    'nationalparken': 'Nationalparken',
    'new brunswick': 'New Brunswick',
    'newfoundland and labrador': 'Newfoundland and Labrador',
    'newfoundland': 'Newfoundland and Labrador',
    'labrador': 'Newfoundland and Labrador',
    'northwest territories': 'Northwest Territories',
    'nova scotia': 'Nova Scotia',
    'nunavut': 'Nunavut',
    'kommune kujalleq': 'Kommune Kujalleq',
    'kommuneqarfik sermersooq': 'Kommuneqarfik Sermersooq',
    'manitoba': 'Manitoba',
    'ontario': 'Ontario',
    'pituffik': 'Pituffik',
    'prince edward island': 'Prince Edward Island',
    '1aasuitsup kommunia': 'Qaasuitsup Kommunia',
    'qeqqata kommunia': 'Qeqqata Kommunia',
    'québec': 'Québec',
    'quebec': 'Québec',
    'saskatchewan': 'Saskatchewan',
    'arkansas': 'Arkansas',
    'district of columbia': 'District of Columbia',
    'delaware': 'Delaware',
    'florida': 'Florida',
    'georgia': 'Georgia',
    'kansas': 'Kansas',
    'louisiana': 'Louisiana',
    'maryland': 'Maryland',
    'missouri': 'Missouri',
    'mississippi': 'Mississippi',
    'north carolina': 'North Carolina',
    'oklahoma': 'Oklahoma',
    'south carolina': 'South Carolina',
    'tennessee': 'Tennessee',
    'texas': 'Texas',
    'west virginia': 'West Virginia',
    'alabama': 'Alabama',
    'connecticut': 'Connecticut',
    'iowa': 'Iowa',
    'illinois': 'Illinois',
    'indiana': 'Indiana',
    'maine': 'Maine',
    'michigan': 'Michigan',
    'minnesota': 'Minnesota',
    'nebraska': 'Nebraska',
    'new hampshire': 'New Hampshire',
    'new jersey': 'New Jersey',
    'new york': 'New York',
    'ohio': 'Ohio',
    'rhode island': 'Rhode Island',
    'vermont': 'Vermont',
    'wisconsin': 'Wisconsin',
    'california': 'California',
    'colorado': 'Colorado',
    'new mexico': 'New Mexico',
    'nevada': 'Nevada',
    'utah': 'Utah',
    'arizona': 'Arizona',
    'idaho': 'Idaho',
    'montana': 'Montana',
    'north dakota': 'North Dakota',
    'oregon': 'Oregon',
    'south dakota': 'South Dakota',
    'washington': 'Washington',
    'wyoming': 'Wyoming',
    'hawaii': 'Hawaii',
    'alaska': 'Alaska',
    'kentucky': 'Kentucky',
    'massachusetts': 'Massachusetts',
    'pennsylvania': 'Pennsylvania',
    'virginia': 'Virginia',
    'ar': 'Arkansas' ,
    'dc': 'District of Columbia',
    'de': "Delaware",
    'fl': "Florida",
    'ga': "Georgia",
    'ks': 'Kansas',
    'la': "Louisiana",
    'md': "Maryland",
    'mo': "Missouri",
    'ms': "Mississippi",
    'nc': "North Carolina",
    'ok': 'Oklahoma',
    'sc': "South Carolina",
    'tn': "Tennesse",
    'tx': "Texas",
    'wv': "West Virginia",
    'al': "Alabama",
    'ct': 'Connecticut',
    'ia': 'Iowa',
    'il': "Illinois",
    'in': "Indiana",
    'me': "Maine",
    'mi': "Michigan",
    'mn': "Minnesota",
    'ne': "Nebraska",
    'nh': "New Hampshire",
    'nj': "New Jersey",
    'ny': "New York",
    'oh': "Ohio",
    'ri': "Rhode Island",
    'vt': "Vermont",
    'wi': "Wisconsin",
    'ca': "California" ,
    'co': "Colorado",
    'nm': "New Mexico",
    'nv': "Nevada",
    'ut': "Utah",
    'az': "Arizona",
    'id': "Idaho",
    'mt': "Montana",
    'nd': "North Dakota",
    'or': "Oregon",
    'sd': "South Dakota",
    'wa': "Washington",
    'wy': "Wyoming",
    'hi': "Hawaii",
    'ak': 'Alaska',
    'ky': 'Kentucky',
    'ma': 'Massachusetts',
    'pa': 'Pennsylvania',
    'va': 'Virginia',
}
























