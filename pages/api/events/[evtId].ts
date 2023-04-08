import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import dbConnect from '../../../lib/Helpers/db_helpers'
import Events from '../../../lib/Models/Event.model'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../lib/Helpers/backend_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { method, body, query: { evtID } } = req

  switch (method) {
    // Fetch an existing event
    case 'GET':
      try {
        const reqEvt = await Events.findById(evtID)

        if (reqEvt)
          return raiseSuccess(res, { msg: '', data: reqEvt })
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
        invited_users: Joi.array().items(
          Joi.object().keys({ userID: Joi.string().required })
        )
          .required()
          .unique('user.userID')
      })

      try {
        const newEvent = await EventSchema.validateAsync(body)
        const reqEvent = await Events.findById(evtID)

        Object.keys(newEvent).forEach(key => reqEvent[key] = newEvent[key])

        let change = false, newUserList: any[] = newEvent.invited_users
        if (newUserList === reqEvent.invited_users) change = false
        else for (let i = 0; i < newUserList.length; i++)
          if (!reqEvent.invited_users.find((oldUser: any) => JSON.stringify(oldUser.userID) === JSON.stringify(newUserList[i].userID))) {
            change = true
            break
          }

        // let removedUsers = reqEvent.invited_users.filter((oldUser: any) => !reqEvent.invited_users.some((newUser: any) => JSON.stringify(oldUser.user_id) === JSON.stringify(newUser.user_id)))
        // let msg = ''

        if (change || newEvent.start_date !== reqEvent.start_date || newEvent.end_date !== reqEvent.end_date || newEvent.location.description !== reqEvent.location.description || newEvent.location.link !== reqEvent.location.link) {
          reqEvent.invited_users.forEach((user: any) => user.status = 'pending')
          // msg = 'Details of Event'
        }

        if (newEvent.start_date !== reqEvent.start_date || newEvent.notify !== reqEvent.notify || newEvent.repeat_status !== reqEvent.repeat_status) {
          if (newEvent.reminder_status) {
            let actualDate = new Date(newEvent.start_date).setFullYear(new Date().getFullYear(), new Date().getMonth()) - newEvent.notify * 1000
            if (newEvent.start_date !== reqEvent.start_date) reqEvent.next_reminder = newEvent.start_date - newEvent.notify * 1000

            switch (newEvent.repeat_status) {
                case 1:
                  actualDate < Date.now() ? reqEvent.next_reminder = new Date(actualDate).setDate(new Date().getDate() + 1) : reqEvent.next_reminder = actualDate
                  break
                case 2:
                  reqEvent.next_reminder = new Date(actualDate).setDate(new Date().getDate() + 7)
                  break
                case 3:
                  reqEvent.next_reminder = new Date(actualDate).setMonth(new Date().getMonth() + 1)
                  break
                case 4:
                  reqEvent.next_reminder = new Date(actualDate).setFullYear(new Date().getFullYear() + 1)
                  break
            }

            reqEvent.next_reminder = reqEvent.next_reminder + (reqEvent.notify - newEvent.notify) * 1000
          } else
            newEvent.reminder_status = false
        }

        const result = await reqEvent.save()

        return raiseSuccess(res, { msg: 'Event Edited.', data: result })
      } catch (error: any) {
        console.error(error)
        
        return raiseError(res)
      }

    default:
      return raiseNotFound(res)
  }
}
