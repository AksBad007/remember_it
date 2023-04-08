import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Events from '../../../../lib/Models/Event.model'
import UserModel from '../../../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { method, query: { params = [] }, headers } = req
  const userID = headers.userid

  // Fetch Events sorted by Date
  if (method === 'GET') {
    try {
      const year = +params[0],
        firstMonth = +params[1], lastMonth = +params[2],
        firstDay = +params[3], lastDay = +params[4]
      const start = new Date(year, firstMonth, firstDay),
        end = new Date(year, lastMonth, lastDay)

      const allEvents = await Events
        .find({
          start_date: { $gte: start, $lte: end },
          end_date: { $gte: start, $lte: end },
          $or: [
            { 'created_by.userID': userID },
            { 'invited_users.userID': userID }
          ]
        })
        .populate('created_by.userID invited_users.userID', 'email username')

      const totalEvents = await Events.countDocuments({
        $or: [
          { 'created_by.userID': userID },
          { 'invited_users.userID': userID }
        ]
      })

      return raiseSuccess(res, { msg: '', data: { allEvents, totalEvents } })
    } catch (error: any) {
      console.error(error)

      switch (error.name) {
        case 'CastError':
          return raiseError(res, 'Invalid Time Duration.')
        default:
          return raiseError(res)
      }
    }
  }

  return raiseNotFound(res)
}
