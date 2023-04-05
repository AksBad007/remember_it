import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../lib/Helpers/backend_helpers'
import dbConnect, { getUserInfo } from '../../../lib/Helpers/db_helpers'
import Events from '../../../lib/Models/Event.model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, body } = req

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
                Joi.object().keys({ userID: Joi.string().required })
            )
                .required()
                .unique('user.userID')
        })

        try {
            const newEvent = await EventSchema.validateAsync(body)
            const reqUser = await getUserInfo(req)
            
            newEvent.created_by = {
                userID: reqUser._id
            }

            newEvent.invited_users.forEach((invitedUser: { userID: string, status?: string }) => invitedUser.status = 'pending')

            // checking and setting first reminder
            if (newEvent.reminder_status) {
                if (newEvent.start_date > Date.now()) newEvent.next_reminder = newEvent.start_date - newEvent.notify * 1000
                else {
                    let actualDate = new Date(newEvent.start_date).setFullYear(new Date().getFullYear(), new Date().getMonth())
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

            return raiseSuccess(res, { msg: 'Event Created Successfully.', data: result })
        } catch (error: any) {
            console.error(error)

            switch (error.name) {
                case 'ValidationError':
                    return raiseError(res, 'Invalid Event Information.')
                default:
                    return raiseError(res)
            }
        }
    } else
        return raiseNotFound(res)
}
