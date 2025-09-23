import Link from 'next/link'
import React, { useRef, useState, useEffect } from 'react';
import "../globals.css"
import "../main.css"
import "../../components/Forms/Form.css"
import { doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import * as Yup from "yup";
import TextareaAutosize from 'react-textarea-autosize';
import autosize from 'autosize'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faGripLinesVertical, faQuestionCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useField, Form, Formik, Field, FieldArray } from "formik";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";


const quesTypeChoices = [
  'Text',
  'Numeric',
  'Rating (1-5)',
  'Rating (Qualitative)'
]

const quesTypeDisplay = {
  'Text': 'Text',
  'Numeric': 'Numeric',
  'Rating (1-5)': 'Rating (1-5)',
  'Rating (Qualitative)': 'Rating (Qual.)'
}

const ErrorMessage = (errorMsg) => {
    Swal.fire({
      icon: "error",
      title: errorMsg
    })
}

export const QuestionTypeDropdown = ({index, freezeQues}) => {
  const [field, meta, helpers] = useField(`questions.${index}.type`)
  const questionType = field.value
  const selection = (questionType == "")? 'Please Choose' : questionType

  return (
    <div className="type-dropdown-wrapper">
      <select 
        className="type-select"
        value={questionType}
        onChange={(e) => helpers.setValue(e.target.value)}
        disabled={freezeQues}
      >
        <option value="">Please Choose</option>
        {quesTypeChoices.map((choice, idx) => (
          <option key={idx} value={choice}>
            {quesTypeDisplay[choice]}
          </option>
        ))}
      </select>
      {meta.touched && meta.error && (
        <span className="question-error">{meta.error}</span>
      )}
    </div>
  )
}

const FixedRow = (props) => {
  return (
    <div className="question-row default">
      <div className="question-prompt">
        <textarea 
          className="question-textarea disabled" 
          disabled={true}
          value={props.prompt}
          readOnly
        />
      </div>
      <div className="question-type">
        <span className="type-display disabled">
          {quesTypeDisplay[props.type]}
        </span>
      </div>
      <div className="question-actions">
        <span className="default-label">Default</span>
      </div>
    </div>
  )
}

// Custom questions row for teachers to edit
export const EditableRow = ({index, formikProps, dragHandleProps, isDragging}) => {
  const [promptField, promptMeta]= useField(`questions.${index}.prompt`)

  const handleDeleteQuestion = (formikProps, index) => {
    const { questions } = formikProps.values
    questions.splice(index, 1);
    formikProps.setFieldValue("questions", questions);
  }

  return (
    <div className={`question-row editable ${isDragging ? 'dragging' : ''}`}>
      <div className="question-prompt">
        <textarea 
          className="question-textarea" 
          {...promptField}
          placeholder="Enter your custom question..."
        />
        {promptMeta.touched && promptMeta.error && (
          <span className="question-error">{promptMeta.error}</span>
        )}
      </div>
      <div className="question-type">
        <QuestionTypeDropdown index={index} freezeQues={false}/>
      </div>
      <div className="question-actions">
        <button 
          className="btn-icon danger" 
          type="button"
          onClick={() => {handleDeleteQuestion(formikProps, index)}}
          title="Delete question"
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        <div className="drag-handle" title="Drag to reorder" {...dragHandleProps}>
          <FontAwesomeIcon icon={faGripLinesVertical} />
        </div>
      </div>
    </div>
  )
}

// First rows are populated by the default questions, followed by
// custom ones. The table initially displays the previous customized questions
export const QuestionsTable = (props) => {
  const [defaultQues, setDefaultQues] = useState([])
  const [customQues, setCustomQues] = useState({'questions': [], 'previous-questions': []})
  const [questionCounter, setQuestionCounter] = useState(1);

  const [prevCustomQues, setPrevCustomQues] = useState([])
  const [freezeQues, setFreezeQues] = useState(false)

  // TODO: set state asynchronous
  const getQuestionId = () => {
    setQuestionCounter((prevCounter) => prevCounter + 1);
    const id = `question_${questionCounter}`;
    return id
  };


  // fetch the default questions
  useEffect(() => {
    getDoc(doc(props.db, "shared", "defaultQuestions"))
      .then((snap) => { setDefaultQues(snap.data()['questions']) })
      .catch((error) => {
        console.log(error)
        ErrorMessage(error)
        return
      })
  }, []) 

  // fetch the current questions
  useEffect(() => {
    getDoc(doc(props.db, "questions", props.classHash))
      .then((snap) => {
        if (typeof snap.data() == 'undefined')
          Swal.fire({
            icon: "error",
            title: 'Invalid access. Did you follow the correct URL?',
            showCancelButton:false,
            showConfirmButton:false,
            allowOutsideClick: false
          })
        else if ('questions' in snap.data() && 'previous-questions' in snap.data()){
          const data = snap.data()
          var initialCount = 0
          data['questions'] = data['questions'].map((obj)=> {
            obj['id'] = `question_${initialCount}`
            initialCount += 1
            return obj
          })
          setQuestionCounter(initialCount)
          setCustomQues(data)
          setPrevCustomQues(data['previous-questions'])}
        else
          throw new Error('No questions field. Please contact admin.')
      })
      .catch((error) => {
        console.log(error)
        ErrorMessage(error.message)
        return
      })
  }, []) 

  const onSubmit = (newValues) => {
    newValues['questions'].map((values, index) => {
      values['qid'] = `custom${index}`
    })

    if(props.classHash != null){
      const classQuesDoc = doc(props.db, 'questions', props.classHash)
      setDoc(classQuesDoc, newValues)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Submitted!",
          })
          // TODO: Add a "changes no saved" message
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Invalid access. Did you follow the correct URL?",
          })})
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid access. Did you follow the correct URL?",
      })
    }
  }

  const validationSchema = Yup.object().shape({
    questions: Yup.array().of(
      Yup.object().shape({
        prompt: Yup.string().min(10, 'Too short (>10 chars)').required("Required"),
        type: Yup.string().required("Required")
      })
    )
  });

  const handleDragEnd = (result, formikProps) => {
    if (!result.destination || result.destination.index === result.source.index){
      return
    }

    const { questions } = formikProps.values
    const [reorderedItem] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedItem);

    formikProps.setFieldValue("questions", questions);
  }

  const handleAddQuestion = (formikProps) => {
    const { questions } = formikProps.values;
    const newQuestion = { id: getQuestionId(), prompt: '', type: '' };

    formikProps.setFieldValue('questions', [...questions, newQuestion]);
  }

  return (
    <Formik
      validateOnChange
      initialValues={customQues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {(formikProps) => (
      <Form>
        <DragDropContext
          onDragEnd={(result) => handleDragEnd(result, formikProps)}
        >
          <Droppable droppableId="droppable">
            {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <FieldArray name="questions">
                <>
                  <div className="questions-list">
                    <div className="questions-header">
                      <div className="header-prompt">Question Prompt</div>
                      <div className="header-type">Question Type</div>
                      <div className="header-actions"></div>
                    </div>
                    {defaultQues.map((question, idx) => (
                      <FixedRow key={`default-${idx}`} {...question}/>
                    ))}
                    {formikProps.values.questions.map((question,index) => (
                      <Draggable
                        key={question.id}
                        draggableId={question.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                        <div
                          key={index}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="draggable-wrapper"
                        >
                          <EditableRow 
                            index={index} 
                            formikProps={formikProps}
                            dragHandleProps={provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                  
                  <div className="questions-footer">
                    <div className="footer-note">
                      <FontAwesomeIcon icon={faQuestionCircle} className="note-icon" />
                      <span>Note: Changes made now will be reflected in the upcoming survey.</span>
                    </div>
                    
                    <div className="footer-actions">
                      <a 
                        href={`survey?callNumber=${props.classCode}&classHash=${props.classHash}&user=preview&week=`}
                        className="btn-secondary"
                      >
                        See Survey Preview
                      </a>
                      
                      {formikProps.dirty && (
                        <div className="unsaved-changes-indicator">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
                          <span>You have unsaved changes</span>
                        </div>
                      )}
                      
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={()=>{handleAddQuestion(formikProps)}}
                        >
                          Add Question
                        </button>
                        <div className={`save-button-with-indicator ${formikProps.dirty ? 'has-changes' : ''}`}>
                          <button 
                            type="submit" 
                            className="btn-primary"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </FieldArray>
            </div>
            )}
          </Droppable>
        </DragDropContext>
      </Form>
      )}
    </Formik>
  )
}

export const AddQuestions = (props) => {
  return (
    <div className="settings-section-clean">
      <div className="section-content">
        <div className="section-header-clean">
          <h2>
            <FontAwesomeIcon icon={faQuestionCircle} className="section-icon" />
            Feedback Questions
          </h2>
          <p className="section-description">
            Customize your weekly surveys with additional questions beyond our defaults.
          </p>
        </div>
        
        <div className="questions-instructions">
          <div className="instruction-card">
            <h4>How to customize questions</h4>
            <p>You can ask more questions to your students in addition to our default questions. Modify your question prompts through this form and <b> click "Save" to save <span className="highlight-text"> any </span> changes that you made</b>. <u>(Unless specifically deleted, the same questions from the previous week will be used.)</u></p>
            
            <div className="question-types">
              <h5>Available question types:</h5>
              <div className="type-list">
                <div className="type-item">
                  <span className="type-badge text">Text</span>
                  <span>Students will give responses in text.</span>
                </div>
                <div className="type-item">
                  <span className="type-badge numeric">Numeric</span>
                  <span>Students will give numeric responses.</span>
                </div>
                <div className="type-item">
                  <span className="type-badge rating">Rating (1-5)</span>
                  <span>Students will choose an integer rating from 1 to 5.</span>
                </div>
                <div className="type-item">
                  <span className="type-badge qualitative">Rating (Qualitative)</span>
                  <span>Students will choose from (Poor, Below Average, Ok, Good, Excellent).</span>
                </div>
              </div>
            </div>
            
            <p className="drag-hint">
              <FontAwesomeIcon icon={faGripLinesVertical} className="drag-icon" />
              You may drag and drop custom questions to change order.
            </p>
          </div>
        </div>
        
        <div className="questions-table-wrapper">
          <QuestionsTable {...props}/>
        </div>
      </div>
    </div>
  )
};



