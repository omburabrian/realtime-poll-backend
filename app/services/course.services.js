const db = require("../models");
const Course = db.course;
const Op = db.Sequelize.Op;

const path = require("path");
const fs = require('fs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
async function loadTestData() {

    var returnMessage = '(blank return message)';

    //  Read the JSON file containing COURSE test data.
    //  (Use "resolve()" to create usable path from relative path.)
    const courseList_jsonString = fs.readFileSync(
        path.resolve(
            __dirname,
            '../testData/course.test_data.json'
        ),
        'utf8'
    );

    //  Must convert the JSON *STRING* representation to a list of actual JSON objects.
    await Course.bulkCreate(JSON.parse(courseList_jsonString))
        .then((data) => {
            let number = data.length;
            return `${number} COURSEs were created successfully`;
        });

    //  Let calling function catch errors.  Probably a contoller function.
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { loadTestData };
