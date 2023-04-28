import { useEffect, useState, useRef, useCallback } from 'react'
import Calendar from '@toast-ui/react-calendar'
import { toast } from 'react-toastify'
import { ISchedule } from 'tui-calendar'
import SlimSelect from 'slim-select'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import CalendarCreationModal from './CalendarCreationModal'
import { _handleSubmit, request, createSchedule } from '../Helpers/frontend_helpers'
import 'tui-calendar/dist/tui-calendar.css'
import styles from '../../styles/Calendar.module.css'

interface CalendarProps {
    userInfo: any
}

export default function CalendarComponent({ userInfo }: CalendarProps) {
    const calendarRef = useRef<any>(null)
    const [creationModal, setCreationModal] = useState(false)
    const [currentRange, setCurrentRange] = useState('')
    const [evtDates, setEvtDates] = useState({ start: new Date(), end: new Date() })
    const [evt, setEvt] = useState<any>(null)

    const genInstance = () => calendarRef.current.getInstance()

    const formatdate = (date: any) => new Date(date).toLocaleString('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })

    const getEvents = useCallback(async () => {
        const calendar = genInstance()
        const start: Date = calendar.getDateRangeStart()._date
        const end: Date = calendar.getDateRangeEnd()._date

        calendar.clear()

        try {
            const eventRes = await request(`events/paginated/${ start.getFullYear() }/${ start.getMonth() }/${ end.getMonth() }/${ start.getDate() }/${ end.getDate() }`)
            const { allEvents, totalEvents } = eventRes.data.data
            let schedules: ISchedule[] = []

            if (totalEvents)
                schedules = allEvents.map((evt: any) => createSchedule(evt, userInfo))

            calendar.createSchedules(schedules)
        } catch (error: any) {
            toast.error(error.message)
        }
    }, [userInfo])

    const rangeChange = useCallback(() => {
        const calendar = genInstance()
        const calendarView: string = calendar.getViewName()

        switch (calendarView) {
            case 'day':
                setCurrentRange(calendar.getDate()._date.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: '2-digit' }))
                break
            case 'week':
                setCurrentRange(
                    calendar.getDateRangeStart()._date.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: '2-digit' })
                    + ' - ' +
                    calendar.getDateRangeEnd()._date.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: '2-digit'})
                )
                break
            default:
                setCurrentRange(calendar.getDate()._date.toLocaleDateString('en-us', { year: 'numeric', month: 'long' }))
                break
        }

        getEvents()
    }, [getEvents])

    const changeView = useCallback((calendarView: string) => {
        genInstance().changeView(calendarView, true)
        rangeChange()
    }, [rangeChange])

    const next = () => {
      genInstance().next()
      rangeChange()
    }

    const prev = () => {
        genInstance().prev()
        rangeChange()
    }

    const getToday = () => {
        genInstance().today()
        rangeChange()
    }

    const resetEvt = () => {
        setCreationModal(false)
        setEvtDates({ start: new Date(), end: new Date() })
        setEvt(null)
    }

    useEffect(() => {
        const viewSelect = new SlimSelect({
            select: '#calendar-view',
            settings: { showSearch: false },
            events: { afterChange: (option) => changeView(option[0].value) }
        })

        changeView('month')

        // Destroy SlimSelects on Page Change
        return () => viewSelect.destroy()
    }, [changeView])

    return (
        <>
            <section id={ styles['calendar-controls'] }>
                <button onClick={getToday}> Today </button>
                <div>
                    <select id='calendar-view'>
                        <option value='month'> Month </option>
                        <option value='day'> Day </option>
                        <option value='week'> Week </option>
                    </select>
                </div>
                <h4 id={ styles['current'] }>{ currentRange }</h4>
            </section>

            <section id={ styles['whole-calendar'] }>
                {
                    creationModal &&
                    <CalendarCreationModal
                        userInfo={ userInfo }
                        calendarInstance={genInstance()}
                        evtDates={ evtDates }
                        evt={ evt }
                        reset={ resetEvt }
                    />
                }

                <button className={ styles['calendar-btns'] } onClick={ prev }><FaChevronLeft /></button>
                <Calendar
                    ref={ calendarRef }
                    usageStatistics={false}
                    useDetailPopup
                    useCreationPopup={false}
                    height='80vh'
                    view='month'
                    calendars={[
                        {
                            id: '1',
                            name: 'Scheduled Event',
                            color: '#ffffff',
                            bgColor: 'var(--purple)',
                            dragBgColor: 'var(--purple)',
                            borderColor: 'var(--purple)'
                        },
                        {
                            id: '2',
                            name: 'Holiday',
                            color: '#ffffff',
                            bgColor: 'var(--purple)',
                            dragBgColor: 'var(--purple)',
                            borderColor: 'var(--purple)'
                        }
                    ]}
                    template={{
                        popupDetailLocation: schedule => 'Location: ' + schedule.location,
                        popupDetailRepeat: schedule => 'Repeat: ' + schedule.recurrenceRule + '<br>Organiser: ' + schedule.dueDateClass,
                        popupDetailUser: schedule => 'Members: ' + schedule.attendees?.join(', '),
                        popupDetailState: schedule => 'State: ' + schedule.state,
                        popupDetailBody: schedule => 'Desc: ' + schedule.body,
                        popupEdit: () => 'Edit',
                        popupDelete: () => 'Delete',
                        popupDetailDate: (_allDay, start, end) => 'Start: ' + formatdate(start) + '<br>End: ' + formatdate(end)
                    }}
                    onBeforeCreateSchedule={(scheduleData: any) => {
                        scheduleData.guide.clearGuideElement()
                        const start = scheduleData.start._date, end = scheduleData.end._date

                        setCreationModal(true)
                        setEvtDates({ start, end })
                    }}
                    onBeforeUpdateSchedule={async (evt) => {
                        const evtID = evt.schedule.id

                        try {
                            let res = await request('events/' + evtID)
                            res = res.data.data

                            setCreationModal(true)
                            setEvt(res)
                            setEvtDates({ start: new Date(res.start_date), end: new Date(res.end_date) })
                        } catch (error: any) {
                            toast.error(error.message)
                        }
                    }}
                    onBeforeDeleteSchedule={async (evt) => {
                        const evtID = evt.schedule.id

                        if (window.confirm('Do you really want to delete this Event?'))
                            try {
                                let res = await request('events/created/' + evtID, { method: 'DELETE' })
                                res = res.data

                                toast.success(res.msg)
                                genInstance().deleteSchedule(evtID, '1', false)
                            } catch (error: any) {
                                toast.error(error.message)
                            }
                    }}
                />
                <button className={ styles['calendar-btns'] } onClick={next}><FaChevronRight /></button>
            </section>
        </>
    )
}
