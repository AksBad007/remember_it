import { useEffect, useState, useRef } from 'react'
import Calendar from '@toast-ui/react-calendar'
import { toast } from 'react-toastify'
import { ISchedule } from 'tui-calendar'
import SlimSelect from 'slim-select'
import DatePicker from 'react-datepicker'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Modal from './Modal'
import { _handleSubmit, post_or_put_data, request } from '../Helpers/frontend_helpers'
import 'tui-calendar/dist/tui-calendar.css'
import 'react-datepicker/dist/react-datepicker.css'
import styles from '../../styles/Calendar.module.css'

interface CalendarProps {
    userInfo: any
}

interface CalendarCreationModalProps {
    calendarInstance: any
}

interface InvitedUser {
    userID: string | any
    username: string
    email: string
    status: string
}

export default function CalendarComponent({ userInfo }: CalendarProps) {
    const calendarRef = useRef<any>(null)
    const [creationModal, setCreationModal] = useState(false)
    const [currentRange, setCurrentRange] = useState('')
    const [evtDates, setEvtDates] = useState({ start: new Date(), end: new Date() })
    const [evt, setEvt] = useState<any>(null)

    const genInstance = () => calendarRef.current.getInstance()

    const formatdate = (date: any) => new Date(date).toLocaleString('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })

    const rangeChange = () => {
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
    }

    const createSchedule = (evt: any) => {
        console.log('evt =', evt)
        let newEvent: ISchedule = {
            calendarId: '1',
            category: 'time',
            id: evt._id,
            title: evt.title,
            body: evt.description,
            start: evt.start_date,
            end: evt.end_date,
            location: evt.location.description,
            dueDateClass: evt.created_by.userID.username,
            attendees: evt.invited_users.map((user: InvitedUser) => user.userID.username),
            isReadOnly: !(userInfo._id === evt.created_by.userID._id)
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

    const getEvents = async () => {
        const calendar = genInstance()
        const start: Date = calendar.getDateRangeStart()._date
        const end: Date = calendar.getDateRangeEnd()._date

        calendar.clear()
        rangeChange()

        try {
            const eventRes = await request(`events/paginated/${ start.getFullYear() }/${ start.getMonth() }/${ end.getMonth() }/${ start.getDate() }/${ end.getDate() }`)
            const { allEvents, totalEvents } = eventRes.data.data
            let schedules: ISchedule[] = []

            if (totalEvents)
                schedules = allEvents.map((evt: any) => createSchedule(evt))

                calendar.createSchedules(schedules)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const changeView = (calendarView: string) => {
        genInstance().changeView(calendarView, true)
        rangeChange()
    }

    const next = () => {
      genInstance().next()
      getEvents()
    }

    const prev = () => {
        genInstance().prev()
        getEvents()
    }

    const getToday = () => {
        genInstance().today()
        getEvents()
    }

    const resetEvt = () => {
        setCreationModal(false)
        setEvtDates({ start: new Date(), end: new Date() })
        setEvt(null)
    }

    const CalendarCreationModal = ({ calendarInstance }: CalendarCreationModalProps) => {
        const [location, setLocation] = useState('None') // could be 'Online'(conference link) or Location(map coordinates)
        const [show, setShow] = useState(false) // for fade effect
        const [evtStart, setEvtStart] = useState(evtDates.start)
        const [evtEnd, setEvtEnd] = useState(evtDates.end)
        const [userList, setUserList] = useState<any[]>([])

        const createEvtBody = (body: { [k: string]: FormDataEntryValue }) => {
            let newEvt: any = { ...body }

            newEvt.invited_users = !newEvt.invited_users ? [] : newEvt.invited_users.map((userID: string) => ({ userID: userID}))
            newEvt.location = {
                description: newEvt.location_description,
                link: location === 'Online' ? newEvt.location_link : ''
            }
            newEvt.reminder_status = newEvt.notify > -1

            delete newEvt.location_description
            delete newEvt.location_link

            return newEvt
        }

        const createNewEvent = async (e: React.FormEvent<HTMLFormElement>) => {
            try {
                let res = await post_or_put_data('events', createEvtBody(_handleSubmit(e)))
                const { data, msg } = res.data

                calendarInstance.createSchedules([createSchedule(data)])
                toast.success(msg)
                hideModal()
            } catch (error: any) {
                toast.error(error.message)
            }
        }

        const updateEvent = async (e: React.FormEvent<HTMLFormElement>) => {            
            try {
                const res = await post_or_put_data('events', createEvtBody(_handleSubmit(e)), false)
                const { data, msg } = res.data

                calendarInstance.updateSchedule(data._id, '1', createSchedule(data), false)
                toast.success(msg)
                hideModal()
            } catch (error: any) {
                toast.error(error.message)
            }
        }

        const hideModal = () => {
            setShow(false)
            setTimeout(() => resetEvt(), 500)
        }

        useEffect(() => {
            const evtSelects = [
                new SlimSelect({ select: '#evt-users', settings: { showSearch: false } }),
                new SlimSelect({ select: '#evt-recurrence', settings: { showSearch: false } }),
                new SlimSelect({ select: '#evt-notify', settings: { showSearch: false } }),
                new SlimSelect({
                    select: '#evt-location',
                    settings: { showSearch: false },
                    events: { afterChange: (option) => setLocation(option[0].value) }
                })
            ]

            setShow(true)

            // Destroy all SlimSelects on Closing Modal
            return () => evtSelects.forEach(select => select.destroy())
        }, [])

        const body =
            <form id={ styles['evt-form'] } onReset={ hideModal } onSubmit={evt ? updateEvent : createNewEvent}>
                <div className='form-floating'>
                    <input
                        type='text'
                        name='title'
                        className='form-control shadow-none'
                        id='floatingInput'
                        placeholder='Title*'
                        defaultValue={evt ? evt.title : ''}
                        required
                    />
                    <label htmlFor='floatingInput'> Title* </label>
                </div>

                <div className={ styles['evt-dates'] }>
                    <div className={ `${styles['evt-cust-labels']} cursor-default` }>
                        <span> Starts At* </span>
                    </div>
                    <DatePicker
                        required
                        showTimeSelect
                        dateFormat='MMMM dd, yyyy hh:mm aa'
                        placeholderText='Starts At*'
                        name='start_date'
                        selected={evtStart}
                        onChange={(e: Date) => setEvtStart(e)}
                    />
                </div>

                <div className={ styles['evt-dates'] }>
                    <div className={ `${styles['evt-cust-labels']} cursor-default` }>
                        <span> Ends At* </span>
                    </div>
                    <DatePicker
                        required
                        showTimeSelect
                        dateFormat='MMMM dd, yyyy hh:mm aa'
                        placeholderText='Ends At*'
                        name='end_date'
                        selected={evtEnd}
                        minDate={evtStart}
                        onChange={(e: Date) => setEvtEnd(e)}
                    />
                </div>

                <div>
                    <select id='evt-users' name='invited_users' multiple>
                        <option data-placeholder='true' value=''> No Users Selected </option>
                        {
                            userList.map((user, idx) => (
                                <option key={ idx } value={ user._id }>{ user.user_name }</option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    <select id='evt-location' name='location_description' defaultValue={evt ? evt.location_description : ''} >
                        <option data-placeholder='true' value='None'> Select Location </option>
                        <option> None </option>
                        <option> Online </option>
                        {/* <option> Location </option> */}
                    </select>
                    {
                        location === 'Online' &&
                        <div className='form-floating mt-3'>
                            <input
                                type='text'
                                className='form-control shadow-none'
                                name='location_link'
                                id='floatingInput'
                                placeholder='Paste Link Here'
                                defaultValue={evt ? evt.location_link : ''}
                            />
                            <label htmlFor='floatingInput'> Paste Link Here </label>
                        </div>
                    }
                </div>

                <div>
                    <select id='evt-recurrence' name='repeat_status' defaultValue={evt ? evt.repeat_status : '0'}>
                        <option value='0'> Do Not Repeat </option>
                        <option value='1'> Every Day </option>
                        <option value='2'> Every Week </option>
                        <option value='3'> Every Month </option>
                        <option value='4'> Every Year </option>
                    </select>
                </div>

                <div>
                    <select id='evt-notify' name='notify' defaultValue={evt ? evt.notify : ''}>
                        <option value='-1'> No Notifications </option>
                        <option value='0'> At the Time of Event </option>
                        <option value='300'> 5 Minutes Before </option>
                        <option value='600'> 10 Minutes Before </option>
                        <option value='900'> 15 Minutes Before </option>
                    </select>
                </div>

                <div className='form-floating'>
                    <textarea
                        className='form-control'
                        placeholder='Description'
                        name='description'
                        defaultValue={evt ? evt.description : ''}
                        id='floatingTextarea'>
                    </textarea>
                    <label htmlFor='floatingTextarea'> Description </label>
                </div>

                <span id={ styles['evt-required-flag'] }> *Required </span>

                <div id={ styles['evt-btns'] }>
                    <button type='submit'> Submit </button>
                    <button type='reset'> Cancel </button>
                </div>
            </form>

        return <Modal bg={show} title={ evt ? 'Update Event': 'Create New Event' } body={ body }/>
    }

    useEffect(() => {
        getEvents()
        const viewSelect = new SlimSelect({
            select: '#calendar-view',
            settings: { showSearch: false },
            events: { afterChange: (option) => changeView(option[0].value) }
        })

        changeView('month')

        // Destroy SlimSelects on Page Change
        return () => viewSelect.destroy()
    }, [])

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
                { creationModal && <CalendarCreationModal calendarInstance={genInstance()} /> }

                <button className={ styles['calendar-btns'] } onClick={ prev }><FaChevronLeft /></button>
                <Calendar
                    ref={ calendarRef }
                    usageStatistics={false}
                    useDetailPopup
                    useCreationPopup={false}
                    height='80vh'
                    view='month'
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
