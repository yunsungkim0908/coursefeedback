import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { Table, OverlayTrigger, Tooltip, Button ,Dropdown } from 'react-bootstrap'
import { collection, doc, query, getDocs, where,
  writeBatch, updateDoc, setDoc, getDoc } from "firebase/firestore";
import 'firebase/compat/auth';
import Swal from "sweetalert2";
import * as Yup from "yup";
import { truncateString, ErrorMessage, SuccessMessage } from "../../components/utils.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPauseCircle, faCheckCircle, faCopy, faPencilAlt, faTrashAlt, faMinus } from '@fortawesome/free-solid-svg-icons'
import "../main.css"

const CourseRow = ({course, ...props}) => {
  const [courses, setCourses] = props.coursesState
  const [approvalStatus, setApprovalStatus] = useState(undefined)
  const courseId = course["hash"]
  const db = props.db

  const deleteCourse = async () => {
    const batch = writeBatch(db)
    const courseId = course.hash

    const courseRef = doc(db, "courses", courseId)
    const rosterRef = doc(db, "rosters", courseId)
    const questionRef = doc(db, "questions", courseId)

    const newCourses = courses.filter((e) => e.hash !== courseId)

    const write = async () => {
      batch.delete(rosterRef)
      batch.delete(questionRef)
      batch.delete(courseRef)
      return batch.commit()
    }

    Swal.fire({
      title: (
        '<span style="color: red"><u>Warning</u>: </span>You are about to <u>permanently delete</u> a course. '+
        "This action cannot be undone. Are you sure?"), 
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "No, cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        write()
          .then(() => {
            setCourses(newCourses)
            SuccessMessage("Done!")
          })
          .catch((error) => {console.log(error)})
      } else {
        Swal.fire("Changes are not saved")
      }
    })
  }

  useEffect(() => {
    const approvedDoc = doc(db, 'approvedCourses', courseId)
    getDoc(approvedDoc)
      .then((snap) => { setApprovalStatus(snap.exists()) })
      .catch((error) => { console.log(error) })
  },[course.hash])

  const StatusLabel = () => {
    if (approvalStatus === undefined)
      return <></>
    const tooltip = (
      <Tooltip id="tooltip">
        {approvalStatus ? "Survey Approved" : "Waiting for Approval"}
      </Tooltip>
    )
    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <FontAwesomeIcon
          style={{padding: "5px 0"}}
          color={approvalStatus ? "green" : "gold"}
          icon={approvalStatus ? faCheckCircle : faPauseCircle}
        />
      </OverlayTrigger>
    )
  }

  const callNumberTrunc = truncateString(course["callNumber"], 100) 

  const IdLabel = ({fullCourseId}) => (
      <label
        onMouseOver={(e) => {e.target.style.color = 'blue'}}
        onMouseOut={(e) => {e.target.style.color = ''}}
        onClick={() => {
          navigator.clipboard.writeText(fullCourseId)
          SuccessMessage(`Course Id: ${fullCourseId}\nCopied to clipboard!`)
        }}
      >
        <OverlayTrigger placement="top" overlay={
          <Tooltip id="tooltip" style={{margin: "5px 0"}}>{fullCourseId}</Tooltip> 
        }>
          <FontAwesomeIcon icon={faCopy} size="sm"/>
        </OverlayTrigger>
      </label>
    )

  return(
    <tr key={course["hash"]}>
      <td className="align-middle"> <IdLabel fullCourseId={course["hash"]}/> </td>
      <td className="align-middle"> 
        {course["courseName"]}
        <br/>
        <Link href={{
            pathname: "course",
            query: {
              callNumber: course["callNumber"],
              classHash: course["hash"]
            }
          }}>
          {callNumberTrunc}
        </Link>
      </td>
      <td className="align-middle"> {course["firstWeek"]}<br/>{course["lastWeek"]}</td> 
      <td className="align-middle"> 
        <StatusLabel/>
        <br/>
        {approvalStatus ? `(${course["completed"]}/${course["numWeeks"]})` : ""} 
      </td>
      <td className="align-middle">
        <div>
          <Link href={{
              pathname: "course",
              query: {
                callNumber: course["callNumber"],
                classHash: course["hash"]
              }
            }}>
            <Button>
              <FontAwesomeIcon icon={faPencilAlt} size="sm"/>
            </Button>
          </Link>
          { (props.user.uid === course["createdBy"])
            ? <Button variant="danger" onClick={deleteCourse}>
                <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
              </Button>
            : <></>
          }
        </div>
      </td>
    </tr>
  )
}

export const CoursesTable = (props) => {
  const [userCourses, setUserCourses] = props.coursesState
  const [courseLoaded, setCourseLoaded] = useState(false)
  const user = props.user

  useEffect(() => {
    if (!user){
      return (
        <p> You must login </p>
      )
    }

    const coursesRef = collection(props.db, "courses")
    const q = query(coursesRef, where("admins", "array-contains", user.email))
    getDocs(q)
      .then((qSnap) => {
        const newCourses = qSnap.docs.map((snap) => snap.data())
        setUserCourses(newCourses)
        setCourseLoaded(true)
      })
  }, [])

  if (!courseLoaded)
    return (
      <div>
      <div className="card my-4 mx-auto" style={{maxWidth: 800}}>
      <div className="card-body">
        <h2> Your courses </h2>
        <hr/>
        <p> Loading... </p>
      </div>
      </div>
      </div>
    )

  return (
    <div>
    <div className="card my-2 mx-auto" style={{maxWidth: 800}}>
    <div className="card-body">
      <h2> Your courses </h2>
      <hr/>
      <p>Here is a list of courses of which you are an admin. You can update rosters, change the weekly questionnaire, and add/remove course admins by clicking the link to the survey settings page.</p>

      <h5><b><u>Note</u></b></h5>
      <ul>
        <li>To become an admin of an existing course survey, one of the admins must add you manually.</li>
        <li><FontAwesomeIcon icon={faPencilAlt} size="sm"/>: Go to settings page and edit admins, rosters, and survey questions</li>
      </ul>

      <Table responsive="sm">
        <thead style={{textAlign: "center", verticalAlign: 'middle', width: "auto"}} >
          <tr>
            <th style={{ width: '15px' }}> ID </th>
            <th style={{ width: '300px' }}> Course Name <br/>(Call Number) </th>
            <th style={{ width: '150px' }}> First Survey <br/> Last Survey </th>
            <th style={{ width: '50px' }}> Status (Progres) </th>
            <th style={{ width: '100px' }}> Actions </th>
          </tr>
        </thead>
        { userCourses.length === 0
          ? <></>
          : <tbody style={{textAlign: "center"}} >
              {userCourses.map((course, i) =>
                <CourseRow key={i}
                  course={course} 
                  coursesState={props.coursesState}
                  courseIdState={props.courseIdState}
                  db={props.db} user={props.user}/>)}
            </tbody>
        }
      </Table>
      { userCourses.length === 0
        ? <div style={{textAlign: "center"}}>
            <label>No items to display</label>
          </div>
        : <></>
      }
    </div>
    </div>
    </div>
  )
}


