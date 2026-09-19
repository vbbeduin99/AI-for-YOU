import React, { useState } from 'react';
import {
  X,
  Clock,
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ExternalLink,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AppState, ModuleItem, ModuleProgressItem } from '../types';
import {
  PDF_OR_READING_LINKS,
  QUIZ_POOLS,
  VIDEO_LINKS,
  MODULES,
} from '../data';

interface ModuleDetailModalProps {
  module: ModuleItem;
  state: AppState;
  onClose: () => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  module,
  state,
  onClose,
  onUpdateState,
}) => {
  const progress: ModuleProgressItem = state.moduleProgress[module.id] || {
    status: 'not_started',
    quizScore: null,
    quizAttempts: 0,
    quizAnswers: {},
    notes: '',
  };

  const [notes, setNotes] = useState<string>(progress.notes || '');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(
    progress.quizAnswers || {}
  );
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(
    progress.quizScore !== null
  );

  const categoryVideos = VIDEO_LINKS[module.category] || [];
  const categoryPdf = PDF_OR_READING_LINKS[module.category];
  const quizQuestions = QUIZ_POOLS[module.category] || [];

  // "Why this matters" dynamic sentence
  const learnerRole = state.profile.jobTitle || state.profile.profession || 'professional';
  const whyThisMatters = `For a ${learnerRole}, mastering this allows you to ${module.outcome.toLowerCase()}`;

  // Prerequisites check
  const prereqDetails = module.prereq.map((preId) => {
    const preMod = MODULES.find((m) => m.id === preId);
    const isMet = state.moduleProgress[preId]?.status === 'completed';
    return { id: preId, title: preMod?.title || preId, isMet };
  });

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = scorePct >= 80; // >=80% marks 'completed', else 'practice_pending'

    const updatedItem: ModuleProgressItem = {
      status: passed ? 'completed' : 'practice_pending',
      quizScore: scorePct,
      quizAttempts: (progress.quizAttempts || 0) + 1,
      quizAnswers,
      notes,
      completedAt: passed ? new Date().toISOString() : progress.completedAt,
    };

    onUpdateState((prev) => ({
      ...prev,
      moduleProgress: {
        ...prev.moduleProgress,
        [module.id]: updatedItem,
      },
    }));

    setIsQuizSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setIsQuizSubmitted(false);
  };

  const handleSaveNotes = () => {
    onUpdateState((prev) => ({
      ...prev,
      moduleProgress: {
        ...prev.moduleProgress,
        [module.id]: {
          ...(prev.moduleProgress[module.id] || {
            status: 'not_started',
            quizScore: null,
            quizAttempts: 0,
            quizAnswers: {},
          }),
          notes,
        },
      },
    }));
  };

  const allQuizAnswered = Object.keys(quizAnswers).length === quizQuestions.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Sticky Header */}
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--panel)] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary)]">
                {module.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--line)] text-[var(--ink-soft)] font-medium">
                {module.level} • {module.hours} hrs
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent)] font-semibold uppercase tracking-wider">
                {module.category}
              </span>
              {progress.status === 'completed' && (
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--success-light)] text-[var(--success)] font-semibold inline-flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified ({progress.quizScore}%)</span>
                </span>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] leading-snug">
              {module.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-8 overflow-y-auto flex-1 text-[var(--ink)]">
          {/* Informational Prerequisite Banner */}
          {prereqDetails.length > 0 && (
            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 font-semibold text-[var(--ink)]">
                <Info className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Prerequisites (Informational Reference Only):</span>
              </div>
              <div className="flex flex-wrap gap-2 pl-5">
                {prereqDetails.map((pre) => (
                  <span
                    key={pre.id}
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded border ${
                      pre.isMet
                        ? 'border-[var(--success)] bg-[var(--success-light)] text-[var(--success)] font-medium'
                        : 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink-soft)]'
                    }`}
                  >
                    <span>{pre.id}: {pre.title}</span>
                    {pre.isMet && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contextual "Why This Matters" */}
          <div className="p-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-light)]/20 space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-[var(--primary)]">
              Relevance for your role
            </span>
            <p className="text-sm text-[var(--ink)] font-medium leading-relaxed">
              {whyThisMatters}
            </p>
          </div>

          {/* Core Lesson Text */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
                Core Conceptual Framework
              </h3>
            </div>
            <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] leading-relaxed text-sm sm:text-base text-[var(--ink)] space-y-3">
              <p>{module.lesson}</p>
            </div>
          </div>

          {/* Curated External Resources (Verified) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="font-display font-semibold text-base text-[var(--ink)]">
                  Verified Curated Domain Resources
                </h3>
              </div>
              <span className="text-[11px] text-[var(--ink-soft)]">Verified links • Open in new tab</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 2 Video Links */}
              {categoryVideos.map((vid, idx) => (
                <a
                  key={idx}
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--primary)] hover:bg-[var(--panel-subtle)] transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
                      <span className="inline-flex items-center space-x-1 font-semibold text-[var(--primary)]">
                        <Video className="w-3.5 h-3.5" />
                        <span>Curated Lecture {idx + 1}</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:text-[var(--primary)]" />
                    </div>
                    <p className="text-xs font-medium text-[var(--ink)] line-clamp-2">
                      {vid.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--ink-soft)]">
                    Domain reference video (shared across {module.category})
                  </span>
                </a>
              ))}
            </div>

            {/* Reading Resource or Honest Empty Slot */}
            <div className="pt-2">
              {categoryPdf ? (
                <a
                  href={categoryPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--primary)] transition-all block space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--primary)] inline-flex items-center space-x-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Verified Reading Guide / PDF</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:text-[var(--primary)] text-[var(--ink-soft)]" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink)]">
                    {categoryPdf.title}
                  </p>
                  <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
                    {categoryPdf.note}
                  </p>
                </a>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-subtle)] text-xs text-[var(--ink-soft)] flex items-start space-x-2">
                  <Info className="w-4 h-4 text-[var(--ink-soft)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[var(--ink)]">
                      No verified external reading guide attached yet for this domain.
                    </span>
                    <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                      Per application verification standards, non-verified URLs are omitted rather than fabricated. Rely on the core curriculum lesson and verified videos above.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Practical Assignment & Scratchpad */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-display font-semibold text-base text-[var(--ink)]">
                Practical Application Exercise
              </h3>
            </div>

            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3">
              <p className="text-sm font-medium text-[var(--ink)] leading-relaxed">
                <strong>Task:</strong> {module.task}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ink-soft)]">
                  Your Implementation Notes & Reflection (saved locally):
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  placeholder="Record your findings, tested prompt variations, or audit results here..."
                  className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 rounded bg-[var(--panel-subtle)] border border-[var(--line)] text-xs font-medium hover:bg-[var(--line)] text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Question Domain Quiz */}
          <div className="space-y-4 pt-4 border-t border-[var(--line)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
                  Knowledge Verification Quiz (5 Questions)
                </h3>
                <p className="text-xs text-[var(--ink-soft)]">
                  Requires ≥80% (at least 4/5 correct) to verify module completion. Unlimited retakes allowed.
                </p>
              </div>

              {isQuizSubmitted && (
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      (progress.quizScore ?? 0) >= 80
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : 'bg-[var(--warning-light)] text-[var(--warning)]'
                    }`}
                  >
                    Score: {progress.quizScore}% (
                    {(progress.quizScore ?? 0) >= 80 ? 'Passed' : 'Practice Pending'})
                  </span>
                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded border border-[var(--line)] text-xs font-medium hover:bg-[var(--panel-subtle)] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => {
                const userChoice = quizAnswers[qIdx];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[var(--ink)]">
                        {qIdx + 1}. {q.text}
                      </h4>
                      {isQuizSubmitted && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                            isCorrect
                              ? 'bg-[var(--success-light)] text-[var(--success)]'
                              : 'bg-[var(--danger-light)] text-[var(--danger)]'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        let optionStyle = 'border-[var(--line)] bg-[var(--panel)]';

                        if (isQuizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'border-[var(--success)] bg-[var(--success-light)]/40 font-medium text-[var(--success)]';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-[var(--danger)] bg-[var(--danger-light)]/40 font-medium text-[var(--danger)]';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-[var(--primary)] bg-[var(--primary-light)]/40 font-medium text-[var(--primary)]';
                        }

                        return (
                          <label
                            key={optIdx}
                            onClick={() => !isQuizSubmitted && handleSelectQuizOption(qIdx, optIdx)}
                            className={`flex items-start space-x-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${optionStyle}`}
                          >
                            <input
                              type="radio"
                              name={`quiz-${module.id}-${qIdx}`}
                              checked={isSelected}
                              disabled={isQuizSubmitted}
                              onChange={() => {}}
                              className="mt-0.5 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <span className="leading-normal">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {!isQuizSubmitted && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  {...(allQuizAnswered ? {} : { disabled: true })}
                  className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium shadow transition-colors ${
                    allQuizAnswered
                      ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] cursor-pointer'
                      : 'bg-[var(--line)] text-[var(--ink-soft)] opacity-60 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {allQuizAnswered
                      ? 'Submit Quiz for Verification'
                      : `Answer all 5 questions (${Object.keys(quizAnswers).length}/5)`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--line)] bg-[var(--panel-subtle)] flex items-center justify-between shrink-0">
          <span className="text-xs text-[var(--ink-soft)]">
            Module {module.id} • AI Skill Architect Catalog
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-xs font-medium text-[var(--ink)] hover:bg-[var(--line)]/50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
