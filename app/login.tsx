"use client";

import { usePathname } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
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
    name: "Priya Sharma",
    email: "teacher@easestu.demo",
    password: "demo123",
    target: "/dashboard",
    icon: GraduationCap,
    access: "Classes 8A and 8B · Science",
  },
  principal: {
    label: "Principal",
    name: "Dr. Mehta",
    email: "principal@easestu.demo",
    password: "demo123",
    target: "/principal",
    icon: School,
    access: "Aggregated school insights",
  },
  parent: {
    label: "Parent",
    name: "Aarav’s parent",
    email: "parent@easestu.demo",
    password: "demo123",
    target: "/parent",
    icon: Users,
    access: "Linked child: Aarav Sharma",
  },
} as const;

type DemoRole = keyof typeof accounts;

export default function DemoLogin() {
  const path = usePathname() || "/login/teacher";
  const role = (path.split("/").filter(Boolean).at(-1) ||
    "teacher") as DemoRole;
  const selectedRole: DemoRole = role in accounts ? role : "teacher";
  const account = accounts[selectedRole];
  const Icon = account.icon;
  const [email, setEmail] = useState<string>(account.email);
  const [password, setPassword] = useState<string>(account.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const roleLinks = useMemo(
    () => Object.entries(accounts) as [DemoRole, (typeof accounts)[DemoRole]][],
    [],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      email.trim().toLowerCase() !== account.email ||
      password !== account.password
    ) {
      setError(
        "Use the synthetic email and password shown below for this role.",
      );
      return;
    }
    setBusy(true);
    localStorage.setItem(
      "easestu-demo-session",
      JSON.stringify({
        role: selectedRole,
        name: account.name,
        email: account.email,
        signedInAt: new Date().toISOString(),
      }),
    );
    window.setTimeout(() => {
      window.location.href = account.target;
    }, 350);
  }

  return (
    <main className="demo-login-shell">
      <div className="demo-login-photo" aria-hidden="true" />
      <a className="demo-login-brand" href="/" aria-label="easeSTU home">
        <BrandLogo />
      </a>
      <section className="demo-login-card" aria-labelledby="login-title">
        <a className="login-back" href="/">
          <ArrowLeft size={16} />
          Back to home
        </a>
        <div className="login-role-icon">
          <Icon size={25} />
        </div>
        <p className="landing-kicker">SYNTHETIC DEMO ACCOUNT</p>
        <h1 id="login-title">Sign in as {account.label}</h1>
        <p className="login-intro">
          Explore the complete {account.label.toLowerCase()} workflow using
          safe, synthetic school data.
        </p>

        <nav className="login-role-tabs" aria-label="Choose demo role">
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

        <div className="demo-identity">
          <span>{account.name}</span>
          <small>{account.access}</small>
        </div>

        <form className="demo-login-form" onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Eye size={17} />
              </button>
            </div>
          </label>
          <div className="demo-credentials">
            <Check size={16} />
            <span>
              Demo credentials are already filled in.
              <small>
                {account.email} · {account.password}
              </small>
            </span>
          </div>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="demo-login-submit" type="submit" disabled={busy}>
            {busy ? (
              "Opening workspace…"
            ) : (
              <>
                Enter {account.label} workspace <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
        <p className="login-disclaimer">
          Demonstration only. This is local synthetic authentication—not AWS
          Cognito.
        </p>
      </section>
    </main>
  );
}
