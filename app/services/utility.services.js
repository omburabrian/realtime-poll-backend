const path = require("path");
const fs = require('fs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function loadJsonFromFile(theFilePath) {

    console.log('utility.services::loadJsonFromFile()');
    console.log('theFilePath = ' + theFilePath);

    //  ( Let any errors propogate up the call stack. )

    //  Read the JSON file as a string.
    const userList_jsonString = fs.readFileSync(theFilePath, 'utf8');

    //  Convert the JSON string into an actual JSON object and return it.
    return JSON.parse(userList_jsonString)
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = { loadJsonFromFile };
