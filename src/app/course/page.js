'use client';

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button, ButtonGroup, Dropdown, Table } from "react-bootstrap";
import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import "bootstrap/dist/css/bootstrap.min.css";
import { CSVReader } from 'react-papaparse';
import Swal from "sweetalert2"
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { AddQuestions } from './addQuestions.js'
import { ManageAdmins } from "./admins.js"
import { onAuthStateChanged } from "firebase/auth";
import { firebase_app, db, auth } from '../../components/firebase'
// import { ManageRoster } from './manageRoster.js'
import { ManageRoster } from './uploadRoster.js'
import { NavBarContainer } from '../../components/container.js'
import "../main.css"

// TODO: explain timeline

const SuccessMessage = (succMsg) => {
    Swal.fire({
      icon: "success",
      title: succMsg
    })
}
const ErrorMessage = (errorMsg) => {
    Swal.fire({
      icon: "error",
      title: errorMsg,
    })
}

export const Description = () => (
  <div className="card my-4 mx-auto" style={{maxWidth: 800}}>
    <div className="card-body">
      <h2> Weekly Timeline </h2>
      <hr/>
      Here is what a week of survey would look like (All times are indicated in Pacific Time (PT)):
      <ul>
        <li>Beginning around <b>Monday at Noon,</b> your students will be asked to fill out the feedback form.</li>
        <li>Around <b>Thursday at Noon,</b> your students will receive a reminder email.</li>
        <li>Around <b>Sunday at 4pm,</b> the feedback forms will close and you will receive a weekly digest from us along with all the feedback sampled from your students.</li>
        {/*<li>Changes to survey questions (and the new roster) will be reflected around <b>11:50am on Mondays</b>. Any change you make go live then. </li>*/}
      </ul>
    </div>
  </div>
)

export default function Page () {
  const [signedIn, setSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState(null)

  const search = useSearchParams()
  let className = search.get("callNumber")
  let instructorHash = search.get("classHash")
  
  const router = useRouter();

  useEffect(() => {
    const unregisterAuthObserver = auth
      .onAuthStateChanged(user => {
        setSignedIn(!!user);
        if (!user){
          router.push('/login')
        }
      })
    // Make sure we un-register Firebase observers when the component unmounts.
    return () => unregisterAuthObserver();
  }, []);

  return (
    <NavBarContainer>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="card my-4 mx-auto" style={{maxWidth: 800}}>
              <div className="card-body">
                <h1>Settings page for {className.toUpperCase()}</h1>
                <Link href={{ pathname: "/dashboard", }}>
                  Back to Dashboard
                </Link>
                &nbsp;&nbsp;&nbsp;
                <a href="" onClick={() => auth.signOut()}>Sign-out</a>
              </div>
            </div>
            <Description/>
            { signedIn
              ? (
              <>
                <AddQuestions classCode={className} classHash={instructorHash} db={db}/>
                <ManageRoster classHash={instructorHash} db={db}/>
                <ManageAdmins classHash={instructorHash} db={db}
                              userEmail={userEmail}/>
              </>
              )
              : <></>
            }
          </div>
        </div>
      </div>
    </NavBarContainer>
  )
}



