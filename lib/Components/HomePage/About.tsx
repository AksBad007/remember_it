import Image from 'next/image'
import AboutBackground from '../../../public/images/about-background.png'
import AboutBackgroundImage from '../../../public/images/create-evt.png'
import styles from '../../../styles/Home.module.css'

export default function About() {
    return (
        <div className={styles['about-section-container']}>
            <div className={styles['about-background-image-container']}>
                <Image src={AboutBackground} alt='Background Banner' />
            </div>
            <div className={styles['about-section-image-container']}>
                <Image src={AboutBackgroundImage} alt='Event Creater Photo' height={520} width={688} />
            </div>
            <div className={styles['about-section-text-container']}>
                <h1 className={styles['primary-heading']}>
                    More Than Just A Calendar
                </h1>
                <p className={styles['primary-text']}>
                    It makes management super easy as it allows adding users, custom invites, timely reminders and so much more.
                </p>
            </div>
        </div>
    )
}
