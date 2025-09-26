'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React, { Suspense, useState, useRef, useEffect } from 'react';
import "../globals.css"
import "../main.css"
import { Form, Formik, FieldArray, useField } from "formik";
import * as Yup from "yup";
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { doc, setDoc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";

import { firebase_app, db, auth } from '../../components/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import NavBar from '../../components/NavBar'
import { Loading } from '../../components/Loading/loading.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

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
  const [field, meta] = useField(`answers.${question.qid}`);
  
  return (
    <div className="survey-question">
      <div className="question-header">
        <span className="question-number">{index + 1}.</span>
        <span className="question-label">{question.prompt}</span>
      </div>
      <div className="question-input">
        {(question.type === 'Text') && (
          <>
            <textarea 
              {...field}
              className={`survey-textarea ${meta.touched && meta.error ? 'error' : ''}`}
              placeholder={('placeholder' in question) ? question.placeholder : getPlaceholder(question)}
              rows={1}
              ref={(textarea) => {
                if (textarea) {
                  // Set initial height to fit placeholder
                  textarea.style.height = 'auto';
                  textarea.style.height = textarea.scrollHeight + 'px';
                }
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            {meta.touched && meta.error && (
              <span className="field-error">{meta.error}</span>
            )}
          </>
        )}
        {(question.type === 'Numeric') && (
          <>
            <input 
              {...field}
              type="text"
              className={`survey-input ${meta.touched && meta.error ? 'error' : ''}`}
              placeholder={('placeholder' in question) ? question.placeholder : getPlaceholder(question)}
            />
            {meta.touched && meta.error && (
              <span className="field-error">{meta.error}</span>
            )}
          </>
        )}
        {(question.type === 'Rating (1-5)' || question.type === 'Rating (Qualitative)') && (
          <ButtonInput question={question}/>
        )}
      </div>
    </div>
  );
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
      <div className="survey-page">
        <div className="survey-container">
          {/* Survey Header */}
          <div className="survey-header-card">
            <div className="survey-header-content">
              <h1 className="survey-title">{header}</h1>
              <p className="survey-description">{desc}</p>
              {isPreview && (
                <Link
                  href={{
                    pathname: "/course",
                    search: `?callNumber=${callNumber}&classHash=${classHash}&user=preview`
                  }}
                  className="back-to-settings"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>Back to Course Settings</span>
                </Link>
              )}
            </div>
          </div>


          {/* Survey Form */}
          <Formik
            validateOnChange
            enableReinitialize={true}
            initialValues={initValues}
            validationSchema={validationSchema}
            onSubmit={(x) => onSubmit(x)}
          >
            <Form onKeyDown={onKeyDown} className="survey-form">
              <FieldArray
                name="answers"
                render={() => {
                  if (closed) {
                    return (
                      <div className="survey-closed-card">
                        <FontAwesomeIcon icon={faExclamationCircle} className="closed-icon" />
                        <h2>Survey Closed</h2>
                        <p>We're sorry, but this week's survey has been closed.</p>
                      </div>
                    )
                  } else {
                    return (
                      <div className="survey-questions">
                        {questions.questions.map((question, index) =>
                          <QuestionBox key={question.qid} question={question} index={index}/>
                        )}
                      </div>
                    )
                  }
                }}
              />
              {!closed && (
                <div className="survey-submit-section">
                  <button
                    type="submit"
                    className={`btn-primary survey-submit ${isPreview ? 'disabled' : ''}`}
                    disabled={isPreview}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Submit my feedback
                  </button>
                  {isPreview && (
                    <p className="preview-note">This is a preview. Submissions are disabled.</p>
                  )}
                </div>
              )}
            </Form>
          </Formik>
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

const ButtonInput = ({question}) => {
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

  return (
    <div className="rating-options">
      {radios.map((radio, idx) => (
        <label key={idx} className="rating-option">
          <input
            type="radio"
            name={question.qid}
            value={radio}
            checked={field.value === radio}
            onChange={(e) => helpers.setValue(e.currentTarget.value)}
            className="rating-input"
          />
          <span className="rating-label">{radio}</span>
        </label>
      ))}
      {meta.touched && meta.error && (
        <span className="field-error">{meta.error}</span>
      )}
    </div>
  )
}

