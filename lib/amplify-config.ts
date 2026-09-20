import { Amplify } from "aws-amplify";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  const userPoolId =
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

  const userPoolClientId =
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

  if (!userPoolId || !userPoolClientId) {
    throw new Error("Cognito environment variables are missing");
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
        },
      },
    },
  });

  configured = true;
}