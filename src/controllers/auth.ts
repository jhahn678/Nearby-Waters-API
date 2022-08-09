import { Request } from 'express';
import Admin from '../models/admin'
import catchAsync from '../utils/catchAsync'
import { AuthError } from '../utils/errors/AuthError';
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

interface CreateAdminBody {
    username: string
    password: string
}

export const createAdmin = catchAsync(async(req: Request<{},{},CreateAdminBody>, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) throw new AuthError()
    if(await Admin.findOne({ username: username.toLowerCase() })) throw new AuthError(400, 'Username already exists')
    const newAdmin = new Admin({ username, password })
    const admin = await newAdmin.save()
    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET)
    res.status(200).json({ username, token })
})

interface SignInAdminBody {
    username: string,
    password: string
}

export const signInAdmin = catchAsync(async(req: Request<{},{},SignInAdminBody>, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) throw new AuthError(400, 'Username or password not sent')
    const admin = await Admin.findOne({ username: username.toLowerCase() })
    if(!admin) throw new AuthError(400, 'Invalid credentials')
    const match = await bcrypt.compare(password, admin.password)    
    if(!match) throw new AuthError(400, 'Invalid credentials')
    const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET)
    res.status(200).json({ username: admin.username, token })
})