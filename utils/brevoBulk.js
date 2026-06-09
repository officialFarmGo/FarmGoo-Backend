const BrevoClient = require('@getbrevo/brevo')

const brevoClient = new BrevoClient.TransactionalEmailsApi()
brevoClient.authentications['apiKey'].apiKey = process.env.brevoapikey;

const brevoBulk = async(recipients, template, subject) => {
    try {
        const sendSmtpEmails = new BrevoClient.SendSmtpEmail();

        sendSmtpEmails.to = recipients.map((driver) => ({
            email: driver.email,
            name: driver.firstName
        }))
        sendSmtpEmails.subject = subject || "New Delivery Request - FarmGoo"
        sendSmtpEmails.htmlContent = template
        sendSmtpEmails.sender = { email: "utibeekpenyong203@gmail.com", name: "IT Department for FarmGoo" }

        await brevoClient.sendTransacEmail(sendSmtpEmails)

        console.log("bulk email sent to", recipients.length, "drivers")

    } catch(error) {
        console.log("brevo bulk error", error.message)
    }
}

module.exports = brevoBulk