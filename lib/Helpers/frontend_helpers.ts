import { ISchedule } from 'tui-calendar'

//Interfaces
interface InvitedUser {
    user: string | any
    username: string
    email: string
    status: string
}

export interface EventListProps {
    userInfo?: any
    allEvents: any[]
    totalEvents: number
}

export const redirectObj = {
    redirect: {
        permanent: false,
        destination: '/logout'
    }
}

// Convert Form Data to JSON
export const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    return Object.fromEntries(new FormData(e.currentTarget))
}

//Network Requests
export const request = async (url: string, options: RequestInit = {}) => {
    let req = await fetch('/api/' + url, options)
    let data = await req.json()

    if (req.ok)
        return data.data

    throw new Error(data.error)
}

export const post_or_put_data = async (url: string, body?: any, post=true) => {
    let req = await request(url, {
        method: post ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })

    return req
}

// Return Event Body
export const createSchedule = (evt: any, userInfo: any) => {
    console.log(evt, userInfo)
    let newEvent: ISchedule = {
        calendarId: '1',
        category: 'time',
        id: evt._id,
        title: evt.title,
        body: evt.description,
        start: evt.start_date,
        end: evt.end_date,
        location: evt.location.description,
        dueDateClass: evt.created_by.user.username,
        attendees: evt.invited_users.map((user: InvitedUser) => user.user.username),
        isReadOnly: !(userInfo._id === evt.created_by.user._id)
    }

    switch (evt.repeat_status) {
        case 1:
            newEvent.recurrenceRule = 'Every Day'
            break
        case 2:
            newEvent.recurrenceRule = 'Every Week'
            break
        case 3:
            newEvent.recurrenceRule = 'Every Month'
            break
        case 4:
            newEvent.recurrenceRule = 'Every Year'
            break
        default:
            newEvent.recurrenceRule = 'None'
            break
    }

    return newEvent
}

export const getSelectValues = (select: HTMLSelectElement) => {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];
        if (opt.selected) result.push(opt.value || opt.text);
    }

    return result;
}
