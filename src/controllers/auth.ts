import { Request } from 'express';
import knex from '../config/knex';
import catchAsync from '../utils/catchAsync'
import { AuthError } from '../utils/errors/AuthError';
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

interface CreateAdminBody {
    username: string
    password: string
}

export const createAdmin = catchAsync(async(req: Request<{},{},CreateAdminBody>, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) throw new AuthError()

    const result = await knex('admins').where({ username: username.toLowerCase() })
    if(result.length > 0) throw new AuthError(400, 'Username already exists')

    const hashed = await bcrypt.hash(password, 10)
    const [ admin ] = await knex('admins').insert({ username, password: hashed }).returning('*')

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET)
    res.status(200).json({ username, token })
})

interface SignInAdminBody {
    username: string,
    password: string
}

export const signInAdmin = catchAsync(async(req: Request<{},{},SignInAdminBody>, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) throw new AuthError(400, 'Username or password not sent')

    const [ admin ] = await knex('admins').where({ username: username.toLowerCase() })
    if(!admin) throw new AuthError(400, 'Invalid credentials')    

    const match = await bcrypt.compare(password, admin.password)    
    if(!match) throw new AuthError(400, 'Invalid credentials')

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET)
    res.status(200).json({ username: admin.username, token })
})