import type { NextApiRequest, NextApiResponse } from 'next'
import { getEvents } from '../../../../lib/Helpers/db_helpers'
import { raiseError, raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers: { userID }, query: { offset = 0 } } = req

  // Fetch Recieved Events
  if (method === 'GET') 
    try {
      const data = await getEvents(offset as number, userID)

      return raiseSuccess(res, { msg: 'Events Found Successfuly.', data })
    } catch (error: any) {
      console.error(error)

      return raiseError(res)
    }
  return raiseNotFound(res)
}
