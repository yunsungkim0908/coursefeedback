'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button, ButtonGroup, Dropdown } from "react-bootstrap";
import ToggleButton from 'react-bootstrap/ToggleButton'
import React, { Suspense, useState, useRef, useEffect } from 'react';
// import firebase from "firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "../main.css"
import "../../components/Forms/form.css"
import { Form, Formik, FieldArray, useField } from "formik";
import * as Yup from "yup";
import {TextAreaInputCard, TextInputCard, StarsInput, RadioInput} from "../../components/Forms/form.js"
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { doc, setDoc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useMediaQuery } from '@react-hook/media-query';

import { firebase_app, db, auth } from '../../components/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import NavBar from '../../components/NavBar'
import { Loading } from '../../components/Loading/loading.js'

const SuccessMessage = (succMsg) => {
    Swal.fire({
      icon: "success",
      title: succMsg
    })
}

const ErrorMessage = (errorMsg) => {
    Swal.fire({
      icon: "error",
      title: errorMsg
    })
}

const getPlaceholder = function(question) {
  switch (question.type) {
    case 'Text': return 'Write text here.'
    case 'Numeric': return 'Write number here.'
    default: return ''
  }
}

export const QuestionBox = ({question, index}) => {
  switch (question.type) {
    case 'Text':
      return <TextAreaInputCard
        label={question.prompt}
        name={`answers.${question.qid}`}
        index={index}
        placeholder={('placeholder' in question)
                      ? question.placeholder
                      : getPlaceholder(question)}
        type='text'
      />
    case 'Numeric':
      return <TextInputCard
        label={question.prompt}
        name={`answers[${question.qid}]`}
        index={index}
        placeholder={('placeholder' in question)
                      ? question.placeholder
                      : getPlaceholder(question)}
        type='text'
      />
    case 'Rating (1-5)':
    case 'Rating (Qualitative)':
      return <ButtonInput question={question} index={index}/>
    default:
      return <></>
  }
}

function SurveyContent() {
  const [questions, setQuestions] = useState({'questions': [], 'classWeek': null})
  const [invalidURL, setInvalidURL] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  const search = useSearchParams()
  let callNumber = search.get("callNumber")
  let classHash = search.get("classHash")
  let globalWeek = search.get("week")
  let userHash = search.get("user")
  
  const [closed, setClosed] = useState(false)

  const readDocAndDo = function(docRef, doSomething){
    return getDoc(docRef)
      .then((snap) => {
        if (typeof snap.data() == 'undefined')
          throw new Error('The survey has been closed, or the URL you entered is invalid. Did you follow the correct URL?')
        else
          {return doSomething(snap)}})
      .catch((error) => {
        ErrorMessage(error.message)
      })
  }

  useEffect(() => {
    if(!classHash || !userHash) {
      setInvalidURL(true)
      return
    } else if (userHash === 'preview') {
      setIsPreview(true)
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        const defaultQuesRef = doc(db, 'shared', 'defaultQuestions')
        const customQuesRef = doc(db, 'questions', classHash)
        Promise.all([
          readDocAndDo(defaultQuesRef, (snap) => snap.data().questions),
          readDocAndDo(customQuesRef, (snap) => snap.data().questions)
        ]).then((values) => {
          const qlist = values[0].concat(values[1])
          setQuestions({'questions': qlist})
        })
      })
    } else {
      if (!globalWeek)
        setInvalidURL(true)
      readDocAndDo(
        doc(doc(db, 'surveyQuestions', globalWeek), classHash, userHash),
        (snap) => {
          if (snap.data().questions === 'closed')
            setClosed(true)
          else
            setQuestions(snap.data())
        }
      )
    }
  }, [])

  if (invalidURL) { return <h1>Invalid URL</h1>}


  const initValues = {answers: {}}
  questions.questions.map((question, index) =>
    {initValues.answers[question.qid] = ''}
  )

  const valShape = {}
  questions.questions.map((question, index) => {
    let val
    switch (question.type) {
      case 'Text':
        val = Yup.string().required('Required')
        break
      case 'Numeric':
        val = Yup.number().typeError('Answer must be a number').required("Required")
        break
      case 'Rating (1-5)':
      case 'Rating (Qualitative)':
        val = Yup.string().required("Required")
        break
      default:
        val = null
    }
    valShape[question.qid] = val
  })
  const validationSchema = Yup.object().shape({
    answers: Yup.object().shape(valShape)
  });

  const onSubmit = function(newValue) {
    var d = new Date()
    newValue['course'] = classHash
    newValue['timestamp'] = d.toUTCString()
    if (isPreview || closed)
      return
    if (classHash != null && userHash != null) {
      const courseAnswersRef = doc(
        doc(db, "surveyAnswers", globalWeek), classHash, userHash
      )
      const courseQuestionsRef = doc(
        doc(db, "surveyQuestions", globalWeek), classHash, userHash
      )
      getDoc(courseQuestionsRef)
      .then((snap) => {
        if (snap.data().questions === 'closed'){
          ErrorMessage("Survey for this week has been closed.")
        } else {
          setDoc(courseAnswersRef, newValue)
          .then((value) =>
                {SuccessMessage("Submitted!") })
          .catch((value) =>
                {ErrorMessage("Invalid access. Either the survey has closed, or the URL is incorrect.")})
        }
      })
    }
  }

  const classWeek = (questions.classWeek) 
    ? `Week ${questions["classWeek"]}`
    : ''

  const header = isPreview
    ? `Preview Survey Page for ${callNumber.toUpperCase()}`
    : `${classWeek} Feedback for ${callNumber.toUpperCase()}`
  const desc = (isPreview
    ? 'This is a preview of the survey page that your students would get to see.'
    : 'In '+callNumber.toUpperCase()+', we will use a small amount of student feedback each week to infer higher resolution information on how the class is going. Thank you for your time!')

  /**
   * Stop enter submitting the form.
   * @param keyEvent Event triggered when the user presses a key.
   */
  function onKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.key) === "Enter") {
      keyEvent.preventDefault();
    }
  }


  // Create breadcrumbs for survey page
  const breadcrumbs = [];
  if (isPreview && callNumber && classHash) {
    breadcrumbs.push(
      {
        label: callNumber.toUpperCase(),
        href: `/course?callNumber=${callNumber}&classHash=${classHash}&user=preview`
      },
      {
        label: 'Preview Survey Page',
        href: null
      }
    );
  }

  return (
    <div className="page-wrapper">
      <NavBar breadcrumbs={breadcrumbs} />
      <div className="page-content">
        <div className="container">
        <div className="row">
          <div className="col">
            <div className="response-card mt-4 mx-auto">
              <div className="card-body">
                <h1>{header}</h1>
                <p>{desc}</p>
                {isPreview &&
                <p>
                  <Link
                    href={{
                      pathname: "/course",
                      search: `?callNumber=${callNumber}&classHash=${classHash}&user=preview`
                  }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: '1' }}>←</span>
                    <span>Go back</span>
                  </Link>
                </p>}
              </div>
            </div>


            <Formik
              validateOnChange
              enableReinitialize={true}
              initialValues={initValues}
              validationSchema={validationSchema}
              onSubmit={(x) => onSubmit(x)}
            >
              <Form onKeyDown={onKeyDown} style={{ width: "100%" }}>
                <FieldArray
                  name="answers"
                  render={() =>
                    {
                      if (closed) {
                        return (
                          <div className="response-card mt-4 mx-auto">
                          <div className="card-body" >
                            <p style={{'fontSize':'1.2rem'}}>We're sorry, but this week's survey has been closed.</p>
                          </div>
                          </div>
                        )
                      } else {
                        return (questions.questions.map((question, index) =>
                        <QuestionBox key={question.qid} question={question} index={index}/>))
                    }
                   }
                  }
                />
                <div className="response-card mt-4 mx-auto" style={{maxWidth: 800}}>
                  <div className="card-body">
                    <Button
                      variant="primary"
                      type="submit"
                      className="mx-auto"
                      disabled={isPreview}
                    >
                       Submit my feedback!
                    </Button>
                  </div>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SurveyContent />
    </Suspense>
  );
}

const ButtonInput = ({question, index}) => {
  const [field, meta, helpers] = useField(`answers.${question.qid}`)

  let radios
  switch (question.type) {
    case 'Rating (1-5)':
      radios = ['1', '2', '3', '4', '5']
      break
    case 'Rating (Qualitative)':
      radios = ['Poor', 'Below Average', 'Ok', 'Good', 'Excellent']
      break
    default:
      radios = []
  }

  const isNarrowScreen = useMediaQuery('(max-width: 550px)')

  return <>
    <div className="response-card mt-4 mx-auto">
    <div className="card-body">
      <label className="form-label">
        <b>{index+1}. </b>{question.prompt}
      </label>
      <ButtonGroup
        vertical={isNarrowScreen}
        className="button-group"
      >
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            id={`radio-${question.qid}-${idx}`}
            type="radio"
            variant={'outline-primary'}
            name={question.qid}
            value={radio}
            checked={field.value === radio}
            onChange={(e) => helpers.setValue(e.currentTarget.value)}
            className='radio-button-fixed'
          >
            {radio}
          </ToggleButton>
        ))}
      </ButtonGroup>
      {meta.touched && meta.error &&
      <div className="error-space">
        <span className="error">{meta.error}</span>
      </div>}
    </div>
  </div>
  </>
}

