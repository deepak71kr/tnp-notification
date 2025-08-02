// src/notificationSender.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const RECIPIENT_EMAILS = process.env.RECIPIENT_EMAILS ? process.env.RECIPIENT_EMAILS.split(',') : [];

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

function createHtmlEmail(type, newEntries) {
  let html = `<h1>New Updates from the BIT Mesra Job Portal!</h1>`;
  if (type === 'New Job Listings Found') {
    html += `<h2>New Job Listings:</h2>`;
    newEntries.forEach(job => {
      html += `
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;">
          <h3>${job.company}</h3>
          <p><strong>Deadline:</strong> ${job.deadline}</p>
          <p><strong>Posted On:</strong> ${job.postedDate}</p>
          <p><a href="${job.link}">View Details</a></p>
        </div>
      `;
    });
  } else if (type === 'New Notifications Found') {
    html += `<h2>New Notifications:</h2>`;
    newEntries.forEach(notification => {
      html += `
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;">
          <h3>${notification.title}</h3>
          <p><strong>Type:</strong> ${notification.type}</p>
          <p><strong>Date:</strong> ${notification.date}</p>
          <p><a href="${notification.link}">View Details</a></p>
        </div>
      `;
    });
  }
  return html;
}

async function sendNotification(subject, newEntries) {
  if (RECIPIENT_EMAILS.length === 0) {
    console.warn('No recipient emails configured. Skipping email notification.');
    return;
  }

  const mailOptions = {
    from: EMAIL_USER,
    to: RECIPIENT_EMAILS.join(','),
    subject: subject,
    html: createHtmlEmail(subject, newEntries),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent successfully to ${RECIPIENT_EMAILS.length} recipient(s).`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendNotification };