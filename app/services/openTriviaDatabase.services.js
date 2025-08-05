/*
------------------------------------------------------------------------------
Open Trivia Database
https://opentdb.com

This app service makes use of the Open Trivia Database API to generate trivia
questions that we can import into our Real-time Poll app.

Per their API config page:

    / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / /
    Trivia API

    The Open Trivia Database provides a completely free JSON API for use in
    programming projects. Use of this API does not require a API Key, just
    generate the URL below use it in your own application to retrieve trivia
    questions.

    All data provided by the API is available under the Creative Commons
    Attribution-ShareAlike 4.0 International License.
    https://creativecommons.org/licenses/by-sa/4.0/
    / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / /

Trivia API
https://opentdb.com/api_config.php

Besides using Cohere AI to generate trivia questions, this API can be used to
generate trivia (quiz) questions (multiple choice, true/false, or both),
complete with answers.

The questions and answers are returned in JSON, similar to our DB / JSON
structure.

------------------------------------------------------------------------------
Example URI for retrieving trivia questions and answers:

https://opentdb.com/api.php?amount=10&category=18&difficulty=easy

*  amount=10            Number of questions to return
*  category=18          Category number in the opentdb database.  (2 dozen)
*  difficulty=easy      Level of difficulty:  [easy, medium, hard]

Categories can be retrieved (JSON) with this URI:
https://opentdb.com/api_category.php

Number of questions in a specified category:
https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE

Browse Questions:
https://opentdb.com/browse.php
------------------------------------------------------------------------------
*/

const opentdbBaseUri = "https://opentdb.com/api.php";

//  ToDo:  Get the JSON from the API.  For now, read from file.
const path = require("path");
const { loadJsonFromFile } = require("./utility.services.js");
const { QUESTION_TYPES } = require("../config/constants");
const { question } = require("../models/index.js");
const he = require('he');

var opentdbCategories = [];

//  Map opentdb question types to rt poll types:
const opentdbQuestionTypes = {
    "multiple": QUESTION_TYPES.MULTIPLE_CHOICE,
    "boolean": QUESTION_TYPES.TRUE_FALSE,
};

const opentdbQuestionDifficulties = [
    "easy",
    "medium",
    "hard"
];

var amount = 10;
var category = 18;
var difficulty = "easy";

//---------------------------------------------------------------------------
async function getTriviaQuestions(filename, amount, category, difficulty) {

    var realtimePoll_JSON = {};     //  JSON Real-time Poll to be returned.
    const opentdbQuestions_JSON = await getTriviaQuestionsFromApi(filename, amount, category, difficulty);
    realtimePoll_JSON = convertTriviaQuestionsToRealTimePoll(opentdbQuestions_JSON);

    //  Edit the poll's description to include the user inputs:  amount, category, difficulty.
    realtimePoll_JSON.description = `(amount = ${amount},  category = ${category},  difficulty = ${difficulty})`;
    return realtimePoll_JSON;
}

//---------------------------------------------------------------------------
async function getTriviaQuestionsFromApi(filename, amount, category, difficulty) {

    //  ToDo:   Setup fetch from API later.
    /*
    const response = await fetch(
        `${opentdbBaseUri}?amount=${amount}&category=${category}&difficulty=${difficulty}`
    );
    //  */

    //  TODO:   TESTING -- For now, just return JSON from a file already downloaded.
    //  const relativePathToJsonFile = '../testData/opentdb/cs-10-easy.json';
    const relativePathToJsonFile = `../testData/opentdb/${filename}`;
    const opentdbQuestions_JSON = await loadJsonFromFile(path.resolve(__dirname, relativePathToJsonFile));

    return opentdbQuestions_JSON;
}

//---------------------------------------------------------------------------
function convertTriviaQuestionsToRealTimePoll(opentdbQuestions_JSON) {

    //  Todo:  function convertTriviaQuestionsToRealTimePoll(opentdbQuestions_JSON) {
    //  As a test, return the first question from the list.  SUCCESS.
    //  const realtimePoll_JSON = opentdbQuestions_JSON.results[0];

    /*
    Create a Poll object and add the Question and Answer objects.
    After returning, set the name and description of the Poll object
    based on the user inputs to the API.
    */

    var aRealtimePoll = {
        name: "(Quiz imported from Open Trivia Database)",
        description: "(What were the user inputs to the API?  amount, category, difficulty)",
        //  secondsPerQuestion: 30,     //  Accept the default
        isQuiz: true,   //  All question sets imported from <opentdb> are "quizzes".
        questions: [],
    };

    //  Loop through the questions, converting each to a Real-time Poll Question,
    //  and adding it to the question list of this poll, <aRealtimePoll>.
    //  (The opentdb question list = opentdbQuestions_JSON.results.)
    opentdbQuestions_JSON.results.forEach(function (aQuestion, index) {

        //  Create a RT Poll question object to add to the new RT Poll object.

        var aRtPollQuestion = {
            questionNumber: index + 1,  //  0-index array, so +1
            questionType: opentdbQuestionTypes[aQuestion.type],
            text: he.decode(aQuestion.question),
            isAnswerOrderRandomized: false,
            //  secondsPerQuestion: 30,     //  Accept the default from the RtPoll.
            answers: [],
        }

        //  ToDo:   (maybe?)  Double check the questionType.
        //          If undefined, then default to multiple choice.

        //  Create the list of RtPoll ANSWERS for this QUESTION.
        //  Initially, just populate the list of answers, then randomize
        //  the order to mix in the correct answer amongst the others.

        //  Add the INCORRECT ANSWERS
        aQuestion.incorrect_answers.forEach(function (anIncorrectAnswer, index) {
            var anAnswer = {
                text: he.decode(anIncorrectAnswer),
                answerIndex: index + 1,
                isCorrectAnswer: false,
            }
            aRtPollQuestion.answers.push(anAnswer);
        });

        //  Add the CORRECT ANSWER
        aRtPollQuestion.answers.push({
            text: he.decode(aQuestion.correct_answer),
            answerIndex: aRtPollQuestion.answers.length + 1,
            isCorrectAnswer: true,
        });

        //  Re-order the answers of the question, based on the question type.
        setRtPollAnswerOrderForOpentdbQuestion(aRtPollQuestion, aQuestion);

        //  Lastly, add this RT Poll question to the RT Poll.
        aRealtimePoll.questions.push(aRtPollQuestion);

        //  console.log(index, aQuestion);  //  (This is the opentdb question.)
    });

    //  return realtimePoll_JSON;
    return aRealtimePoll;
}

//---------------------------------------------------------------------------
function setRtPollAnswerOrderForOpentdbQuestion(aRtPollQuestion, aQuestion) {

    //  For TRUE-FALSE questions, always order the answers:
    //      1 = TRUE, 2 = FALSE,
    if (aQuestion.type === "boolean") {
        //  Set the answer order to true/false.
        aRtPollQuestion.answers = [
            {
                "text": "True",
                "answerIndex": 1,
                "isCorrectAnswer": false
            },
            {
                "text": "False",
                "answerIndex": 2,
                "isCorrectAnswer": false
            }
        ];

        //  Now flag the correct answer.
        if (aQuestion.correct_answer === "True") {
            aRtPollQuestion.answers[0].isCorrectAnswer = true;
        } else {
            aRtPollQuestion.answers[1].isCorrectAnswer = true;
        }
    } else {
        //  Assume multiple choice question.
        //  Randomize the order of all the answers.
        //  (Compares every element in the array, randomly swapping positions, in place.)
        aRtPollQuestion.answers = aRtPollQuestion.answers.sort(() => Math.random() - 0.5);

        //  Now reassign the answer indexes to match their new order.
        aRtPollQuestion.answers.forEach(function (anAnswer, index) {
            anAnswer.answerIndex = index + 1;   //  0-based, so +1 for frontend usage.
        });
    }
}

//---------------------------------------------------------------------------
/*
function getRtPollQuestionTypeForOpentdbQuestionType(opentdbQuestionType) {

}
//  */

//---------------------------------------------------------------------------
module.exports = { getTriviaQuestions };
