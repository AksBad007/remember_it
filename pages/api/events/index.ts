import type { NextApiRequest } from 'next'
import Joi from 'joi'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../lib/Helpers/backend_helpers'
import { findConnection, NextApiResponseServerIO } from '../../../lib/Helpers/socket_helpers'
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
            invited_users: Joi.array().items(
                Joi.object().keys({ user: Joi.string().required })
            )
                .required()
                .unique('user.user')
        })

        try {
            const newEvent = await EventSchema.validateAsync(body)
            const reqUser = await getUserInfo(req)
            
            newEvent.created_by = {
                user: reqUser._id
            }

            newEvent.invited_users.forEach((invitedUser: any) => invitedUser.status = 'pending')

            // checking and setting first reminder
            if (newEvent.reminder_status) {
                if (newEvent.start_date > Date.now()) newEvent.next_reminder = newEvent.start_date - newEvent.notify * 1000
                else {
                    const actualDate = new Date(newEvent.start_date).setFullYear(new Date().getFullYear(), new Date().getMonth())
                    switch (newEvent.repeat_status) {
                        case 1:
                            actualDate < Date.now() ? newEvent.next_reminder = new Date(actualDate).setDate(new Date().getDate() + 1) : newEvent.next_reminder = actualDate
                            break
                        case 2:
                            newEvent.next_reminder = new Date(actualDate).setDate(new Date().getDate() + 7)
                            break
                        case 3:
                            newEvent.next_reminder = new Date(actualDate).setMonth(new Date().getMonth() + 1)
                            break
                        case 4:
                            newEvent.next_reminder = new Date(actualDate).setFullYear(new Date().getFullYear() + 1)
                            break
                        default:
                            newEvent.next_reminder = newEvent.start_date - newEvent.notify * 1000
                            break
                    }
        
                    newEvent.next_reminder = newEvent.next_reminder - newEvent.notify * 1000
                }
            }

            const result = await new Events(newEvent).save()
            const { title, created_by, invited_users } = result

            // Send notifications
            let onlineUsers: string[] = []
            invited_users.forEach((invitedUser: any) => {
                let reqSocket = findConnection(invitedUser.user._id)
                if (reqSocket)
                    onlineUsers.push(reqSocket.socketID as string)
            })
            res.socket.server.io.in(onlineUsers).emit('newEvt', result)

            // Send Mails
            const mailList = invited_users.map((user: any) => user.user.email)
            const confirmMsg = 'Event Created Successfully!'
            const msg = `
                Dear User,
                    This is to inform you that you have been invited to the Event - ${ title } by ${ created_by.user.username }.
                    You can either accept it or reject it by going to ${ process.env.BASE_URL }/events/recieved.
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
