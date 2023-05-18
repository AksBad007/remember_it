import { createTransport } from 'nodemailer'

export default function mail(subject: string, to: string | string[], msg: string) {
    if (!to.length)
        return

    const { EMAIL_USERNAME, EMAIL_PASSWORD } = process.env

    return createTransport({
        port: 465,
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD
        }
    })
        .sendMail({
            from: EMAIL_USERNAME,
            to,
            subject,
            text: msg,
            html: `<div>${msg}</div>`
        })
}
