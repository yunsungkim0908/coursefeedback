import Link from 'next/link'
import React, { useRef, useState, useEffect } from 'react';
import { Table, Button ,Dropdown } from 'react-bootstrap'
import "../../components/Forms/Form.css"
import { doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import * as Yup from "yup";
import TextareaAutosize from 'react-textarea-autosize';
import autosize from 'autosize'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faGripLinesVertical } from '@fortawesome/free-solid-svg-icons'
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
    <>
      <Dropdown>
        <Dropdown.Toggle
          variant="outline-primary" id="dropdown-basic"
          style={{'width':'150px'}}
        >
          {quesTypeDisplay[selection]}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {
            quesTypeChoices.map((choice, idx) => (
              <Dropdown.Item 
                key={idx}
                onClick = {() => {
                  helpers.setValue(choice)
                }}
                disabled={freezeQues} 
              >{quesTypeDisplay[choice]}</Dropdown.Item>
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
      {meta.touched && meta.error && 
      <div className="error-space">
        <span className="error">{meta.error}</span>
      </div>}
    </>
  )
}

const FixedRow = (props) => {
  return (
    <>
      <Col sm="8">
        <TextareaAutosize className="text-area-input" disabled={true}
          value={props.prompt}
        />
      </Col>
      <Col sm="3" className='vertical-center'>
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-secondary" id="dropdown-basic" disabled
            style={{'width': '150px'}}
          >
            {quesTypeDisplay[props.type]}
          </Dropdown.Toggle>
        </Dropdown>
      </Col>
      <Col sm="1">
        {/*<Button disabled>
          Default
        </Button>*/}
      </Col>
      <hr style={{margin: "0.3rem 0 0.3rem 0"}}/>
    </>
  )
}

// Table row for custom questions customized by teachers.
export const EditableRow = ({index, formikProps}) => {
  const [promptField, promptMeta]= useField(`questions.${index}.prompt`)

  const handleDeleteQuestion = (formikProps, index) => {
    const { questions } = formikProps.values
    questions.splice(index, 1);

    formikProps.setFieldValue("questions", questions);
  }

  return (
    <>
      <Col sm="8">
        <div className='button-box'>
          <div className='flex-grow'>
            <TextareaAutosize className="text-area-input" disabled={false}
              {...promptField}/>
            {promptMeta.touched && promptMeta.error &&
            <p>
              <span className="error">{promptMeta.error}</span>
            </p>}
          </div>
        </div>
      </Col>
      <Col sm="4" className='vertical-center'>
        <div className='button-box'>
          <QuestionTypeDropdown className='flex-item' index={index} freezeQues={false}/>
          <Button className='flex-item' variant="danger" type="button" disabled={false}
            onClick={() => {handleDeleteQuestion(formikProps, index)}}
          >
            <FontAwesomeIcon icon={faTrashAlt} size="sm"/>
          </Button>
        </div>
      </Col>
      <hr style={{margin: "0.3rem 0 0.3rem 0"}}/>
    </>
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
                  <div style={{margin: "1rem"}}>
                    <Row>
                      <Col sm="8"><b>Question Prompt</b></Col>
                      <Col sm="3"><b>Question type</b></Col>
                      <Col sm="1"></Col>
                      <hr style={{margin: "1rem 0 0.5rem 0"}}/>
                    </Row>
                    {defaultQues.map((question) => (
                      <Row>
                        <FixedRow {...question}/>
                      </Row>
                    ))}
                    {formikProps.values.questions.map((question,index) => (
                      <Draggable
                        key={question.id}
                        draggableId={question.id}
                        index={index}
                      >
                        {(provided) => (
                        <Row
                          key={index}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <EditableRow index={index} formikProps={formikProps}/>
                        </Row>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                  <p style={{color: 'blue'}}>
                    Note: Changes made now will be reflected in the upcoming survey.
                  </p>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Button href={`survey?callNumber=${props.classCode}&classHash=${props.classHash}&user=preview&week=`}>
                      See Survey Preview
                    </Button>
                    <div className='button-box'>
                      <Button
                        type="button"
                        className='mx-auto'
                        onClick={()=>{handleAddQuestion(formikProps)}}
                      >
                        Add Question
                      </Button>
                      <Button 
                        type="submit" 
                        className="mx-auto"
                      >
                        Save
                      </Button>
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
    <>
      <div className="card my-4 mx-auto" style={{maxWidth: 800}}>
        <div className="card-body">
          <div className="question-spacing">
            <div className="question-spacing">
              <h2>Feedback Questions</h2>
              <hr/>
              <div>
                  <p>You can ask more questions to your students in addition to our default questions. Modify your question prompts through this form and <b> click "Save" to save <span style={{color: 'blue'}}> any </span> changes that you made</b>. <u>(Unless specifically deleted, the same questions from the previous week will be used.)</u></p>
                Choose one the following types for each question (Drag and drop a row to change the order):
                <ul>
                  <li><b>Text:</b> Students will give responses in text.</li>
                  <li><b>Numeric:</b> Students will give numeric responses.</li>
                  <li><b>Rating (1-5):</b> Students will choose an integer rating from 1 to 5.</li>
                  <li><b>Rating (Qualitative):</b> Students will choose from (Poor, Below Average, Ok, Good, Excellent).</li>
                </ul>
                <p>
                  You may drag and drop custom questions to change order.
                </p>
                <QuestionsTable {...props}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};



