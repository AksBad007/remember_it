import type { Server as SocketIOServer } from 'socket.io'
import schedule from 'node-schedule'
import Events from '../Models/Event.model'
import mail from './mail_helpers'

export const initReminders = (io: SocketIOServer) => {
    const calendarNotify = async (list: any[], msg: string) => {
        let onlineUsers: string[] = []
        let mailList: string[] = []

        for (let i = 0; i < list.length; i++) {
            const { user, status } = list[i]

            if (status !== 'rejected') {
                mailList.push(user.email)

                let reqSocket = global.connectedUsers.find(connection => JSON.stringify(connection.userID) === JSON.stringify(user._id))
                if (reqSocket)
                    onlineUsers.push(reqSocket.socketID as string)
            }
        }
        
        if (onlineUsers.length)
            io.in(onlineUsers).emit('reminder', msg)

        await mail('Event Reminder!', mailList, msg)
    }

    schedule.scheduleJob('*/5 * * * *', async (currenTTime) => {
        const events = await Events
            .find({ reminder_status: true, next_reminder: currenTTime })
            .populate('created_by.user invited_users.user', 'email username')

        console.log(events.length, 'reminders on', currenTTime)

        for (let i = 0; i < events.length; i++) {
            const { title, created_by, repeat_status, invited_users } = events[i]
            const allMembers = [ ...invited_users, { user: created_by.user, status: 'accepted' }]
            const msg = 'Reminder for Event: ' + title

            switch (repeat_status) {
                case 1:
                    await calendarNotify(allMembers, msg)
                    console.log('Daily Reminder Sent for eventID:', events[i]._id, ', titled:', title)

                    events[i].next_reminder = events[i].next_reminder.setDate(new Date().getDate() + 1)
                    await events[i].save()
                    break

                case 2:
                    await calendarNotify(allMembers, msg)
                    console.log('Weekly Reminder Sent for eventID:', events[i]._id, ', titled:', title)

                    events[i].next_reminder = events[i].next_reminder.setDate(new Date().getDate() + 7)
                    await events[i].save()
                    break

                case 3:
                    await calendarNotify(allMembers, msg)
                    console.log('Monthly Reminder Sent for eventID:', events[i]._id, ', titled:', title)

                    events[i].next_reminder = events[i].next_reminder.setMonth(new Date().getMonth() + 1)
                    await events[i].save()
                    break

                case 4:
                    await calendarNotify(allMembers, msg)
                    console.log('Yearly Reminder Sent for eventID:', events[i]._id, ', titled:', title)

                    events[i].next_reminder = events[i].next_reminder.setFullYear(new Date().getFullYear() + 1)
                    await events[i].save()
                    break

                default:
                    await calendarNotify(allMembers, msg)
                    console.log('Reminder Sent for eventID:', events[i]._id, ', titled:', title)
                    break
            }
        }
    })
}
