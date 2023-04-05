import { useEffect, useState, useRef } from 'react'
import Calendar from '@toast-ui/react-calendar'
import { toast } from 'react-toastify'
import { ISchedule } from 'tui-calendar'
import SlimSelect from 'slim-select'
import DatePicker from 'react-datepicker'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Modal from './Modal'
import { _handleSubmit, postData } from '../Helpers/frontend_helpers'
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
    userID: string
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

    const getEvents = () => {
        const calendar = genInstance()
        const start = calendar.getDateRangeStart()._date
        const end = calendar.getDateRangeEnd()._date

        calendar.clear()
        rangeChange()
    }

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

    const changeView = (calendarView: string) => {
        genInstance().changeView(calendarView, true)
        rangeChange()
    }

    const next = () => {
      const calendar = genInstance()
      calendar.next()
      getEvents()
    }

    const prev = () => {
        const calendar = genInstance()
        calendar.prev()
        getEvents()
    }

    const getToday = () => {
        const calendar = genInstance()
        calendar.today()
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

            if (!newEvt.invited_users)
                newEvt.invited_users = []
            else
                newEvt.invited_users = newEvt.invited_users.map((userID: string) => ({ userID: userID}))

            newEvt.location = {
                description: newEvt.location_description,
                link: location === 'Online' ? newEvt.location_link : ''
            }

            delete newEvt.location_description
            delete newEvt.location_link

            if (newEvt.notify < 0)
                newEvt.reminder_status = false
            else
                newEvt.reminder_status = true

            return newEvt
        }

        const createNewEvent = async (e: React.FormEvent<HTMLFormElement>) => {
            try {
                let res = await postData('events', createEvtBody(_handleSubmit(e)))
                const { data, msg } = res.data

                let schedule: ISchedule = {
                    calendarId: '1',
                    category: 'time',
                    id: data._id,
                    title: data.title,
                    body: data.description,
                    start: data.start_date,
                    end: data.end_date,
                    location: data.location.location_description,
                    dueDateClass: userInfo.username,
                    attendees: [],
                    isReadOnly: !(userInfo._id === data.created_by.userID)
                }

                data.invited_users.forEach((user: InvitedUser) => schedule.attendees?.push(user.username))

                switch (data.repeat_status) {
                    case 1:
                        schedule.recurrenceRule = 'Every Day'
                        break
                    case 2:
                        schedule.recurrenceRule = 'Every Week'
                        break
                    case 3:
                        schedule.recurrenceRule = 'Every Month'
                        break
                    case 4:
                        schedule.recurrenceRule = 'Every Year'
                        break
                    default:
                        schedule.recurrenceRule = 'None'
                        break
                }

                calendarInstance.createSchedules([schedule])

                toast.success(msg)
                hideModal()
            } catch (error: any) {
                toast.error(error.message)
            }
        }

        const updateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
            const body = createEvtBody(_handleSubmit(e))
            console.log(body)

            // if (!body.invited_users)
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
        const viewSelect = new SlimSelect({
            select: '#calendar-view',
            settings: { showSearch: false },
            events: { afterChange: (option) => changeView(option[0].value) }
        })

        changeView('month')

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
                        popupDetailRepeat: schedule => 'Repeat: ' + schedule.recurrenceRule + '<br>organiser: ' + schedule.dueDateClass,
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
                    onBeforeUpdateSchedule={e => {
                        const evt = e.schedule

                        // request(calendarURL + 'getEvent/' + evt.id, { headers: headers })
                        //     .then(res => res.event)
                        //     .then(evt => { showModal(true) setEvt(evt) setStart(new Date(evt.start_date)) setEnd(new Date(evt.end_date)) })
                    }}
                    onBeforeDeleteSchedule={e => {
                        const evt = e.schedule

                        // if (window.confirm('Do you really want to delete this Event?'))
                        //     request(calendarURL + 'delete/' + project_id + '/' + evt.id, { headers: headers, method: 'DELETE' })
                        //     .then(() => genInstance().deleteSchedule(evt.id, '1', false))
                    }}
                />
                <button className={ styles['calendar-btns'] } onClick={next}><FaChevronRight /></button>
            </section>
        </>
    )
}
