const { SendMessageCommand } = require("@aws-sdk/client-sqs");
const { sqsClient } = require("./aws");

const QUEUE_URL = process.env.SQS_INVITE_QUEUE_URL;

/**
 * Pushes an invite job to SQS instead of sending the email inline.
 * Keeps the API response fast and decouples "user was invited" from
 * "email was successfully delivered" — the worker retries independently.
 */
async function enqueueInviteEmail({ email, orgName, role, invitedBy }) {
  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        type: "ORG_INVITE",
        email,
        orgName,
        role,
        invitedBy,
        queuedAt: new Date().toISOString(),
      }),
    })
  );
}

module.exports = { enqueueInviteEmail };
