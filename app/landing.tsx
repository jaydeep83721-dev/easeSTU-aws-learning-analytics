"use client";

import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  ArrowDown,
  ArrowRight,
  ChartNoAxesCombined,
  FileCheck2,
  ScanLine,
} from "lucide-react";

const journey = [
  {
    number: "01",
    icon: FileCheck2,
    title: "Teach, then check understanding.",
    copy: "Create concept-led MCQs after a chapter. Teachers stay in control of every question.",
  },
  {
    number: "02",
    icon: ScanLine,
    title: "Keep the assessment offline.",
    copy: "Students answer on paper. QR-linked sheets bring the class into one clear workflow.",
  },
  {
    number: "03",
    icon: ChartNoAxesCombined,
    title: "See where support matters.",
    copy: "Topic patterns turn marked answers into practical next steps for teachers and families.",
  },
];

const roles = [
  {
    name: "Teacher",
    workspace: "Teacher workspace",
    href: "/login/teacher",
    crop: "role-teacher",
  },
  {
    name: "Principal",
    workspace: "Principal workspace",
    href: "/login/principal",
    crop: "role-principal",
  },
  {
    name: "Parent",
    workspace: "Parent workspace",
    href: "/login/parent",
    crop: "role-parent",
  },
];

export default function Landing() {
  const shellRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8%" },
    );
    elements.forEach((element) => observer.observe(element));

    const shell = shellRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const updateScrollMotion = () => {
      if (!shell || reduceMotion.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const progress = Math.min(
          1,
          Math.max(0, window.scrollY / window.innerHeight),
        );
        shell.style.setProperty("--hero-progress", progress.toFixed(3));
      });
    };
    updateScrollMotion();
    window.addEventListener("scroll", updateScrollMotion, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollMotion);
    };
  }, []);

  return (
    <main className="landing-shell" ref={shellRef}>
      <section className="landing-hero" aria-labelledby="landing-title">
        <img
          className="landing-hero-photo"
          src="/classroom-chalk-clean.png"
          alt="Children drawing and learning together with colourful chalk"
        />
        <div className="landing-hero-wash" aria-hidden="true" />
        <div className="landing-topline">
          <a className="landing-brand" href="/" aria-label="easeSTU home">
            <BrandLogo />
          </a>
          <div className="landing-nav-actions">
            <a href="#how-it-works">How it works</a>
            <a href="#workspaces">
              Choose login <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="landing-hero-copy" data-reveal>
          <p className="landing-kicker">
            CLASSROOM INSIGHT, WITHOUT ANOTHER STUDENT APP
          </p>
          <h1 id="landing-title">Turn every test into a clearer next step.</h1>
          <p>
            Teachers create concept-led MCQs, scan paper answer sheets, and see
            where a class needs support—all in one calm workflow.
          </p>
          <div className="landing-hero-actions">
            <a className="landing-enter" href="#workspaces">
              Choose a workspace <ArrowRight size={18} />
            </a>
            <a className="landing-secondary" href="#workspaces">
              Explore every role <ArrowDown size={17} />
            </a>
          </div>
        </div>
        <div className="landing-proof" aria-label="Demo highlights">
          <span>
            <b>Offline first</b> Paper assessments
          </span>
          <span>
            <b>Topic aware</b> Useful class patterns
          </span>
          <span>
            <b>Human reviewed</b> Teacher stays in control
          </span>
        </div>
      </section>

      <section
        className="landing-story"
        id="how-it-works"
        aria-labelledby="story-title"
      >
        <div className="story-intro" data-reveal>
          <p className="landing-kicker">ONE QUIET WORKFLOW</p>
          <h2 id="story-title">
            The test stays familiar. The insight gets sharper.
          </h2>
        </div>
        <div className="journey-list">
          {journey.map(({ number, icon: Icon, title, copy }) => (
            <article className="journey-step" data-reveal key={number}>
              <div className="journey-number">{number}</div>
              <div className="journey-icon">
                <Icon size={23} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-evidence" aria-labelledby="evidence-title">
        <div className="evidence-copy" data-reveal>
          <p className="landing-kicker">A CLEARER CLASSROOM SIGNAL</p>
          <h2 id="evidence-title">Not another score screen.</h2>
          <p>
            Concept highlights show how many students need support, where the
            class is progressing, and when a small-group conversation may be
            enough.
          </p>
        </div>
        <div
          className="signal-board"
          data-reveal
          aria-label="Example topic understanding overview"
        >
          <div className="signal-head">
            <span>Class 8A · Science</span>
            <span>Synthetic preview</span>
          </div>
          <div className="signal-score">
            <span>Class understanding</span>
            <strong>72%</strong>
          </div>
          <div className="signal-row">
            <div>
              <strong>Force</strong>
              <span>Secure</span>
            </div>
            <i>
              <b style={{ width: "84%" }} />
            </i>
            <em>84%</em>
          </div>
          <div className="signal-row">
            <div>
              <strong>Pressure</strong>
              <span>Revisit together</span>
            </div>
            <i>
              <b style={{ width: "46%" }} />
            </i>
            <em>46%</em>
          </div>
          <div className="signal-row">
            <div>
              <strong>Area</strong>
              <span>Small group</span>
            </div>
            <i>
              <b style={{ width: "67%" }} />
            </i>
            <em>67%</em>
          </div>
        </div>
      </section>

      <section className="landing-close" aria-labelledby="close-title">
        <div data-reveal>
          <p className="landing-kicker">UNDERSTANDING COMES FIRST</p>
          <h2 id="close-title">
            Every result should lead to a better next step.
          </h2>
          <p>
            Explore the complete teacher, parent, and principal demonstration.
          </p>
          <a className="landing-enter" href="#workspaces">
            Choose your login <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section
        className="landing-roles"
        id="workspaces"
        aria-labelledby="roles-title"
      >
        <div className="roles-heading" data-reveal>
          <p className="landing-kicker">SYNTHETIC DEMO LOGIN</p>
          <h2 id="roles-title">Choose your workspace.</h2>
          <p>
            Each demo account opens only the information appropriate for that
            role.
          </p>
        </div>
        <div className="role-grid compact-role-grid">
          {roles.map((role) => (
            <a
              className="role-card compact-role-card"
              href={role.href}
              key={role.name}
              data-reveal
            >
              <span className="role-label">{role.name}</span>
              <span className={`role-art ${role.crop}`} aria-hidden="true">
                <img
                  src="/role-triptych.webp"
                  width="2172"
                  height="724"
                  alt=""
                />
              </span>
              <span className="role-hover">
                <small>{role.name}</small>
                <strong>{role.workspace}</strong>
                <span>
                  Sign in to demo <ArrowRight size={18} />
                </span>
              </span>
            </a>
          ))}
        </div>
        <footer className="landing-final-footer">
          easeSTU · Synthetic school data · Demonstration only
        </footer>
      </section>
    </main>
  );
}
