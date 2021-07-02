let formSchema = {
    custname: {
        trim: true,
        escape: true,
        notEmpty: true,
        isLength: { 
            options: {
                min: 1, max: 50 
            }
        },
        isAlpha: 'en-gb',
        errorMessage: "Please enter your name."
    },
    email: {
        trim: true,
        escape: true,
        isEmail: true,
        errorMessage: "Please supply a valid email address."
    },
    phonenum: {
        trim: true,
        escape: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 6,
                max: 25
            }
        },
        errorMessage: "Please enter a valid phone number."
    },
    message: {
        trim: true,
        escape: true,
        notEmpty: true,
        errorMessage: "Please let us know how we can help in the message box."
    },
    url: {
        isEmpty: true,
        errorMessage: "Please don't enter anything in the URL field, it's an anti-spam field."
    },
    tstamp: {
        notEmpty: true,
        isNumeric: true
    }
}

module.exports = formSchema;