import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import BannerBackground from '../../../public/images/home-banner-background.png'
import BannerImage from '../../../public/images/detail-popup.png'
import styles from '../../../styles/Home.module.css'

export default function Home() {
    return (
        <div className={styles['home-container']}>
            <div className={styles['home-banner-container']}>
                <div className={styles['home-bannerImage-container']}>
                    <Image src={BannerBackground} alt='' width={700} />
                </div>
                <div className={styles['home-text-section']}>
                    <h1 className={styles['primary-heading']}>
                        Don&apos;t Just Schedule it - <br />
                        Remember It!
                    </h1>
                    <p className={styles['primary-text']}>
                        A super simple time management app, made for you to assist you in daily scheduling.
                    </p>
                    <Link href='/auth' className='btn btn-lg btn-primary'>
                        Get Started <FiArrowRight />
                    </Link>
                </div>
                <div className={styles['home-image-section']}>
                    <Image src={BannerImage} alt='' />
                </div>
            </div>
        </div>
    )
}
