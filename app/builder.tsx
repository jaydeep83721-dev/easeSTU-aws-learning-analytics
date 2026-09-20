'use client';

import {
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Plus, Check, Printer, ArrowUp, Trash2, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Q, topics, students } from "@/lib/data";
import { callBackend } from "@/lib/aws-client";
import { Heading, Choice, Tag, download } from './workspace';
type GeneratedQuestion = {
    questionId: string;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctAnswer: "A" | "B" | "C" | "D";
    topic: string;
    explanation: string;
    difficulty: string;
};

type GenerateQuestionsResponse = {
    success: boolean;
    questions: GeneratedQuestion[];
    message?: string;
};
type CreateTestResponse = {
    message: string;
    test: {
        testId: string;
        title: string;
        totalQuestions: number;
    };
};
export default function Builder({
    paper,
    setPaper,
    notify,
}: {
    paper: Q[];
    setPaper: (q: Q[]) => void;
    notify: (s: string) => void;
}) {
    const [count, setCount] = useState('6');
    const [suggestions, setSuggestions] = useState<Q[]>([]);
    const [title, setTitle] = useState('Force and Pressure — Concept Check');
    const [edit, setEdit] = useState<Q | null>(null);
    const [mode, setMode] = useState('Question paper');
    const [pages, setPages] = useState<{ id: string; name: string; qr: string }[]>([]);
    const [busy, setBusy] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedTestId, setSavedTestId] =
        useState<string | null>(null);
    async function generateQuestions() {
        async function saveTest() {
            if (!paper.length) {
                notify("Add at least one question to the paper.");
                return;
            }

            if (!title.trim()) {
                notify("Enter a test title.");
                return;
            }

            setSaving(true);

            try {
                if (!savedTestId) {
                    notify(
                        "Save the test to AWS before creating QR answer sheets.",
                    );
                    setBusy(false);
                    return;
                }

                const testId = savedTestId;

                const result =
                    await callBackend<CreateTestResponse>(
                        "create-test",
                        {
                            testId,
                            title: title.trim(),
                            subject: "Mathematics",
                            className: "Class 8A",
                            questions: paper.map((question) => ({
                                text: question.text,
                                topic: question.topic,
                                answer: "ABCD"[question.answer],
                                options: {
                                    A: question.options[0],
                                    B: question.options[1],
                                    C: question.options[2],
                                    D: question.options[3],
                                },
                                explanation: question.explanation,
                            })),
                        },
                    );

                setSavedTestId(result.test.testId);

                localStorage.setItem(
                    "easestu-current-test-id",
                    result.test.testId,
                );

                notify(
                    `Test saved to AWS: ${result.test.testId}`,
                );
            } catch (error) {
                notify(
                    error instanceof Error
                        ? error.message
                        : "Unable to save the test.",
                );
            } finally {
                setSaving(false);
            }
        }
        setBusy(true);

        try {
            const result =
                await callBackend<GenerateQuestionsResponse>(
                    "generate-mcqs",
                    {
                        subject: "Mathematics",
                        className: "Class 8A",
                        chapters: ["Fractions"],
                        questionCount: Number(count),
                    },
                );

            const convertedQuestions: Q[] =
                result.questions.map((question) => ({
                    id: question.questionId,
                    text: question.question,
                    options: [
                        question.options.A,
                        question.options.B,
                        question.options.C,
                        question.options.D,
                    ],
                    answer: "ABCD".indexOf(
                        question.correctAnswer,
                    ),
                    topic: question.topic,
                    explanation: question.explanation,
                }));

            setSuggestions(convertedQuestions);

            if (convertedQuestions.length === 0) {
                notify(
                    result.message ||
                    "No questions are available for this chapter.",
                );
            } else {
                notify(
                    `${convertedQuestions.length} questions loaded from AWS.`,
                );
            }
        } catch (error) {
            notify(
                error instanceof Error
                    ? error.message
                    : "Question generation failed.",
            );
        } finally {
            setBusy(false);
        }
    }
    async function print() {
        if (!paper.length) return;

        if (mode === 'QR answer sheets' && paper.length > 12) {
            notify(
                'QR sheets currently support up to 12 questions. Reduce the paper before printing answer sheets.'
            );
            return;
        }

        setBusy(true);

        try {
            if (mode === 'QR answer sheets') {
                const testId = crypto.randomUUID();
                const sheets = await Promise.all(
                    students.map(async (s) => {
                        const id = crypto.randomUUID();
                        return {
                            id,
                            studentId: s.id,
                            name: s.name,
                            testId,
                            page: 1,
                            qr: await QRCode.toDataURL(id, { width: 120, margin: 3 }),
                        };
                    })
                );

                localStorage.setItem(
                    'easestu-sheet-mapping',
                    JSON.stringify({
                        testId,
                        questions: paper,
                        sheets: sheets.map(({ qr, ...s }) => s),
                    })
                );

                setPages(sheets);
            }

            setTimeout(() => {
                window.print();
                setBusy(false);
            }, 300);
        } catch {
            setBusy(false);
            notify('Print preparation failed. Please retry.');
        }
    }

    function saveTest(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void {
        throw new Error('Function not implemented.');
    }

    return (
        <>
            <Heading
                eyebrow="UNDERSTANDING, NOT MEMORISATION"
                title="Make room for good questions."
                description="Choose conceptual questions, add your own, and build a paper your way."
            />

            <div className="builder-layout">
                <div>
                    {/* Section 1: Setup */}
                    <section className="panel">
                        <div className="panel-head">
                            <h2>1. Set up your assessment</h2>
                            <Tag tone="neutral">Offline test</Tag>
                        </div>

                        <div className="form-grid">
                            <label>
                                Test title
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </label>

                            <label>
                                Class
                                <Choice
                                    label="Test class"
                                    value="Class 8A"
                                    options={['Class 8A']}
                                    onChange={() => { }}
                                />
                            </label>

                            <label>
                                Subject
                                <Choice
                                    label="Subject"
                                    value="Mathematics"
                                    options={["Mathematics"]}
                                    onChange={() => { }}
                                />
                            </label>

                            <label>
                                Chapter
                                <Choice
                                    label="Chapter"
                                    value="Fractions"
                                    options={["Fractions"]}
                                    onChange={() => { }}
                                />
                            </label>

                            <label>
                                Number of suggestions
                                <Choice
                                    label="Question count"
                                    value={count}
                                    options={['3', '6', '9', '12']}
                                    onChange={setCount}
                                />
                            </label>
                        </div>

                        <div className="config-bottom">
                            <p>Sample chapter bank · Other chapters require Bedrock setup.</p>
                            <Button onClick={generateQuestions} disabled={busy}>
                                <Sparkles size={16} />
                                {busy ? "Loading from AWS…" : "Generate questions"}
                            </Button>
                        </div>
                    </section>

                    {/* Section 2: Suggested questions */}
                    <div className="section-heading">
                        <h2>2. Review suggested questions</h2>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setEdit({
                                    id: crypto.randomUUID(),
                                    text: '',
                                    options: ['', '', '', ''],
                                    answer: 0,
                                    topic: topics[0],
                                    explanation: '',
                                })
                            }
                        >
                            <Plus size={16} />
                            Write your own
                        </Button>
                    </div>

                    {!suggestions.length && (
                        <section className="panel empty">
                            <h3>Your question ideas will appear here.</h3>
                            <p>Choose how many suggestions you need, then review each one.</p>
                        </section>
                    )}

                    {suggestions.map((q, i) => (
                        <section className="panel question-card" key={q.id}>
                            <div className="question-meta">
                                <Tag tone="blue">{q.topic}</Tag>
                                <span>Conceptual · Sample bank</span>
                            </div>

                            <h3>
                                {i + 1}. {q.text}
                            </h3>

                            <div className="options-grid">
                                {q.options.map((o, j) => (
                                    <div key={j} className={j === q.answer ? 'correct' : ''}>
                                        <b>{'ABCD'[j]}</b>
                                        {o}
                                        {j === q.answer && <Check size={15} />}
                                    </div>
                                ))}
                            </div>

                            <p className="explanation">{q.explanation}</p>

                            <div className="question-actions">
                                <Button variant="ghost" onClick={() => setEdit(q)}>
                                    Edit
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => setSuggestions(suggestions.filter((s) => s.id !== q.id))}
                                >
                                    Dismiss
                                </Button>

                                <Button
                                    variant="outline"
                                    disabled={paper.some((s) => s.id === q.id)}
                                    onClick={() => setPaper([...paper, q])}
                                >
                                    {paper.some((s) => s.id === q.id) ? <Check size={15} /> : <Plus size={15} />}
                                    {paper.some((s) => s.id === q.id) ? 'Added' : 'Add to paper'}
                                </Button>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Sidebar: Paper summary */}
                <aside className="panel paper-summary">
                    <p className="eyebrow">YOUR QUESTION PAPER</p>
                    <h2>{title || 'Untitled assessment'}</h2>
                    <p>
                        {paper.length} questions · {paper.length} marks
                    </p>

                    <div className="paper-list">
                        {paper.map((q, i) => (
                            <div key={q.id}>
                                <b>{i + 1}</b>
                                <span>{q.text}</span>

                                <div>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Move question ${i + 1} up`}
                                        disabled={!i}
                                        onClick={() => {
                                            const p = [...paper];
                                            [p[i - 1], p[i]] = [p[i], p[i - 1]];
                                            setPaper(p);
                                        }}
                                    >
                                        <ArrowUp size={14} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove question ${i + 1}`}
                                        onClick={() => setPaper(paper.filter((s) => s.id !== q.id))}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!paper.length && (
                        <p className="empty-paper">
                            Your paper starts with a question.
                            <br />
                            Add one from the suggestions.
                        </p>
                    )}

                    <h3>Concept coverage</h3>
                    {[...new Set(paper.map((q) => q.topic))].map((t) => (
                        <div className="coverage" key={t}>
                            <span>{t}</span>
                            <b>{paper.filter((q) => q.topic === t).length}</b>
                        </div>
                    ))}

                    <div className="print-controls">
                        <Button
                            disabled={!paper.length || saving}
                            onClick={saveTest}
                        >
                            <Check size={16} />
                            {saving
                                ? "Saving to AWS…"
                                : savedTestId
                                    ? "Update saved test"
                                    : "Save test to AWS"}
                        </Button>

                        {savedTestId && (
                            <small>
                                Saved test ID: {savedTestId}
                            </small>
                        )}
                        <Choice
                            label="Print document"
                            value={mode}
                            onChange={setMode}
                            options={['Question paper', 'Answer key', 'QR answer sheets']}
                        />

                        <Button disabled={!paper.length || busy} onClick={print}>
                            <Printer size={16} />
                            {busy ? 'Preparing…' : 'Preview & print'}
                        </Button>
                    </div>

                    <small>
                        QR sheets use random IDs. Student and test mappings stay in this browser until exported.
                    </small>

                    <Button
                        variant="link"
                        onClick={() => {
                            const s = localStorage.getItem('easestu-sheet-mapping');
                            if (s) download('sheet-mapping.json', s);
                            else notify('Prepare QR answer sheets first.');
                        }}
                    >
                        Export QR mapping
                    </Button>
                </aside>
            </div>

            {/* Question Editor Dialog */}
            <Dialog open={!!edit} onOpenChange={() => setEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Question editor</DialogTitle>
                        <DialogDescription>
                            Add a correct answer and concept for accurate scoring.
                        </DialogDescription>
                    </DialogHeader>

                    {edit && (
                        <form
                            className="question-form"
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (!edit.text.trim() || edit.options.some((x) => !x.trim())) return;

                                setSuggestions([
                                    ...suggestions.filter((q) => q.id !== edit.id),
                                    edit,
                                ]);

                                if (paper.some((q) => q.id === edit.id)) {
                                    setPaper(paper.map((q) => (q.id === edit.id ? edit : q)));
                                }

                                setEdit(null);
                                notify('Question saved. Add it to the paper when ready.');
                            }}
                        >
                            <label>
                                Question
                                <Textarea
                                    required
                                    value={edit.text}
                                    onChange={(e) => setEdit({ ...edit, text: e.target.value })}
                                />
                            </label>

                            {edit.options.map((o, j) => (
                                <label key={j}>
                                    Option {'ABCD'[j]}
                                    <Input
                                        required
                                        value={o}
                                        onChange={(e) =>
                                            setEdit({
                                                ...edit,
                                                options: edit.options.map((v, k) =>
                                                    k === j ? e.target.value : v
                                                ),
                                            })
                                        }
                                    />
                                </label>
                            ))}

                            <label>
                                Correct answer
                                <Choice
                                    label="Correct answer"
                                    value={'ABCD'[edit.answer]}
                                    options={['A', 'B', 'C', 'D']}
                                    onChange={(s) => setEdit({ ...edit, answer: 'ABCD'.indexOf(s) })}
                                />
                            </label>

                            <label>
                                Concept
                                <Choice
                                    label="Concept"
                                    value={edit.topic}
                                    options={topics}
                                    onChange={(s) => setEdit({ ...edit, topic: s })}
                                />
                            </label>

                            <label>
                                Explanation
                                <Input
                                    value={edit.explanation}
                                    onChange={(e) => setEdit({ ...edit, explanation: e.target.value })}
                                />
                            </label>

                            <Button type="submit">Save question</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Print Preview Area */}
            <div className="print-area">
                {mode === 'QR answer sheets' ? (
                    pages.map((s) => (
                        <section className="answer-page" key={s.id}>
                            <div className="print-header">
                                <div>
                                    <h1>{title}</h1>
                                    <p>
                                        {s.name} · Class 8A · Page 1 of 1
                                    </p>
                                    <p>Fill one circle completely for each question.</p>
                                </div>
                                <img src={s.qr} width="120" height="120" alt="Sheet identification QR" />
                            </div>

                            <p className="sheet-id">{s.id}</p>

                            {paper.map((q, i) => (
                                <div className="bubble-row" key={q.id}>
                                    <strong>{i + 1}</strong>
                                    {['A', 'B', 'C', 'D'].map((a) => (
                                        <span key={a}>
                                            {a}
                                            <i />
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </section>
                    ))
                ) : (
                    <section>
                        <h1>{title}</h1>
                        <p>
                            Class 8A · Science · {paper.length} marks
                        </p>

                        {paper.map((q, i) => (
                            <div className="print-question" key={q.id}>
                                <h3>
                                    {i + 1}. {q.text}
                                </h3>

                                {mode === 'Answer key' ? (
                                    <p>
                                        Answer: {'ABCD'[q.answer]} · {q.topic}
                                        <br />
                                        {q.explanation}
                                    </p>
                                ) : (
                                    q.options.map((o, j) => (
                                        <p key={j}>
                                            {'ABCD'[j]}. {o}
                                        </p>
                                    ))
                                )}
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </>
    );
}
