const { getTriviaQuestions } = require("./openTriviaDatabase.services");
//  const { loadJsonFromFile } = require("./utility.services");


//  V:\xampp\htdocs\projects\rt-poll\realtime-poll-backend\app\services\openTriviaDatabase.services.js

const db = require("../models");
const Poll = db.poll;
const Question = db.question;
const Answer = db.answer;
const Op = db.Sequelize.Op;

const path = require("path");
const fs = require('fs');

//---------------------------------------------------------------------------
async function loadTestData() {

    var returnMessage = '(return message from loadTestData())';
    const poll_JSON = await getTriviaQuestions();


    //  The console.log() will not display nested JSON arrays?
    //  Convert to a string and log and check in Notepad++.
    const poll_jsonString = JSON.stringify(poll_JSON);
    console.log(poll_jsonString);
    // console.log(poll_JSON);
    return returnMessage;

    //  Let calling function catch errors.  Probably a contoller function.
}

//---------------------------------------------------------------------------
async function bulkCreatePollsWithQuestionsAndAnswers(pollsData) {

    //  Start a transaction.  (Allows for rolling all DB operations en masse upon failure.)
    const transaction = await db.sequelize.transaction();

    //  ToDo:   Add these includes to the regular "create" and make them optional.

    try {
        const createdPolls = await Poll.bulkCreate(pollsData, {
            include: [
                {
                    model: Question,
                    as: 'question',     //  (Defined alias in associations in models/index.js)
                                        //  Possibly need to specify foreign key.  It defaults correctly?
                    include: [{
                        model: Answer,
                        as: 'answer',   //  (Defined alias in associations in models/index.js)
                                        //  Possibly need to specify foreign key.  It defaults correctly?
                    }],
                },
            ],
            transaction: transaction,   //  "Pass the transaction to ensure atomicity"
        });

        await transaction.commit();
        return createdPolls;

    } catch (error) {
        await transaction.rollback();   //  Rollback all upon any error.
        console.error('Error during bulk creation of POLLs:', error);
        throw error;    //  Re-throw error to let calling function handle it.
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { loadTestData, bulkCreatePollsWithQuestionsAndAnswers };
