import { connect, set } from 'mongoose'
import { decodeAuth } from './backend_helpers'
import User from '../Models/User.model'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false
    }

    set('strictQuery', false)
    cached.promise = connect(process.env.MONGODB_URI as string, opts).then(mongoose => mongoose)
  }

  try {
    cached.conn = await cached.promise
    console.log('DB connected.')
    return cached.conn
  } catch (error) {
    console.error('DB connection failed.')
    console.error(error)
  }
}

// DB Methods outside APIs
export const getUserInfo = async (req: any) => {
  await dbConnect()
  const userID = await decodeAuth(req.cookies.auth_token)
  const data = await User.findById(userID, '_id username')

  if (data)
    return data

  throw new Error('User Not Found')
}
