import { connect, set } from 'mongoose'
import { decodeAuth } from './backend_helpers'
import mail from './mail_helpers'
import Users from '../Models/User.model'
import Events from '../Models/Event.model'

let cached = global.mongoose

if (!cached)
  cached = global.mongoose = { conn: null, promise: null }

interface QueryFilter {
  [key: string]: any
}

export default async function dbConnect() {
  if (cached.conn)
    return cached.conn

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
  const data = await Users.findById(userID)

  if (data)
    return data

  throw new Error('User Not Found')
}

export const searchUsers = async (query: string | string[], userID?: any) => {
  await dbConnect()
  const filter: QueryFilter = { $or: [ { email: query }, { username: query } ]}

  if (userID) {
    const { friends_added, friends_recieved, friends_sent } = await getUserInfo(userID)

    filter._id = {
      $in: [
          ...friends_added,
          ...friends_recieved,
          ...friends_sent
      ]
    }
  }

  return await Users.find(filter, '_id username email').limit(global.limit)
}

export const getFriends = async (count: number, userID: any) => {
  const { friends_added } = await Users.findById(userID)
  const filter = { '_id': { $in: friends_added.map((user: any) => user.user) } }
  const friendsCount = await Users.count(filter)
  const friendList = await Users
    .find(filter, '_id username email')
    .skip(count as number)
    .limit(20)
    .sort({ username: 1 })

  return { total: friendsCount, friendList }
}

export const getRequests = async (count: number, userID: any) => {
  const reqUser = await Users.findById(userID)
  const { friends_recieved } = reqUser
  const filter = { '_id': { $in: friends_recieved.map((user: any) => user.user) } }
  const friendsCount = await Users.count(filter)
  const friendList = await Users
    .find(filter, '_id username email')
    .skip(count as number)
    .limit(20)
    .sort({ username: 1 })

  return { total: friendsCount, friendList }
}

export const getEvents = async (offset: number, userID: any, sent=false) => {
  await dbConnect()
  const filter = sent ? { 'created_by.user': userID } : { 'invited_users.user': userID }

  const allEvents = await Events
    .find(filter)
    .skip(offset)
    .limit(global.limit)
    .sort({ start_date: 'asc' })
    .populate('created_by.user invited_users.user', 'email username')
  const totalEvents = await Events.countDocuments(filter)

  return { allEvents, totalEvents }
}

// Respond to Event
export const respond = async (evtID: string, userID: string, status: string) => {
  await dbConnect()
  const reqEvt = await Events.findById(evtID).populate('created_by.user invited_users.user', 'email username')
  const reqUser = reqEvt.invited_users.find((user: any) => JSON.stringify(user.user._id) === JSON.stringify(userID))

  reqUser.status = status
  const { title, created_by: { userID: { username, email } } } = await reqEvt.save()

  const msg = `Dear ${ username }, This is to inform you that ${ reqUser.user.username } has accepted the Event - ${ title } created by you.`
  const confirmMsg = 'Event ' + status.charAt(0).toUpperCase() + status.slice(1) + '!'
  await mail(confirmMsg, email, msg)

  return confirmMsg
}
