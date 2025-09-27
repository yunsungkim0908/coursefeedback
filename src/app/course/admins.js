// Import CSS first to prevent FOUC  
import "../globals.css"
import "../main.css"

import React, { useRef, useState, useEffect } from 'react';
// Removed Bootstrap imports to prevent conflicts
import { doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { Formik, Form, useFormikContext, Field, useField, FieldArray } from 'formik';
import { TextInputCell } from "../../components/Forms/Form.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPlus, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { ErrorMessage, SuccessMessage } from "../../components/utils.js"
import * as Yup from "yup";

import "../../components/Forms/Form.css"
import "../main.css"
const AddAdmin = ({admins, setAdmins, submit}) => {
  const [ newAdmin, newAdminMeta, newAdminHelpers ] = useField("newAdmin")
  const emailSchema = Yup.string().email()

  return (
    <div className="admin-row add-admin">
      <div className="admin-no"></div>
      <div className="admin-email">
        <input
          {...newAdmin}
          type="email"
          className="admin-input"
          placeholder="Enter admin email address"
        />
        {newAdminMeta.touched && newAdminMeta.error && (
          <span className="input-error">{newAdminMeta.error}</span>
        )}
      </div>
      <div className="admin-actions">
        <button 
          className="btn-icon primary"
          onClick={() => {
            if (emailSchema.isValidSync(newAdmin.value)){
              if (admins.includes(newAdmin.value)) {
                newAdminHelpers.setError("Admin already exists")
              } else {
                const newAdmins = [...admins, newAdmin.value]
                setAdmins(newAdmins)
                submit(newAdmins)
                newAdminHelpers.setValue("")
              }
            } else {
              newAdminHelpers.setError("Invalid email")
            }
          }}
          title="Add admin"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  )
}

const AdminRow = ({email, i, createdByEmail, userEmail, admins, setAdmins, submit}) => {

  return (
    <div className="admin-row">
      <div className="admin-no">{i+1}</div>
      <div className="admin-email">{email}</div>
      <div className="admin-actions">
        { (createdByEmail === email) 
          ? <span className="owner-badge">Owner</span>
          : <button 
              className="btn-icon danger" 
              onClick={() => {
                const newAdmins = admins.filter((e) => e !== email)
                setAdmins(newAdmins)
                submit(newAdmins)
              }}
              title="Remove admin"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
        }
      </div>
    </div>
  )
}

export const ManageAdmins = (props) => {
  const [admins, setAdmins] = useState([])
  const [createdByEmail, setCreatedBy] = useState("")

  useEffect(() => {
    getDoc(doc(props.db, "courses", props.classHash))
      .then((snap) => {
        const adminLst = snap.data()["admins"]
        setCreatedBy(snap.data()["createdByEmail"])
        setAdmins(adminLst)})
      .catch((error) => {
        console.log(error)
        ErrorMessage("Cannot read course info. Have you logged in?")
      })
  }, [])

  const updateAdmins = (newAdmins) => {
    if (props.classHash != null){
      const courseDoc = doc(props.db, "courses", props.classHash)
      setAdmins(newAdmins)
      updateDoc(courseDoc, {"admins": newAdmins})
        .then(() => {SuccessMessage("Submitted!")})
        .catch((error) => {ErrorMessage("Submit failed. Have you logged in?")})
    } else {
      ErrorMessage("Invalid access. Did you follow the correct URL?")
    }
  }

  return (
    <div className="settings-section-clean">
      <div className="section-content">
        <div className="section-header-clean">
          <h2>
            <FontAwesomeIcon icon={faUserShield} className="section-icon" />
            Manage Admins
          </h2>
          <p className="section-description">
            Control who has administrative access to this course.
          </p>
        </div>
        
        <div className="admins-info">
          <div className="info-card">
            <h4>Admin Permissions</h4>
            <p>Add or remove admins by their email address. Admins will be able to:</p>
            <ul className="permissions-list">
              <li>Log in with the saved email address</li>
              <li>Edit the survey settings and questions</li>
              <li>Manage the course roster</li>
              <li>Receive weekly survey digests</li>
            </ul>
          </div>
        </div>

        <div className="admins-table-wrapper">
          <div className="admins-header">
            <div className="header-no">No.</div>
            <div className="header-email">Email</div>
            <div className="header-actions">Actions</div>
          </div>
          
          <div className="admins-list">
            {admins.map((email, i) => {
              return <AdminRow key={email} i={i} email={email}
                      createdByEmail={createdByEmail}
                      userEmail={props.userEmail}
                      admins={admins} setAdmins={setAdmins}
                      submit={updateAdmins}/>})
            }
            <Formik initialValues={{newAdmin: null}}>
              <AddAdmin admins={admins} setAdmins={setAdmins} submit={updateAdmins}/>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

