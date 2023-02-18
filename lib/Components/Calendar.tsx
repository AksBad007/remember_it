import { LegacyRef, useRef, useState, useEffect } from 'react'
import Calendar from '@toast-ui/react-calendar'
import '@toast-ui/calendar/dist/toastui-calendar.min.css'

export default function CalendarPage() {
    const currentRef = useRef() as LegacyRef<Calendar>

    return (
        <Calendar
            ref={ currentRef }
            usageStatistics={ false }
            useDetailPopup
            useFormPopup
            height='90vh'
            view='month'
            template={{
                popupDetailLocation: schedule => 'location: ' + schedule.location,
                popupDetailRecurrenceRule: schedule => 'repeat: ' + schedule.recurrenceRule + `<br>organiser: ` + schedule.dueDateClass,
                popupDetailAttendees: schedule => 'members: ' + schedule.attendees.join(', '),
                popupDetailState: schedule => 'state: ' + schedule.state,
                popupDetailBody: schedule => 'desc: ' + schedule.body,
                popupEdit: () => 'Edit',
                popupDelete: () => 'Delete',
                popupDetailDate: ({ allDay, start, end }) => (
                    'Start: ' + new Date(start).toLocaleString('en', { year: "numeric", month: "long", day: "2-digit", hour: "2-digit", minute: "2-digit" }) +
                    '<br>End: ' + new Date(end).toLocaleString('en', { year: "numeric", month: "long", day: "2-digit", hour: "2-digit", minute: "2-digit" }))
            }}
        />
    )
}
