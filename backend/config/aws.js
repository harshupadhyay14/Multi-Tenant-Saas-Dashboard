const { S3Client } = require("@aws-sdk/client-s3");
const { SQSClient } = require("@aws-sdk/client-sqs");
const { SNSClient } = require("@aws-sdk/client-sns");

// In ECS, credentials come from the task's IAM role automatically —
// never hardcode keys here. Locally, the AWS SDK falls back to your
// `aws configure` profile or env vars (AWS_ACCESS_KEY_ID etc.) from .env.
const region = process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({ region });
const sqsClient = new SQSClient({ region });
const snsClient = new SNSClient({ region });

module.exports = { s3Client, sqsClient, snsClient, region };
