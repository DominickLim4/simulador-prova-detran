"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  GraduationCap,
  HeartPulse,
  History,
  Home,
  Leaf,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Timer,
  Trophy,
  UserRound,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CATEGORY_LABELS,
  CATEGORY_SHORT_LABELS,
  CATEGORY_STYLES,
  EXAM_DURATION_SECONDS,
  TOTAL_EXAM_QUESTIONS,
  type Category,
  type ExamSession,
  type StoredExamResult,
} from "@/lib/types";

type View = "home" | "exam" | "result" | "history" | "dashboard" | "study";
type ResultFilter = "all" | "wrong" | "right";
type StatusFilter = "all" | "approved" | "failed";

const HISTORY_KEY = "detran-simulado-history-v1";
const NAME_KEY = "detran-simulado-candidate-name";

const navItems: Array<{ id: Exclude<View, "exam" | "result">; label: string; icon: LucideIcon }> = [
  { id: "home", label: "Início", icon: Home },
  { id: "history", label: "Histórico", icon: History },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "study", label: "Estudar", icon: BookOpen },
];

const studyResources: Array<{
  category: Category;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    category: "LEGISLACAO",
    title: "Código de Trânsito Brasileiro",
    description: "Lei 9.503/1997 compilada no Planalto.",
    href: "https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm",
    icon: FileText,
  },
  {
    category: "LEGISLACAO",
    title: "Resolução CONTRAN 168/2004",
    description: "Formação de condutores e estrutura do processo de habilitação.",
    href: "https://www.gov.br/transportes/pt-br/centrais-de-conteudo/resolucao-contran-168-04-compilada-pdf/view",
    icon: GraduationCap,
  },
  {
    category: "LEGISLACAO",
    title: "Manuais Brasileiros de Sinalização",
    description: "Volumes oficiais de sinalização vertical, horizontal e semafórica.",
    href: "https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito",
    icon: CarFront,
  },
  {
    category: "DIRECAO_DEFENSIVA",
    title: "Educação para o Trânsito PRF",
    description: "Materiais e ações educativas da Polícia Rodoviária Federal.",
    href: "https://www.gov.br/prf/pt-br/seguranca-viaria/educacao-para-o-transito",
    icon: ShieldCheck,
  },
  {
    category: "DIRECAO_DEFENSIVA",
    title: "SENATRAN",
    description: "Portal da Secretaria Nacional de Trânsito.",
    href: "https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/",
    icon: Gauge,
  },
  {
    category: "PRIMEIROS_SOCORROS",
    title: "SAMU 192",
    description: "Referência pública para urgência e atendimento pré-hospitalar.",
    href: "https://www.gov.br/saude/pt-br/composicao/saes/samu-192",
    icon: HeartPulse,
  },
  {
    category: "MEIO_AMBIENTE_CIDADANIA",
    title: "CONAMA",
    description: "Conselho Nacional do Meio Ambiente.",
    href: "https://www.gov.br/mma/pt-br/composicao/conama",
    icon: Leaf,
  },
  {
    category: "MECANICA",
    title: "Noções de funcionamento do veículo",
    description: "Base institucional para revisar manutenção e segurança veicular.",
    href: "https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/",
    icon: Wrench,
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}min ${String(seconds).padStart(2, "0")}s`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function readHistory(): StoredExamResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(HISTORY_KEY);
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : [];

    return Array.isArray(parsedValue) ? (parsedValue as StoredExamResult[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: StoredExamResult[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getInitialName() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(NAME_KEY) ?? "";
}

function metricValue(value: number, suffix = "") {
  return Number.isFinite(value) ? `${value}${suffix}` : `0${suffix}`;
}

function computeQuickStats(history: StoredExamResult[]) {
  const total = history.length;
  const approved = history.filter((exam) => exam.aprovado).length;
  const totalScore = history.reduce((sum, exam) => sum + exam.totalAcertos, 0);
  const best = history.reduce((max, exam) => Math.max(max, exam.totalAcertos), 0);

  return {
    total,
    approvalRate: total === 0 ? 0 : Math.round((approved / total) * 100),
    average: total === 0 ? 0 : Number((totalScore / total).toFixed(1)),
    best,
  };
}

function getRecentQuestionIds(history: StoredExamResult[], candidateName: string) {
  const normalizedName = candidateName.trim().toLowerCase();

  return history
    .filter((exam) => exam.nomeCandidato.trim().toLowerCase() === normalizedName)
    .slice(0, 2)
    .flatMap((exam) => exam.questoesIds);
}

function byDateDesc(a: StoredExamResult, b: StoredExamResult) {
  return new Date(b.dataFim).getTime() - new Date(a.dataFim).getTime();
}

function buildCategoryChart(history: StoredExamResult[]) {
  const totals = new Map<Category, { total: number; acertos: number }>();

  history.forEach((exam) => {
    exam.desempenhoPorCategoria.forEach((item) => {
      const current = totals.get(item.categoria) ?? { total: 0, acertos: 0 };
      totals.set(item.categoria, {
        total: current.total + item.total,
        acertos: current.acertos + item.acertos,
      });
    });
  });

  return Array.from(totals.entries()).map(([categoria, item]) => ({
    categoria,
    name: CATEGORY_SHORT_LABELS[categoria],
    acertos: item.total === 0 ? 0 : Math.round((item.acertos / item.total) * 100),
  }));
}

function buildSubjectPerformance(history: StoredExamResult[]) {
  const subjects = new Map<
    string,
    {
      assunto: string;
      categoria: Category;
      total: number;
      acertos: number;
      linkEstudo: string;
    }
  >();

  history.forEach((exam) => {
    exam.revisao.forEach((question) => {
      const key = `${question.categoria}:${question.assunto}`;
      const current = subjects.get(key) ?? {
        assunto: question.assunto,
        categoria: question.categoria,
        total: 0,
        acertos: 0,
        linkEstudo: question.linkEstudo,
      };

      subjects.set(key, {
        ...current,
        total: current.total + 1,
        acertos: current.acertos + (question.correta ? 1 : 0),
      });
    });
  });

  return Array.from(subjects.values()).map((subject) => ({
    ...subject,
    percentual:
      subject.total === 0 ? 0 : Math.round((subject.acertos / subject.total) * 100),
  }));
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600",
        className
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
        className
      )}
    >
      {children}
    </button>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "sky",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "sky" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cx("grid size-10 place-items-center rounded-lg", tones[tone])}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        CATEGORY_STYLES[category]
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function AppHeader({
  activeView,
  onNavigate,
}: {
  activeView: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex min-h-11 items-center gap-3 self-start rounded-lg pr-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          aria-label="Ir para o início"
        >
          <span className="grid size-10 place-items-center rounded-lg bg-slate-950 text-white">
            <CarFront aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block text-base font-bold text-slate-950">Simulado DETRAN</span>
            <span className="block text-xs font-medium text-slate-500">CNH primeira habilitação</span>
          </span>
        </button>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cx(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <Icon aria-hidden="true" className="mx-auto size-10 text-slate-400" />
      <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function HomeView({
  candidateName,
  onCandidateNameChange,
  onStart,
  isStarting,
  history,
}: {
  candidateName: string;
  onCandidateNameChange: (value: string) => void;
  onStart: () => void;
  isStarting: boolean;
  history: StoredExamResult[];
}) {
  const stats = useMemo(() => computeQuickStats(history), [history]);
  const latestExam = history[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-700">
                Prova teórica DETRAN
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                Simulado fiel ao formato oficial de 30 questões.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                60 minutos, aprovação com 21 acertos e distribuição por disciplina.
              </p>
            </div>
            <div className="grid w-full grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center sm:w-auto sm:min-w-[300px]">
              <div className="min-w-0 rounded-md bg-white px-2 py-2">
                <p className="text-lg font-bold text-slate-950">30</p>
                <p className="break-words text-xs leading-tight text-slate-500">questões</p>
              </div>
              <div className="min-w-0 rounded-md bg-white px-2 py-2">
                <p className="text-lg font-bold text-slate-950">60</p>
                <p className="break-words text-xs leading-tight text-slate-500">minutos</p>
              </div>
              <div className="min-w-0 rounded-md bg-white px-2 py-2">
                <p className="text-lg font-bold text-slate-950">70%</p>
                <p className="break-words text-xs leading-tight text-slate-500">aprovação</p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Qual seu nome?
              </span>
              <span className="relative block">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={candidateName}
                  onChange={(event) => onCandidateNameChange(event.target.value)}
                  className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Digite seu nome"
                  autoComplete="name"
                />
              </span>
            </label>
            <PrimaryButton
              onClick={onStart}
              disabled={isStarting}
              className="self-end px-6"
              ariaLabel="Iniciar simulado"
            >
              {isStarting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Gerando prova
                </>
              ) : (
                <>
                  <Play aria-hidden="true" className="size-5" />
                  Iniciar Simulado
                </>
              )}
            </PrimaryButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <MetricCard icon={FileText} label="Provas realizadas" value={String(stats.total)} />
          <MetricCard
            icon={CheckCircle2}
            label="Taxa de aprovação"
            value={metricValue(stats.approvalRate, "%")}
            tone="emerald"
          />
          <MetricCard
            icon={Trophy}
            label="Melhor pontuação"
            value={`${stats.best}/${TOTAL_EXAM_QUESTIONS}`}
            tone="amber"
          />
          {latestExam ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Última prova</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">
                    {latestExam.totalAcertos}/{TOTAL_EXAM_QUESTIONS}
                  </p>
                  <p className="text-sm text-slate-500">{formatDate(latestExam.dataFim)}</p>
                </div>
                <span
                  className={cx(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    latestExam.aprovado
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  )}
                >
                  {latestExam.aprovado ? "Aprovado" : "Reprovado"}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

function ExamView({
  exam,
  answers,
  currentIndex,
  remainingSeconds,
  isSubmitting,
  onSelectAnswer,
  onChangeQuestion,
  onSubmit,
}: {
  exam: ExamSession;
  answers: Record<string, string | null>;
  currentIndex: number;
  remainingSeconds: number;
  isSubmitting: boolean;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onChangeQuestion: (index: number) => void;
  onSubmit: (autoSubmit?: boolean) => void;
}) {
  const currentQuestion = exam.questoes[currentIndex];
  const answeredCount = exam.questoesIds.filter((id) => answers[id]).length;
  const progress = Math.round((answeredCount / TOTAL_EXAM_QUESTIONS) * 100);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-slate-950 text-white">
              <Timer aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">{exam.nomeCandidato}</p>
              <p className="text-base font-bold text-slate-950">
                Questão {currentIndex + 1} de {TOTAL_EXAM_QUESTIONS}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={cx(
                "inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold",
                remainingSeconds <= 300
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-slate-50 text-slate-800"
              )}
              aria-live="polite"
            >
              <Clock3 aria-hidden="true" className="size-4" />
              {formatSeconds(remainingSeconds)}
            </div>
            <PrimaryButton
              onClick={() => onSubmit(false)}
              disabled={isSubmitting}
              className="bg-slate-950 hover:bg-slate-800"
            >
              {isSubmitting ? "Finalizando" : "Finalizar"}
            </PrimaryButton>
          </div>
        </div>
        <div className="h-2 bg-slate-200">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CategoryBadge category={currentQuestion.categoria} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {currentQuestion.assunto}
            </span>
          </div>

          {currentQuestion.imagem_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentQuestion.imagem_url}
              alt=""
              className="mt-5 max-h-56 w-full rounded-lg border border-slate-200 object-contain"
            />
          ) : null}

          <h1 className="mt-5 text-xl font-bold leading-8 text-slate-950 sm:text-2xl">
            {currentQuestion.enunciado}
          </h1>

          <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Alternativas">
            {currentQuestion.alternativas.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onSelectAnswer(currentQuestion.id, option.id)}
                  className={cx(
                    "flex min-h-14 w-full items-start gap-3 rounded-lg border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                    selected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50"
                  )}
                >
                  <span
                    className={cx(
                      "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                      selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="pt-1 text-sm leading-6 text-slate-800 sm:text-base">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <SecondaryButton
              onClick={() => onChangeQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Anterior
            </SecondaryButton>
            {currentIndex === TOTAL_EXAM_QUESTIONS - 1 ? (
              <PrimaryButton onClick={() => onSubmit(false)} disabled={isSubmitting}>
                <CheckCircle2 aria-hidden="true" className="size-4" />
                Finalizar
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => onChangeQuestion(currentIndex + 1)}>
                Próxima
                <ChevronRight aria-hidden="true" className="size-4" />
              </PrimaryButton>
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-950">Mapa da prova</p>
              <p className="text-xs text-slate-500">
                {answeredCount}/{TOTAL_EXAM_QUESTIONS} respondidas
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {progress}%
            </span>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2 lg:grid-cols-5">
            {exam.questoes.map((question, index) => {
              const answered = Boolean(answers[question.id]);
              const current = index === currentIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => onChangeQuestion(index)}
                  aria-label={`Ir para questão ${index + 1}`}
                  className={cx(
                    "grid aspect-square min-h-11 place-items-center rounded-lg border text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                    current
                      ? "border-slate-950 bg-slate-950 text-white"
                      : answered
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-500 hover:border-sky-300"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
  );
}

function ResultView({
  result,
  onRestart,
  onHome,
}: {
  result: StoredExamResult;
  onRestart: () => void;
  onHome: () => void;
}) {
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(
    result.revisao.find((question) => !question.correta)?.id ?? result.revisao[0]?.id ?? null
  );
  const filteredQuestions = result.revisao.filter((question) => {
    if (filter === "wrong") {
      return !question.correta;
    }

    if (filter === "right") {
      return question.correta;
    }

    return true;
  });
  const chartData = result.desempenhoPorCategoria.map((item) => ({
    name: CATEGORY_SHORT_LABELS[item.categoria],
    acertos: item.percentual,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
    >
      <div
        className={cx(
          "rounded-lg border p-5 shadow-sm sm:p-6",
          result.aprovado
            ? "border-emerald-200 bg-emerald-50"
            : "border-rose-200 bg-rose-50"
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={cx(
                "grid size-12 shrink-0 place-items-center rounded-lg text-white",
                result.aprovado ? "bg-emerald-600" : "bg-rose-600"
              )}
            >
              {result.aprovado ? (
                <CheckCircle2 aria-hidden="true" className="size-7" />
              ) : (
                <XCircle aria-hidden="true" className="size-7" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold uppercase text-slate-600">
                Resultado de {result.nomeCandidato}
              </p>
              <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
                {result.aprovado ? "APROVADO" : "REPROVADO"}
              </h1>
              <p className="mt-2 text-base text-slate-700">
                {result.totalAcertos}/{TOTAL_EXAM_QUESTIONS} acertos em{" "}
                {formatDuration(result.tempoGastoSegundos)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <PrimaryButton onClick={onRestart}>
              <RotateCcw aria-hidden="true" className="size-4" />
              Refazer outro simulado
            </PrimaryButton>
            <SecondaryButton onClick={onHome}>Voltar ao menu</SecondaryButton>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Resumo</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard
              icon={CheckCircle2}
              label="Acertos"
              value={String(result.totalAcertos)}
              tone="emerald"
            />
            <MetricCard
              icon={XCircle}
              label="Erros"
              value={String(TOTAL_EXAM_QUESTIONS - result.totalAcertos)}
              tone="rose"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Acerto por categoria</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Acerto"]} />
                <Bar dataKey="acertos" radius={[6, 6, 0, 0]} fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-950">Revisão das questões</h2>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtro de revisão">
            {[
              ["all", "Ver todas"],
              ["wrong", "Só erradas"],
              ["right", "Só certas"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id as ResultFilter)}
                className={cx(
                  "min-h-10 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                  filter === id
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {filteredQuestions.map((question, index) => {
            const isOpen = openQuestionId === question.id;

            return (
              <article
                key={question.id}
                className="rounded-lg border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenQuestionId(isOpen ? null : question.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cx(
                        "grid size-8 place-items-center rounded-full text-sm font-bold text-white",
                        question.correta ? "bg-emerald-600" : "bg-rose-600"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-950">
                        {question.assunto}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {CATEGORY_LABELS[question.categoria]}
                      </span>
                    </span>
                  </span>
                  {question.correta ? (
                    <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-600" />
                  ) : (
                    <XCircle aria-hidden="true" className="size-5 text-rose-600" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-200"
                    >
                      <div className="p-4">
                        <p className="text-base font-semibold leading-7 text-slate-950">
                          {question.enunciado}
                        </p>
                        <div className="mt-4 grid gap-2">
                          {question.alternativas.map((option) => {
                            const isCorrect = option.label === question.respostaCorreta;
                            const wasSelected = option.label === question.alternativaMarcada;

                            return (
                              <div
                                key={option.label}
                                className={cx(
                                  "rounded-lg border p-3 text-sm leading-6",
                                  isCorrect
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                    : wasSelected
                                      ? "border-rose-300 bg-rose-50 text-rose-900"
                                      : "border-slate-200 bg-slate-50 text-slate-700"
                                )}
                              >
                                <span className="font-bold">{option.label}.</span>{" "}
                                {option.text}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 rounded-lg bg-slate-50 p-4">
                          <p className="text-sm font-bold text-slate-950">Explicação</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {question.explicacao}
                          </p>
                          <a
                            href={question.linkEstudo}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-bold text-sky-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                          >
                            Estudar este assunto
                            <ExternalLink aria-hidden="true" className="size-4" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function HistoryView({
  history,
  onViewDetails,
}: {
  history: StoredExamResult[];
  onViewDetails: (result: StoredExamResult) => void;
}) {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const filteredHistory = useMemo(() => {
    return [...history]
      .sort(byDateDesc)
      .filter((exam) =>
        exam.nomeCandidato.toLowerCase().includes(nameFilter.trim().toLowerCase())
      )
      .filter((exam) => {
        if (statusFilter === "approved") {
          return exam.aprovado;
        }

        if (statusFilter === "failed") {
          return !exam.aprovado;
        }

        return true;
      })
      .filter((exam) => {
        const examTime = new Date(exam.dataFim).getTime();
        const startsAfter = startDate
          ? examTime >= new Date(`${startDate}T00:00:00`).getTime()
          : true;
        const endsBefore = endDate
          ? examTime <= new Date(`${endDate}T23:59:59`).getTime()
          : true;

        return startsAfter && endsBefore;
      });
  }, [endDate, history, nameFilter, startDate, statusFilter]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-sky-700">Histórico</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Provas realizadas</h1>
        </div>
        <p className="text-sm text-slate-500">{filteredHistory.length} registro(s)</p>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_160px_160px]">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Nome</span>
          <span className="relative block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="Filtrar candidato"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">Todos</option>
            <option value="approved">Aprovado</option>
            <option value="failed">Reprovado</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Início</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Fim</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3">
        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nenhuma prova encontrada"
            description="Quando um simulado for finalizado, ele aparecerá aqui com revisão completa."
          />
        ) : (
          filteredHistory.map((exam) => (
            <article
              key={exam.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-2 sm:grid-cols-[180px_120px_130px_1fr] sm:items-center">
                  <div>
                    <p className="font-bold text-slate-950">{exam.nomeCandidato}</p>
                    <p className="text-sm text-slate-500">{formatDate(exam.dataFim)}</p>
                  </div>
                  <p className="font-bold text-slate-950">
                    {exam.totalAcertos}/{TOTAL_EXAM_QUESTIONS}
                  </p>
                  <span
                    className={cx(
                      "w-fit rounded-full px-3 py-1 text-xs font-bold",
                      exam.aprovado
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    )}
                  >
                    {exam.aprovado ? "Aprovado" : "Reprovado"}
                  </span>
                  <p className="text-sm text-slate-500">
                    Tempo: {formatDuration(exam.tempoGastoSegundos)}
                  </p>
                </div>
                <SecondaryButton onClick={() => onViewDetails(exam)}>
                  Ver detalhes
                  <ChevronRight aria-hidden="true" className="size-4" />
                </SecondaryButton>
              </div>
            </article>
          ))
        )}
      </div>
    </motion.section>
  );
}

function DashboardView({
  history,
  onStudy,
  onStart,
}: {
  history: StoredExamResult[];
  onStudy: () => void;
  onStart: () => void;
}) {
  const stats = useMemo(() => computeQuickStats(history), [history]);
  const categoryData = useMemo(() => buildCategoryChart(history), [history]);
  const subjectData = useMemo(() => buildSubjectPerformance(history), [history]);
  const evolutionData = useMemo(
    () =>
      [...history]
        .sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime())
        .map((exam, index) => ({
          name: `${index + 1}`,
          acertos: exam.totalAcertos,
          data: formatDate(exam.dataFim),
        })),
    [history]
  );
  const bestSubjects = useMemo(
    () => [...subjectData].sort((a, b) => b.percentual - a.percentual).slice(0, 5),
    [subjectData]
  );
  const worstSubjects = useMemo(
    () =>
      [...subjectData]
        .sort((a, b) => a.percentual - b.percentual || b.total - a.total)
        .slice(0, 5),
    [subjectData]
  );

  if (history.length === 0) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <EmptyState
          icon={BarChart3}
          title="Dashboard aguardando dados"
          description="Finalize um simulado para liberar os gráficos de categoria, tópicos e evolução."
          action={
            <PrimaryButton onClick={onStart}>
              <Play aria-hidden="true" className="size-4" />
              Iniciar Simulado
            </PrimaryButton>
          }
        />
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase text-sky-700">Dashboard</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Desempenho real</h1>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={FileText} label="Total de provas" value={String(stats.total)} />
        <MetricCard
          icon={CheckCircle2}
          label="Taxa de aprovação"
          value={metricValue(stats.approvalRate, "%")}
          tone="emerald"
        />
        <MetricCard
          icon={Gauge}
          label="Média de acertos"
          value={String(stats.average)}
          tone="sky"
        />
        <MetricCard
          icon={Trophy}
          label="Melhor pontuação"
          value={`${stats.best}/${TOTAL_EXAM_QUESTIONS}`}
          tone="amber"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Taxa de acerto por categoria</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Acerto"]} />
                <Bar dataKey="acertos" radius={[6, 6, 0, 0]}>
                  {categoryData.map((item) => (
                    <Cell key={item.categoria} fill="#0284c7" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Evolução das pontuações</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  domain={[0, TOTAL_EXAM_QUESTIONS]}
                />
                <Tooltip
                  formatter={(value) => [`${value}/${TOTAL_EXAM_QUESTIONS}`, "Pontuação"]}
                  labelFormatter={(_, payload) => payload[0]?.payload?.data ?? ""}
                />
                <Line
                  type="monotone"
                  dataKey="acertos"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <SubjectList title="Top 5 assuntos com maior acerto" subjects={bestSubjects} tone="good" />
        <SubjectList title="Top 5 assuntos com menor acerto" subjects={worstSubjects} tone="bad" />
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500 text-white">
              <AlertTriangle aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recomendações</h2>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Você precisa estudar mais:{" "}
                {worstSubjects.length > 0
                  ? worstSubjects.slice(0, 3).map((subject) => subject.assunto).join(", ")
                  : "continue realizando simulados para calibrar os tópicos."}
              </p>
            </div>
          </div>
          <SecondaryButton onClick={onStudy} className="border-amber-300 bg-white">
            Abrir Estudar
          </SecondaryButton>
        </div>
      </div>
    </motion.section>
  );
}

function SubjectList({
  title,
  subjects,
  tone,
}: {
  title: string;
  subjects: Array<{
    assunto: string;
    categoria: Category;
    total: number;
    acertos: number;
    percentual: number;
    linkEstudo: string;
  }>;
  tone: "good" | "bad";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {subjects.length === 0 ? (
          <p className="text-sm text-slate-500">Sem dados suficientes.</p>
        ) : (
          subjects.map((subject) => (
            <a
              key={`${subject.categoria}:${subject.assunto}:${tone}`}
              href={subject.linkEstudo}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 p-3 transition hover:border-sky-300 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{subject.assunto}</p>
                  <p className="text-xs text-slate-500">
                    {CATEGORY_LABELS[subject.categoria]} · {subject.acertos}/{subject.total}
                  </p>
                </div>
                <span
                  className={cx(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    tone === "good"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  )}
                >
                  {subject.percentual}%
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function StudyView() {
  const groupedResources = studyResources.reduce(
    (acc, resource) => {
      acc[resource.category] = [...(acc[resource.category] ?? []), resource];
      return acc;
    },
    {} as Record<Category, typeof studyResources>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase text-emerald-700">Estudar</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Materiais por categoria</h1>
      </div>

      <div className="mt-5 grid gap-5">
        {Object.entries(groupedResources).map(([category, resources]) => (
          <section key={category} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">
                {CATEGORY_LABELS[category as Category]}
              </h2>
              <CategoryBadge category={category as Category} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => {
                const Icon = resource.icon;

                return (
                  <article
                    key={resource.href}
                    className="flex h-full flex-col rounded-lg border border-slate-200 p-4"
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-slate-950">
                      {resource.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                      {resource.description}
                    </p>
                    <a
                      href={resource.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                    >
                      Acessar
                      <ExternalLink aria-hidden="true" className="size-4" />
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </motion.section>
  );
}

export function DetranApp() {
  const [view, setView] = useState<View>("home");
  const [candidateName, setCandidateName] = useState("");
  const [history, setHistory] = useState<StoredExamResult[]>([]);
  const [exam, setExam] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [result, setResult] = useState<StoredExamResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const submitLockRef = useRef(false);
  const submitExamRef = useRef<(autoSubmit?: boolean) => void>(() => undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setCandidateName(getInitialName());
      setHistory(readHistory().sort(byDateDesc));
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3200);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (candidateName.trim()) {
      window.localStorage.setItem(NAME_KEY, candidateName.trim());
    }
  }, [candidateName]);

  const navigate = useCallback(
    (nextView: View) => {
      if (view === "exam") {
        const shouldLeave = window.confirm(
          "Sair do simulado atual? As respostas desta prova não serão salvas."
        );

        if (!shouldLeave) {
          return;
        }
      }

      setView(nextView);
    },
    [view]
  );

  const startExam = useCallback(async () => {
    const trimmedName = candidateName.trim();

    if (trimmedName.length < 2) {
      showToast("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    setIsStarting(true);

    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCandidato: trimmedName,
          recentQuestionIds: getRecentQuestionIds(history, trimmedName),
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar prova");
      }

      const generatedExam = (await response.json()) as ExamSession;
      const initialAnswers = Object.fromEntries(
        generatedExam.questoesIds.map((questionId) => [questionId, null])
      ) as Record<string, string | null>;

      setExam(generatedExam);
      setAnswers(initialAnswers);
      setCurrentIndex(0);
      setRemainingSeconds(generatedExam.tempoLimiteSegundos);
      setResult(null);
      setView("exam");
      showToast("Prova gerada com 30 questões.");
    } catch {
      showToast("Não foi possível gerar a prova agora.");
    } finally {
      setIsStarting(false);
    }
  }, [candidateName, history, showToast]);

  const submitExam = useCallback(
    async (autoSubmit = false) => {
      if (!exam || submitLockRef.current) {
        return;
      }

      const blankCount = exam.questoesIds.filter((questionId) => !answers[questionId]).length;

      if (!autoSubmit && blankCount > 0) {
        const shouldSubmit = window.confirm(
          `Ainda há ${blankCount} questão(ões) em branco. Finalizar mesmo assim?`
        );

        if (!shouldSubmit) {
          return;
        }
      }

      submitLockRef.current = true;
      setIsSubmitting(true);

      try {
        const timeSpent = EXAM_DURATION_SECONDS - remainingSeconds;
        const response = await fetch("/api/exams/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            nomeCandidato: exam.nomeCandidato,
            dataInicio: exam.dataInicio,
            questoesIds: exam.questoesIds,
            respostas: answers,
            tempoGastoSegundos: timeSpent,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao corrigir prova");
        }

        const correctedExam = (await response.json()) as StoredExamResult;
        const nextHistory = [correctedExam, ...history].sort(byDateDesc);

        setHistory(nextHistory);
        writeHistory(nextHistory);
        setResult(correctedExam);
        setExam(null);
        setView("result");
        showToast(autoSubmit ? "Tempo encerrado. Prova corrigida." : "Prova salva e corrigida.");

        if (correctedExam.aprovado) {
          void import("canvas-confetti").then(({ default: confetti }) => {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.7 },
            });
          });
        }
      } catch {
        showToast("Não foi possível finalizar a prova.");
      } finally {
        submitLockRef.current = false;
        setIsSubmitting(false);
      }
    },
    [answers, exam, history, remainingSeconds, showToast]
  );

  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  useEffect(() => {
    if (view !== "exam" || !exam || isSubmitting) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.setTimeout(() => submitExamRef.current(true), 0);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [exam, isSubmitting, view]);

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }, []);

  const showResultDetails = useCallback((selectedResult: StoredExamResult) => {
    setResult(selectedResult);
    setView("result");
  }, []);

  const restartFromResult = useCallback(() => {
    setView("home");
    void startExam();
  }, [startExam]);

  const activeView = view === "result" ? "history" : view;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {view !== "exam" ? <AppHeader activeView={activeView} onNavigate={navigate} /> : null}

      <AnimatePresence mode="wait">
        {view === "home" ? (
          <HomeView
            key="home"
            candidateName={candidateName}
            onCandidateNameChange={setCandidateName}
            onStart={startExam}
            isStarting={isStarting}
            history={history}
          />
        ) : null}

        {view === "exam" && exam ? (
          <ExamView
            key="exam"
            exam={exam}
            answers={answers}
            currentIndex={currentIndex}
            remainingSeconds={remainingSeconds}
            isSubmitting={isSubmitting}
            onSelectAnswer={selectAnswer}
            onChangeQuestion={setCurrentIndex}
            onSubmit={submitExam}
          />
        ) : null}

        {view === "result" && result ? (
          <ResultView
            key={result.id}
            result={result}
            onRestart={restartFromResult}
            onHome={() => setView("home")}
          />
        ) : null}

        {view === "history" ? (
          <HistoryView key="history" history={history} onViewDetails={showResultDetails} />
        ) : null}

        {view === "dashboard" ? (
          <DashboardView
            key="dashboard"
            history={history}
            onStudy={() => setView("study")}
            onStart={startExam}
          />
        ) : null}

        {view === "study" ? <StudyView key="study" /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            role="status"
            className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
