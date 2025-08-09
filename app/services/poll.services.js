const { getTriviaQuestions } = require("./openTriviaDatabase.services");
const { loadJsonFromFile } = require("./utility.services.js");

const db = require("../models");
const Poll = db.poll;
const Question = db.question;
const Answer = db.answer;
const Op = db.Sequelize.Op;

const path = require("path");

//---------------------------------------------------------------------------
//  Find all Polls for a user (professor)
async function findAllForUserId(userId) {
  try {
    const data = await Poll.findAll({
      where: { userId: userId },
      include: [
        {
          model: Question,
          include: [{
            model: Answer,
          }],
        },
      ],
      order: [
        ["name", "ASC"],
      ],
    });
    return data;
  } catch (err) {
    throw new Error(err.message || "Error retrieving Polls for user ID = " + userId);
  }
};

//---------------------------------------------------------------------------
async function loadTestData_quizzesAndAnswers() {

    //  (Let calling function catch errors.  Probably a contoller function.)

    var returnMessage = 'Error occurred while loading test data for POLLS';


    /*
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    NOTE:   Which PROFESSOR USER to which to assign new Polls test data?

    Only ADMINS have permission to create test data.  Admins also have
    PROFESSOR permissions.  So for now, just assign the new test data for the
    new Polls to the current user, who will be an ADMIN user.

    ToDo:   Add option to assign new Polls test data to specified PROFESSOR
            user(s).
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -    
    */

    const theUserId = 1;
    const testDataSpecifications = getTestDataSpecifications();
    var quizList = [];      //  List of polls that will be bulkCreate()'d.
    var poll_JSON = {};     //  Temporary variable for holding the poll in the loop.

    //  Read the list of test data files (previously downloaded from opentdb),
    //  converting them to Real-time Polls, Questions, and Answers.
    testDataSpecifications.forEach(async (testDataSpecs) => { 

        poll_JSON = await getTriviaQuestions(testDataSpecs);

        /*
        poll_JSON = await getTriviaQuestions(
            //  ToDo:  Eventually won't need fileName, as data will come from API.
            testDataSpecs.fileName,
            testDataSpecs.amount,
            testDataSpecs.category,
            testDataSpecs.difficulty,
            testDataSpecs.pollName,
        );
        //  */

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
async function loadTestData() {
    try {
        const quizzesMessage = await loadTestData_quizzesAndAnswers();
        const discussionPollsMessage = await loadTestData_discussionPolls();

        // Combine messages for a comprehensive response
        return `${quizzesMessage}\n${discussionPollsMessage}`;

    } catch (err) {
        console.error('Error loading test data for DISCUSSION POLLS and QUIZZES:', err);
        //  Re-throw a more generic error to be handled by the controller
        throw new Error(err.message || "Error occurred while loading test data for DISCUSSION POLLS and QUIZZES");
    }
}

//---------------------------------------------------------------------------
async function loadTestData_discussionPolls() {
    try {
        const relativePathToJsonFile = '../testData/discussion_polls.test_data.json';
        const discussionPollsData = await loadJsonFromFile(path.resolve(__dirname, relativePathToJsonFile));

        const pollCount = await bulkCreatePollsWithQuestionsAndAnswers(discussionPollsData);

        return `${pollCount} discussion POLLS were created successfully`;

    } catch (err) {
        console.error('Error loading discussion poll test data:', err);
        throw new Error(err.message || "Error occurred while loading test data for DISCUSSION POLLS");
    }
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
function getTestDataSpecifications() {

    return [
        {
            fileName: 'animals-10-easy.json',
            category: 'Animals',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Animals Quiz'
        },
        {
            fileName: 'art-10-easy.json',
            category: 'Art',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Art Quiz'
        },
        {
            fileName: 'books-10-easy.json',
            category: 'Books',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Books Quiz'
        },
        {
            fileName: 'celebrities-10-easy.json',
            category: 'Celebrities',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Celebrities Quiz'
        },
        {
            fileName: 'computer-science-10-easy.json',
            category: 'Computer Science',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Computer Science Quiz'
        },
        {
            fileName: 'film-10-easy.json',
            category: 'Film',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Film Quiz'
        },
        {
            fileName: 'general-knowledge-10-easy.json',
            category: 'General Knowledge',
            difficulty: 'easy',
            amount: '10',
            pollName: 'General Knowledge Quiz'
        },
        {
            fileName: 'geography-10-easy.json',
            category: 'Geography',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Geography Quiz'
        },
        {
            fileName: 'history-10-easy.json',
            category: 'History',
            difficulty: 'easy',
            amount: '10',
            pollName: 'History Quiz'
        },
        {
            fileName: 'math-10-easy.json',
            category: 'Math',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Math Quiz'
        },
        {
            fileName: 'music-10-easy.json',
            category: 'Music',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Music Quiz'
        },
        {
            fileName: 'mythology-10-easy.json',
            category: 'Mythology',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Mythology Quiz'
        },
        {
            fileName: 'politics-10-easy.json',
            category: 'Politics',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Politics Quiz'
        },
        {
            fileName: 'science-and-nature-10-easy.json',
            category: 'Science and Nature',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Science and Nature Quiz'
        },
        {
            fileName: 'sports-10-easy.json',
            category: 'Sports',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Sports Quiz'
        },
                {
            fileName: 'television-10-easy.json',
            category: 'Television',
            difficulty: 'easy',
            amount: '10',
            pollName: 'Television Quiz'
        },
    ];

    /*
    JSON files from Open Trivia Database API:

    app\testData\opentdb

        animals-10-easy.json
        art-10-easy.json
        books-10-easy.json
        celebrities-10-easy.json
        computer-science-10-easy.json
        cs-10-easy.json
        film-10-easy.json
        general-knowledge-10-easy.json
        geography-10-easy.json
        history-10-easy.json
        math-10-easy.json
        music-10-easy.json
        mythology-10-easy.json
        politics-10-easy.json
        science-and-nature-10-easy.json
        sports-10-easy.json
        television-10-easy.json
    */
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = {
    findAllForUserId,
    loadTestData,
    loadTestData_quizzesAndAnswers,
    loadTestData_discussionPolls,
    bulkCreatePollsWithQuestionsAndAnswers,
};
