import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Events from '../../../../lib/Models/Event.model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { method, query: { params = [] }, headers } = req
  const userID = headers.userid

  // Fetch Events sorted by Date
  if (method === 'GET') {
    if (params.length !== 5)
      return raiseError(res, 'Invalid Time Duration.')

    try {
      const year = +params[0],
        firstMonth = +params[1], lastMonth = +params[2],
        firstDay = +params[3], lastDay = +params[4]
      const start = new Date(year, firstMonth, firstDay),
        end = new Date(year, lastMonth, lastDay)

      // Edge Case for Same Day
      if (start.valueOf() === end.valueOf()) {
        start.setDate(start.getDate() - 1)
        end.setDate(end.getDate() + 1)
      }

      const orCondition = [
        { 'created_by.userID': userID },
        { 'invited_users.userID': userID }
      ]

      const allEvents = await Events
        .find({
          $and: [
            {
              $or: [
                {
                  $and: [ // Event starts and ends in the range
                    { start_date: { $gte: start, $lte: end } },
                    { end_date: { $gte: start, $lte: end } }
                  ]
                },
                {
                  $and: [ // Event starts in the range and end later
                    { start_date: { $gte: start, $lte: end } },
                    { end_date: { $gte: end } }
                  ]
                },
                {
                  $and: [ // Event starts earlier but ends in the range
                    { start_date: { $lte: start } },
                    { end_date: { $gte: start, $lte: end } }
                  ]
                },
                {
                  $and: [ // Event starts earlier and ends later
                    { start_date: { $lte: start } },
                    { end_date: { $gte: end } }
                  ]
                },
              ]
            },
            { $or: orCondition }
          ]
        })
        .populate('created_by.userID invited_users.userID', 'email username')

      const totalEvents = await Events.countDocuments({ $or: orCondition })

      return raiseSuccess(res, { msg: 'Events Found Successfully.', data: { allEvents, totalEvents } })
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
