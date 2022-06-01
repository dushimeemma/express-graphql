import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import AfricasTalking from 'africastalking';

config();

const { USERNAME, PASSWORD, RECEIVER_EMAIL, PORT, SHORT_CODE, API_KEY } =
  process.env;

const africastalking = AfricasTalking({
  apiKey: API_KEY,
  username: 'sandbox',
});

class SendMail {
  static sendMail(username, password, receiverEmail, senderEmail) {
    const transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 587,
      auth: {
        user: username,
        pass: password,
      },
    });

    const mailOptions = {
      from: senderEmail,
      to: receiverEmail,
      subject: `New Message`,
      text: `Your new message`,
      html: `<b>Dear eShuri Team,</b><br><br><br><br>Your message<br><br><br><b><i>${senderEmail}</i></b>`,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        return 'Email not sent';
      }
      console.log({ info });
    });

    return `Email have sent to your email: ${senderEmail}`;
  }
  static async sendSms(receiverNumber, code) {
    try {
      const result = await africastalking.SMS.send({
        to: receiverNumber,
        message: 'here goes OTP',
        from: code,
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

const port = PORT || 3000;

const app = express();

const schema = buildSchema(`
    type Query {
        message: String
    }
    type Mutation {
        greetings(email: String): String
        sendSms(phone_number: String): String
    }
`);

const root = {
  message: () => 'First Graphql server',
  greetings: ({ email }) => {
    SendMail.sendMail(USERNAME, PASSWORD, RECEIVER_EMAIL, email);
  },
  sendSms: ({ phone_number }) => {
    SendMail.sendSms(phone_number, SHORT_CODE);
  },
};

app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(port, () => console.log(`Server started on port ${port}`));

export default app;
