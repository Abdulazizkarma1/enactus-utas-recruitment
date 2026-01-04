const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // 1. Configure the transporter (Use Gmail or your SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or 'hotmail', 'yahoo'
      auth: {
        user: 'enactus.cktutas.recruitment@gmail.com', // Replace with real email
        pass: 'your_app_password_here' // Google App Password (not your real password)
      }
    });

    // 2. Send the mail
    await transporter.sendMail({
      from: '"Enactus UTAS" <no-reply@enactus.org>',
      to: to,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #800000;">Enactus UTAS</h2>
          <p>${text}</p>
          <br/>
          <p>Regards,<br/>The Recruitment Team</p>
        </div>
      `
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email failed:", error);
  }
};

module.exports = sendEmail;