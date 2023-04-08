import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../lib/Helpers/db_helpers'
import Events from '../../../../lib/Models/Event.model'
import { raiseNotFound, raiseError, raiseSuccess } from '../../../../lib/Helpers/backend_helpers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { method, headers: { userID } } = req

  // Fetch Created Events
  if (method === 'GET') {

  }
  return raiseNotFound(res)
}
