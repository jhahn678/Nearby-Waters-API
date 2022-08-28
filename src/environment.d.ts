declare global {
    namespace NodeJS {
      interface ProcessEnv {
        JWT_SECRET: string
        PG_CONNECTION_STRING: string
      }
    }
}


export {}