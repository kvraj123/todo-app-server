const sgMail = require('@sendgrid/mail')




sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// sgMail.send({
//     to: 'poojarykaviraj7@gmail.com',
//     from: 'poojarykaviraj7@gmail.com',
//     subject: 'Bhai maine bheja',
//     text: 'divine hai naam chote frak to dekh',
//   }).then((res)=> console.log(res)).catch((e) => console.log(e))

const sendWelcomeEmail = (email, name) => {
        sgMail.send({
        to: email,
        from: 'poojarykaviraj7@gmail.com',
        subject: 'KV hai naam chote farak to dekh',
        text: `Welcome to my app, ${name}`,
    }).then((res)=> console.log(res)).catch((e) => console.log(e))
}


module.exports = {
    sendWelcomeEmail
}
