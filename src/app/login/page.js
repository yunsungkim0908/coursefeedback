'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '../../components/firebase'
import React, {useEffect} from 'react'
import styles from '../page.module.css'
import '../main.css'
import '../../components/Loading/loading.css'
import 'firebaseui/dist/firebaseui.css'
import firebase from 'firebase/compat/app'
import 'firebase/auth'
import { NavBarContainer } from '../../components/container.js'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    import("firebaseui")
      .then((firebaseui) => {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth)

        const unregisterAuthObserver = auth.onAuthStateChanged(
          user => {
            if (user != null){
              router.push('/dashboard')
            }
            else {
              ui.start("#firebase-auth-container", {
                signInOptions: [
                  {
                    provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    customParameters: {
                      hd: 'stanford.edu',
                      auth_type: 'reauthenticate',
                      prompt: 'select_account'
                    },
                    providerName:'Stanford',
                    iconUrl:'https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/SU_SealColor_web3-1.png'
                  },
                  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                  firebase.auth.EmailAuthProvider.PROVIDER_ID,
                ],
                signInFlow: 'popup',
                callbacks: {signInSuccess: () => false}
                // signInSuccessUrl: '/dashboard'
                // Other config options...
              })

            }
          })

        return unregisterAuthObserver
      })
  }, [])

  return (
    <NavBarContainer>
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardCenter}>
            <h2 className={styles.center}>High-Resolution Course Feedback</h2>
            <h4 style={{color: "grey"}}>Sign-up or Login</h4>
            <div style={{
              width: "100%",
              margin: "auto",
            }} id={"firebase-auth-container"}/>
            <Link href="/">Back to Main Page</Link>
            <hr/>
            <h5>Don't have an account?</h5>
            <p>Click on one of the buttons above and we will make an account for you</p>
          </div>
        </div>
      </main>
      {/*
      <div id="loader-wrapper" className={(isLoading || isLoggedIn) ? styles.visible : styles.hidden}>
        <div id="loader"/>
      </div>
      */}
    </NavBarContainer>
  )
}

