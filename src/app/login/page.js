'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '../../components/firebase'
import React, {useEffect} from 'react'
import '../globals.css'
import '../main.css'
import '../../components/Loading/loading.css'
import 'firebaseui/dist/firebaseui.css'
import firebase from 'firebase/compat/app'
import 'firebase/auth'
import NavBar from '../../components/NavBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faChartLine, faShieldAlt, faUsers, faBookOpen } from '@fortawesome/free-solid-svg-icons'

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
    <div className="page-wrapper">
      <div className="login-page">
        <div className="login-container">
            <div className="login-card">
              <div className="login-header">
                <h2>High-Resolution Course Feedback</h2>
                <p>Choose your preferred sign-in method</p>
              </div>
              
              <div id="firebase-auth-container" className="auth-container" />
              
              <div className="login-footer">
                <div className="divider">
                  <span>New to HRCF?</span>
                </div>
                <p className="signup-text">
                  Click any sign-in option above and we'll create an account for you automatically.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

