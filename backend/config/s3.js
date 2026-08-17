const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("./aws");

const BUCKET = process.env.S3_BUCKET_NAME;

/**
 * Generates a short-lived presigned PUT URL so the browser can upload
 * directly to S3 without the file ever passing through our backend.
 * Backend only ever needs s3:PutObject / s3:DeleteObject on this one bucket —
 * see infra/iam-task-role-permissions-policy.json.
 */
async function getPresignedUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
  const publicUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { uploadUrl, publicUrl };
}

async function deleteObject(key) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { getPresignedUploadUrl, deleteObject };
