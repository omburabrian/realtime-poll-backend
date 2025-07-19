const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

const path = require("path");
const fs = require('fs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function loadTestData() {


    var returnMessage = '(blank return message)';

    //  Read the JSON file containing user test data.
    //  (The relative path was not what was expected.  Use path utility to resolve.)
    const userList_jsonString = fs.readFileSync(
        path.resolve(
            __dirname,
            '../testData/users-without-id.json'
        ),
        'utf8'
    );

    //  Must convert the JSON string representation to an actual JSON object.
    await User.bulkCreate(JSON.parse(userList_jsonString))
        .then((data) => {
            let number = data.length;
            //  Return a string message, not a JSON object.
            //  return { message: `${number} users were created successfully` };

            returnMessage = `${number} users were created successfully`

            return `${number} users were created successfully`;
        });

        return returnMessage;

    //  Let calling function catch errors.  Probably a contoller function.
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { loadTestData };


//  ToDo:   Reset all the passwords using salt.
//  ToDo:   Create a DEFAULT ADMIN USER, with userName = "admin".
//  ToDo:   Allow user login option with <userName>, (not just <email>).
//  ToDo:   Auto-generate userNames when users create an account.
//              Let them override it, but check for duplicates.
