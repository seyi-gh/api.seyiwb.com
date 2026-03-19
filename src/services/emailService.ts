import config from '../config';

//? Template for sending to user an email
export interface SendEmailInput {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

//? Template for the api sending options
interface BrevoTransactionalEmailPayload {
  sender: { name: string; email: string };
  to: Array<{ email: string; name: string }>;
  subject: string;
  htmlContent: string;
  textContent: string;
}

//? Template for the contact for brevo update
interface BrevoContactPayload {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
  };
  listIds: number[];
  updateEnabled: boolean;
}


//? Default parse brevo error for not sending emails correctly
const parseBrevoError = async (response: Response): Promise<string> => {
  try {
    const raw = await response.text();
    return raw || 'No response body';
  } catch { return 'Unable to read response body'; }
};


//! Actually this is not used, i changed the api request and is not required
//? Updating the contanct list for brevo (This is for sending actualizations)
export const upsertContactToList = async (
  email: string,
  firstName: string,
  listId: number
): Promise<void> => {
  const payload: BrevoContactPayload = {
    email,
    attributes: {
      FIRSTNAME: firstName
    },
    listIds: [listId],
    updateEnabled: true
  };

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': config.brevo_api_key
    },
    body: JSON.stringify(payload)
  });

  //? This must work correctly for sending emails to a contanct
  //? and upload first then send !!

  if (!response.ok) {
    const responseBody = await parseBrevoError(response);
    throw new Error(
      `Brevo contact upsert failed (${response.status}): ${responseBody}`
    );
  }
};


//? This is the main method to send emails to users
export const sendTransactionalEmail = async (
  input: SendEmailInput
): Promise<void> => {
  const payload: BrevoTransactionalEmailPayload = {
    sender: {
      name: config.brevo_sender_name,
      email: config.brevo_sender_email
    },
    to: [
      {
        email: input.toEmail,
        name: input.toName
      }
    ],
    subject: input.subject,
    htmlContent: input.htmlContent,
    textContent: input.textContent
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': config.brevo_api_key
    },
    body: JSON.stringify(payload)
  });

  //! This is the most important function to the creation of the users

  if (!response.ok) {
    const responseBody = await parseBrevoError(response);
    throw new Error(
      `Brevo transactional email failed (${response.status}): ${responseBody || 'No response body'}`
    );
  }
};
