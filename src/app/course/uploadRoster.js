'use client';

// Import CSS first to prevent FOUC  
import "../globals.css"
import "../main.css"

// Removed Bootstrap imports to prevent conflicts
import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import { CSVReader } from 'react-papaparse';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ErrorMessage, SuccessMessage, SectionCard } from '../../components/utils.js'
import styles from '../page.module.css'
import pageStyles from './page.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faFileAlt } from '@fortawesome/free-solid-svg-icons'

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
    const rosterRef = doc(props.db, 'rosters', props.classHash)

    getDoc(rosterRef)
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

    const rosterRef = doc(props.db, 'rosters', props.classHash)
    const timestamp = getPstTimestamp()
    updateDoc(rosterRef, {'roster': roster, 'lastRosterUpdate': timestamp})
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
          <table className={`roster-table ${staged ? 'staged' : 'unstaged'}`}>
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
          </table>
        </div>
        <div className={styles['button-box']}>
          <button className="btn-primary" type="submit" onClick={onSubmit}>
            Upload!
          </button>
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
    <div className="settings-section-clean">
      <div className="section-content">
        <div className="section-header-clean">
          <h2>
            <FontAwesomeIcon icon={faUsers} className="section-icon" />
            Update Roster
          </h2>
          <p className="section-description">
            Upload your course roster to manage student survey assignments.
          </p>
        </div>
        
        <div className="roster-instructions">
          <div className="instruction-panel">
            <h4>CSV File Requirements</h4>
            <p>Upload a CSV file that has the following 2 fields:</p>
            <div className="requirement-list">
              <div className="requirement-item">
                <span className="requirement-label">Name</span>
                <span className="requirement-desc">Full name of the student (e.g., John Doe)</span>
              </div>
              <div className="requirement-item">
                <span className="requirement-label">Email</span>
                <span className="requirement-desc">Email address of the student (e.g., student@example.edu)</span>
              </div>
            </div>
          </div>

          <div className="instruction-panel canvas">
            <h4>
              <FontAwesomeIcon icon={faFileAlt} className="panel-icon" />
              If your course uses Canvas
            </h4>
            <div className="steps-list">
              <div className="step">
                <span className="step-number">1</span>
                <span>Open your course Canvas page.</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span>Go to the <b>"New Analytics"</b> page by clicking on the "New Analytics" button.</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span>Click on the <b>"Reports"</b> tab.</span>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <span>Click the <b>"Run Report"</b> button for "Class Roster".</span>
              </div>
              <div className="step">
                <span className="step-number">5</span>
                <span>Download the roster CSV file by clicking the "Run Report" button.</span>
              </div>
            </div>
            
            <p className="help-text">
              If you are still having trouble, refer to this <a href="https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-view-and-download-reports-in-New-Analytics/ta-p/409936" target="_blank" rel="noopener noreferrer">detailed guide</a> on the Canvas community website.
            </p>
          </div>
        </div>

        <div className="roster-form-wrapper">
          <RosterForm db={props.db} classHash={props.classHash}/>
        </div>
      </div>
    </div>
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
