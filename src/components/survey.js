'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SurveyBuilder = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedQuestions = Array.from(questions);
    const [reorderedQuestion] = updatedQuestions.splice(result.source.index, 1);
    updatedQuestions.splice(result.destination.index, 0, reorderedQuestion);

    setQuestions(updatedQuestions);
  };

  const handleQuestionAdd = () => {
    if (!newQuestion) return;

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setNewQuestion('');
  };

  return (
    <div>
      <h2>Survey Builder</h2>
      <input
        type="text"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        placeholder="Enter a new question"
      />
      <button onClick={handleQuestionAdd}>Add Question</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((question, index) => (
                <Draggable key={index} draggableId={`question-${index}`} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      {question}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SurveyBuilder;

