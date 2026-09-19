import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  ListOrdered,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import {
  AppState,
  UserProfile,
  UserPriorities,
  DiagnosticState,
  Question,
  ModuleItem,
} from '../types';
import {
  PROFESSION_OPTIONS,
  AI_EXPERIENCE_OPTIONS,
  TOOLS_USED_OPTIONS,
  TIME_AVAILABLE_OPTIONS,
  LEARNING_FORMAT_OPTIONS,
  OBJECTIVE_OPTIONS,
  PRIORITIES,
  DIMENSIONS,
} from '../data';
import {
  prepareDiagnosticQuestions,
  computeDimensionScores,
  computeOverallScore,
  computeRecommendations,
  calculateSchedule,
} from '../utils/engine';

interface AssessmentWizardProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenModule: (moduleId: string) => void;
  onNavigateToLibrary: () => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  state,
  onUpdateState,
  onOpenModule,
  onNavigateToLibrary,
}) => {
  // Step: 1 = Profile, 2 = Priorities, 3 = Diagnostic, 4 = Results, 5 = Pathway
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (state.diagnostic.submitted) return 4;
    if (state.priorities.selected.length > 0) return 3;
    if (state.profile.jobTitle && state.profile.profession) return 2;
    return 1;
  });

  // Local draft states
  const [profile, setProfile] = useState<UserProfile>(state.profile);
  const [priorities, setPriorities] = useState<UserPriorities>(state.priorities);
  const [answers, setAnswers] = useState<Record<string, number>>(state.diagnostic.answers);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Sync state if external changes happen
  useEffect(() => {
    setProfile(state.profile);
  }, [state.profile]);

  useEffect(() => {
    setPriorities(state.priorities);
  }, [state.priorities]);

  // Administered questions (prepared once priorities exist)
  const questions: Question[] = useMemo(() => {
    if (state.diagnostic.administered && state.diagnostic.administered.length === 24) {
      // Re-hydrate administered from existing state
      const prepared = prepareDiagnosticQuestions(priorities);
      // Ensure we match exact IDs if already stored
      return prepared;
    }
    return prepareDiagnosticQuestions(priorities);
  }, [priorities, state.diagnostic.administered]);

  // Step 1 Validation
  const isProfileValid = Boolean(
    profile.profession.trim() &&
    profile.jobTitle.trim() &&
    profile.responsibilities.trim() &&
    profile.aiExperience &&
    profile.timeAvailable &&
    profile.objective
  );

  // Step 2 Validation
  const isPrioritiesValid = priorities.selected.length >= 1;

  // Step 3 Validation: all 24 questions answered
  const answeredCount = Object.keys(answers).length;
  const isDiagnosticComplete = answeredCount === 24;

  const dimensionScores = useMemo(() => {
    return computeDimensionScores({
      administered: questions.map((q) => q.id),
      answers,
      submitted: state.diagnostic.submitted,
    });
  }, [questions, answers, state.diagnostic.submitted]);

  const overall = useMemo(() => {
    return computeOverallScore(dimensionScores);
  }, [dimensionScores]);

  const recommendations = useMemo(() => {
    return computeRecommendations(profile, priorities, dimensionScores);
  }, [profile, priorities, dimensionScores]);

  const schedule = useMemo(() => {
    return calculateSchedule(recommendations.map((r) => r.module), profile.timeAvailable);
  }, [recommendations, profile.timeAvailable]);

  // Handlers
  const handleSaveProfileAndProceed = () => {
    if (!isProfileValid) return;
    onUpdateState((prev) => ({ ...prev, profile }));
    setCurrentStep(2);
  };

  const handleTogglePriority = (priorityId: string) => {
    const isSel = priorities.selected.includes(priorityId);
    let newSelected: string[];
    let newRanked = [...priorities.ranked];

    if (isSel) {
      newSelected = priorities.selected.filter((id) => id !== priorityId);
      newRanked = newRanked.filter((id) => id !== priorityId);
    } else {
      newSelected = [...priorities.selected, priorityId];
    }

    const updated = { selected: newSelected, ranked: newRanked };
    setPriorities(updated);
    onUpdateState((prev) => ({ ...prev, priorities: updated }));
  };

  const handleSetRank = (rankIndex: 0 | 1 | 2, priorityId: string) => {
    const newRanked = [...priorities.ranked];
    // Remove if already in another rank
    const existingIndex = newRanked.indexOf(priorityId);
    if (existingIndex !== -1) {
      newRanked[existingIndex] = '';
    }
    newRanked[rankIndex] = priorityId;
    const cleaned = newRanked.filter(Boolean);
    const updated = { ...priorities, ranked: cleaned };
    setPriorities(updated);
    onUpdateState((prev) => ({ ...prev, priorities: updated }));
  };

  const handleStartDiagnostic = () => {
    if (!isPrioritiesValid) return;
    const qList = prepareDiagnosticQuestions(priorities);
    onUpdateState((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        administered: qList.map((q) => q.id),
      },
    }));
    setActiveQuestionIdx(0);
    setCurrentStep(3);
  };

  const handleSelectAnswer = (questionId: string, optionIdx: number) => {
    const newAnswers = { ...answers, [questionId]: optionIdx };
    setAnswers(newAnswers);
    onUpdateState((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        answers: newAnswers,
      },
    }));
  };

  const handleSubmitDiagnostic = () => {
    if (!isDiagnosticComplete) return;
    onUpdateState((prev) => ({
      ...prev,
      diagnostic: {
        administered: questions.map((q) => q.id),
        answers,
        submitted: true,
      },
    }));
    setCurrentStep(4);
  };

  const handleRetake = () => {
    if (window.confirm('Retake the diagnostic? This will clear your current answers to reassess your skills.')) {
      setAnswers({});
      setActiveQuestionIdx(0);
      onUpdateState((prev) => ({
        ...prev,
        diagnostic: {
          administered: [],
          answers: {},
          submitted: false,
        },
      }));
      setCurrentStep(3);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Wizard Step Progress Tracker */}
      <div className="border border-[var(--line)] bg-[var(--panel)] rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, label: 'Profile' },
            { step: 2, label: 'Priorities' },
            { step: 3, label: 'Diagnostic' },
            { step: 4, label: 'Results' },
            { step: 5, label: 'Pathway' },
          ].map((item) => {
            const isCurrent = currentStep === item.step;
            const isDone = currentStep > item.step || (item.step === 4 && state.diagnostic.submitted);
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step === 1) setCurrentStep(1);
                  else if (item.step === 2 && isProfileValid) setCurrentStep(2);
                  else if (item.step === 3 && isPrioritiesValid) setCurrentStep(3);
                  else if (item.step === 4 && state.diagnostic.submitted) setCurrentStep(4);
                  else if (item.step === 5 && state.diagnostic.submitted) setCurrentStep(5);
                }}
                className={`py-2 px-1 rounded-lg font-medium transition-all ${
                  isCurrent
                    ? 'bg-[var(--primary)] text-white font-semibold'
                    : isDone
                    ? 'bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--line)]'
                    : 'text-[var(--ink-soft)] opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{item.step}.</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PROFILE */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-10 space-y-8 shadow-xs">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              1. Professional Profile
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Specify your domain, daily responsibilities, and objective. Your library will automatically tailor itself to these parameters.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Your Name <span className="text-xs text-[var(--ink-soft)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Alex Rahman"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Profession */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Primary Profession / Industry <span className="text-[var(--danger)]">*</span>
                </label>
                <select
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select your profession</option>
                  {PROFESSION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Specific Job Title <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                placeholder="e.g. Senior Product Marketing Manager, Clinical Research Associate, Financial Analyst"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Daily Responsibilities */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Three Most Important Daily Responsibilities <span className="text-[var(--danger)]">*</span>
              </label>
              <textarea
                rows={3}
                value={profile.responsibilities}
                onChange={(e) => setProfile({ ...profile, responsibilities: e.target.value })}
                placeholder="e.g. 1. Analyzing quarterly sales trends across territories. 2. Drafting customer briefing reports. 3. Validating clinical trial trial datasets."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Self-reported AI Experience */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--panel-subtle)] border border-[var(--line)]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Current AI Experience Level <span className="text-[var(--danger)]">*</span>
                </label>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--line)] text-[var(--ink-soft)]">
                  Self-reported (never scored)
                </span>
              </div>
              <select
                value={profile.aiExperience}
                onChange={(e) => setProfile({ ...profile, aiExperience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select your experience level</option>
                {AI_EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Tools Used (Multiselect) */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--panel-subtle)] border border-[var(--line)]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  AI Tools You Have Used
                </label>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--line)] text-[var(--ink-soft)]">
                  Self-reported (never scored)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {TOOLS_USED_OPTIONS.map((tool) => {
                  const checked = profile.toolsUsed.includes(tool);
                  return (
                    <label
                      key={tool}
                      className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-medium'
                          : 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--line)]/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          let updated: string[];
                          if (e.target.checked) {
                            if (tool === 'None') updated = ['None'];
                            else updated = [...profile.toolsUsed.filter((t) => t !== 'None'), tool];
                          } else {
                            updated = profile.toolsUsed.filter((t) => t !== tool);
                          }
                          setProfile({ ...profile, toolsUsed: updated });
                        }}
                        className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="truncate">{tool}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Time Available & Objective */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Learning Time Available <span className="text-[var(--danger)]">*</span>
                </label>
                <select
                  value={profile.timeAvailable}
                  onChange={(e) => setProfile({ ...profile, timeAvailable: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {TIME_AVAILABLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--ink)]">
                  Primary Objective <span className="text-[var(--danger)]">*</span>
                </label>
                <select
                  value={profile.objective}
                  onChange={(e) => setProfile({ ...profile, objective: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select your main goal</option>
                  {OBJECTIVE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              id="profile-next-btn"
              type="button"
              onClick={handleSaveProfileAndProceed}
              {...(isProfileValid ? {} : { disabled: true })}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium shadow transition-colors ${
                isProfileValid
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] cursor-pointer'
                  : 'bg-[var(--line)] text-[var(--ink-soft)] opacity-60 cursor-not-allowed'
              }`}
            >
              <span>Continue to Priorities & Ranking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRIORITIES & RANKING */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-10 space-y-8 shadow-xs">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              2. Priorities & Weighted Ranking
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Select the professional tasks where AI assistance matters most to you. Rank your top 3 to calibrate recommendation weights (Rank 1 = weight 5, Rank 2 = weight 3, Rank 3 = weight 2).
            </p>
          </div>

          {/* Priorities Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--ink)]">
                Select Your Relevant Tasks ({priorities.selected.length} selected)
              </span>
              <span className="text-xs text-[var(--ink-soft)]">Click to select or deselect</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 border border-[var(--line)] rounded-xl p-3 bg-[var(--panel-subtle)]">
              {PRIORITIES.map((priority) => {
                const isSelected = priorities.selected.includes(priority.id);
                return (
                  <div
                    key={priority.id}
                    onClick={() => handleTogglePriority(priority.id)}
                    className={`p-3 rounded-lg border text-sm cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--panel)] shadow-xs'
                        : 'border-transparent bg-[var(--panel)]/70 hover:bg-[var(--panel)]'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-[var(--primary)]">
                          {priority.id}
                        </span>
                        <span className="font-medium text-[var(--ink)]">{priority.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {priority.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--line)] text-[var(--ink-soft)] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-[var(--line)]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 3 Ranking Section */}
          {priorities.selected.length > 0 && (
            <div className="space-y-4 p-5 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ListOrdered className="w-4 h-4 text-[var(--primary)]" />
                  <h4 className="font-semibold text-sm text-[var(--ink)]">
                    Rank Your Top 3 Priorities
                  </h4>
                </div>
                <p className="text-xs text-[var(--ink-soft)]">
                  These receive highest weight in your recommendation formula and determine adaptive diagnostic questions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { rank: 0, label: 'Rank 1 (Weight: 5x)', currentId: priorities.ranked[0] || '' },
                  { rank: 1, label: 'Rank 2 (Weight: 3x)', currentId: priorities.ranked[1] || '' },
                  { rank: 2, label: 'Rank 3 (Weight: 2x)', currentId: priorities.ranked[2] || '' },
                ].map((item) => (
                  <div key={item.rank} className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--ink)]">{item.label}</label>
                    <select
                      value={item.currentId}
                      onChange={(e) => handleSetRank(item.rank as 0 | 1 | 2, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--ink)]"
                    >
                      <option value="">Choose top priority</option>
                      {priorities.selected.map((pId) => {
                        const p = PRIORITIES.find((item) => item.id === pId);
                        return (
                          <option key={pId} value={pId}>
                            {p?.name || pId}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-[var(--line)] text-sm font-medium hover:bg-[var(--panel-subtle)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </button>

            <button
              id="priorities-next-btn"
              type="button"
              onClick={handleStartDiagnostic}
              {...(isPrioritiesValid ? {} : { disabled: true })}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium shadow transition-colors ${
                isPrioritiesValid
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] cursor-pointer'
                  : 'bg-[var(--line)] text-[var(--ink-soft)] opacity-60 cursor-not-allowed'
              }`}
            >
              <span>Begin 24-Question Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DIAGNOSTIC (24 Questions) */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-10 space-y-6 shadow-xs">
          {/* Header & Progress */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  3. Skill Diagnostic
                </h2>
                <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
                  Question {activeQuestionIdx + 1} of {questions.length} • 16 Core Foundations + 8 Priority-Targeted Questions
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  {answeredCount} / {questions.length} Answered
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[var(--primary)] h-full rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>

            {/* Jump Question Dots */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = activeQuestionIdx === idx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-7 h-7 rounded text-xs font-mono flex items-center justify-center transition-all ${
                      isActive
                        ? 'ring-2 ring-[var(--primary)] font-bold text-[var(--primary)] bg-[var(--panel)]'
                        : isAnswered
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                        : 'bg-[var(--panel-subtle)] text-[var(--ink-soft)] hover:bg-[var(--line)]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Container */}
          {questions[activeQuestionIdx] && (
            <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--line)] text-[var(--ink-soft)] font-semibold">
                  {questions[activeQuestionIdx].id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent)] font-semibold">
                  {DIMENSIONS.find((d) => d.id === questions[activeQuestionIdx].dimensionId)?.name ||
                    questions[activeQuestionIdx].dimensionId}
                </span>
                {questions[activeQuestionIdx].priorityId && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--warning-light)] text-[var(--warning)] font-medium">
                    Priority-Targeted ({questions[activeQuestionIdx].priorityId})
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-[var(--ink)] leading-relaxed">
                {questions[activeQuestionIdx].text}
              </h3>

              <div className="space-y-3 pt-2">
                {questions[activeQuestionIdx].options.map((opt, optIdx) => {
                  const isSelected = answers[questions[activeQuestionIdx].id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectAnswer(questions[activeQuestionIdx].id, optIdx)}
                      className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary-light)]/40 font-medium'
                          : 'border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--panel-subtle)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={questions[activeQuestionIdx].id}
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-sm text-[var(--ink)] leading-snug">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Navigation Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                {...(activeQuestionIdx === 0 ? { disabled: true } : {})}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg border border-[var(--line)] text-sm font-medium ${
                  activeQuestionIdx === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-[var(--panel-subtle)] cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))
                }
                {...(activeQuestionIdx === questions.length - 1 ? { disabled: true } : {})}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg border border-[var(--line)] text-sm font-medium ${
                  activeQuestionIdx === questions.length - 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-[var(--panel-subtle)] cursor-pointer'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              id="diagnostic-submit-btn"
              type="button"
              onClick={handleSubmitDiagnostic}
              {...(isDiagnosticComplete ? {} : { disabled: true })}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium shadow transition-colors ${
                isDiagnosticComplete
                  ? 'bg-[var(--success)] text-white hover:bg-[var(--success)]/90 cursor-pointer'
                  : 'bg-[var(--line)] text-[var(--ink-soft)] opacity-60 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isDiagnosticComplete
                  ? 'Submit All 24 Diagnostic Questions'
                  : `Answer all 24 questions (${answeredCount}/24)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTS */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-10 space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                4. Diagnostic Results & Analysis
              </h2>
              <p className="text-sm text-[var(--ink-soft)]">
                Scored strictly from administered scenario responses. Dimensions with 0 administered questions display as "Not assessed", never 0%.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)] transition-colors self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Diagnostic</span>
            </button>
          </div>

          {/* Overall Score Card */}
          {overall && (
            <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs uppercase font-medium tracking-wider text-[var(--ink-soft)]">
                  Overall Assessed Score
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display text-4xl font-bold text-[var(--ink)]">
                    {overall.overallPercentage}%
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-semibold">
                    {overall.band}
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] pt-1">
                  Average across all evaluated dimensions.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-medium tracking-wider text-[var(--success)] font-semibold">
                  Strengths Identified (≥70%)
                </span>
                {overall.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {overall.strengths.map((s) => (
                      <span
                        key={s.id}
                        className="text-xs px-2 py-0.5 rounded-md bg-[var(--success-light)] text-[var(--success)] font-medium"
                      >
                        {s.name} ({s.percentage}%)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--ink-soft)]">No dimensions ≥70% assessed yet.</p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-medium tracking-wider text-[var(--warning)] font-semibold">
                  Priority Skill Gaps (&lt;50%)
                </span>
                {overall.gaps.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {overall.gaps.map((g) => (
                      <span
                        key={g.id}
                        className="text-xs px-2 py-0.5 rounded-md bg-[var(--warning-light)] text-[var(--warning)] font-medium"
                      >
                        {g.name} ({g.percentage}%)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--ink-soft)]">No critical gaps &lt;50% assessed.</p>
                )}
              </div>
            </div>
          )}

          {/* 10-Dimension Breakdown Bars */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
              10-Dimension Skill Competency Profile
            </h3>

            <div className="space-y-2.5">
              {dimensionScores.map((dim) => {
                const isAssessed = dim.percentage !== null;
                return (
                  <div
                    key={dim.id}
                    className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="sm:w-1/3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-[var(--primary)]">
                          {dim.id}
                        </span>
                        <span className="text-sm font-medium text-[var(--ink)]">{dim.name}</span>
                      </div>
                      <span className="text-xs text-[var(--ink-soft)]">
                        {isAssessed
                          ? `${dim.correct} / ${dim.administered} questions correct`
                          : '0 questions administered in session'}
                      </span>
                    </div>

                    <div className="sm:w-1/2 flex items-center space-x-3">
                      {isAssessed ? (
                        <>
                          <div className="w-full bg-[var(--line)] h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                dim.percentage! >= 70
                                  ? 'bg-[var(--success)]'
                                  : dim.percentage! >= 40
                                  ? 'bg-[var(--primary)]'
                                  : 'bg-[var(--warning)]'
                              }`}
                              style={{ width: `${dim.percentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold w-10 text-right">
                            {dim.percentage}%
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-[var(--line)]/50 h-2 rounded-full" />
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--panel-subtle)] text-[var(--ink-soft)]">
                            Not assessed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Self-reported Background Card */}
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
                Self-Reported Context (Kept Independent from Score)
              </h4>
              <span className="text-[10px] text-[var(--ink-soft)]">Unscored profile metadata</span>
            </div>
            <div className="text-xs text-[var(--ink)] space-y-1">
              <p>
                <strong className="text-[var(--ink-soft)]">AI Experience:</strong>{' '}
                {profile.aiExperience || 'Not specified'}
              </p>
              <p>
                <strong className="text-[var(--ink-soft)]">Tools Encountered:</strong>{' '}
                {profile.toolsUsed.length > 0 ? profile.toolsUsed.join(', ') : 'None'}
              </p>
            </div>
          </div>

          {/* Footer Proceed to Pathway */}
          <div className="pt-4 flex justify-end">
            <button
              id="view-pathway-btn"
              type="button"
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium shadow hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
            >
              <span>View Your Recommended Pathway</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PERSONALIZED PATHWAY */}
      {currentStep === 5 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-10 space-y-8 shadow-xs">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              5. Personalized Learning Pathway
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Auditable pathway generated by our weighted formula: 35% priority relevance, 30% assessed skill gap, 20% priority rank weight, 10% career objective, and 5% learner preference.
            </p>
          </div>

          {/* Study Schedule Plan Header */}
          <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs text-[var(--ink-soft)] uppercase font-semibold">
                Modules in Pathway
              </span>
              <p className="font-display text-2xl font-bold text-[var(--ink)] mt-0.5">
                {recommendations.length}
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--ink-soft)] uppercase font-semibold">
                Total Study Time
              </span>
              <p className="font-display text-2xl font-bold text-[var(--ink)] mt-0.5">
                {schedule.totalHours} hrs
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--ink-soft)] uppercase font-semibold">
                Weekly Commitment
              </span>
              <p className="font-display text-2xl font-bold text-[var(--ink)] mt-0.5">
                {profile.timeAvailable}
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--ink-soft)] uppercase font-semibold">
                Estimated Duration
              </span>
              <p className="font-display text-2xl font-bold text-[var(--primary)] mt-0.5">
                ~{schedule.totalWeeks} {schedule.totalWeeks === 1 ? 'Week' : 'Weeks'}
              </p>
            </div>
          </div>

          {/* Recommended Modules List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
                Ordered Curriculum Sequence
              </h3>
              <span className="text-xs text-[var(--ink-soft)]">Includes full prerequisite closure</span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => {
                const isCompleted = state.moduleProgress[rec.module.id]?.status === 'completed';
                const isPending = state.moduleProgress[rec.module.id]?.status === 'practice_pending';
                return (
                  <div
                    key={rec.module.id}
                    className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--primary)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1.5 sm:w-2/3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary)]">
                          {rec.module.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--line)] text-[var(--ink-soft)] font-medium">
                          {rec.module.level} • {rec.module.hours}h
                        </span>
                        {rec.isPrerequisiteAddon && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--warning-light)] text-[var(--warning)] font-medium">
                            Prerequisite Foundation
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--success-light)] text-[var(--success)] font-semibold inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--warning-light)] text-[var(--warning)] font-medium">
                            Practice Pending
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-semibold text-[var(--ink)]">
                        {rec.module.title}
                      </h4>

                      {/* Transparent Human-Readable Reasons */}
                      <div className="space-y-0.5 pt-1">
                        {rec.reasons.map((r, rIdx) => (
                          <p key={rIdx} className="text-xs text-[var(--ink-soft)] flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                            <span>{r}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-3 sm:self-center">
                      <button
                        type="button"
                        onClick={() => onOpenModule(rec.module.id)}
                        className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Review' : 'Open Module'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Breakdown Collapsible Table */}
          <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              <h4 className="font-display font-semibold text-sm text-[var(--ink)]">
                Estimated Weekly Study Progression
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {schedule.weeks.map((w) => (
                <div
                  key={w.weekNumber}
                  className="p-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-[var(--ink)]">
                    <span>Week {w.weekNumber}</span>
                    <span className="text-[var(--ink-soft)] font-mono">{w.hours} hrs</span>
                  </div>
                  <ul className="space-y-1 text-[var(--ink-soft)]">
                    {w.modules.map((m) => (
                      <li key={m.id} className="truncate">
                        • {m.id}: {m.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg border border-[var(--line)] text-sm font-medium hover:bg-[var(--panel-subtle)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Results</span>
            </button>

            <button
              id="goto-library-btn"
              type="button"
              onClick={onNavigateToLibrary}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium shadow hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
            >
              <span>Explore Tailored Module Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
