# Concept AWS backend — implementation foundation

## Honest status
The included standard Next.js app is a working synthetic demo, not an AWS deployment. It uses a React interface, demo API and browser-local drafts. This separate backend package has not been deployed or integration-tested in AWS. Frontend Cognito sign-in and live API wiring remain work to complete; the role preview must never secure real records.

The SAM template creates Cognito, an authenticated HTTP API, Python Lambda, encrypted DynamoDB and private S3. Bedrock calls use Converse. Scoring is deterministic. Memberships are server-provisioned; parents get approved messages for linked children only. Duplicate student/test results return 409.

## Deployment
1. Install official AWS CLI and SAM CLI, authenticate to a development AWS account.
2. From aws/: `sam validate --lint`, `sam build`, `sam deploy --guided`.
3. Supply the frontend origin and a regional Converse-compatible model ID plus IAM resource ARN. An inference profile may need additional backing-model ARNs in the IAM statement. Verify model access and region support in your account.
4. Save the stack outputs: API URL, pool/client IDs, table and bucket names. Never put AWS secret keys in frontend code.
5. Provision Cognito users and server-controlled memberships in DynamoDB:
   `{ "pk":"USER#<cognito-sub>", "sk":"MEMBERSHIP", "schoolId":"demo-school", "role":"TEACHER", "classes":["8A"] }`
   Parent: `role:PARENT, children:["STU-001"]`. Principal: `role:PRINCIPAL`.
6. Add `pk:SCHOOL#demo-school, sk:CLASS#8A, students:[{id,name},...]`. Approved chapter snippets use `sk:CHAPTER#force-pressure, content:<text>`. Large materials belong in S3.
7. Add Cognito SRP sign-in with a supported SDK. Replace the demo role switcher with `/me` and connect screens through `lib/aws-client.ts`. Replace browser storage with the API. Remove synthetic fallbacks in production.
8. Deploy the repository root with AWS Amplify Hosting. The included `amplify.yml` builds the standard Next.js application with `npm ci` and `npm run build`.

## Routes
- GET /me
- POST /tests: `{classId,title,questions}`; questions have text, options[4], answer 0–3, topic and explanation.
- POST /questions/draft: `{classId,chapterId,count}`
- POST /tests/{testId}/sheets
- POST /uploads: `{classId}` returns a five-minute S3 POST with a 25 MB limit.
- POST /results/confirm: `{sheetId,answers:[0,1,null,...],reviewed:true}`
- GET /tests/{testId}/results
- POST /messages/draft: `{testId,studentId}`
- POST /messages/{id}/approve: `{text}`
- GET /parent/messages
- GET /principal/overview

## Scanner boundary
The local scanner utility is review-first and requires calibration. It is not an automatic S3-triggered pipeline. It only supports aligned full-page scans of a known template. Install scanner/requirements.txt, then:
`python scanner/extract.py scanned.pdf sheet-mapping.json extracted-review.json --layout layout.json`
Layout is normalized circle centres per question:
`{"rows":[[[xA,y,r],[xB,y,r],[xC,y,r],[xD,y,r]],...]}`.
Calibrate against a real print at 100% scale. Every page remains REVIEW_REQUIRED. Unknown/duplicate QR and ambiguous bubbles are flagged. Do not feed its raw output directly into final grades.

Before school use, implement scanner deskew/perspective correction, segmentation, human correction UI, Step Functions bounded parallelism, S3 worker deployment and retry handling. Multi-page answer sheets need a page ID on every page and completeness checks. The demo print supports a single sheet with up to 12 questions reliably; use a paginated template for larger papers.

## Validation and remaining work
`python -m unittest discover -s src` checks scoring boundaries and intervention rules. Python source compiles locally. SAM must still be validated with the CLI and services tested in an actual AWS account.

Test unauthenticated requests, cross-class teacher access, cross-child parent access, duplicate scans, AI failure, malformed model output, and edit/approve visibility. Add immutable audit entries, durable correction versions, roster administration, scan retention rules and production monitoring. A draft message must never be sent automatically.

AWS reference documentation:
- https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-property-httpapi-httpapiauth.html
- https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html
- https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html
