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

var amount = 10;
var category = 18;
var difficulty = "easy";

async function getTriviaQuestions(amount, category, difficulty) {

    const response = await fetch(
        `${opentdbBaseUri}?amount=${amount}&category=${category}&difficulty=${difficulty}`
    );

    //  (Response will already be in JSON format.)
    //  return await response.json();
    return response;
}

module.exports = { getTriviaQuestions };
