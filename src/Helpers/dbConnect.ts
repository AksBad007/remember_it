import { Mongoose, connect } from 'mongoose'

declare global {
  var mongoose: {
    promise: Promise<Mongoose> | null
    conn: Mongoose | null
  }
}

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
      bufferMaxEntries: 0,
      useFindAndModify: true,
      useCreateIndex: true
    }

    cached.promise = connect(<string>process.env.MONGODB_URI, opts).then(mongoose => mongoose)
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect