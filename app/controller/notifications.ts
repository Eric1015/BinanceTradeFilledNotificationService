import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

interface SendMessageParams {
  subject: string;
  from: string;
  to: string;
  body: string;
}

export class NotificationsController {
  private client: twilio.Twilio;
  private sendgridApiKey: string;
  constructor(accountSid: string, authToken: string, sendgridApiKey: string) {
    this.client = twilio(accountSid, authToken);
    this.sendgridApiKey = sendgridApiKey;
  }

  async sendSMSMessage(params: SendMessageParams): Promise<boolean> {
    // parse the to number from the left-hand side of the email address
    const regexp = /(^.\d+[^@])/g;
    const from = params.from;
    const to = params.to.match(regexp)[0];
    const body = `Subject: ${params.subject}\nMessage: ${params.body}`;

    let message;

    try {
      message = await this.client.messages.create({
        body: body,
        from: from,
        to: to,
      });
    } catch (err) {
      console.log(err);
    }

    console.log('Message Output: ', message);
    return true;
  }

  async sendEmailMessage(params: SendMessageParams): Promise<boolean> {
    sgMail.setApiKey(this.sendgridApiKey);
    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.body,
      html: `<p>${params.body}</p>`,
    };
    const res = await sgMail
      .send(msg)
      .then(() => {
        console.log('Message has been sent successfully');
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
    return res;
  }

  async sendSMSAndEmailMessage(params: SendMessageParams): Promise<boolean> {
    const emailResult = await this.sendEmailMessage(params);
    const smsResult = await this.sendSMSAndEmailMessage(params);
    return emailResult && smsResult;
  }
}
