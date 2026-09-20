"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify-config";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestData = Record<string, unknown>;

export async function callBackend<T = unknown>(
  action: string,
  data: RequestData = {},
): Promise<T> {
  configureAmplify();

  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing.",
    );
  }

  const session = await fetchAuthSession();
  const accessToken =
    session.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error(
      "You must sign in before accessing the backend.",
    );
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action,
      ...data,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ||
        result.message ||
        result.details ||
        `Backend request failed: ${response.status}`,
    );
  }

  if (result.success === false) {
    throw new Error(
      result.error ||
        result.details ||
        "Backend operation failed.",
    );
  }

  return result as T;
}