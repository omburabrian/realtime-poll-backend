const { loadJsonFromFile } = require("./utility.services");
const db = require("../models");
const Poll = db.poll;
const Question = db.question;
const Answer = db.answer;
const Op = db.Sequelize.Op;

const path = require("path");
const fs = require('fs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function loadTestData() {

    var returnMessage = '(return message from loadTestData())';

    //  const poll_JSON = UtilityServices.loadJsonFromFile(
    const poll_JSON = await loadJsonFromFile(
        path.resolve(__dirname, '../testData/opentdb/cs-10-easy.json')
    );

    console.log(poll_JSON);

    //  ToDo:  From the JSON, create the poll, questions, and answers.

    /*
    //  Must convert the JSON string representation to an actual JSON object.
    await User.bulkCreate(JSON.parse(userList_jsonString))
        .then((data) => {
            let number = data.length;
            //  Return a string message, not a JSON object.
            //  return { message: `${number} users were created successfully` };

            returnMessage = `${number} users were created successfully`

            return `${number} users were created successfully`;
        });

    //  */

    return returnMessage;

    //  Let calling function catch errors.  Probably a contoller function.
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { loadTestData };
