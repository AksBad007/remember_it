import type { NextApiRequest, NextApiResponse } from 'next'
import { raiseError, raiseSuccess } from '../../../src/Helpers/backCommon'
import dbConnect from '../../../src/Helpers/dbConnect'
import User from '../../../src/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query, body } = req

    switch (method) {
        case 'POST':
            switch (query['mode']) {
                case 'register':
                    User.exists({ email: body['email'] }, (err, doc) => {
                        if (doc) raiseError(res, 'User Already Exists.')
                    })

                    const newUser = new User({
                        displayName: body['username'],
                        email: body['email'],
                        password: body['password']
                    })

                    await newUser
                        .save()
                        .then((doc) => raiseSuccess(res, { msg: 'Registration Succesful.', data: doc }))
                        .catch((err) => raiseError(res, err))
                case 'login':

                    break
                default:
                    raiseError(res, "Invalid Authentication Mode.")
            }
        case 'PUT':

            break
        case 'DELETE':

            break
        default:
            raiseError(res, 'Invalid Method.')
    }
}
