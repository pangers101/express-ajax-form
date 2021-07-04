const nodemailer = require('nodemailer');
const config = require('dotenv').config();
const transporter = getTransporter();
const h2t = require('html-to-text');
const fs = require('fs');
const fsp = fs.promises;



function getFields(req){
    let fields = {};
    if(req.body){
        //console.log(req.body);
        //if POST value emailfields exists...
        let fieldArray = [];
        if(req.body.emailfields){
            fieldArray = req.body.emailfields.split(",");
        }
        for(let key in req.body){
            if(fieldArray.includes(key) && req.body.emailfields){
                fields[key] = req.body[key];
            }else if(!req.body.emailfields){
                //there was no list of email fields, so add all fields
                fields[key] = req.body[key];
            }
        }
        return fields;
    }else{
        return fields;
    }
}

function createEnquiryEmail(req){
    let fields = getFields(req);
    let email = {
        from    : process.env.SMTP_FROM,
        to      : process.env.SITE_EMAIL,
        subject : 'Website Enquiry from ' + process.env.SITE_NAME,
        fields  : fields,
        get html(){
            let htmlbody = `
<h3>Website enquiry from ${process.env.SITE_NAME}.</h3>
<hr />
        `;
            for(let k in this.fields){
                htmlbody += `\n<strong>${k}</strong> : ${this.fields[k]}<hr />`
            }
            return htmlbody;
        },
        get text(){
            return h2t.convert(this.html);
        }
    }
    if(process.env.CC_EMAIL){
        email.cc = process.env.CC_EMAIL;
    }
    return email;
}

async function sendEnquiryEmail(req){
    try{
        //await a 'true' for the config being correct
        await verifyConfig();
        //await the email being sent successfully.
        await storeJSON(req, true);
        await transporter.sendMail(createEnquiryEmail(req));
        console.log('email sent successfully');
        return true;
    }catch(err){
        console.log(err);
        throw new Error(err);
    }
    //store json record in file
}

/* 2nd param is 'true' if request is valid, false if it's rejected */
async function storeJSON(req, valid = true){
    try{
        let theFile;
        if(valid === true){
            theFile = "/jsonenquiries.json";
        }else{
            theFile = "/jsonfailedenquiries.json";
        }

        let fields = getFields(req);
        
        if(fields){
            fields.time = new Date().toLocaleString();
            
            await fsp.appendFile('./' + process.env.LOGS_FOLDER + theFile, JSON.stringify(fields) + '\n', { flag: 'a' })         
            //Only use the following line if locally installed express-ajax-form with 'npm link'
            //await fsp.appendFile(__dirname + '/' + process.env.LOGS_FOLDER + theFile, JSON.stringify(fields) + '\n', { flag: 'a' })         
            console.log('written JSON file for enquiry');            
        }
        return true;
    }catch(e){
        console.log(e);
    }
}

function getTransporter(){
    let mailObj = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE, // upgrade later with STARTTLS
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
          //pass: 'invalidpass'
        },
        tls: { 
            rejectUnauthorized: false 
        }
      }
    //console.log(mailObj);
    return nodemailer.createTransport(mailObj);      
}

//returns a promise - resolves to 'true' if config valid, 'false' if invalid.
async function verifyConfig(){
    try{
        return await transporter.verify();
    }catch{
        //console.log('SMTP details invalid.');
        return false;
    }
}

module.exports = {
    sendEnquiryEmail,
    verifyConfig,
    createEnquiryEmail,
    storeJSON
}