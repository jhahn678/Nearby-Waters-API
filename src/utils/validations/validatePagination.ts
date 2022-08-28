export const validatePageInput = (page: any): number => {
    if(typeof page === 'number' && page > 0) return page;
    if(typeof page === 'string') return parseInt(page);
    return 1;
}


export const validateLimitInput = (limit: any): number => {
    if(typeof limit === 'number' && limit > 0) return limit
    if(typeof limit === 'string') return parseInt(limit)
    return 50;
}