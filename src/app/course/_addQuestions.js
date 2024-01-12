import Link from 'next/link'
import React, { useRef, useState, useEffect } from 'react';
import { Table, Button ,Dropdown } from 'react-bootstrap'
import "../../components/Forms/Form.css"
import { doc, deleteDoc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import * as Yup from "yup";
import TextareaAutosize from 'react-textarea-autosize';
import autosize from 'autosize'

import { useField, Form, Formik, Field, FieldArray } from "formik";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


const choices = [
  'Text',
  'Numeric',
  'Rating (1-5)',
  'Rating (Qualitative)'
]

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
        <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
          {selection}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {
            choices.map((choice, idx) => (
              <Dropdown.Item 
                key={idx}
                onClick = {() => {
                  helpers.setValue(choice)
                }}
                disabled={freezeQues} 
              >{choice}</Dropdown.Item>
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
      <th>
        <TextareaAutosize className="text-area-input" disabled={true}
          value={props.prompt}
        />
      </th>
      <th>
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" disabled>
            {props.type}
          </Dropdown.Toggle>
        </Dropdown>
      </th>
      <th>
        {/*<Button disabled>
          Default
        </Button>*/}
      </th>
    </>
  )
}

// Table row for custom questions customized by teachers.
export const EditableRow = ({index}) => {
  const [promptField, promptMeta]= useField(`questions.${index}.prompt`)

  return (
    <>
      <th>
        <TextareaAutosize className="text-area-input" disabled={false}
          {...promptField}/>
        {promptMeta.touched && promptMeta.error &&
        <p>
          <span className="error">{promptMeta.error}</span>
        </p>}
      </th>
      <th>
        <QuestionTypeDropdown index={index} freezeQues={false}/>
      </th>
      <th>
        <Button variant="danger" type="button" disabled={false}
          onClick={() => {
            arrayHelpers.remove(index)
          }}>
         X
        </Button>
      </th>
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
    console.log(questionCounter)
    return id
  };


  useEffect(() => {
    setDefaultQues([
      {qid: 'default0', prompt: 'default question 0', type: 'Text'},
      {qid: 'default1', prompt: 'default question 1', type: 'Rating (1-5)'},
      {qid: 'default2', prompt: 'default question 2', type: 'Rating (Qualitative)'},
      {qid: 'default3', prompt: 'default question 3', type: 'Numeric'},
    ])

    const data = {'questions': [
      {qid: 'custom0', prompt: 'custom question 0', type: 'Text'},
      {qid: 'custom1', prompt: 'custom question 1', type: 'Rating (1-5)'},
      {qid: 'custom2', prompt: 'custom question 2', type: 'Rating (Qualitative)'},
      {qid: 'custom3', prompt: 'custom question 3', type: 'Numeric'},
    ], 'previous-questions': []}

    var initialCount = 0
    data['questions'] = data['questions'].map((obj)=> {
      obj['id'] = `question_${initialCount}`
      initialCount += 1
      console.log(obj['id'])
      return obj
    })
    setQuestionCounter(initialCount)
    setCustomQues(data)
    console.log(data.questions)
    setPrevCustomQues(data['previous-questions'])
  }, [])

  // // fetch the default questions
  // useEffect(() => {
  //   getDoc(doc(props.db, "shared", "default-questions"))
  //     .then((snap) => { setDefaultQues(snap.data()) })
  //     .catch((error) => {
  //       console.log(error)
  //       ErrorMessage(error)
  //       return
  //     })
  // }, []) 

  // // fetch the current questions
  // useEffect(() => {
  //   getDoc(doc(props.db, "questions", props.classHash))
  //     .then((snap) => {
  //       if (typeof snap.data() == 'undefined')
  //         Swal.fire({
  //           icon: "error",
  //           title: 'Invalid access. Did you follow the correct URL?',
  //           showCancelButton:false,
  //           showConfirmButton:false,
  //           allowOutsideClick: false
  //         })
  //       else if ('questions' in snap.data() && 'previous-questions' in snap.data()){
  //         const data = snap.data()
  //         var initialCount = 0
  //         data['questions'] = data['questions'].map((obj)=> {
  //           obj['id'] = `question_${initialCount}`
  //           initialCount += 1
  //           console.log(obj['id'])
  //           return obj
  //         })
  //         setQuestionCounter(initialCount)
  //         setCustomQues(data)
  //         console.log(data.questions)
  //         setPrevCustomQues(data['previous-questions'])}
  //       else
  //         throw new Error('No questions field. Please contact admin.')
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //       ErrorMessage(error.message)
  //       return
  //     })
  // }, []) 

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
          })})
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
    if (!result.destination){
      return
    }

    const { questions } = formikProps.values
    const [reorderedItem] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedItem);

    formikProps.setFieldValue("questions", questions);
    console.log(formikProps.values.questions)
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
                  <Table>
                    <thead>
                      <tr>
                        <th>Question Prompt</th>
                        <th>Question Type</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaultQues.map((question) => (
                        <tr>
                          <FixedRow {...question}/>
                        </tr>
                      ))}
                      {formikProps.values.questions.map((question,index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided) => (
                          <tr
                            key={index}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <EditableRow index={index}/>
                          </tr>
                          )}
                        </Draggable>
                      ))}
                    </tbody>
                  </Table>
                  {provided.placeholder}
                  <Button type="button"
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
      <div className="card mt-4">
        <div className="card-body small-padding-card">
          <div className="question-spacing">
            <div className="question-spacing">
              <h2>Feedback Questionnaire of the Week</h2>
              <hr/>
              <div>
                  <p>You can ask more questions to your students in addition to our default questions. Modify your question prompts through this form and <b> click "Save" to save <span style={{color: 'blue'}}> any </span> changes that you made</b>. <u>(Unless specifically deleted, the same questions from the previous week will be used.)</u></p>
                Choose one the following types for each question:
                <ul>
                  <li><b>Text:</b> Students will give you a text response.</li>
                  <li><b>Numeric:</b> Students will give you numeric answers.</li>
                  <li><b>Rating (1-5):</b> Students will choose an integer rating from 1 to 5.</li>
                  <li><b>Rating (Qualitative):</b> Students will choose from (Poor, Below Average, Ok, Good, Excellent).</li>
                </ul>
                <p>
                  <Link href={{
                      pathname: "survey",
                      query: {
                        callNumber: props.classCode,
                        classHash: props.classHash,
                        user: 'preview',
                        week: ''
                      }
                  }}>
                    Preview
                  </Link>
                  {' '} of what your students would see in the next survey.
                </p>
                <p style={{color: 'red'}}>
                  Note: Changes made now will be reflected to the survey between 0am~2am every Monday.
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



