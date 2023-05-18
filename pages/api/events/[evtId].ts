import type { NextApiRequest } from 'next'
import Joi from 'joi'
import type { NextApiResponseServerIO } from '../../../lib/Helpers/socket_helpers'
import { raiseNotFound, raiseError, raiseSuccess, calculateNextReminder } from '../../../lib/Helpers/backend_helpers'
import dbConnect from '../../../lib/Helpers/db_helpers'
import mail from '../../../lib/Helpers/mail_helpers'
import Events from '../../../lib/Models/Event.model'
import Users from '../../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, body, query: { evtID } } = req

    switch (method) {
        // Fetch an existing event
        case 'GET':
            try {
                const reqEvt = await Events.findById(evtID)

                if (reqEvt)
                    return raiseSuccess(res, { msg: 'Event Found.', data: reqEvt })
                return raiseError(res, 'Event Not Found.')
            } catch (error: any) {
                console.log(error)

                raiseError(res)
            }

        // Edit an Existing Event
        case 'PUT':
            const EventSchema = Joi.object({
                start_date: Joi.date().required(),
                end_date: Joi.date().required(),
                title: Joi.string().required(),
                description: Joi.string().optional().allow(''),
                repeat_status: Joi.number().required(),
                reminder_status: Joi.boolean().required(),
                notify: Joi.number().optional(),
                location: Joi.object({
                    description: Joi.string().required(),
                    link: Joi.string().optional().allow(''),
                })
                    .required(),
                invited_users: Joi.array()
                    .items(Joi.object().keys({ user: Joi.string().required() }))
                    .required()
            })

            try {
                const newEvent = await EventSchema.validateAsync(body)
                const reqEvent = await Events.findById(evtID).populate('created_by.user invited_users.user', 'email username')

                Object.keys(newEvent).forEach(key => {
                    // Only update below fields
                    if (['title', 'description'].includes(key))
                        reqEvent[key] = newEvent[key]
                })

                // To detect modifications in Members List
                let newUsers: any[] = [],
                    removedUsers: any[] = [],
                    sameUsers: any[] = []

                for (let i = 0; i < newEvent.invited_users.length; i++) {
                    const newUser = newEvent.invited_users[i]
                    let sameUser = reqEvent.invited_users.find((oldUser: any) => JSON.stringify(oldUser.user._id) === JSON.stringify(newUser.user))

                    if (sameUser)
                        sameUsers.push(sameUser.user)
                    else
                        newUsers.push(await Users.findById(newUser.user, 'email username'))
                }

                reqEvent.invited_users.forEach((oldUser: any) => {
                    if (!newEvent.invited_users.find((newUser: any) => JSON.stringify(newUser.user) === JSON.stringify(oldUser.user._id)))
                        removedUsers.push(oldUser.user)
                })

                let msg = `Dear User, This is to inform you that theb details of Event - ${reqEvent.title} held on ${new Date(reqEvent.start_date)} have been updated by ${reqEvent.created_by.user.username}.`

                // If critical information is changed, every member must respond again
                if (newEvent.start_date !== reqEvent.start_date || newEvent.end_date !== reqEvent.end_date || newEvent.location.link !== reqEvent.location.link) {
                    reqEvent.invited_users = newEvent.invited_users
                    reqEvent.invited_users.forEach((user: any) => user.status = 'pending')
                    newEvent.location = reqEvent.location
                    msg += 'Please accept or reject it again.'
                }

                // If any reminder dependency is modified, calculate reminders again
                if (newEvent.start_date !== reqEvent.start_date || newEvent.notify !== reqEvent.notify || newEvent.repeat_status !== reqEvent.repeat_status) {
                    reqEvent.next_reminder = calculateNextReminder(newEvent)
                    if (!reqEvent.next_reminder) {
                        reqEvent.reminder_status = false
                    }

                    ['start_date', 'end_date', 'notify', 'repeat_status'].forEach(key => reqEvent[key] = newEvent[key])
                }

                const result = await reqEvent.save()
                const { _id, title, created_by: { user: { username } } } = result
                const confirmMsg = 'Event updated!'

                // Send notifications
                let onlineUsers: string[] = [],
                mailList = sameUsers.map(({ email }: any) => email)
                sameUsers.forEach(({ _id }: any) => {
                    let reqSocket = global.connectedUsers.find(connection => JSON.stringify(connection.userID) === JSON.stringify(_id))
                    if (reqSocket)
                        onlineUsers.push(reqSocket.socketID as string)
                })
                if (onlineUsers.length) {
                    res.socket.server.io.in(onlineUsers).emit('notify', `Event: ${ title } has been updated by ${ username }.`)
                    res.socket.server.io.in(onlineUsers).emit('evtUpdate', result)
                }
                if (mailList.length)
                    await mail(confirmMsg, mailList, msg)

                onlineUsers = []
                mailList = newUsers.map(({ email }: any) => email)
                newUsers.forEach(({ _id }: any) => {
                    let reqSocket = global.connectedUsers.find(connection => JSON.stringify(connection.userID) === JSON.stringify(_id))
                    if (reqSocket)
                        onlineUsers.push(reqSocket.socketID as string)
                })
                if (onlineUsers.length) {
                    res.socket.server.io.in(onlineUsers).emit('notify', `${username} invited you to Event: ${title}.`)
                    res.socket.server.io.in(onlineUsers).emit('newEvt', result)
                }
                if (mailList.length) {
                    msg = `
                        Dear User,
                            This is to inform you that you have been invited to the Event - ${ title } by ${ username }.
                            You can either accept it or reject it by going to ${ process.env.BASE_URL }/events/received.
                    `
                    await mail(confirmMsg, mailList, msg)
                }

                onlineUsers = []
                mailList = removedUsers.map(({ email }: any) => email)
                removedUsers.forEach(({ _id }: any) => {
                    let reqSocket = global.connectedUsers.find(connection => JSON.stringify(connection.userID) === JSON.stringify(_id))
                    if (reqSocket)
                        onlineUsers.push(reqSocket.socketID as string)
                })
                if (onlineUsers.length)
                    res.socket.server.io.in(onlineUsers).emit('evtDel', _id)
                if (mailList.length) {
                    msg = `Dear User, This is to inform you that you have been removed from the Event: ${ reqEvent.title }.`
                    await mail(confirmMsg, mailList, msg)
                }

                return raiseSuccess(res, { msg: confirmMsg, data: result })
            } catch (error: any) {
                console.error(error)

                return raiseError(res)
            }

        default:
            return raiseNotFound(res)
    }
}
