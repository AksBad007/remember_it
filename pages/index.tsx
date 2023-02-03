import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

const Home = () => {
  return (
    <>
      <Head>
        <title>Remember It - A Calendar App</title>
        <meta name="description" content="Remember It - A Calendar App generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Link href='/auth'>Get Started</Link>
      </main>
    </>
  )
}

export default Home