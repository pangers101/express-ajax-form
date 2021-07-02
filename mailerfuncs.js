const nodemailer = require('nodemailer');
const config = require('dotenv').config();
const transporter = getTransporter();
const h2t = require('html-to-text');


//replace these with req.body
let fields = {
    custname: 'Bla Bla',
    email:  'exampleemail@gmail.com',
    phone: '09870987988',
    message:    'I\'d like to order some chocolate! :)'
}


function getFields(req){
    let fields = {};
    if(req.body){
        //if POST value emailfields exists...
        let fieldArray = [];
        if(req.body.emailfields){
            fieldArray = emailfields.split(",");
        }
        for(let key in req.body){
            if(fieldArray.includes(key)){
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
    return email = {
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
}

async function sendEnquiryEmail(req){
    try{
        //await a 'true' for the config being correct
        await verifyConfig();
        //await the email being sent successfully.
        await transporter.sendMail(createEnquiryEmail(req));
        console.log('email sent successfully');
        return true;
    }catch(err){
        console.log(err.message);
        return false;
    }
    //store json record in file
}

function getTransporter(){
    return nodemailer.createTransport({
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
      });      
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
    createEnquiryEmail
}