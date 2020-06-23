const sendgridAPIKey = process.env.SENDGRID_API_KEY
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'adam7tt@gmail.com',
        subject: 'Welcome, thank you for joing us!',
        text: 'Welcome to the app ' + name + '. Please let us know how you\'re getting along'
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'adam7tt@gmail.com',
        subject: 'Sorry to see you go...',
        text: 'Goodbye ' + name + '.We\'re sorry you no longer require our services. Is there anything we could do to improve them?'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}