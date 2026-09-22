"use client";
import { callBackend } from "@/lib/aws-client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import {
  BookOpen,
  School,
  LayoutDashboard,
  FileText,
  ScanLine,
  Users,
  Plus,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Download,
  Lightbulb,
  Sparkles,
  ShieldCheck,
  Check,
  Settings2,
  GraduationCap,
  Search,
  ClipboardList,
  ChartSpline,
  MessagesSquare,
  UserRoundCog,
  Layers3,
  TrendingUp,
  FileDown,
  Home,
  HeartHandshake,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  bank,
  topics,
  students,
  sample,
  analyse,
  draft,
  Submission,
  Q,
} from "@/lib/data";
import Builder from "./builder";
import Scanner from "./scanner";
export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((x) => (
          <SelectItem value={x} key={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function Tag({
  children,
  tone = "teal",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"tag " + tone}>{children}</span>;
}
export function Heading({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
export function download(
  name: string,
  value: string,
  type = "application/json",
) {
  const a = document.createElement("a");
  const u = URL.createObjectURL(new Blob([value], { type }));
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
type Message = { text: string; approved: boolean };
export default function Workspace() {
  const path = usePathname() || "/";
  const routeRole = path.startsWith("/parent")
    ? "parent"
    : path.startsWith("/principal")
      ? "principal"
      : "teacher";
  const [accessReady, setAccessReady] = useState(false);
  const [cls, setCls] = useState("8A");
  const [subs, setSubs] = useState<Submission[]>(sample());
  const [threshold, setThreshold] = useState("50");
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [paper, setPaper] = useState<Q[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All students");
  const [resultTestId, setResultTestId] = useState("");

  useEffect(() => {
    if (path === "/results") {
      const params = new URLSearchParams(window.location.search);
      setResultTestId(params.get("testId") || "");
    } else {
      setResultTestId("");
    }
  }, [path]);
  useEffect(() => {
    try {
      const session = JSON.parse(
        localStorage.getItem("easestu-demo-session") || "null",
      ) as { role?: "teacher" | "principal" | "parent" } | null;

      if (!session?.role) {
        window.location.replace(`/login/${routeRole}`);
        return;
      }

      if (session.role !== routeRole) {
        window.location.replace(
          session.role === "teacher"
            ? "/dashboard"
            : session.role === "principal"
              ? "/principal"
              : "/parent",
        );
        return;
      }

      setAccessReady(true);
    } catch {
      localStorage.removeItem("easestu-demo-session");
      window.location.replace(`/login/${routeRole}`);
    }
  }, [routeRole]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("easestu-v1") || "{}");
      setMessages(saved.messages || {});
      setPaper(saved.paper || []);
      setCls(sessionStorage.getItem("easestu-class") || "8A");
    } catch {
      setNotice("Could not restore this demo. Starting with sample data.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("easestu-v1", JSON.stringify({ messages, paper }));
      } catch {
        setNotice(
          "Browser storage unavailable. Changes last for this session.",
        );
      }
    }
  }, [ready, messages, paper]);
  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem("easestu-class", cls);
    let active = true;
    fetch("/api/demo?class=" + cls)
      .then((r) => r.json() as Promise<{ submissions: Submission[] }>)
      .then((d) => {
        if (active) {
          const s = sessionStorage.getItem("easestu-import-" + cls);
          setSubs(s ? JSON.parse(s) : d.submissions);
        }
      })
      .catch(() => setSubs(sample(cls)));
    return () => {
      active = false;
    };
  }, [cls, ready]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const data = analyse(subs, Number(threshold)),
    prev = analyse(sample(cls, true));
  const role = path.startsWith("/parent")
    ? "Parent"
    : path.startsWith("/principal")
      ? "Principal"
      : "Teacher";
  const nav =
    role === "Teacher"
      ? [
        ["/dashboard", "Overview", LayoutDashboard],
        ["/create-test", "Create Test", FileText],
        ["/tests", "Tests", ClipboardList],
        ["/scan", "Scan & Process", ScanLine],
        ["/results", "Results & Insights", ChartSpline],
        ["/review", "Review & Support", MessagesSquare],
        ["/teacher-settings", "Profile & Settings", UserRoundCog],
      ]
      : role === "Parent"
        ? [
          ["/parent", "Home", Home],
          ["/parent/progress", "My Child’s Progress", TrendingUp],
          ["/parent/assessments", "Assessments", ListChecks],
          ["/parent/support", "Support Notes", HeartHandshake],
          ["/parent/settings", "Profile & Settings", UserRoundCog],
        ]
        : [
          ["/principal", "Overview", LayoutDashboard],
          ["/principal/classes", "Class Performance", School],
          ["/principal/gaps", "Learning Gaps", Layers3],
          ["/principal/trends", "Progress & Trends", TrendingUp],
          ["/principal/reports", "Reports", FileDown],
          ["/principal/settings", "Profile & Settings", UserRoundCog],
        ];
  const filtered = data.results.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) &&
      (group === "All students" ||
        (group === "Needs support"
          ? s.score < 50
          : group === "Developing well"
            ? s.score >= 50 && s.score < 80
            : s.score >= 80)),
  );
  const strongest = data.concepts.reduce((a, b) =>
    a.success > b.success ? a : b,
  ),
    weakest = data.concepts.reduce((a, b) => (a.success < b.success ? a : b)),
    needsSupport = data.results.filter((s) => s.score < 50).length;
  function messageFor(s: (typeof data.results)[number]) {
    return {
      text: draft(
        s.name || "Your child",
        s.score,
        topics.filter((t) => s.scores[t] < Number(threshold)),
      ),
      approved: false,
    };
  }
  function makeDraft(s: (typeof data.results)[number]) {
    setMessages((m) => ({ ...m, [cls + ":" + s.studentId]: messageFor(s) }));
  }
  function exportResults() {
    download(
      "class-" + cls + "-results.csv",
      "Student ID,Name,Score," +
      topics.join(",") +
      "\n" +
      data.results
        .map((s) =>
          [
            s.studentId,
            s.name,
            s.score,
            ...topics.map((t) => s.scores[t]),
          ].join(","),
        )
        .join("\n"),
      "text/csv",
    );
  }
  if (!accessReady) {
    return (
      <main className="access-check" aria-live="polite">
        <BookOpen size={24} />
        <span>Checking workspace access…</span>
      </main>
    );
  }
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <a className="brand" href="/" aria-label="easeSTU home">
            <BrandLogo />
          </a>
          <div className="school-switch">
            <School size={19} />
            <div>
              <strong>Greenwood School</strong>
              <small>Academic year 2026–27</small>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <p className="nav-label">{role.toUpperCase()} WORKSPACE</p>
          <SidebarMenu>
            {nav.map(([href, label, Icon]: any) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={path === href}>
                  <a href={href}>
                    <Icon size={19} />
                    <span>{label}</span>
                    {path === href && (
                      <ChevronRight className="ml-auto" size={15} />
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="sidebar-note">
            <GraduationCap size={26} />
            <strong>Understanding comes first.</strong>
            <p>
              Small insights. Thoughtful support.
              <br />
              More confident learners.
            </p>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="profile">
            <span className="avatar">
              {role === "Teacher" ? "PS" : role === "Parent" ? "AP" : "DM"}
            </span>
            <div>
              <strong>
                {role === "Teacher"
                  ? "Priya Sharma"
                  : role === "Parent"
                    ? "Aarav’s parent"
                    : "Dr. Mehta"}
              </strong>
              <small>{role} workspace</small>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <SidebarTrigger />
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {role === "Teacher" ? "Class " + cls : role + " panel"}
            </strong>
          </div>
          <div className="top-actions">
            <Tag tone="neutral">Synthetic demo</Tag>
            <span className="avatar small">
              {role === "Teacher" ? "PS" : role === "Parent" ? "AP" : "DM"}
            </span>
          </div>
        </header>
        <main className="main-content">
          {path === "/results" && resultTestId && (
            <AwsResultsPanel testId={resultTestId} />
          )}

          {(path === "/dashboard" ||
            (path === "/results" && !resultTestId)) && (
              <>
                <div className="page-heading">
                  <div>
                    <p className="eyebrow">YOUR CLASS, AT A GLANCE</p>
                    <h1>
                      {path === "/dashboard"
                        ? "A clearer picture of learning."
                        : "Results & Insights"}
                    </h1>
                    <p>
                      See what’s clicking, and where a little support can help.
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/create-test">
                      <Plus size={17} />
                      Create Test
                    </a>
                  </Button>
                </div>
                <AwsOverviewSnapshot />
                {path === "/dashboard" && (
                  <div className="workflow-strip" aria-label="Teacher work queue">
                    <div>
                      <span>Assigned classes</span>
                      <strong>2</strong>
                      <small>8A and 8B</small>
                    </div>
                    <div>
                      <span>Tests conducted</span>
                      <strong>4</strong>
                      <small>This term</small>
                    </div>
                    <a href="/scan">
                      <span>PDF processing</span>
                      <strong>1</strong>
                      <small>
                        View pipeline <ChevronRight size={13} />
                      </small>
                    </a>
                    <a href="/review">
                      <span>Manual reviews</span>
                      <strong>3</strong>
                      <small>
                        Needs attention <ChevronRight size={13} />
                      </small>
                    </a>
                  </div>
                )}
                {path === "/dashboard" ? (
                  <>
                    <div className="analysis-grid">
                      <section className="panel">
                        <div className="panel-head">
                          <div>
                            <h2>Understanding, topic by topic</h2>
                            <p>Average performance across assessed students</p>
                          </div>
                          <Choice
                            label="Support threshold"
                            value={threshold + "% threshold"}
                            options={[
                              "40% threshold",
                              "50% threshold",
                              "60% threshold",
                            ]}
                            onChange={(s) => setThreshold(s.slice(0, 2))}
                          />
                        </div>
                        <div className="chart-legend">
                          <span>
                            <i className="teal-dot" />
                            Concept performance
                          </span>
                          <span>Click a topic to explore</span>
                        </div>
                        <div className="concept-list">
                          {data.concepts.map((c) => (
                            <button
                              className="concept-row"
                              key={c.topic}
                              onClick={() => setTopic(c.topic)}
                            >
                              <div className="concept-label">
                                <strong>{c.topic}</strong>
                                <b>{c.success}%</b>
                              </div>
                              <div className="track">
                                <span
                                  style={{
                                    width: c.success + "%",
                                    background:
                                      c.success < 50 ? "#d5a04e" : "#138b81",
                                  }}
                                />
                              </div>
                              <div className="concept-foot">
                                <span>
                                  {c.affected.length} of {subs.length} need
                                  support
                                </span>
                                <span>
                                  {c.action}
                                  <ChevronRight size={13} />
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="panel-foot">
                          <ShieldCheck size={15} />
                          Calculated from marked answers. Support threshold: below{" "}
                          {threshold}%.
                        </div>
                      </section>
                      <section className="insight-panel">
                        <span className="insight-kicker">
                          <Sparkles size={16} /> A CONCEPT CONNECTION
                        </span>
                        <h2>
                          A different example.
                          <br />A familiar idea.
                        </h2>
                        <Tag tone="amber">Pressure & area</Tag>
                        <p className="insight-intro">
                          {data.concepts[2].affected.length} students could use a
                          little more support with this concept.
                        </p>
                        <div className="analogy">
                          <Lightbulb size={21} />
                          <div>
                            <strong>Think of a school bag.</strong>
                            <p>
                              Wide straps spread the same weight over a larger
                              area, making the bag more comfortable. A simple way
                              to connect area and pressure.
                            </p>
                          </div>
                        </div>
                        <p className="respect">
                          An optional example to use or adapt. You know your
                          classroom best.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setTopic(topics[2])}
                        >
                          Explore this concept
                          <ArrowRight size={16} />
                        </Button>
                        <small className="sample-label">
                          Sample suggestion · Bedrock not connected
                        </small>
                      </section>
                    </div>
                    <div className="lower-grid">
                      <section className="panel">
                        <div className="panel-head">
                          <div>
                            <h2>Progress worth noticing</h2>
                            <p>Same concepts, two synthetic assessments</p>
                          </div>
                          <Tag>+{data.average - prev.average} points</Tag>
                        </div>
                        <div className="progress-chart">
                          {topics.map((t, i) => (
                            <div className="progress-column" key={t}>
                              <div className="bars">
                                <div
                                  style={{
                                    height: prev.concepts[i].success * 1.35,
                                  }}
                                >
                                  <span>{prev.concepts[i].success}%</span>
                                </div>
                                <div
                                  style={{
                                    height: data.concepts[i].success * 1.35,
                                  }}
                                >
                                  <span>{data.concepts[i].success}%</span>
                                </div>
                              </div>
                              <small>{t}</small>
                            </div>
                          ))}
                        </div>
                        <div className="chart-legend bottom">
                          <span>
                            <i className="gray-dot" />
                            Previous assessment
                          </span>
                          <span>
                            <i className="teal-dot" />
                            Current assessment
                          </span>
                        </div>
                      </section>
                      <section className="panel next-panel">
                        <div className="panel-head">
                          <h2>Your next steps</h2>
                        </div>
                        {[
                          [
                            "/scan",
                            ScanLine,
                            "Process answer sheets",
                            "Bring offline answers into focus",
                          ],
                          [
                            "/review",
                            BookOpen,
                            "Review parent messages",
                            "Encouragement, in your words",
                          ],
                          [
                            "/results",
                            Users,
                            "Look a little closer",
                            "Individual topic performance",
                          ],
                        ].map(([href, Icon, title, desc]: any) => (
                          <a href={href} key={href}>
                            <span className="step-icon">
                              <Icon size={20} />
                            </span>
                            <div>
                              <strong>{title}</strong>
                              <p>{desc}</p>
                            </div>
                            <ChevronRight size={17} />
                          </a>
                        ))}
                      </section>
                    </div>
                  </>
                ) : (
                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h2>Every student, a next step</h2>
                        <p>
                          {filtered.length} assessed students · missing sheets are
                          not automatically marked absent
                        </p>
                      </div>
                    </div>
                    <div className="table-tools">
                      <div className="search-box">
                        <Search size={16} />
                        <Input
                          aria-label="Search students"
                          placeholder="Search students…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <Choice
                        label="Performance group"
                        value={group}
                        onChange={setGroup}
                        options={[
                          "All students",
                          "Concept secure",
                          "Developing well",
                          "Needs support",
                        ]}
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Concepts needing attention</TableHead>
                          <TableHead>Progress group</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((s) => (
                          <TableRow key={s.studentId}>
                            <TableCell>
                              <div className="person">
                                <span className="avatar small">
                                  {s.name?.[0]}
                                </span>
                                <div>
                                  <strong>{s.name}</strong>
                                  <small>
                                    {s.studentId} · Roll {s.roll}
                                  </small>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <strong>{s.score}%</strong>
                            </TableCell>
                            <TableCell>
                              {topics
                                .filter((t) => s.scores[t] < Number(threshold))
                                .join(", ") || "All assessed concepts secure"}
                            </TableCell>
                            <TableCell>
                              <Tag
                                tone={
                                  s.score >= 80
                                    ? "teal"
                                    : s.score >= 50
                                      ? "blue"
                                      : "amber"
                                }
                              >
                                {s.score >= 80
                                  ? "Concept secure"
                                  : s.score >= 50
                                    ? "Developing well"
                                    : "Needs support"}
                              </Tag>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={"Draft for " + s.name}
                                onClick={() => {
                                  makeDraft(s);
                                  setNotice("Draft ready in Parent messages.");
                                }}
                              >
                                <FileText size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {!filtered.length && (
                      <p className="empty">No students match these filters.</p>
                    )}
                  </section>
                )}
              </>
            )}
          {path === "/create-test" && (
            <Builder paper={paper} setPaper={setPaper} notify={setNotice} />
          )}
          {path === "/tests" && <TeacherTests />}
          {path === "/scan" && (
            <Scanner
              cls={cls}
              onProcess={(s) => {
                setSubs(s);
                sessionStorage.setItem(
                  "easestu-import-" + cls,
                  JSON.stringify(s),
                );
                setNotice(
                  "Verified answers scored. Open Overview to see the results.",
                );
              }}
            />
          )}
          {(path === "/review" || path === "/messages") && (
            <>
              <Heading
                eyebrow="REVIEW FIRST. SUPPORT WITH CARE."
                title="Review & Support"
                description="Resolve uncertain scans, adapt AI suggestions, and approve parent messages in one place."
              />
              <div className="review-queue">
                <a href="/scan" className="panel queue-card">
                  <ShieldAlert size={22} />
                  <div>
                    <span>OMR review queue</span>
                    <strong>3 uncertain pages</strong>
                    <small>Confidence below 85% · open Scan & Process</small>
                  </div>
                  <ChevronRight size={18} />
                </a>
                <section className="panel queue-card">
                  <Lightbulb size={22} />
                  <div>
                    <span>Optional teaching analogy</span>
                    <strong>Pressure & area</strong>
                    <small>School-bag strap example · edit before using</small>
                  </div>
                  <Tag tone="amber">AI suggestion</Tag>
                </section>
              </div>
              <div className="context-row">
                <span>Class {cls} · Science · Force and Pressure</span>
                <Button
                  onClick={() => {
                    setMessages((m) => {
                      const next = { ...m };
                      data.results.forEach((s) => {
                        const key = cls + ":" + s.studentId;
                        if (!next[key]) next[key] = messageFor(s);
                      });
                      return next;
                    });
                    setNotice("Sample drafts are ready for review.");
                  }}
                >
                  <Sparkles size={16} />
                  Create sample drafts
                </Button>
              </div>
              <p className="subtle-banner">
                Template-based demo drafts · Bedrock generation becomes
                available after AWS setup.
              </p>
              <div className="message-grid">
                {data.results.map((s) => {
                  const key = cls + ":" + s.studentId,
                    m = messages[key];
                  return (
                    <section className="panel message-card" key={key}>
                      <div className="message-top">
                        <div className="person">
                          <span className="avatar">{s.name?.[0]}</span>
                          <div>
                            <strong>{s.name}</strong>
                            <small>Force and Pressure</small>
                          </div>
                        </div>
                        <Tag tone={m?.approved ? "teal" : "neutral"}>
                          {m?.approved
                            ? "Approved"
                            : m
                              ? "Draft"
                              : "Not drafted"}
                        </Tag>
                      </div>
                      {m ? (
                        <>
                          <Textarea
                            aria-label={"Message for " + s.name}
                            value={m.text}
                            onChange={(e) =>
                              setMessages((all) => ({
                                ...all,
                                [key]: {
                                  text: e.target.value,
                                  approved: false,
                                },
                              }))
                            }
                          />
                          <div className="message-actions">
                            <Button
                              variant="ghost"
                              onClick={() => makeDraft(s)}
                            >
                              Redraft
                            </Button>
                            <Button
                              disabled={m.approved || !m.text.trim()}
                              onClick={() => {
                                setMessages((all) => ({
                                  ...all,
                                  [key]: { ...m, approved: true },
                                }));
                                setNotice(
                                  "Approved. Visible in this demo’s parent panel.",
                                );
                              }}
                            >
                              <Check size={16} />
                              {m.approved ? "Approved" : "Approve message"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button variant="outline" onClick={() => makeDraft(s)}>
                          Create draft
                        </Button>
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          )}
          {path.startsWith("/parent") && (
            <ParentPanel path={path} message={messages["8A:STU-001"]} />
          )}
          {path.startsWith("/principal") && <Principal path={path} />}
          {path === "/teacher-settings" && <SettingsPanel role="Teacher" />}
          {path === "/setup" && (
            <>
              <Heading
                eyebrow="FROM DEMO TO YOUR SCHOOL"
                title="Deployment readiness"
                description="The synthetic demo is ready to explore. AWS services still need to be connected."
              />
              <section className="panel setup-panel">
                <Button asChild variant="outline">
                  <a href="/easestu-source.zip" download>
                    <Download size={16} />
                    Download project source
                  </a>
                </Button>
                <h2 className="mt-6">Working in this demo</h2>
                <p>
                  Calculated results, conceptual question selection, manual
                  questions, print layouts, QR identities, verified answer
                  import, parent approval and school trends. Drafts are saved in
                  your browser. The role switcher previews screens; it is not
                  school authentication.
                </p>
                <h2>Before real school use</h2>
                {[
                  ["Cognito", "Authenticate teachers, parents and principals."],
                  [
                    "API Gateway + Lambda",
                    "Run scoring and permission checks on the backend.",
                  ],
                  [
                    "DynamoDB",
                    "Persist tests, results, sheet mappings and approved messages.",
                  ],
                  [
                    "S3 + scanner worker",
                    "Store and extract PDF scans with uncertain-mark review.",
                  ],
                  [
                    "Bedrock",
                    "Draft conceptual questions, analogies and parent messages.",
                  ],
                ].map(([a, b]) => (
                  <div className="setup-row" key={a}>
                    <ShieldCheck size={20} />
                    <div>
                      <strong>{a}</strong>
                      <p>{b}</p>
                    </div>
                    <Tag tone="amber">Not connected</Tag>
                  </div>
                ))}
                <p>
                  See the AWS source package for deployment and integration
                  steps. Live PDF extraction, Cognito sign-in and AWS account
                  deployment must be validated before using real student
                  records.
                </p>
              </section>
            </>
          )}
          <footer className="app-footer">
            <span>
              easeSTU{" "}
              <span className="muted">Built around understanding.</span>
            </span>
            <span>Synthetic school data · Demo workspace</span>
          </footer>
        </main>
      </div>
      <Dialog open={!!topic} onOpenChange={() => setTopic(null)}>
        <DialogContent className="topic-dialog">
          <DialogHeader>
            <DialogTitle>{topic}</DialogTitle>
            <DialogDescription>
              Students below {threshold}% in this concept · Class {cls}
            </DialogDescription>
          </DialogHeader>
          {data.concepts
            .filter((c) => c.topic === topic)
            .map((c) => (
              <div key={c.topic}>
                <div className="detail-stat">
                  <strong>{c.affected.length}</strong>
                  <span>
                    of {subs.length} students · {c.percentage}%
                  </span>
                  <Tag tone="amber">{c.action}</Tag>
                </div>
                <p className="muted">
                  A suggestion for support, not a judgement of ability.
                </p>
                <div className="affected-list">
                  {c.affected.map((s) => (
                    <div key={s.studentId}>
                      <span>{s.name}</span>
                      <strong>{s.scores[c.topic]}%</strong>
                    </div>
                  ))}
                </div>
                <h3>Question patterns</h3>
                {bank.map((q, i) =>
                  q.topic === c.topic ? (
                    <p className="question-pattern" key={q.id}>
                      Q{i + 1}: {q.text}
                      <br />
                      <strong>
                        {subs.filter((s) => s.answers[i] !== q.answer).length}{" "}
                        incorrect or blank
                      </strong>
                    </p>
                  ) : null,
                )}
              </div>
            ))}
        </DialogContent>
      </Dialog>
      {notice && (
        <div className="toast" role="status">
          <Check size={19} />
          {notice}
        </div>
      )}
    </SidebarProvider>
  );
}
type SavedTest = {
  testId: string;
  title: string;
  subject: string;
  className: string;
  totalQuestions: number;
  status: string;
  createdAt: string;
};

type ListTestsResponse = {
  success: boolean;
  count: number;
  tests: SavedTest[];
};
type AwsStudentResult = {
  studentId: string;
  studentName?: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  category: "STRONG" | "AVERAGE" | "NEEDS_SUPPORT";
  topicBreakdown?: Record<
    string,
    {
      correct: number;
      total: number;
    }
  >;
};

type AwsResultsResponse = {
  testId: string;
  results: AwsStudentResult[];
};
type AwsTopicAnalytics = {
  topic: string;
  correct: number;
  total: number;
  successRate: number;
  status: "STRONG" | "AVERAGE" | "WEAK";
};

type AwsAnalyticsResponse = {
  testId: string;
  studentsParticipated: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  strongStudents: number;
  averageStudents: number;
  studentsNeedingSupport: number;
  topicAnalytics: AwsTopicAnalytics[];
};
function AwsOverviewSnapshot() {
  const [latestTest, setLatestTest] = useState<SavedTest | null>(null);
  const [analytics, setAnalytics] =
    useState<AwsAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        setLoading(true);
        setErrorMessage("");

        const testData =
          await callBackend<ListTestsResponse>("list-tests");

        const tests = [...(testData.tests ?? [])].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );

        const newestTest = tests[0];

        if (!newestTest) {
          if (!cancelled) {
            setLatestTest(null);
            setAnalytics(null);
          }
          return;
        }

        const analyticsData =
          await callBackend<AwsAnalyticsResponse>("get-analytics", {
            testId: newestTest.testId,
          });

        if (!cancelled) {
          setLatestTest(newestTest);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load the latest class analytics.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="panel">
        <p className="empty">Loading the latest class analytics…</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="panel">
        <p className="empty">
          Unable to load dashboard analytics: {errorMessage}
        </p>
      </section>
    );
  }

  if (!latestTest || !analytics) {
    return (
      <section className="panel">
        <p className="empty">
          No completed assessment analytics are available yet.
        </p>
      </section>
    );
  }

  const topics = analytics.topicAnalytics ?? [];

  const strongestTopic =
    topics.length > 0
      ? topics.reduce((best, topic) =>
        topic.successRate > best.successRate ? topic : best,
      )
      : null;

  const weakestTopic =
    topics.length > 0
      ? topics.reduce((weakest, topic) =>
        topic.successRate < weakest.successRate ? topic : weakest,
      )
      : null;

  return (
    <>
      <div className="context-row">
        <div className="context-left">
          <BookOpen size={16} />

          <strong>{latestTest.subject || "Assessment"}</strong>

          <span className="muted">/</span>

          <span>{latestTest.title}</span>

          <Tag tone="neutral">
            {latestTest.className || "Class"}
          </Tag>
        </div>

        <Button asChild variant="outline">
          <a
            href={`/results?testId=${encodeURIComponent(
              latestTest.testId,
            )}`}
          >
            View full results
            <ChevronRight size={15} />
          </a>
        </Button>
      </div>

      <div className="stats-grid">
        <section className="stat">
          <div className="stat-label">
            Class average
            <Users size={17} />
          </div>

          <div className="stat-value">
            {Number(analytics.averagePercentage).toFixed(1)}%
          </div>

          <p>{analytics.studentsParticipated} students assessed</p>
        </section>

        <section className="stat">
          <div className="stat-label">
            Strongest topic
            <ArrowUpRight size={17} />
          </div>

          <div className="stat-value">
            {strongestTopic
              ? `${Number(strongestTopic.successRate).toFixed(1)}%`
              : "—"}
          </div>

          <p className="positive">
            {strongestTopic && <ArrowUpRight size={13} />}
            {strongestTopic?.topic || "No topic data"}
          </p>
        </section>

        <section className="stat">
          <div className="stat-label">
            Weakest topic
            <Lightbulb size={17} />
          </div>

          <div className="stat-value">
            {weakestTopic
              ? `${Number(weakestTopic.successRate).toFixed(1)}%`
              : "—"}
          </div>

          <p>{weakestTopic?.topic || "No topic data"}</p>
        </section>

        <section className="stat">
          <div className="stat-label">
            Need support
            <Users size={17} />
          </div>

          <div className="stat-value">
            {analytics.studentsNeedingSupport}
          </div>

          <p>Students below the support threshold</p>
        </section>
      </div>
    </>
  );
}
function AwsResultsPanel({ testId }: { testId: string }) {
  const [results, setResults] = useState<AwsStudentResult[]>([]);
  const [analytics, setAnalytics] =
    useState<AwsAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setErrorMessage("");

    Promise.all([
      callBackend<AwsResultsResponse>("get-results", {
        testId,
      }),
      callBackend<AwsAnalyticsResponse>("get-analytics", {
        testId,
      }),
    ])
      .then(([resultsData, analyticsData]) => {
        if (!cancelled) {
          setResults(resultsData.results ?? []);
          setAnalytics(analyticsData);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load assessment analytics.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [testId]);

  return (
    <>
      <Heading
        eyebrow="REAL AWS ASSESSMENT RESULTS"
        title="Results & Insights"
        description={`Results securely loaded from DynamoDB for test ${testId}.`}
      />

      <div className="context-row">
        <span>
          {loading
            ? "Loading results…"
            : `${results.length} assessed student${results.length === 1 ? "" : "s"
            }`}
        </span>

        <Button asChild variant="outline">
          <a href="/tests">Back to tests</a>
        </Button>
      </div>
      {!loading && !errorMessage && analytics && (
        <div className="stats-grid">
          <section className="stat">
            <p className="stat-label">Students assessed</p>
            <p className="stat-value">
              {analytics.studentsParticipated}
            </p>
          </section>

          <section className="stat">
            <p className="stat-label">Class average</p>
            <p className="stat-value">
              {Number(analytics.averagePercentage).toFixed(1)}%
            </p>
          </section>

          <section className="stat">
            <p className="stat-label">Highest score</p>
            <p className="stat-value">
              {Number(analytics.highestPercentage).toFixed(1)}%
            </p>
          </section>

          <section className="stat">
            <p className="stat-label">Lowest score</p>
            <p className="stat-value">
              {Number(analytics.lowestPercentage).toFixed(1)}%
            </p>
          </section>
        </div>
      )}
      <section className="panel">
        {loading && (
          <p className="empty">Loading results from AWS…</p>
        )}

        {!loading && errorMessage && (
          <p className="empty">
            Unable to load results: {errorMessage}
          </p>
        )}

        {!loading &&
          !errorMessage &&
          results.length === 0 && (
            <p className="empty">
              No student results have been recorded for this test.
            </p>
          )}

        {!loading &&
          !errorMessage &&
          results.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Correct answers</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Concepts needing attention</TableHead>
                  <TableHead>Progress group</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {results.map((result) => {
                  const weakTopics = Object.entries(
                    result.topicBreakdown ?? {},
                  )
                    .filter(
                      ([, values]) =>
                        Number(values.correct) <
                        Number(values.total),
                    )
                    .map(([topicName]) => topicName);

                  return (
                    <TableRow key={result.studentId}>
                      <TableCell>
                        <strong>
                          {result.studentName ||
                            "Unnamed student"}
                        </strong>

                        <small className="cell-note">
                          {result.studentId}
                        </small>
                      </TableCell>

                      <TableCell>
                        {result.correctAnswers}/
                        {result.totalQuestions}
                      </TableCell>

                      <TableCell>
                        <strong>
                          {Number(result.percentage).toFixed(0)}%
                        </strong>
                      </TableCell>

                      <TableCell>
                        {weakTopics.length
                          ? weakTopics.join(", ")
                          : "All assessed concepts secure"}
                      </TableCell>

                      <TableCell>
                        <Tag
                          tone={
                            result.category === "STRONG"
                              ? "teal"
                              : result.category === "AVERAGE"
                                ? "blue"
                                : "neutral"
                          }
                        >
                          {result.category === "STRONG"
                            ? "Strong"
                            : result.category === "AVERAGE"
                              ? "Developing well"
                              : "Needs support"}
                        </Tag>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
      </section>
      {!loading &&
        !errorMessage &&
        analytics &&
        analytics.topicAnalytics.length > 0 && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Concept performance</h2>
                <p>
                  Calculated from all student answers for this test.
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concept</TableHead>
                  <TableHead>Correct responses</TableHead>
                  <TableHead>Success rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {analytics.topicAnalytics.map((topic) => (
                  <TableRow key={topic.topic}>
                    <TableCell>
                      <strong>{topic.topic}</strong>
                    </TableCell>

                    <TableCell>
                      {topic.correct}/{topic.total}
                    </TableCell>

                    <TableCell>
                      {Number(topic.successRate).toFixed(1)}%
                    </TableCell>

                    <TableCell>
                      <Tag
                        tone={
                          topic.status === "STRONG"
                            ? "teal"
                            : topic.status === "AVERAGE"
                              ? "blue"
                              : "neutral"
                        }
                      >
                        {topic.status === "WEAK"
                          ? "Needs support"
                          : topic.status === "AVERAGE"
                            ? "Developing"
                            : "Strong"}
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      <p className="privacy-note">
        <ShieldCheck size={16} />
        Scores and topic breakdowns are calculated by the secured
        easeSTU Lambda backend.
      </p>
    </>
  );
}
type OpenedTestQuestion = {
  number?: number;
  text: string;
  options?: string[];
  answer?: string;
  topic?: string;
  explanation?: string;
};

type OpenedTestDetails = SavedTest & {
  questions?: OpenedTestQuestion[];
};

type OpenedTestResponse = {
  test: OpenedTestDetails;
};

function TeacherTests() {
  const [tests, setTests] = useState<SavedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedTest, setSelectedTest] =
    useState<OpenedTestDetails | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    callBackend<ListTestsResponse>("list-tests")
      .then((data) => {
        if (!cancelled) {
          setTests(data.tests ?? []);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load saved tests.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function openTest(testId: string) {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedTest(null);

    try {
      const data = await callBackend<OpenedTestResponse>("get-test", {
        testId,
      });

      setSelectedTest(data.test);
    } catch (error) {
      setDetailsError(
        error instanceof Error
          ? error.message
          : "Could not load the test.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <>
      <Heading
        eyebrow="EVERY ASSESSMENT, ONE WORKSPACE"
        title="Tests"
        description="Create assessments and access tests saved securely in AWS DynamoDB."
      />

      <div className="context-row">
        <span>
          {loading
            ? "Loading saved tests…"
            : `${tests.length} saved test${tests.length === 1 ? "" : "s"}`}
        </span>

        <Button asChild>
          <a href="/create-test">
            <Plus size={16} />
            Create Test
          </a>
        </Button>
      </div>

      <section className="panel">
        {loading && <p className="empty">Loading tests from AWS…</p>}

        {!loading && loadError && (
          <p className="empty">Unable to load tests: {loadError}</p>
        )}

        {!loading && !loadError && tests.length === 0 && (
          <p className="empty">
            No saved tests yet. Create and save your first assessment.
          </p>
        )}

        {!loading && !loadError && tests.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.testId}>
                  <TableCell>
                    <strong>{test.title}</strong>

                    <small className="cell-note">
                      {test.testId}
                      {test.createdAt
                        ? ` · ${new Date(
                          test.createdAt,
                        ).toLocaleDateString()}`
                        : ""}
                    </small>
                  </TableCell>

                  <TableCell>{test.subject || "—"}</TableCell>

                  <TableCell>{test.className || "—"}</TableCell>

                  <TableCell>{test.totalQuestions}</TableCell>

                  <TableCell>
                    <Tag tone={test.status === "ACTIVE" ? "teal" : "neutral"}>
                      {test.status}
                    </Tag>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTest(test.testId)}
                    >
                      Open test
                      <ChevronRight size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <p className="privacy-note">
        <ShieldCheck size={16} />
        These tests are loaded from the secured easeSTU DynamoDB database.
      </p>

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);

          if (!open) {
            setSelectedTest(null);
            setDetailsError("");
          }
        }}
      >
        <DialogContent
          style={{
            maxWidth: "760px",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {selectedTest?.title ?? "Test details"}
            </DialogTitle>

            <DialogDescription>
              {selectedTest
                ? `${selectedTest.className || "No class"} · ${selectedTest.subject || "No subject"
                } · ${selectedTest.totalQuestions} questions`
                : "Loading the selected assessment from AWS."}
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <p className="empty">Loading test from AWS…</p>
          )}

          {!detailsLoading && detailsError && (
            <p className="empty">
              Unable to open test: {detailsError}
            </p>
          )}

          {!detailsLoading &&
            !detailsError &&
            selectedTest &&
            (!selectedTest.questions ||
              selectedTest.questions.length === 0) && (
              <p className="empty">
                This test does not contain any saved questions.
              </p>
            )}

          {!detailsLoading &&
            !detailsError &&
            selectedTest?.questions?.map((question, questionIndex) => (
              <section
                className="panel question-card"
                key={`${selectedTest.testId}-${questionIndex}`}
              >
                <div className="question-meta">
                  <Tag tone="blue">
                    {question.topic || "General"}
                  </Tag>

                  <span>
                    Question {question.number ?? questionIndex + 1}
                  </span>
                </div>

                <h3>
                  {question.number ?? questionIndex + 1}.{" "}
                  {question.text}
                </h3>

                <div className="options-grid">
                  {(question.options ?? []).map(
                    (option, optionIndex) => (
                      <div key={optionIndex}>
                        <b>{"ABCD"[optionIndex]}</b>
                        {option}
                      </div>
                    ),
                  )}
                </div>

                <p>
                  <strong>
                    Correct answer: {question.answer || "Not provided"}
                  </strong>
                </p>

                {question.explanation && (
                  <p className="explanation">
                    {question.explanation}
                  </p>
                )}
              </section>
            ))}
          {selectedTest && !detailsLoading && !detailsError && (
            <Button asChild>
              <a
                href={`/results?testId=${encodeURIComponent(
                  selectedTest.testId,
                )}`}
              >
                View student results
                <ChevronRight size={14} />
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ParentPanel({ path, message }: { path: string; message?: Message }) {
  const assessments = [
    ["Force and Pressure", "Science", "18 Sep 2026", "72%"],
    ["Motion", "Science", "04 Sep 2026", "68%"],
    ["Fractions", "Mathematics", "27 Aug 2026", "81%"],
  ];
  if (path === "/parent/settings") return <SettingsPanel role="Parent" />;
  if (path === "/parent/progress")
    return (
      <>
        <Heading
          eyebrow="MY CHILD’S PROGRESS"
          title="Clear progress, simple language."
          description="Only Aarav’s topic-level learning across previous assessments."
        />
        <div className="progress-cards">
          {[
            ["Balanced forces", "Strong", "teal", 84],
            ["Contact & non-contact forces", "Developing", "blue", 68],
            ["Pressure & area", "Needs Support", "amber", 44],
          ].map(([topic, label, tone, value]: any) => (
            <section className="panel progress-card" key={topic}>
              <span>{topic}</span>
              <Tag tone={tone}>{label}</Tag>
              <strong>{value}%</strong>
              <div className="track">
                <i style={{ width: value + "%" }} />
              </div>
              <small>Across the latest two assessments</small>
            </section>
          ))}
        </div>
        <section className="panel trend-panel">
          <h2>Recent progress</h2>
          <div className="mini-trend">
            <span style={{ height: "48%" }}>58</span>
            <span style={{ height: "62%" }}>68</span>
            <span style={{ height: "72%" }}>72</span>
          </div>
          <p>
            Science performance is improving steadily across the last three
            assessments.
          </p>
        </section>
        <PrivacyNote />
      </>
    );
  if (path === "/parent/assessments")
    return (
      <>
        <Heading
          eyebrow="COMPLETED ASSESSMENTS"
          title="Assessments"
          description="Aarav’s results only, with a clear topic breakdown."
        />
        <section className="panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((a) => (
                <TableRow key={a[0]}>
                  <TableCell>
                    <strong>{a[0]}</strong>
                  </TableCell>
                  <TableCell>{a[1]}</TableCell>
                  <TableCell>{a[2]}</TableCell>
                  <TableCell>
                    <Tag tone="teal">{a[3]}</Tag>
                  </TableCell>
                  <TableCell>
                    View topic breakdown{" "}
                    <ChevronRight size={14} className="inline" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <PrivacyNote />
      </>
    );
  if (path === "/parent/support")
    return (
      <>
        <Heading
          eyebrow="TEACHER-APPROVED GUIDANCE"
          title="Support Notes"
          description="Positive, practical suggestions your child’s teacher has reviewed."
        />
        {message?.approved ? (
          <ParentLetter text={message.text} />
        ) : (
          <section className="panel empty">
            <HeartHandshake size={32} />
            <h2>No new support note yet.</h2>
            <p>
              The teacher is reviewing this assessment. Draft or AI-generated
              text is never shown here.
            </p>
          </section>
        )}
        <PrivacyNote />
      </>
    );
  return (
    <>
      <Heading
        eyebrow="AARAV’S LEARNING JOURNEY"
        title="Little steps. Growing confidence."
        description="A simple view of your child’s latest learning."
      />
      <div className="parent-intro">
        <span className="avatar big">AS</span>
        <div>
          <h2>Aarav Sharma</h2>
          <p>Class 8A · Greenwood School</p>
        </div>
        <Tag>Linked child</Tag>
      </div>
      <div className="stats-grid">
        {[
          ["Latest assessment", "72%"],
          ["Recent progress", "+4 pts"],
          ["Strongest topic", "Balanced forces"],
          ["Needs support", "Pressure & area"],
        ].map(([label, value]) => (
          <section className="stat" key={label}>
            <div className="stat-label">{label}</div>
            <div className="parent-stat-value">{value}</div>
          </section>
        ))}
      </div>
      {message?.approved ? (
        <ParentLetter text={message.text} />
      ) : (
        <section className="panel empty">
          <BookOpen size={32} />
          <h2>Your next teacher note will appear here.</h2>
          <p>Only reviewed and approved support notes are shared.</p>
        </section>
      )}
      <PrivacyNote />
    </>
  );
}

function ParentLetter({ text }: { text: string }) {
  return (
    <section className="panel parent-letter">
      <p className="eyebrow">LATEST SUPPORT NOTE · SCIENCE</p>
      <h2>Force and Pressure</h2>
      <div className="letter-rule" />
      <p>{text}</p>
      <footer>
        <ShieldCheck size={18} />
        <div>
          <strong>Reviewed by your teacher</strong>
          <small>Priya Sharma · Science teacher</small>
        </div>
      </footer>
    </section>
  );
}
function PrivacyNote() {
  return (
    <p className="privacy-note">
      <ShieldCheck size={16} />
      Linked only to Aarav. No rankings, other students, scanned sheets, or AI
      confidence data.
    </p>
  );
}

function SettingsPanel({ role }: { role: "Teacher" | "Parent" | "Principal" }) {
  const name =
    role === "Teacher"
      ? "Priya Sharma"
      : role === "Parent"
        ? "Aarav’s parent"
        : "Dr. Mehta";
  const detail =
    role === "Teacher"
      ? "Science · Classes 8A and 8B"
      : role === "Parent"
        ? "Linked child: Aarav Sharma · Class 8A"
        : "Greenwood School · Academic leadership";
  return (
    <>
      <Heading
        eyebrow="ACCOUNT & WORKSPACE"
        title="Profile & Settings"
        description="Your identity, assigned access, help, and session controls."
      />
      <section className="panel settings-card">
        <div className="settings-profile">
          <span className="avatar big">
            {role === "Teacher" ? "PS" : role === "Parent" ? "AP" : "DM"}
          </span>
          <div>
            <h2>{name}</h2>
            <p>{detail}</p>
          </div>
          <Tag>{role}</Tag>
        </div>
        {[
          ["School", "Greenwood School"],
          ["Academic year", "2026–27"],
          [
            "Data access",
            role === "Principal"
              ? "Aggregated school summaries"
              : role === "Parent"
                ? "Linked child only"
                : "Assigned classes only",
          ],
        ].map(([a, b]) => (
          <div className="setting-row" key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </div>
        ))}
        <div className="settings-actions">
          <Button asChild variant="outline">
            <a href="/setup">Help & guidance</a>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("easestu-demo-session");
              window.location.href = "/";
            }}
          >
            Log out of demo
          </Button>
        </div>
      </section>
    </>
  );
}

function Principal({ path }: { path: string }) {
  const cs = ["8A", "8B"].map((id) => ({
    id,
    ...analyse(sample(id)),
    prev: analyse(sample(id, true)),
  }));
  const total = cs.reduce((n, c) => n + c.results.length, 0),
    overall = Math.round(
      cs.reduce((n, c) => n + c.results.reduce((v, s) => v + s.score, 0), 0) /
      total,
    );
  if (path === "/principal/settings") return <SettingsPanel role="Principal" />;
  if (path === "/principal/classes")
    return (
      <>
        <Heading
          eyebrow="COMPARE, DON’T RANK"
          title="Class Performance"
          description="Aggregated class patterns filtered by grade, section, subject, or period."
        />
        <div className="filter-row">
          <Tag tone="neutral">Grade 8</Tag>
          <Tag tone="neutral">Science</Tag>
          <Tag tone="neutral">Current term</Tag>
        </div>
        <section className="panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Average</TableHead>
                <TableHead>Participation</TableHead>
                <TableHead>Strong topic</TableHead>
                <TableHead>Weak topic</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <strong>Class {c.id}</strong>
                  </TableCell>
                  <TableCell>{c.average}%</TableCell>
                  <TableCell>{c.results.length}/50</TableCell>
                  <TableCell>
                    {
                      c.concepts.reduce((a, b) =>
                        a.success > b.success ? a : b,
                      ).topic
                    }
                  </TableCell>
                  <TableCell>
                    {
                      c.concepts.reduce((a, b) =>
                        a.success < b.success ? a : b,
                      ).topic
                    }
                  </TableCell>
                  <TableCell>
                    <Tag>+{c.average - c.prev.average} pts</Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </>
    );
  if (path === "/principal/gaps")
    return (
      <>
        <Heading
          eyebrow="WHERE SUPPORT CAN TRAVEL FURTHEST"
          title="Learning Gaps"
          description="See whether a concept challenge is local to one class or shared across the grade."
        />
        <section className="panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concept</TableHead>
                <TableHead>Class 8A</TableHead>
                <TableHead>Class 8B</TableHead>
                <TableHead>Reach</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((t, i) => {
                const count = cs.reduce(
                  (n, c) => n + c.concepts[i].affected.length,
                  0,
                );
                return (
                  <TableRow key={t}>
                    <TableCell>
                      <strong>{t}</strong>
                    </TableCell>
                    {cs.map((c) => (
                      <TableCell key={c.id}>{c.concepts[i].success}%</TableCell>
                    ))}
                    <TableCell>{count} students</TableCell>
                    <TableCell>
                      <Tag tone={count > 10 ? "amber" : "teal"}>
                        {count > 10 ? "Across grade" : "Monitor"}
                      </Tag>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
        <p className="privacy-note">
          <ShieldCheck size={16} />
          Student names stay hidden; this view is designed for school-level
          planning.
        </p>
      </>
    );
  if (path === "/principal/trends")
    return (
      <>
        <Heading
          eyebrow="CHANGE OVER TIME"
          title="Progress & Trends"
          description="Comparable assessment patterns without turning classrooms into a leaderboard."
        />
        <div className="trend-grid">
          {cs.map((c) => (
            <section className="panel trend-panel" key={c.id}>
              <div className="panel-head">
                <h2>Class {c.id}</h2>
                <Tag>+{c.average - c.prev.average} pts</Tag>
              </div>
              <div className="mini-trend">
                <span style={{ height: "45%" }}>{c.prev.average - 5}</span>
                <span style={{ height: "62%" }}>{c.prev.average}</span>
                <span style={{ height: "76%" }}>{c.average}</span>
              </div>
              <p>Assessment 00 → 01 → 02</p>
            </section>
          ))}
        </div>
        <section className="panel setup-panel">
          <h2>Topic movement</h2>
          {topics.map((t, i) => (
            <div className="setup-row" key={t}>
              <TrendingUp size={20} />
              <div>
                <strong>{t}</strong>
                <p>Grade-wide comparable assessments</p>
              </div>
              <Tag>
                +
                {Math.max(
                  2,
                  Math.round(
                    (cs[0].concepts[i].success + cs[1].concepts[i].success) /
                    20,
                  ),
                )}{" "}
                pts
              </Tag>
            </div>
          ))}
        </section>
      </>
    );
  if (path === "/principal/reports")
    return (
      <>
        <Heading
          eyebrow="READY FOR ACADEMIC REVIEW"
          title="Reports"
          description="Download focused summaries for meetings without exposing operational teacher tools."
        />
        <div className="report-grid">
          {[
            [
              "School overview",
              "All grades and subjects",
              "school-overview.csv",
            ],
            [
              "Grade 8 learning gaps",
              "Class and topic summary",
              "grade-8-gaps.csv",
            ],
            [
              "Science trend report",
              "Assessment progress over time",
              "science-trends.csv",
            ],
            [
              "Class 8A summary",
              "Participation and topic mastery",
              "class-8a.csv",
            ],
          ].map(([title, desc, file]) => (
            <section className="panel report-card" key={title}>
              <FileDown size={24} />
              <div>
                <h2>{title}</h2>
                <p>{desc}</p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  download(
                    file,
                    "Report,Value\n" +
                    title +
                    ",Synthetic demo\nGenerated,19 Sep 2026",
                    "text/csv",
                  )
                }
              >
                <Download size={15} />
                Download
              </Button>
            </section>
          ))}
        </div>
      </>
    );
  return (
    <>
      <Heading
        eyebrow="THE BIGGER PICTURE"
        title="A school that learns together."
        description="School-wide patterns and opportunities to support teaching teams."
      />
      <div className="stats-grid">
        {[
          ["Tests completed", "4"],
          ["Participating classes", "2"],
          ["Overall mastery", overall + "%"],
          ["Classes needing attention", "1"],
        ].map(([label, value]) => (
          <section className="stat" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </section>
        ))}
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Shared concepts, shared opportunities</h2>
            <p>Science · Force and Pressure · Synthetic school overview</p>
          </div>
          <Tag>Aggregated</Tag>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concept</TableHead>
              <TableHead>Class 8A</TableHead>
              <TableHead>Class 8B</TableHead>
              <TableHead>Students needing support</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((t, i) => (
              <TableRow key={t}>
                <TableCell>
                  <strong>{t}</strong>
                </TableCell>
                {cs.map((c) => (
                  <TableCell key={c.id}>
                    <span
                      className={
                        "heat " + (c.concepts[i].success < 50 ? "warm" : "cool")
                      }
                    >
                      {c.concepts[i].success}%
                    </span>
                  </TableCell>
                ))}
                <TableCell>
                  {cs.reduce((n, c) => n + c.concepts[i].affected.length, 0)} of{" "}
                  {total}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <div className="lower-grid mt-6">
        <section className="panel setup-panel">
          <h2>Recent assessment activity</h2>
          {cs.map((c) => (
            <div className="setup-row" key={c.id}>
              <School size={21} />
              <div>
                <strong>Class {c.id}</strong>
                <p>
                  {c.prev.average}% → {c.average}% average
                </p>
              </div>
              <Tag>+{c.average - c.prev.average} points</Tag>
            </div>
          ))}
        </section>
        <section className="insight-panel">
          <span className="insight-kicker">
            <Lightbulb size={16} /> SCHOOL-WIDE GAP
          </span>
          <h2>Pressure & area</h2>
          <p>
            Both classes would benefit from more opportunities to explore this
            easeSTU
          </p>
          <p className="respect">
            Open Learning Gaps to see whether this pattern extends across the
            grade.
          </p>
          <Button asChild variant="outline">
            <a href="/principal/gaps">
              View learning gaps
              <ArrowRight size={16} />
            </a>
          </Button>
        </section>
      </div>
    </>
  );
}
function setAnalytics(analyticsData: AwsAnalyticsResponse) {
  throw new Error("Function not implemented.");
}

