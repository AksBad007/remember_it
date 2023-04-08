import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/Helpers/db_helpers'
import Events from '../../../lib/Models/Event.model'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../lib/Helpers/backend_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { method, body, query: { evtID } } = req

  
  switch (method) {
    // Fetch an existing event
    case 'GET':
      
      break
    // Edit an Existing Event
    case 'PUT':

      break
    default:
      return raiseNotFound(res)
  }
  return raiseNotFound(res)
}
