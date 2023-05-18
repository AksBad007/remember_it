import type { NextApiRequest } from 'next'
import Joi from 'joi'
import type { NextApiResponseServerIO } from '../../../lib/Helpers/socket_helpers'
import { raiseNotFound, raiseError, raiseSuccess, calculateNextReminder } from '../../../lib/Helpers/backend_helpers'
import mail from '../../../lib/Helpers/mail_helpers'
import dbConnect, { getUserInfo } from '../../../lib/Helpers/db_helpers'
import Events from '../../../lib/Models/Event.model'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
    await dbConnect()
    const { method, body } = req

    // Create an Event
    if (method === 'POST') {
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
            const reqUser = await getUserInfo(req)

            newEvent.created_by = { user: reqUser._id }
            newEvent.invited_users.forEach((invitedUser: any) => invitedUser.status = 'pending')
            newEvent.next_reminder = calculateNextReminder(newEvent)

            const result = await new Events(newEvent).save()
            const { title, created_by: { user: { username } }, invited_users } = result

            // Send notifications
            let onlineUsers: string[] = []
            invited_users.forEach((invitedUser: any) => {
                let reqSocket = global.connectedUsers.find(connection => JSON.stringify(connection.userID) === JSON.stringify(invitedUser.user._id))
                if (reqSocket)
                    onlineUsers.push(reqSocket.socketID as string)
            })

            if (onlineUsers.length) {
                res.socket.server.io.in(onlineUsers).emit('notify', `${username} invited you to Event: ${title}.`)
                res.socket.server.io.in(onlineUsers).emit('newEvt', result)
            }

            // Send Mails
            const mailList = invited_users.map((user: any) => user.user.email)
            const confirmMsg = 'Event Created Successfully!'
            const msg = `
                Dear User,
                    This is to inform you that you have been invited to the Event - ${ title } by ${ username }.
                    You can either accept it or reject it by going to ${ process.env.BASE_URL }/events/received.
            `
            await mail(confirmMsg, mailList, msg)

            return raiseSuccess(res, { msg: confirmMsg, data: result })
        } catch (error: any) {
            console.error(error)

            switch (error.name) {
                case 'ValidationError':
                    return raiseError(res, 'Invalid Event Information.')
                default:
                    return raiseError(res)
            }
        }
    }
    return raiseNotFound(res)
}
