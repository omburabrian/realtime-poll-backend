const { getTriviaQuestions } = require("./openTriviaDatabase.services");

const db = require("../models");
const Poll = db.poll;
const Question = db.question;
const Answer = db.answer;
const Op = db.Sequelize.Op;

const path = require("path");
const fs = require('fs');

//---------------------------------------------------------------------------
async function loadTestData() {

    //  (Let calling function catch errors.  Probably a contoller function.)

    var returnMessage = 'Error occurred while loading test data for POLLS';

    //  For testing, just assign the test data polls to the first user,
    //  assuming it is the dev who first logged in.
    //  ToDo:   Assign the polls to various users who have the role of "professor".
    const theUserId = 1;
    const testDataFiles = getTestDataFiles();
    var quizList = [];      //  List of polls that will be bulkCreate()'d.
    var poll_JSON = {};     //  Temporary variable for holding the poll in the loop.

    //  Read the list of test data files (previously downloaded from opentdb),
    //  converting them to Real-time Polls, Questions, and Answers.
    testDataFiles.forEach(async (testDataFile) => { 

        poll_JSON = await getTriviaQuestions(
            //  ToDo:  Eventually won't need fileName, as data will come from API.
            testDataFile.fileName,
            testDataFile.amount,
            testDataFile.category,
            testDataFile.difficulty
        );

        //  Assign the "professor" user and add to the list from which
        //  to bulkCreate() the new POLLS (quizzes).
        poll_JSON["userId"] = theUserId;
        quizList.push(poll_JSON);
    });

    //  Bulk create all the polls, en masse... ("The Incredible *Bulk*!")
    const pollCount = await bulkCreatePollsWithQuestionsAndAnswers(quizList);
    returnMessage = `${pollCount} POLLS were created successfully`;
    // console.log(returnMessage);
    return returnMessage;
}

//---------------------------------------------------------------------------
async function bulkCreatePollsWithQuestionsAndAnswers(pollsData) {

    //  Start a transaction.
    //  (Allows for rolling back all DB operations en masse upon failure.)
    const transaction = await db.sequelize.transaction();

    //  Get the options block and add the transaction.
    var includeOptionsBlock = getIncludeOptionsBlockForQA();
    includeOptionsBlock['transaction'] = transaction;

    try {
        const createdPolls = await Poll.bulkCreate(
            pollsData,
            includeOptionsBlock,
        );

        //  When the transaction completes (instantiates), then commit() it.
        await transaction.commit();
        return createdPolls.length;

    } catch (error) {
        await transaction.rollback();   //  If error, rollback any and all DB operations.
        console.error('Error during bulk creation of POLLs:', error);
        throw error;    //  Re-throw error to let calling function handle it.
    }
}

function getIncludeOptionsBlockForQA() {
     //  Create options to enable creating nested model instances, simultaneously
    return {
        include: [
            {
                model: Question,
                //  as: 'question',
                include: [{
                    model: Answer,
                    //  as: 'answer',
                }],
            },
        ],
    };
}

//--------------------------------------------------------
function getTestDataFiles() {

    return [
        {
            fileName: 'science-and-nature-10-easy.json',
            category: 'Science and Nature',
            difficulty: 'easy',
            amount: '10'
        },
        {
            fileName: 'animals-10-easy.json',
            category: 'Animals',
            difficulty: 'easy',
            amount: '10'
        },
        {
            fileName: 'computer-science-10-easy.json',
            category: 'Computer Science',
            difficulty: 'easy',
            amount: '10'
        },
        {
            fileName: 'geography-10-easy.json',
            category: 'Geography',
            difficulty: 'easy',
            amount: '10'
        },
        {
            fileName: 'history-10-easy.json',
            category: 'History',
            difficulty: 'easy',
            amount: '10'
        },
        {
            fileName: 'sports-10-easy.json',
            category: 'Sports',
            difficulty: 'easy',
            amount: '10'
        },
    ];
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { loadTestData, bulkCreatePollsWithQuestionsAndAnswers };
