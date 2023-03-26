import { useEffect, useState, useRef } from 'react'
import Calendar from '@toast-ui/react-calendar'
import SlimSelect from 'slim-select'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Modal from './Modal'
import 'tui-calendar/dist/tui-calendar.css'
import styles from '../../styles/Calendar.module.css'

interface CalendarProps {
    eventList: any[]
    userInfo: any
}

interface CalendarCreationModalProps {
    calendarInstance: any
}

export default function CalendarComponent({ eventList, userInfo }: CalendarProps) {
    const currentRef = useRef<any>(null)
    const viewRef = useRef<HTMLSelectElement>(null)
    const [creationModal, setCreationModal] = useState(false)
    const [calendarView, setCalendarView] = useState('month')
    const [currentRange, setCurrentRange] = useState('')
    const [start, setStart] = useState<any>(null)
    const [end, setEnd] = useState<any>(null)
    const [evt, setEvt] = useState<any>(null)

    const genInstance = () => currentRef.current.getInstance()

    const formatdate = (date: any) => new Date(date).toLocaleString('en', { year: "numeric", month: "long", day: "2-digit", hour: "2-digit", minute: "2-digit" })

    const getEvents = () => {
        const calendar = genInstance()
        const start = calendar.getDateRangeStart()._date
        const end = calendar.getDateRangeEnd()._date

        calendar.clear()
        rangeChange()
    }

    const rangeChange = () => {
        const calendar = genInstance()

        switch (calendarView) {
            case "day":
                setCurrentRange(calendar.getDate()._date.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "2-digit" }))
                break;
            case "month":
                setCurrentRange(calendar.getDate()._date.toLocaleDateString('en-us', { year: "numeric", month: "long" }))
                break;
            default:
                setCurrentRange(calendar.getDateRangeStart()._date.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "2-digit" }) + " - " + calendar.getDateRangeEnd()._date.toLocaleDateString('en-us', {year: "numeric", month: "short", day: "2-digit"}))
                break;
        }
    }

    const changeView = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCalendarView(e.target.value)
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
        setStart(null)
        setEnd(null)
        setEvt(null)
    }

    const CalendarCreationModal = ({ calendarInstance }: CalendarCreationModalProps) => {
        const [fullDay, setFullDay] = useState(false)
        const [link, setLink] = useState(false)
        const [show, setShow] = useState(false)
        const [evt_start, setEvt_Start] = useState(start)
        const [evt_end, setEvt_End] = useState(end)
        const [userList, setUserList] = useState<any[]>([])

        const createNewEvent = () => {}

        const updateEvent = () => {}

        const hideModal = () => {
            setShow(false)
            setTimeout(() => resetEvt(), 500)
        }

        useEffect(() => {
            new SlimSelect({ select: "#evt-users", settings: { showSearch: false } })
            new SlimSelect({ select: "#evt-recurrence", settings: { showSearch: false } })
            new SlimSelect({ select: "#evt-notify", settings: { showSearch: false } })
            new SlimSelect({
                select: "#evt-location",
                settings: { showSearch: false },
                events: { afterChange: (option) => setLink(option[0].value !== 'None') }
            })

            setShow(true)
        }, [])

        const body =
            <form id={ styles['evt-form'] } onReset={ hideModal } onSubmit={evt ? updateEvent : createNewEvent}>
                <div className='form-floating'>
                    <input type="text" name="evt-title" className='form-control shadow-none' id='floatingInput' placeholder='Title*' defaultValue={evt ? evt.title : ""} required />
                    <label htmlFor="floatingInput">Title*</label>
                </div>

                <div className='form-check'>
                    <label id={ styles['evt-full-day-label'] } className='form-check-label cursor' htmlFor='evt-full-day'>
                        <input id='evt-full-day' className='form-check-input shadow-none' type='checkbox' defaultValue={evt ? evt.fullDay : fullDay} onChange={() => setFullDay(!fullDay)} /> Full Day
                    </label>
                </div>

                {/* <div className={ styles['evt-dates'] }>
                    <DatePicker
                        required
                        showTimeSelect
                        dateFormat="MMMM dd, yyyy hh:mm aa"
                        placeholderText={`${t("calendar.start")}*`}
                        id='evt-start'
                        selected={evt_start < new Date() ? new Date() : evt_start}
                        minDate={new Date()}
                        onChange={e => setEvt_Start(e)}
                        showTimeSelectOnly={fullDay}
                    />
                </div>

                <div className={ styles['evt-dates'] }>
                    <DatePicker
                        required
                        showTimeSelect
                        dateFormat="MMMM dd, yyyy hh:mm aa"
                        placeholderText={`${t("calendar.end")}*`}
                        id='evt-end'
                        selected={fullDay ? evt_start : evt_end}
                        minDate={new Date()}
                        onChange={e => setEvt_End(e)}
                        showTimeSelectOnly={fullDay}
                    />
                </div> */}

                <div>
                    <select id='evt-users' required multiple>
                        <option data-placeholder="true" value=''> No Users Selected </option>
                        {
                            userList.map((user, idx) => (
                                <option key={ idx } value={ user._id }>{ user.user_name }</option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    <select id='evt-location' defaultValue={evt ? evt.location_description : ""} >
                        <option data-placeholder="true" value=''> Select Location </option>
                        <option> None </option>
                        <option> Zoom Meet </option>
                        <option> Google Meet </option>
                        <option> Skype </option>
                    </select>
                    {
                        link &&
                        <div className='form-floating mt-3'>
                            <input type="text" className='form-control shadow-none' name="evt-location-link" id="floatingInput" placeholder='Paste Link Here' defaultValue={evt ? evt.location_link : ""} />
                            <label htmlFor="floatingInput">Paste Link Here</label>
                        </div>
                    }
                </div>

                <div>
                    <select id='evt-recurrence' defaultValue={evt ? evt.repeat_status : "0"}>
                        <option value="0"> Do Not Repeat</option>
                        <option value="1"> Every Day </option>
                        <option value="2"> Every Week </option>
                        <option value="3"> Every Month </option>
                        <option value="4"> Every Year </option>
                    </select>
                </div>

                <div>
                    <select id="evt-notify" defaultValue={evt ? evt.notify : ""}>
                        <option data-placeholder="true" value=''> Add Notifications </option>
                        <option> None </option>
                        <option value="0"> At the Time of Event </option>
                        <option value="300"> 5 Minutes Before </option>
                        <option value="600"> 10 Minutes Before </option>
                        <option value="900"> 15 Minutes Before </option>
                    </select>
                </div>

                <div className="form-floating">
                    <textarea className="form-control" placeholder="Description (Optional)" name='evt-desc' defaultValue={evt ? evt.description : ""} id="floatingTextarea"></textarea>
                    <label htmlFor="floatingTextarea"> Description (Optional) </label>
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
        new SlimSelect({
            select: '#calendar-view',
            settings: { showSearch: false },
            events: { afterChange: (option) => viewRef.current?.dispatchEvent(new Event('change', { bubbles: true })) }
        })
        rangeChange()
    }, [])

    return (
        <>
            <section id={ styles['calendar-controls'] }>
                <button onClick={getToday}> Today </button>
                <div>
                    <select ref={viewRef} id='calendar-view' defaultValue={ calendarView } onChange={ changeView }>
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
                    ref={ currentRef }
                    usageStatistics={false}
                    useDetailPopup
                    useCreationPopup={false}
                    height='90vh'
                    view='month'
                    template={{
                        popupDetailLocation: schedule => 'location: ' + schedule.location,
                        popupDetailRepeat: schedule => 'repeat: ' + schedule.recurrenceRule + '<br>organiser: ' + schedule.dueDateClass,
                        popupDetailUser: schedule => 'members: ' + schedule.attendees?.join(', '),
                        popupDetailState: schedule => 'state: ' + schedule.state,
                        popupDetailBody: schedule => 'desc: ' + schedule.body,
                        popupEdit: () => 'Edit',
                        popupDelete: () => 'Delete',
                        popupDetailDate: (_allDay, start, end) => 'Start: ' + formatdate(start) + '<br>End: ' + formatdate(end)
                    }}
                    onBeforeCreateSchedule={(scheduleData: any) => {
                        scheduleData.guide.clearGuideElement()
                        const start = scheduleData.start._date, end = scheduleData.end._date

                        setCreationModal(true)
                        setStart(start)
                        setEnd(end)
                    }}
                    // onBeforeUpdateSchedule={e => {
                    //     const evt = e.schedule

                    //     if (evt.state === "Expired") alert("You cannot edit an expired event.")
                    //     else if (evt.start._date.valueOf() + 600000 <= Date.now()) alert("You cannot edit event within 10 minutes of start.")
                    //     else request(calendarURL + "getEvent/" + evt.id, { headers: headers })
                    //         .then(res => res.event)
                    //         .then(evt => { showModal(true) setEvt(evt) setStart(new Date(evt.start_date)) setEnd(new Date(evt.end_date)) })
                    // }}
                    // onBeforeDeleteSchedule={e => {
                    //     const evt = e.schedule

                    //     if (window.confirm("Do you really want to delete this Event?"))
                    //         request(calendarURL + "delete/" + project_id + "/" + evt.id, { headers: headers, method: "DELETE" })
                    //         .then(() => genInstance().deleteSchedule(evt.id, "1", false))
                    // }}
                />
                <button className={ styles['calendar-btns'] } onClick={next}><FaChevronRight /></button>
            </section>
        </>
    )
}
