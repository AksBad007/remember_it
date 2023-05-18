import { FaWpforms, FaHandPointer } from 'react-icons/fa'
import { AiFillMail } from 'react-icons/ai'
import styles from '../../../styles/Home.module.css'

export default function Work() {
    const workInfoData = [
        {
            image: <FaWpforms />,
            title: 'Fill Basic Details',
            text: 'Give standand details like Title, Description etc.',
        },
        {
            image: <FaHandPointer />,
            title: 'Fine Tune',
            text: 'Choose from your friends/collegues and reminder settings.',
        },
        {
            image: <AiFillMail />,
            title: 'Enjoy The Show',
            text: 'Sit back and relax while we take responsibility of your timely arrival to the event.',
        },
    ]
    return (
        <div className={styles['work-section-wrapper']}>
            <div className={styles['work-section-top']}>
                <h1 className={styles['primary-heading']}>How It Works</h1>
                <p className={styles['primary-text']}>
                    Be it a solo adventure or a group meet, planning an event is super easy.
                </p>
            </div>
            <div className={styles['work-section-bottom']}>
                {workInfoData.map((data, idx) => (
                    <div className={styles['work-section-info']} key={idx}>
                        <div>
                            {data.image}
                        </div>
                        <h2>{data.title}</h2>
                        <p>{data.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
