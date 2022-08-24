import { AdminOneName, ADMIN_ONE_MAP } from "../types/enums/adminOne"


export const validateAdminOne = (value: string): AdminOneName | null  => {
    const name = ADMIN_ONE_MAP[value.toLowerCase()];
    if(name) return name;
    return null;
}
