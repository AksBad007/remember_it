import { useState } from 'react'
import styles from '../../../styles/Event.module.css'

interface Action {
    prompt: string
    fn: () => Promise<void>
}

interface EventProps {
    evt: any
    action: Action
    cancel: Action
    received?: boolean
    userInfo?: any
}

export default function Event({ evt, action, cancel, received=false, userInfo }: EventProps) {
    const { title, start_date, location, description, invited_users } = evt
    let reqUser = received ? invited_users.find(({ user }: any) => user._id === userInfo._id) : undefined
    const [status, setStatus] = useState(reqUser?.status || '')

    const onAction = async () => {
        try {
            await action.fn()

            if (received)
                setStatus('accepted')
        } catch (error: any) {
            console.error(error)
        }
    }

    const onCancel = async () => {
        try {
            await cancel.fn()

            if (received)
                setStatus('rejected')
        } catch (error: any) {
            console.error(error)
        }
    }

    return (
        <div className={ styles['evt_item'] }>
            <div className={ styles['evt-item_link'] }>
                <div className={ styles['evt-item_bg'] }></div>

                <div>
                    <div className={ styles['evt-item_title'] }>
                        { title }
                    </div>

                    <div className={ styles['evt-item_bg-item'] }>
                        Location:
                        <span className={ styles['evt-item_bg-item_child'] }>
                            { location.description }
                        </span>
                    </div>

                    <div className={ styles['evt-item_bg-item'] }>
                        Description:
                        <span className={ styles['evt-item_bg-item_child'] }>
                            { description || 'No Description Added.' }
                        </span>
                    </div>

                    <div className={ styles['evt-item_bg-item'] }>
                        Members:
                        <span className={ styles['evt-item_bg-item_child'] }>
                            {
                                invited_users.length > 0 ?
                                    invited_users.map(({ user }: any) => user.username).join(', ') :
                                    'No Members Added.'
                            }
                        </span>
                    </div>
                </div>

                <div className={ styles['evt-item_date-box'] }>
                    Start:
                    <span className={ styles['evt-item_date'] }>
                        { new Date(start_date).toLocaleString('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
                    </span>
                </div>

                <div className={ styles['evt-btns'] }>
                    {
                        received && status === 'rejected' &&
                        <button className='btn btn-primary' onClick={ onAction }>{ action.prompt }</button>
                    }
                    {
                        received && status === 'accepted' &&
                        <button className='btn btn-danger' onClick={ onCancel }>{ cancel.prompt }</button>
                    }
                    {
                        ((received && status === 'pending') || !received) &&
                        <>
                            <button className='btn btn-primary' onClick={ onAction }>{ action.prompt }</button>
                            <button className='btn btn-danger' onClick={ onCancel }>{ cancel.prompt }</button>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}
