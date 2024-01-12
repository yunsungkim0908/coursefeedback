'use client';

// TODO: last roster update

import { Button, ButtonGroup, Dropdown, Table } from "react-bootstrap";
import Tab from "react-bootstrap/Tab"
import Tabs from "react-bootstrap/Tabs"
import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import "bootstrap/dist/css/bootstrap.min.css";
import { CSVReader } from 'react-papaparse';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ErrorMessage, SuccessMessage, SectionCard } from '../../components/utils.js'
import styles from '../page.module.css'
import pageStyles from './page.module.css'

const getPstTimestamp = () => {
  // Create a Date object for the current date and time
  const currentDate = new Date();

  // Define options for formatting the date
  const options = {
    timeZone: 'America/Los_Angeles', // Pacific Time Zone
    timeZoneName: 'short', // Display the time zone abbreviation (PST)
  };

  // Format the date as a string
  const pstTimestamp = currentDate.toLocaleString('en-US', options);

  return pstTimestamp
}

const RosterForm = (props) => {

  const [roster, setRoster] = useState([])
  const [oldRoster, setOldRoster] = useState([])
  const [lastRosterUpdate, setLastRosterUpdate] = useState(undefined)

  const [isDamaged, setIsDamaged] = useState(false)
  const [staged, setStaged] = useState(false)

  useEffect(() => {
    const classRef = doc(props.db, 'courses', props.classHash)

    getDoc(classRef)
      .then((snap) => {
        const data = snap.data()
        setOldRoster(data['roster'] || [])
        setLastRosterUpdate(data['lastRosterUpdate'])
      })
      .catch((error) => {
        console.log(error)
        ErrorMessage('Invalid access. Did you follow the correct URL?')
      })
  }, [])

  const onUpload = (csvFile) => {
    setIsDamaged(false)
    console.log(csvFile)
    const defaultLen = csvFile[0].data.length
    const email_idx = csvFile[0].data.indexOf('Email')
    const name_idx = csvFile[0].data.indexOf('Student Name')

    if (email_idx === -1 || name_idx === -1){
      ErrorMessage("Could not find 'Name' or 'Email' columns. Make sure to upload a valid CSV file with both columns.")
      return
    }

    let _roster = []
    for (var i = 1; i < csvFile.length; i++) {
      if (csvFile[i].data.length != defaultLen) {
        ErrorMessage('The file seems to be broken. (Do all rows have the same length?)')
        setIsDamaged(true)
        return
      }
      const email = csvFile[i].data[email_idx]
      const stud_name = csvFile[i].data[name_idx]
      if (typeof email == 'undefined' 
          || typeof stud_name == 'undefined'
          || stud_name == 'Student Test'
          || email.length === 0
          || stud_name.length === 0){
        continue
      }
      _roster.push({email: email, name: stud_name})
    }
    setRoster(_roster)
    setStaged(true)
  }

  const onSubmit = () => {
    if (isDamaged){
      ErrorMessage('The file seems to be broken. (Do all rows have the same length?)')
      return
    }
    if (!staged){
      ErrorMessage("Stage a new roster to upload!")
      return
    }

    const classRef = doc(props.db, 'courses', props.classHash)
    const timestamp = getPstTimestamp()
    updateDoc(classRef, {'roster': roster, 'lastRosterUpdate': timestamp})
    .then(() => { 
      SuccessMessage("Upload Complete!")
      setStaged(false)
      setOldRoster(roster)
      setLastRosterUpdate(timestamp)
    })
    .catch((error) => { 
      console.log(error)
      ErrorMessage("Invalid access. Are you using the correct URL?") })
  }

  console.log(staged)
  console.log(roster)
  console.log(oldRoster)

  let countText
  let lastUpdateText = ""
  if (staged) {
    countText = `Total of ${roster.length} students staged for upload`
  } else {
    if (lastRosterUpdate) {
      countText = `Current roster has ${oldRoster.length} student(s)`
    } else {
      countText = 'You have not uploaded a roster yet.'
    }
  }

  if (lastRosterUpdate) {
    lastUpdateText = `Last updated: ${lastRosterUpdate}`
  }

  return (
    <div style={{margin: '5px 0'}}>
      <CSVReader
        addRemoveButton
        config={{skipEmptyLines: true}}
        onDrop={onUpload}
        onError={(err, file, inputElem, reason)=>ErrorMessage(reason)}
        onRemoveFile={() => {
          setStaged(false)
          setRoster([])
        }}
      >
        <span>Drop CSV file here or click to upload.</span>
      </CSVReader>

      <div style={{'textAlign': 'center', 'color': (staged ? 'blue' : 'black')}}>
        {countText}

        <div style={{'color': 'black'}}>
          {lastUpdateText}
        </div>

        <div style={{'maxHeight': '300px', 'overflowY': 'scroll'}}>
          <Table className={staged ? pageStyles.staged : pageStyles.unstaged}>
            <thead>
              <tr>
                <th> No. </th>
                <th> Name </th>
                <th> Email </th>
              </tr>
            </thead>
            <tbody style={{'color': (staged?'blue':'black')}}>
              {(staged ? roster : oldRoster).map((_, i) => (
                <tr key={i}>
                  <td> {i+1} </td>
                  <td> {(staged ? roster : oldRoster)[i].name} </td>
                  <td> {(staged ? roster : oldRoster)[i].email} </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className={styles['button-box']}>
          <Button type="submit" onClick={onSubmit}>
            Upload!
          </Button>
          <p style={{color: 'red', margin: "5px", flex: 1}}>
            Please make sure to <b>review the staged roster</b> before uploading.
          </p>
        </div>
      </div>
    </div>
  )
}

export const ManageRoster = (props) => {
  return (
    <SectionCard>
      <h2>Update Roster</h2>
      <hr/>
      <p>Upload a CSV file that has the following 2 fields:</p>
      <ul>
        <li key={1}><b>Name</b>: Full name of the student (e.g., John Doe)</li>
        <li key={2}><b>Email</b>: Email address of the student (e.g., student@example.edu)</li>
      </ul>

      <u><b style={{'color': 'blue'}}>If your course uses Canvas,</b></u> follow these steps:
      <ul>
        <li key={1}>Open your course Canvas page. </li>
        <li key={2}>Go to the <b>"New Analytics"</b> page by clicking on the "New Analytics" button.</li>
        <li key={3}>Click on the <b>"Reports"</b> tab.</li>
        <li key={4}>Click the <b>"Run Report"</b> button for "Class Roster".</li>
        <li key={5}>Download the roster CSV file by clicking the "Run Report" button.</li>
      </ul>

      <p> If you are still having trouble, refer to this <a href="https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-view-and-download-reports-in-New-Analytics/ta-p/409936">detailed guide</a> on the Canvas community website.</p>

      <RosterForm db={props.db} classHash={props.classHash}/>
    </SectionCard>
  )
}

{/*
export const ManageRoster = (props) => {
  return (
    <SectionCard>
      <h2>Update Roster</h2>
      <hr/>
      <Tabs defaultActiveKey="canvas-roster">
        <Tab eventKey="canvas-roster" title="Using the Canvas Roster">
          <InstructionTabCanvasRoster/>
        </Tab>
        <Tab eventKey="csv" title="Using a CSV File">
          <InstructionTabCSV/>
        </Tab>
      </Tabs>
      <RosterForm db={props.db} classHash={props.classHash}/>
    </SectionCard>
  )
}

const InstructionTabCanvasRoster = () => (
  <div>
    <p>If your class uses the Canvas course management system, you can easily get the roster from Canvas:</p>
    <ul>
      <li key={1}>Open your course Canvas page. </li>
      <li key={2}>Go to the <b>"New Analytics"</b> page by clicking on the "New Analytics" button.</li>
      <li key={3}>Click on the <b>"Reports"</b> tab.</li>
      <li key={4}>Click the <b>"Run Report"</b> button for "Class Roster".</li>
      <li key={5}>Download the roster CSV file by clicking the "Run Report" button.</li>
    </ul>

    <p> If you are still having trouble, refer to this <a href="https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-view-and-download-reports-in-New-Analytics/ta-p/409936">detailed guide</a> on the Canvas community website.</p>

  </div>
)

const InstructionTabCSV = () => (
  <div>
  </div>
)
*/}
