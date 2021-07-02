'use strict';
const { verifyConfig } = require('nodemailer');

require('dotenv').config();
let nm = require('./mailerfuncs');

nm.sendEnquiryEmail();


