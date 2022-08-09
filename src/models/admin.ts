import mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

interface IAdmin {
    username: string,
    password: string
}

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})


adminSchema.pre('save', async function(next){
    this.username = this.username.toLowerCase();
    const password = this.password;
    const hash = await bcrypt.hash(password, 8)
    this.password = hash;
    next()
})

const Admin = mongoose.model<IAdmin>('Admin', adminSchema)

export default Admin;