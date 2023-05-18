import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import SlimSelect from 'slim-select'
import DatePicker from 'react-datepicker'
import Modal from '../UI/Modal'
import { handleSubmit, post_or_put_data, createSchedule, getSelectValues, onNewEvt, onUpdateEvt } from '../../Helpers/frontend_helpers'
import 'react-datepicker/dist/react-datepicker.css'
import styles from '../../../styles/Calendar.module.css'

interface CalendarCreationModalProps {
    userInfo: any
    calendarInstance?: any
    evt?: any
    evtDates: {
        start: Date
        end: Date
    }
    reset: () => void
}

export default function CalendarCreationModal ({ userInfo, calendarInstance, evtDates, evt, reset }: CalendarCreationModalProps) {
    const [location, setLocation] = useState('None') // could be 'Online'(conference link) or Location(map coordinates)
    const [show, setShow] = useState(false) // for fade effect
    const [evtStart, setEvtStart] = useState(evtDates.start)
    const [evtEnd, setEvtEnd] = useState(evtDates.end)
    const userList: any[] = userInfo.friends_added
    const defaultUsers: string[] = evt ? evt.invited_users.filter((invited_user: any) => userList.find((user: any) => user.user._id === invited_user.user)).map((user: any) => user.user) : []

    const createEvtBody = (body: { [k: string]: FormDataEntryValue }) => {
        let newEvt: any = { ...body }

        newEvt.invited_users = getSelectValues(document.querySelector('#evt-users') as HTMLSelectElement).map(userID => ({ user: userID }))
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
            let res = await post_or_put_data('events', createEvtBody(handleSubmit(e)))
            const { data, msg } = res

            onNewEvt(data, calendarInstance, userInfo)
            toast.success(msg)
            hideModal()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const updateEvent = async (e: React.FormEvent<HTMLFormElement>) => {            
        try {
            const res = await post_or_put_data('events/' + evt._id, createEvtBody(handleSubmit(e)), false)
            const { data, msg } = res

            if (calendarInstance)
                onUpdateEvt(data, calendarInstance, userInfo)
            toast.success(msg)
            hideModal()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const hideModal = () => {
        setShow(false)
        setTimeout(() => reset(), 500)
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

    return (
        <Modal bg={show} title={ evt ? 'Update Event': 'Create New Event' }>
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
                    <select id='evt-users' name='invited_users' defaultValue={ defaultUsers } multiple>
                        <option data-placeholder='true' value=''> No Users Selected </option>
                        {
                            userList.map((user, idx) => (
                                <option key={ idx } value={ user.user._id }>{ user.user.username }</option>
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
                    <button className='btn btn-primary' type='submit'> Submit </button>
                    <button className='btn btn-danger' type='reset'> Cancel </button>
                </div>
            </form>
        </Modal>
    )
}
