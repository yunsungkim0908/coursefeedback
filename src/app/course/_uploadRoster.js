'use client';

import { Button, ButtonGroup, Dropdown, Table } from "react-bootstrap";
import Tab from "react-bootstrap/Tab"
import Tabs from "react-bootstrap/Tabs"
import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import "bootstrap/dist/css/bootstrap.min.css";
import * as formik from 'formik'
import * as Yup from "yup";
import { CSVReader } from 'react-papaparse';
import Swal from "sweetalert2"
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firebase_app, db, auth } from '../../components/firebase'
import { ErrorMessage, SectionCard } from '../../components/utils.js'

export const UploadRoster = (props) => {

  const [csvFile, setCsvFile] = useState([])
  const [oldSuid, setOldSuid] = useState([])
  const [suid, setSuid] = useState([])
  const [oldNames, setOldNames] = useState([])
  const [names, setNames] = useState([])
  const [isDamaged, setIsDamaged] = useState(false)
  const [staged, setStaged] = useState(false)
  const [idOnly, setIdOnly] = useState(false)

  const { Formik } = formik;

  useEffect(() => {
    const classRef = doc(props.db, 'rosters', props.classHash)

    getDoc(classRef)
      .then((snap) => {
        const data = snap.data()
        setOldSuid(data.id)
        setOldNames(data.name)
      })
      .catch((error) => {
        console.log(error)
        ErrorMessage('Invalid access. Did you follow the correct URL?')
      })
  }, [])

  const onUpload = (csvFile) => {
    setIsDamaged(false)
    const defaultLen = csvFile[0].data.length
    const email_idx = csvFile[0].data.indexOf('SIS Login ID')
    const name_idx = csvFile[0].data.indexOf('Student')

    if (email_idx === -1 || name_idx === -1){
      ErrorMessage("Could not find 'Student' or 'SIS Login ID' columns. Make sure to upload a valid CSV file with both columns")
      return
    }

    let suid = []
    let names = []
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
          || stud_name == 'Student, Test'
          || email.length === 0
          || stud_name.length === 0){
        continue
      }
      suid.push(email)
      names.push(stud_name)
    }
    setSuid(suid)
    setNames(names)
    setStaged(true)
  }

  const validationSchema = Yup.object().shape({
    idOnly: Yup.boolean().required("Required"),
    emailDomain: Yup.string()
      .when('idOnly',{
        is: true,
        then: (schema) => schema.required("Required").email("Not a valid email domain")
      })
  })

  const onSubmit = (newValues) => {
    console.log(newValues)
    if (isDamaged){
      ErrorMessage('The file seems to be broken. (Do all rows have the same length?)')
      return
    }
    if (!staged){
      ErrorMessage("Stage a new roster to upload!")
      return
    }

    const classRef = doc(props.db, 'rosters', props.classHash)
    setDoc(classRef, {'id': suid, 'name': names})
    .then((value) => { 
      SuccessMessage("Upload Complete!")
      setStaged(false)
      setOldSuid(suid)
      setOldNames(names)
    })
    .catch((error) => { 
      console.log(error)
      ErrorMessage("Invalid access. Are you using the correct URL?") })
  }

  const getExampleEmail = (domain) => {
    console.log(typeof(domain))
    console.log(domain)
    const newValue = "example@" + (typeof(domain) == "string" ? domain : "")
    console.log(newValue)
    return newValue
  }
  const extractExampleDomain = (email) => {
    console.log(email)
    const domain = email.replace(/^example@/, "")
    console.log(domain)
    return domain
  }

  const RosterForm = (formikProps) => {
    console.log(formikProps.values.emailDomain)
    return (
    <div>
      <CSVReader
        addRemoveButton
        config={{skipEmptyLines: true}}
        onDrop={onUpload}
        onError={(err, file, inputElem, reason)=>ErrorMessage(reason)}
        onRemoveFile={(data) => {
          setStaged(false)
          setSuid([])
          setNames([])
        }}
      >
        <span>Drop CSV file here or click to upload.</span>
      </CSVReader>

      <div style={{'textAlign': 'center', 'color': (staged? 'blue': 'black')}}>
        {staged
          ? `Total of ${suid.length} students staged for upload`
          : `Current roster has ${oldSuid.length} students`}
        <div style={{'max-height': '300px', 'overflowY': 'scroll'}}>
        <Table>
          <thead>
            <tr>
              <th> No. </th>
              <th> SIS ID Login </th>
              <th> Name </th>
            </tr>
          </thead>
          <tbody style={{'color': (staged?'blue':'black')}}>
            {Array.from((staged? suid: oldSuid).keys()).map((i, _) => 
              <tr>
                <td> {i+1} </td>
                <td> {(staged? suid: oldSuid)[i]} </td>
                <td> {(staged? names: oldNames)[i]} </td>
              </tr>
            )}
          </tbody>
        </Table>
        </div>
        <Form onSubmit={formikProps.handleSubmit}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: "flex-start",
              margin: "5px 0"
            }}>
              <div style={{width: "400px"}}>
                <Form.Check
                  type="switch"
                  name="idOnly"
                  value={formikProps.values.idOnly}
                  id="idOnly-switch"
                  onChange={formikProps.handleChange}
                  label="Use the same email domain"
                  style={{textAlign: "left", margin: "10px 0"}}
                />
                {formikProps.values.idOnly &&
                <InputGroup className="mb-1">
                  <InputGroup.Text id="addon-at" style={{height: "2rem"}}>example@</InputGroup.Text>
                  <Form.Control
                    style={{height: "2rem"}}
                    as="input"
                    value={extractExampleDomain(formikProps.values.emailDomain)}
                    placeholder="e.g., stanford.edu"
                    name="emailDomain"
                    label="emailDomain"
                    onChange={(domain) => {
                      formikProps.setFieldValue('emailDomain',
                        getExampleEmail(domain.target.value))}
                    }
                    aria-describedby="addon-at"
                    isInvalid={!!formikProps.errors.emailDomain && formikProps.touched.emailDomain
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formikProps.errors.emailDomain}
                  </Form.Control.Feedback>
                  </InputGroup>
                }
              </div>
              <Button type="submit">
                Upload!
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
  }

  return (
    <SectionCard>
      <h2>Update Roster</h2>
      <hr/>
      <p>If your class uses the Canvas course management system:</p>
      <ul>
        <li>Go to the "Grades" section in the class Canvas page</li>
        <li>Download the gradebook by clicking "Download Current Scores (.csv)"</li>
        <ul>
          <li>If you don't see this button, you're in "Gradebook" mode. Look for the "Actions" tab and click "Export"</li>
        </ul>
        <li>Upload the downloaded gradebook here. (We only take the SIS Login ID and the name fields.)</li>
      </ul>
      <p>
      Feel free to remove private information like grades from the csv file, <b>but please keep the "Student" and "SIS Login ID"</b> columns.
      </p>

      <p style={{color: 'red'}}>
        <b><u>WARNING:</u></b> Please make sure to <b>review the uploaded roster and correct any errors</b> before uploading.
      </p>
      <Formik
        validationOnChange={false}
        validationOnBlur={false}
        initialValues={{idOnly: false, emailDomain: getExampleEmail("")}}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {(formikProps) => <RosterForm db={props.db} classHash={props.classHash} {...formikProps}/>}
      </Formik>
    </SectionCard>
  )
}

