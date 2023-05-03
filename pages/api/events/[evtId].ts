import type { NextApiRequest } from 'next'
import Joi from 'joi'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../lib/Helpers/backend_helpers'
import { findConnection, NextApiResponseServerIO } from '../../../lib/Helpers/socket_helpers'
import dbConnect from '../../../lib/Helpers/db_helpers'
import mail from '../../../lib/Helpers/mail_helpers'
import Events from '../../../lib/Models/Event.model'

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
        invited_users: Joi.array().items(
          Joi.object().keys({ userID: Joi.string().required })
        )
          .required()
          .unique('user.user')
      })

      try {
        const newEvent = await EventSchema.validateAsync(body)
        const reqEvent = await Events.findById(evtID).populate('created_by.user invited_users.user', 'email username')

        Object.keys(newEvent).forEach(key => reqEvent[key] = newEvent[key])

        let change = false, newUserList: any[] = newEvent.invited_users
        if (newUserList === reqEvent.invited_users) change = false
        else for (let i = 0; i < newUserList.length; i++)
          if (!reqEvent.invited_users.find((oldUser: any) => JSON.stringify(oldUser.user) === JSON.stringify(newUserList[i].user))) {
            change = true
            break
          }

        let removedUsers = reqEvent.invited_users.filter((oldUser: any) => !reqEvent.invited_users.some((newUser: any) => JSON.stringify(oldUser.user._id) === JSON.stringify(newUser.user._id)))
        let msg = `Dear User, This is to inform you that theb details of Event - ${ reqEvent.title } held on ${ new Date(reqEvent.start_date) } have been edited by ${ reqEvent.created_by.user.username }.`

        if (change || newEvent.start_date !== reqEvent.start_date || newEvent.end_date !== reqEvent.end_date || newEvent.location.description !== reqEvent.location.description || newEvent.location.link !== reqEvent.location.link) {
          reqEvent.invited_users.forEach((user: any) => user.status = 'pending')
          msg += 'Please accept or reject it again.'
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

        const { invited_users } = result
        const mailList = invited_users.map((user: any) => user.user.email)
        const confirmMsg = 'Event Edited!'
        await mail(confirmMsg, mailList, msg)

        if (removedUsers) {
          const removedMailList = removedUsers.map((user: any) => user.user.email)
          msg = `Dear User, This is to inform you that you have been removed from the Event - ${ reqEvent.title }.`
          await mail(confirmMsg, removedMailList, msg)
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
