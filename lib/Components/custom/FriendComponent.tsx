import Image, { StaticImageData } from 'next/image'
import styles from '../../../styles/Friends.module.css'

interface FriendsProps {
    user: {
        username: string
        userImg: StaticImageData
    }
    request?: boolean
    condition?: boolean
    onTrue: {
        fn: () => Promise<void>
        prompt: string
    } | undefined
    onFalse: {
        fn: () => Promise<void>
        prompt: string
    } | undefined
}

export default function FriendComponent({ user: { username, userImg }, request=false, condition, onTrue, onFalse}: FriendsProps) {
  return (
    <div className='shadow'>
        <div className={ styles['frnd-user-main'] }>
            <Image className='p-2' src={ userImg } alt='User Image' width={ 150 } height={ 150 } />

            <div className={ styles['frnd-username'] }>
                <span>{ username }</span>

                {
                    !request ? 
                        condition ?
                        <button className='btn btn-danger' onClick={ onTrue?.fn }>{ onTrue?.prompt }</button> :
                        <button className='btn btn-primary' onClick={ onFalse?.fn }>{ onFalse?.prompt }</button> :
                    <>
                        <button className='btn btn-danger' onClick={ onTrue?.fn }>{ onTrue?.prompt }</button>
                        <button className='btn btn-primary' onClick={ onFalse?.fn }>{ onFalse?.prompt }</button>
                    </>
                }
            </div>
        </div>
    </div>
  )
}
