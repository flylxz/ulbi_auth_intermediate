const colors = require('colors');
const { createTransport } = require('nodemailer');

const ApiError = require('../middlewares/error-middleware');

class MailService {
  transport;

  constructor() {
    this.transport = createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      // service: 'gmail',
      // secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  sendActivationMail = async (to, link) => {
    try {
      await this.transport.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: `Account activation ${process.env.API_URL}`,
        text: '',
        html: `
        <div>
            <h1>Click for activation</h1>
            <a href="${link}">${link}</a>
        </div>
      `,
      });
    } catch (e) {
      console.log(colors.red('error send mail: ', e));
    }
  };
}

module.exports = new MailService();
