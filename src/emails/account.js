const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'pratyush.bhargav143@gmail.com',
//     from: 'saurav109677@gmail.com',
//     subject: 'SendGrid First Mail',
//     text: 'Always Remember Krsna!! '
// })

const sendWelcomeEmail = (email , name) =>{
    sgMail.send({
        to: email,
        from: 'saurav109677@gmail.com',
        subject: 'Welcome to this site',
        text: 'Thank you for joining with us.'+ name
        //html: ''
    })
}

const sendCancelEmail = (email, name)=>{
   sgMail.send({
    to: email,
    from: 'saurav109677@gmail.com',
    subject: 'Cancellation of account',
    text:'Please provide us the feedback'+name,
    html:'<select><option>Not satisfied</option><option>need improvement</option></select><br><input type=submit value="submit"/>'
   }) 
   
}

module.exports ={
    sendWelcomeEmail,
    sendCancelEmail
}