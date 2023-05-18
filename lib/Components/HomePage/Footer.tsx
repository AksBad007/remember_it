import { BsTwitter } from 'react-icons/bs'
import { SiLinkedin } from 'react-icons/si'
import { BsYoutube } from 'react-icons/bs'
import { FaFacebookF } from 'react-icons/fa'
import styles from '../../../styles/Home.module.css'

export default function Footer() {
    return (
        <div className={styles['footer-wrapper']}>
            <div className={styles['footer-section-one']}>
                <div>
                    <h2>Remember It - A Calendar App</h2>
                </div>
                <div className={styles['footer-icons']}>
                    <BsTwitter />
                    <SiLinkedin />
                    <BsYoutube />
                    <FaFacebookF />
                </div>
            </div>
            <div className={styles['footer-section-two']}>
                <div className={styles['footer-section-columns']}>
                    <span>Help</span>
                    <span>Share</span>
                    <span>Carrers</span>
                    <span>Testimonials</span>
                    <span>Work</span>
                </div>
                <div className={styles['footer-section-columns']}>
                    <span>244-5333-7783</span>
                    <span>244-6666-7783</span>
                    <span>hello@calendarApp.com</span>
                    <span>contact@calendarApp.com</span>
                </div>
                <div className={styles['footer-section-columns']}>
                    <span>Terms & Conditions</span>
                    <span>Privacy Policy</span>
                </div>
            </div>
        </div>
    )
}
