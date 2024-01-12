'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import 'firebase/compat/auth';
import "../main.css"
import { CoursesTable } from "./courseTable.js"
import { AddCourse } from "./addCourse.js"
import { db, auth } from '../../components/firebase'
import { NavBarContainer } from '../../components/container.js'

export default function Page() {
  const [signedIn, setSignedIn] = useState(false);
  const coursesState = useState([])
  const courseIdState = useState([])

  const router = useRouter();

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged(
      user => {
        setSignedIn(!!user);
        if (!user){
          router.push('/login')
        }
      })
    return unregisterAuthObserver;
    // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  if (signedIn){
    return (
      <NavBarContainer>
      <div className="container">
      <div className="row">
      <div className="col">
        <div className="card my-4 mx-auto" style={{maxWidth: 800}}>
          <div className="card-body">
            <h1>High-Resolution Course Feedback</h1>
            <hr/>
            <h4>Welcome, {auth.currentUser.displayName} ({auth.currentUser.email})!</h4>
            <a href="" onClick={() => auth.signOut()}>
              Sign-out
            </a>
          </div>
        </div>
        <AddCourse db={db} coursesState={coursesState}
          courseIdState={courseIdState}
          user={auth.currentUser}/>
        <CoursesTable db={db} coursesState={coursesState}
          courseIdState={courseIdState}
          user={auth.currentUser}/>
      </div>
      </div>
      </div>
      </NavBarContainer>
    )
  } else {
    return (
      <>
      </>
    )
  }
}

