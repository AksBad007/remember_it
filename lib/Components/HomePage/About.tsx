import Image from 'next/image'
import AboutBackground from '../../../public/images/about-background.png'
import AboutBackgroundImage from '../../../public/images/create-evt.png'
import styles from '../../../styles/Home.module.css'

export default function About() {
  return (
    <div className={ styles['about-section-container'] }>
      <div className={ styles['about-background-image-container'] }>
        <Image src={ AboutBackground } alt='Background Banner' />
      </div>
      <div className={ styles['about-section-image-container'] }>
        <Image src={ AboutBackgroundImage } alt='Event Creater Photo' height={ 520 } width={ 688 }  />
      </div>
      <div className={ styles['about-section-text-container'] }>
        <h1 className={ styles['primary-heading'] }>
          Management Made Easy
        </h1>
        <p className={ styles['primary-text'] }>
          Lorem ipsum dolor sit amet consectetur. Non tincidunt magna non et
          elit. Dolor turpis molestie dui magnis facilisis at fringilla quam.
        </p>
        <p className={ styles['primary-text'] }>
          Non tincidunt magna non et elit. Dolor turpis molestie dui magnis
          facilisis at fringilla quam.
        </p>
      </div>
    </div>
  )
}
