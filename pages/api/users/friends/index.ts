import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseNotFound, raiseSuccess } from '../../../../lib/Helpers/backend_helpers';
import dbConnect, { getUserInfo } from '../../../../lib/Helpers/db_helpers'
import Users from '../../../../lib/Models/User.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  const { method, query, body, headers } = req
  const userID = headers.authorization

  const userInfo = await getUserInfo(userID)
  const friendID = body._id

  switch (method) {
    case 'POST':

      break

    case 'DELETE':

      break

    default:
      return raiseNotFound(res)
  }
}
