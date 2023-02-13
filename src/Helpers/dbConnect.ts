import { connect } from 'mongoose'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect () {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    }

    cached.promise = connect(<string>process.env.MONGODB_URI, opts).then(mongoose => mongoose)
  }

  cached.conn = await cached.promise
  console.log('db connected');
  return cached.conn
}

export default dbConnect
