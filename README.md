# easeSTU — classroom understanding

A professional classroom learning-gap demo based on offline conceptual MCQ assessments.

## Try the demo
- Overview: two synthetic classes, 50 students each, 47/46 assessed; scores calculated from 12 individual answers.
- Make a test: review a chapter question bank, edit or write questions, add/remove/reorder, print paper, key or unique QR sheets.
- Answer sheets: load a sample batch or import verified JSON. This screen scores the fixed 12-question sample test only.
- Class analysis: search, performance groups, topic gaps and CSV export.
- Parent messages: draft, edit and approve. Parent preview shows only Aarav's approved message.
- Principal: aggregate synthetic class comparisons.

No online student portal and no email/SMS/WhatsApp notifications. Analogies are optional suggestions. All displayed identities and scores are synthetic.

## Run locally

Use Node.js 20.9 or newer (Node 22 LTS is recommended):

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

This is a standard Next.js App Router project using Shadcn/Radix controls and Lucide icons. It does not use Vinext, Vite, Cloudflare Workers or Wrangler. Demo drafts and papers persist in localStorage, while imported answers use sessionStorage. These are demonstration conveniences, not school-grade security or cross-device storage.

## Production build

```bash
npm run build
npm start
```

The same source can be connected to GitHub and deployed with AWS Amplify Hosting's Next.js support. `amplify.yml` contains the build instructions.

## AWS
See aws/README.md. SAM and Python source are supplied as an integration foundation. AWS account deployment, Cognito UI, live API wiring, Bedrock and PDF/OMR production calibration are not complete or claimed live. The demo is ready to explore; the complete AWS production rollout is not yet finished.

## Verification

The standard Next.js production build and TypeScript checks pass. Python scoring tests cover blanks, invalid answers and intervention boundaries.
