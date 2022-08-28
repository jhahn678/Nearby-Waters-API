import Knex from "knex";
import KnexPostgis from "knex-postgis";
import { IGeometry } from "../types/Geometry";
import { IGeoplace } from "../types/Geoplace";
import { IWaterbody } from "../types/Waterbody";
import { IAdmin } from "../types/Admin";
import camelToSnakeCase from "../utils/camelToSnakeCase";

require('dotenv').config()
const { PG_CONNECTION_STRING } = process.env;

const knex = Knex({
    client: 'pg',
    connection: PG_CONNECTION_STRING!,
    pool: { min: 0, max: 7 },
    wrapIdentifier: (value, origImpl) => origImpl(camelToSnakeCase(value)),
})


export const st = KnexPostgis(knex)

export default knex;

declare module 'knex/types/tables' {
    interface Tables {
        geoplaces: IGeoplace,
        geometries: IGeometry,
        waterbodies: IWaterbody,
        admins: IAdmin
    }
}