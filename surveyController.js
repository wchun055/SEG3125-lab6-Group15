// required packages
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var fs = require('fs');

const DATA_FILE = './data/surveyResults.json';

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]');
    }
    const dataRead = fs.readFileSync(DATA_FILE);
    return JSON.parse(dataRead);
}

function writeData(info) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(info, null, 2));
}

// update the data file, I use "name" to be equal to fruit, or animal or color
// to match with the file names
// I assume we always just add 1 to a single item
function combineCounts(name, value){
    // console.log(value);
    info = readData(name);
     // will be useful for text entry, since the item typed in might not be in the list
    var found = 0;
    for (var i=0; i<info.length; i++){
        if (info[i][name] === value){
            info[i].count = parseInt(info[i].count) + 1;
            found = 1;
        }
    }
    if (found === 0){
        info.push({[name] : value, count: 1});
    }
    writeData(info, name);
}

// This is the controler per se, with the get/post
module.exports = function(app){

    // when a user goes to localhost:3000/analysis
    // serve a template (ejs file) which will include the data from the data files
    app.get('/analysis', function(req, res){
        var color = readData("color");
        var fruit = readData("fruit");
        var animal = readData("animal");
        res.render('showResults', {results: [color, fruit, animal]});
        console.log([color, fruit, animal]);
    });

    // when a user goes to localhost:3000/survey
    // serve a static html (the survey itself to fill in)
    app.get('/survey', function(req, res){
        res.sendFile(__dirname+'/views/survey.html');
    });

    // when a user types SUBMIT in localhost:3000/survey 
    // the action.js code will POST, and what is sent in the POST
    // will be recuperated here, parsed and used to update the data files
    app.post('/survey', urlencodedParser, function(req, res){
        const submission = req.body; // contains all fields: visits, impressions, devices, etc.

        // read existing data
        const allData = readData();

        // add new submission
        allData.push(submission);

        // save back
        writeData(allData);

        console.log("Submission saved:", submission);
       
        // mystery line... (if I take it out, the SUBMIT button does change)
        // if anyone can figure this out, let me know!
        res.sendFile(__dirname + "/views/survey.html");
    });
    

};