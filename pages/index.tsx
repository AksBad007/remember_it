import Link from 'next/link'
import { useCookies } from 'react-cookie'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <main>
        <Link href='/auth'>Get Started</Link>
      </main>
    </>
  )
}
