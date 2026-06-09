const BrevoClient = require('@getbrevo/brevo')

const {} = require('../utils/emailTemplate')

const brevoClient = new BrevoClient.TransactionalEmailsApi()
brevoClient.authentications['apiKey'].apiKey = process.env.brevoapikey;

const brevo = async(userEmail, userName, otp, template) =>{
     try{
        const sendSmtpEmails = new BrevoClient.SendSmtpEmail();

        sendSmtpEmails.to = [{email: userEmail}]
        sendSmtpEmails.subject = "Hello from FarmGoo"
        sendSmtpEmails.htmlContent  =  template
        sendSmtpEmails.sender = { email: "utibeekpenyong203@gmail.com", name: "IT Department for FarmGoo"}

        await brevoClient.sendTransacEmail(sendSmtpEmails);

        console.log("email sent to", userEmail)


    }
    catch(error){
        console.log("brevo error", error.message)
    


    }
}



module.exports = brevo