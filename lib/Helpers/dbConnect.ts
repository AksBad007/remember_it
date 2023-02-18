import { connect, set } from 'mongoose'

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
