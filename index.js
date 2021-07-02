const nodemailer = require('nodemailer');
const { body, checkSchema, validationResult } = require('express-validator');
const fs = require('fs');
const fsp = fs.promises;
require('dotenv').config();
//console.log(__dirname + '/' + process.env.SCHEMA_FILE);
const formSchema = require(__dirname + '/' + process.env.SCHEMA_FILE);
const mf = require('./mailerfuncs');

module.exports = [
    checkSchema(formSchema),
    function processForm(req, res, next){
        const errors = validationResult(req);
   
        //check timestamp exists, check current timestamp is > 5 seconds from posted tstamp, and less than 10 mins
        let timeError = isTimeError(req);

        if (!errors.isEmpty() || timeError) {
            console.log('failure');
            res.status(200).json({
                //Only send the first error for each field
                errors: errors.mapped(),
                timeError: timeError
            });
        }else{
            console.log('success');
            mf.sendEnquiryEmail(req);
            res.status(200).json({
                success: true,
                message: 'Registration successful'
            });
        }
    }
];

function isTimeError(req){
    let curSec = ((new Date()).getTime())/1000;
        let timeError = false;
        let formStamp = +req.body.tstamp;
        
        //Debug formstamp for 3 seconds ago
        //formStamp = (((new Date()).getTime())/1000) - 3;
        
        //Debug formstamp for 650 seconds ago
        //formStamp = (((new Date()).getTime())/1000) + 650;

        if((formStamp + 5) > curSec){
            //form was submitted less than 5 secs ago.
            timeError = true;
        }else if((formStamp + 600) < curSec){
            //form was submitted more than 10 mins after timestamp
            timeError = true;
        }else if(!formStamp){
            timeError = true;
        }
    return timeError;
}

