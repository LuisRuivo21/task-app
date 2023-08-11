const sendGridMail = require("@sendgrid/mail");

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sendGridMail.send({
    to: email,
    from: "luis.ruivo.ua92@gmail.com",
    subject: "Thank you for joining the Task Manager App 👍",
    text: `Hi ${name}, welcome to the Task Manager App. Please let me know if any you require any further assistance💃`,
  });
};

const sendCancellationEmail = (email, name) => {
  sendGridMail.send({
    to: email,
    from: "luis.ruivo.ua92@gmail.com",
    subject: "Cancellation confirmation",
    text: `Hi ${name}, is sad to know that your are leaving the Task Manager App 😢`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
