# SaaSBoard — AWS Deployment Guide

Run these roughly in order. Replace `ACCOUNT_ID` and region (`ap-south-1`)
throughout — including inside `ecs-task-definition.json` and
`iam-task-role-permissions-policy.json` before using them.

## 0. Prereqs
```bash
aws configure                     # set your IAM user creds, region ap-south-1
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

## 1. S3 bucket (org logos)
```bash
aws s3api create-bucket --bucket saasboard-org-logos \
  --region ap-south-1 --create-bucket-configuration LocationConstraint=ap-south-1

# Block public access — the app uses presigned URLs, no public bucket needed
aws s3api put-public-access-block --bucket saasboard-org-logos \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

## 2. SQS queue + dead-letter queue
```bash
# DLQ first
aws sqs create-queue --queue-name saasboard-invite-dlq

DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name saasboard-invite-dlq --output text) \
  --attribute-names QueueArn --output text | cut -f2)

# Main queue, redrive to DLQ after 3 failed attempts
aws sqs create-queue --queue-name saasboard-invite-queue \
  --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}"

aws sqs get-queue-url --queue-name saasboard-invite-queue   # save this as SQS_INVITE_QUEUE_URL
```

## 3. SNS topic (+ your email as a subscriber for the demo)
```bash
aws sns create-topic --name saasboard-invite-notifications   # save the returned TopicArn

aws sns subscribe --topic-arn arn:aws:sns:ap-south-1:$ACCOUNT_ID:saasboard-invite-notifications \
  --protocol email --notification-endpoint you@example.com
# check your inbox and confirm the subscription
```

## 4. IAM roles
```bash
# Task role — what the running container is allowed to do (S3/SQS/SNS/Logs)
aws iam create-role --role-name saasboard-ecs-task-role \
  --assume-role-policy-document file://iam-task-role-trust-policy.json

aws iam put-role-policy --role-name saasboard-ecs-task-role \
  --policy-name saasboard-task-permissions \
  --policy-document file://iam-task-role-permissions-policy.json

# Execution role — what ECS itself needs to pull the image + fetch secrets
aws iam create-role --role-name saasboard-ecs-execution-role \
  --assume-role-policy-document file://iam-task-role-trust-policy.json

aws iam attach-role-policy --role-name saasboard-ecs-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

## 5. Secrets (Mongo URI, JWT secret, etc.)
```bash
aws secretsmanager create-secret --name saasboard/mongo-uri --secret-string "mongodb+srv://..."
aws secretsmanager create-secret --name saasboard/jwt-secret --secret-string "$(openssl rand -hex 32)"
aws secretsmanager create-secret --name saasboard/s3-bucket --secret-string "saasboard-org-logos"
aws secretsmanager create-secret --name saasboard/sqs-queue-url --secret-string "<queue url from step 2>"
aws secretsmanager create-secret --name saasboard/sns-topic-arn --secret-string "<topic arn from step 3>"
aws secretsmanager create-secret --name saasboard/client-url --secret-string "https://your-frontend-url"
```

## 6. ECR + push image
```bash
aws ecr create-repository --repository-name saasboard-backend

aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

cd backend
docker build -t saasboard-backend .
docker tag saasboard-backend:latest $ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/saasboard-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/saasboard-backend:latest
```

## 7. CloudWatch log group
```bash
aws logs create-log-group --log-group-name /ecs/saasboard-backend
```

## 8. Register task definition + ECS cluster + ALB + service
```bash
aws ecs create-cluster --cluster-name saasboard-cluster

aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# ALB + target group + listener — do this once via console the first time,
# it's fiddly in pure CLI (VPC/subnet/security-group IDs needed).
# Target group health check path: /health

aws ecs create-service \
  --cluster saasboard-cluster \
  --service-name saasboard-backend-svc \
  --task-definition saasboard-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXX],securityGroups=[sg-XXXX],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=<tg-arn>,containerName=saasboard-api,containerPort=5000"
```

## 9. CloudWatch alarm (basic — 5xx errors)
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name saasboard-high-5xx \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum --period 60 --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=LoadBalancer,Value=<alb-arn-suffix>
```

## Teardown (do this right after the interview to avoid billing)
```bash
aws ecs delete-service --cluster saasboard-cluster --service saasboard-backend-svc --force
aws ecs delete-cluster --cluster saasboard-cluster
aws ecr delete-repository --repository-name saasboard-backend --force
aws sqs delete-queue --queue-url <queue-url>
aws sqs delete-queue --queue-url <dlq-url>
aws sns delete-topic --topic-arn <topic-arn>
# S3 bucket + ALB + target group + log group: delete via console once confirmed unused
```

## What to say if they ask "why this design"
- **S3 presigned URLs, not a proxy upload** — file never touches the API server, backend only needs `PutObject`/`GetObject` on one bucket.
- **SQS between the API and the notification** — invite endpoint responds immediately; a flaky email provider can't slow down or fail the API request.
- **DLQ with maxReceiveCount 3** — bad messages don't retry forever; they land somewhere you can inspect them.
- **Two containers, one task role** — API and worker scale/fail independently but share the same least-privilege permissions boundary.
- **Execution role vs. task role** — execution role is what ECS uses to pull the image and secrets; task role is what your code uses at runtime. Keeping them separate is a real interview point.
