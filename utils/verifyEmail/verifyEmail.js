const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler')


module.exports = asyncHandler(async (userEmail, subject, htmlTemplate) => {
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.APP_NODE_MAILER_EMAIL,
            padss: process.env.APP_NODE_MAILER_PASS
        }
    });

    const mailOption = {
        from: process.env.APP_NODE_MAILER_EMAIL,
        to: userEmail,
        subject: subject,
        html: htmlTemplate,
    };

    const info = transporter.sendMail(mailOption);
});