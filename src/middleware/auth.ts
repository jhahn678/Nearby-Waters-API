import * as jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'
import { AuthError } from '../utils/errors/AuthError';
 

export const authorizeAdmin: RequestHandler = (req, res, next) => {
    const header = req.headers.authorization;
    if(!header) throw new AuthError(400, 'Authorization required')
    const parsed = header.split(' ')[1]
    if(!jwt.verify(parsed, process.env.JWT_SECRET)) {
        throw new AuthError(400, 'Authorization rejected')
    }
    next()
}