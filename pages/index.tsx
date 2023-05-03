import Link from 'next/link'
import styles from '../styles/Home.module.css'
import Header from '../lib/Components/HomePage/Header'
import About from '../lib/Components/HomePage/About'
import Contact from '../lib/Components/HomePage/Contact'
import Footer from '../lib/Components/HomePage/Footer'
import { Work } from '../lib/Components/HomePage/Work'

export default function HomePage() {
  return (
    <div className={ styles['App'] }>
      <Header />
      <About />
      <Work />
      <Contact />
      <Footer />
    </div>
  )
}
