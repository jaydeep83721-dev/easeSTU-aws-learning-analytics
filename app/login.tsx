"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  confirmSignIn,
  fetchAuthSession,
  signIn,
} from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify-config";
import { BrandLogo } from "@/components/brand-logo";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

const accounts = {
  teacher: {
    label: "Teacher",
    target: "/dashboard",
    icon: GraduationCap,
    access: "Manage tests and classroom analytics",
  },
  principal: {
    label: "Principal",
    target: "/principal",
    icon: School,
    access: "View aggregated school insights",
  },
  parent: {
    label: "Parent",
    target: "/parent",
    icon: Users,
    access: "View linked child progress",
  },
} as const;

type UserRole = keyof typeof accounts;

function roleFromGroups(groups: string[]): UserRole | null {
  if (groups.includes("TEACHER")) return "teacher";
  if (groups.includes("PRINCIPAL")) return "principal";
  if (groups.includes("PARENT")) return "parent";
  return null;
}

export default function Login() {
  const path = usePathname() || "/login/teacher";

  const pathRole = (path.split("/").filter(Boolean).at(-1) ||
    "teacher") as UserRole;

  const selectedRole: UserRole =
    pathRole in accounts ? pathRole : "teacher";

  const account = accounts[selectedRole];
  const Icon = account.icon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    configureAmplify();
  }, []);

  const roleLinks = useMemo(
    () =>
      Object.entries(accounts) as [
        UserRole,
        (typeof accounts)[UserRole],
      ][],
    [],
  );

  async function openCorrectDashboard() {
    const session = await fetchAuthSession({
      forceRefresh: true,
    });

    const accessToken = session.tokens?.accessToken;

    if (!accessToken) {
      throw new Error("Cognito did not return an access token.");
    }

    const rawGroups =
      accessToken.payload["cognito:groups"];

    const groups = Array.isArray(rawGroups)
      ? rawGroups.map(String)
      : [];

    const actualRole = roleFromGroups(groups);

    if (!actualRole) {
      throw new Error(
        "Your Cognito user is not assigned to TEACHER, PRINCIPAL or PARENT.",
      );
    }

    const targetAccount = accounts[actualRole];

    // Kept temporarily because existing dashboard code may read this value.
    localStorage.setItem(
      "easestu-demo-session",
      JSON.stringify({
        role: actualRole,
        email,
        signedInAt: new Date().toISOString(),
        authentication: "AWS Cognito",
      }),
    );

    window.location.href = targetAccount.target;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (!needsNewPassword) {
        const existingSession = await fetchAuthSession();

        if (existingSession.tokens?.accessToken) {
          await openCorrectDashboard();
          return;
        }
      }
      if (needsNewPassword) {
        const result = await confirmSignIn({
          challengeResponse: password,
        });

        if (!result.isSignedIn) {
          throw new Error(
            `Additional Cognito step required: ${result.nextStep.signInStep}`,
          );
        }

        await openCorrectDashboard();
        return;
      }

      const result = await signIn({
        username: email.trim().toLowerCase(),
        password,
      });

      if (
        result.nextStep.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        setNeedsNewPassword(true);
        setPassword("");
        setError(
          "Your temporary password worked. Enter a new permanent password below.",
        );
        return;
      }

      if (!result.isSignedIn) {
        throw new Error(
          `Additional Cognito step required: ${result.nextStep.signInStep}`,
        );
      }

      await openCorrectDashboard();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in with Cognito.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="demo-login-shell">
      <div className="demo-login-photo" aria-hidden="true" />

      <a
        className="demo-login-brand"
        href="/"
        aria-label="easeSTU home"
      >
        <BrandLogo />
      </a>

      <section
        className="demo-login-card"
        aria-labelledby="login-title"
      >
        <a className="login-back" href="/">
          <ArrowLeft size={16} />
          Back to home
        </a>

        <div className="login-role-icon">
          <Icon size={25} />
        </div>

        <p className="landing-kicker">AWS COGNITO SECURE LOGIN</p>

        <h1 id="login-title">
          Sign in as {account.label}
        </h1>

        <p className="login-intro">{account.access}</p>

        <nav
          className="login-role-tabs"
          aria-label="Choose account role"
        >
          {roleLinks.map(([key, item]) => (
            <a
              className={key === selectedRole ? "active" : ""}
              href={`/login/${key}`}
              key={key}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <form
          className="demo-login-form"
          onSubmit={submit}
        >
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="username"
              disabled={needsNewPassword}
              required
            />
          </label>

          <label>
            {needsNewPassword
              ? "Create permanent password"
              : "Password"}

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete={
                  needsNewPassword
                    ? "new-password"
                    : "current-password"
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <Eye size={17} />
              </button>
            </div>
          </label>

          <div className="demo-credentials">
            <Check size={16} />
            <span>
              Protected using Amazon Cognito
              <small>
                Use the email and password created in your
                Cognito user pool.
              </small>
            </span>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="demo-login-submit"
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Signing in…"
              : needsNewPassword
                ? "Set password and continue"
                : (
                  <>
                    Sign in securely
                    <ArrowRight size={17} />
                  </>
                )}
          </button>
        </form>

        <p className="login-disclaimer">
          Authentication and role access are managed by AWS
          Cognito.
        </p>
      </section>
    </main>
  );
}