export type Subregion = 
| 'Northwestern' | 'Midwest' | 'Northeastern' 
| 'Western' | 'Southeastern'| 'Mid-Atlantic' | 'Southwestern'

export const SUBREGION_MAP = {
    'northwestern': 'Northwestern',
    'northwest': 'Northwestern',
    'midwest': 'Midwest',
    'midwestern': 'Midwest',
    'mid-west': 'Midwest',
    'northeastern': 'Northeastern',
    'northeast': 'Northeastern',
    'western': 'Western',
    'west': 'Western',
    'southeastern': 'Southeastern',
    'southeast': 'Southeastern',
    'mid-atlantic': 'Mid-Atlantic',
    'midatlantic': 'Mid-Atlantic',
    'southwestern': 'Southwestern',
    'southwest': 'Southwestern',
}

export const validateSubregion = (value: string): Subregion | null => {
    const subregion = SUBREGION_MAP[value.toLowerCase()]
    if(subregion) return subregion;
    return null;
}