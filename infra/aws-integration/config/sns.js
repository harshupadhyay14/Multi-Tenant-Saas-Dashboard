const { PublishCommand } = require("@aws-sdk/client-sns");
const { snsClient } = require("./aws");

const TOPIC_ARN = process.env.SNS_INVITE_TOPIC_ARN;

async function publishInviteNotification({ email, orgName, role }) {
  await snsClient.send(
    new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: `You've been invited to ${orgName}`,
      Message: `You were invited to join "${orgName}" as ${role}. Log in to accept: ${process.env.CLIENT_URL}/accept-invite?email=${encodeURIComponent(
        email
      )}`,
      MessageAttributes: {
        recipientEmail: { DataType: "String", StringValue: email },
      },
    })
  );
}

module.exports = { publishInviteNotification };
