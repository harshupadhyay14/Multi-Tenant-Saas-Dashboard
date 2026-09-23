// Standalone worker — run as a separate ECS service (or a second container
// in the same task) from the API. Keeping it separate means a slow/broken
// notification pipeline never affects API response times.
//
// Run locally with:  node worker.js
// In ECS: same Docker image, different container command.

require("dotenv").config();
const { ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const { sqsClient } = require("./config/aws");
const { publishInviteNotification } = require("./config/sns");

const QUEUE_URL = process.env.SQS_INVITE_QUEUE_URL;
const POLL_INTERVAL_MS = 2000;

async function pollQueue() {
  try {
    const { Messages } = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 10, // long polling — cheaper than tight-loop short polling
        VisibilityTimeout: 30,
      })
    );

    if (Messages?.length) {
      for (const msg of Messages) {
        await handleMessage(msg);
      }
    }
  } catch (err) {
    console.error("Error polling SQS:", err.message);
  } finally {
    setTimeout(pollQueue, POLL_INTERVAL_MS);
  }
}

async function handleMessage(msg) {
  try {
    const body = JSON.parse(msg.Body);

    if (body.type === "ORG_INVITE") {
      await publishInviteNotification({
        email: body.email,
        orgName: body.orgName,
        role: body.role,
      });
      console.log(`✅ Invite notification sent for ${body.email}`);
    }

    // Only delete on success — if publishInviteNotification throws, the
    // message stays in-flight and reappears after VisibilityTimeout for
    // a retry. After maxReceiveCount (set on the queue's redrive policy),
    // it moves to a dead-letter queue instead of retrying forever.
    await sqsClient.send(
      new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: msg.ReceiptHandle })
    );
  } catch (err) {
    console.error("Failed to process message, will retry:", err.message);
  }
}

console.log("🚀 Invite worker started, polling SQS...");
pollQueue();
