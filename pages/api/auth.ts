import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import { compare } from 'bcrypt'
import { raiseNotFound, raiseError, raiseSuccess, signClaim, raiseUnauthorized } from '../../lib/Helpers/backend_helpers'
import dbConnect, { getUserInfo } from '../../lib/Helpers/db_helpers'
import mail from '../../lib/Helpers/mail_helpers'
import Users from '../../lib/Models/User.model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect()
    const { method, query, body, headers } = req
    const userID = headers.userid

    switch (method) {
        case 'POST':
            switch (query.mode) {
                case 'register':
                    const registerSchema = Joi.object({
                        username: Joi.string().required(),
                        email: Joi.string().email().required(),
                        password: Joi.string().required(),
                        remember: Joi.optional()
                    })

                    try {
                        const newUser = await registerSchema.validateAsync(body)
                        const result = await new Users(newUser).save()
                        const token = await signClaim(result._id)

                        const { email, username } = result
                        const msg = `Congratutions! ${username}, You have successfully registered.`
                        const confirmMsg = 'Registration Succesful!'
                        await mail(confirmMsg, email, msg)

                        return raiseSuccess(res, { msg: confirmMsg, data: token })
                    } catch (error: any) {
                        console.error(error)

                        switch (error.name) {
                            case 'MongoServerError':
                                if (error.code === 11000)
                                    return raiseError(res, 'User Already Exists.')
                                return raiseError(res)
                            case 'ValidationError':
                                return raiseError(res, 'Invalid User Information.')
                            default:
                                return raiseError(res)
                        }
                    }

                case 'login':
                    const loginSchema = Joi.object({
                        email: Joi.string().email().required(),
                        password: Joi.string().required(),
                        remember: Joi.optional()
                    })

                    try {
                        const existingUser = await loginSchema.validateAsync(body)
                        const result = await Users.findOne({ email: existingUser.email })

                        if (result) {
                            if (await compare(existingUser.password, result.password)) {
                                const token = await signClaim(result._id)

                                return raiseSuccess(res, { msg: 'Login Succesful.', data: token })
                            }

                            return raiseError(res, 'Incorrect Password.')
                        }

                        throw new Error('User Not Found.')
                    } catch (error) {
                        console.error(error)

                        return raiseNotFound(res, 'User Not Found.')
                    }

                default:
                    return raiseNotFound(res, 'Invalid Authentication Mode.')
            }

        case 'PUT':

            break

        case 'DELETE':
            try {
                const { email, username } = await Users.findByIdAndDelete(userID)

                const msg = `Dear ${username}, We are sorry to let you go. Your account has been permanently deleted.`
                const confirmMsg = 'Account Deleted!'
                await mail(confirmMsg, email, msg)

                return raiseSuccess(res, { msg: confirmMsg, data: null })
            } catch (error) {
                console.error(error)

                return raiseError(res, 'Invalid User ID.')
            }

        case 'GET':
            try {
                const result = await getUserInfo(req)

                if (result)
                    return raiseSuccess(res, { msg: 'User Found.', data: result })
                return raiseNotFound(res, 'User Not Found.')
            } catch (error) {
                console.error(error)

                return raiseUnauthorized(res, 'Invalid Authorization Token')
            }

        default:
            return raiseNotFound(res)
    }
}
