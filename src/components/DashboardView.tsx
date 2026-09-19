import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Calendar,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { AppState, ModuleItem } from '../types';
import { MODULES } from '../data';
import {
  computeDimensionScores,
  computeOverallScore,
  computeRecommendations,
  calculateSchedule,
} from '../utils/engine';

interface DashboardViewProps {
  state: AppState;
  onNavigateToAssessment: () => void;
  onOpenModule: (moduleId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigateToAssessment,
  onOpenModule,
}) => {
  const isSubmitted = state.diagnostic.submitted;

  // Live calculation of 10 dimensions from state
  const dimensionScores = useMemo(() => {
    if (!isSubmitted) return [];
    return computeDimensionScores(state.diagnostic);
  }, [state.diagnostic, isSubmitted]);

  const overall = useMemo(() => {
    if (!isSubmitted) return null;
    return computeOverallScore(dimensionScores);
  }, [dimensionScores, isSubmitted]);

  // Pathway summary
  const recommendations = useMemo(() => {
    return computeRecommendations(state.profile, state.priorities, dimensionScores);
  }, [state.profile, state.priorities, dimensionScores]);

  const schedule = useMemo(() => {
    return calculateSchedule(
      recommendations.map((r) => r.module),
      state.profile.timeAvailable
    );
  }, [recommendations, state.profile.timeAvailable]);

  // Catalog completion calculation (independent of library filter!)
  const completedModules = useMemo(() => {
    return MODULES.filter((m) => state.moduleProgress[m.id]?.status === 'completed');
  }, [state.moduleProgress]);

  const completionPct = Math.round((completedModules.length / MODULES.length) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-2">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Learner Progress Center</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--ink)]">
          Executive Dashboard
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">
          Real-time competency tracking, catalog completion metrics, and practical assignment portfolio.
        </p>
      </div>

      {/* Primary KPI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Catalog Completion Bar */}
        <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-xs">
          <span className="text-xs uppercase font-semibold tracking-wider text-[var(--ink-soft)]">
            Total Catalog Progress
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-3xl font-bold text-[var(--ink)]">
              {completedModules.length}
            </span>
            <span className="text-sm text-[var(--ink-soft)] font-mono">
              / {MODULES.length} modules
            </span>
            <span className="text-xs font-semibold text-[var(--primary)] ml-auto">
              {completionPct}%
            </span>
          </div>
          <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[var(--primary)] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--ink-soft)]">
            Denominator = 24 catalog modules (unaffected by library filter)
          </p>
        </div>

        {/* Diagnostic Score KPI */}
        <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-xs">
          <span className="text-xs uppercase font-semibold tracking-wider text-[var(--ink-soft)]">
            Assessed AI Proficiency
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-3xl font-bold text-[var(--ink)]">
              {overall ? `${overall.overallPercentage}%` : '—'}
            </span>
            {overall && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-semibold truncate">
                {overall.band}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--ink-soft)]">
            {isSubmitted
              ? 'Derived from 24 objective scenario evaluations'
              : 'Diagnostic assessment not yet submitted'}
          </p>
        </div>

        {/* Pathway modules count */}
        <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-xs">
          <span className="text-xs uppercase font-semibold tracking-wider text-[var(--ink-soft)]">
            Targeted Pathway
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-3xl font-bold text-[var(--ink)]">
              {recommendations.length}
            </span>
            <span className="text-sm text-[var(--ink-soft)]">recommended modules</span>
          </div>
          <p className="text-[11px] text-[var(--ink-soft)]">
            {schedule.totalHours} total study hours required
          </p>
        </div>

        {/* Schedule timeline */}
        <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-2 shadow-xs">
          <span className="text-xs uppercase font-semibold tracking-wider text-[var(--ink-soft)]">
            Estimated Pace
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display text-3xl font-bold text-[var(--primary)]">
              ~{schedule.totalWeeks}
            </span>
            <span className="text-sm text-[var(--ink-soft)]">
              {schedule.totalWeeks === 1 ? 'week' : 'weeks'}
            </span>
          </div>
          <p className="text-[11px] text-[var(--ink-soft)]">
            Based on {state.profile.timeAvailable} commitment
          </p>
        </div>
      </div>

      {/* 10-Dimension Live Skill Bars OR Prompt Card */}
      <section className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">
              10-Dimension Skill Competency Breakdown
            </h2>
            <p className="text-xs text-[var(--ink-soft)]">
              Recomputed live from administered diagnostic answers.
            </p>
          </div>

          {isSubmitted && (
            <button
              onClick={onNavigateToAssessment}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--primary)] hover:underline self-start"
            >
              <span>Review full assessment breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isSubmitted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dimensionScores.map((dim) => {
              const isAssessed = dim.percentage !== null;
              return (
                <div
                  key={dim.id}
                  className="p-3 rounded-lg border border-[var(--line)] bg-[var(--panel-subtle)] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--ink)]">
                      <strong className="text-[var(--primary)] mr-1">{dim.id}</strong> {dim.name}
                    </span>
                    {isAssessed ? (
                      <span className="font-mono font-bold text-[var(--ink)]">
                        {dim.percentage}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--ink-soft)]">Not assessed</span>
                    )}
                  </div>

                  {isAssessed ? (
                    <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden">
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
                  ) : (
                    <div className="w-full bg-[var(--line)]/50 h-2 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-subtle)] space-y-3">
            <Sparkles className="w-8 h-8 text-[var(--primary)] mx-auto opacity-70" />
            <h3 className="font-display font-semibold text-base text-[var(--ink)]">
              Diagnostic Not Yet Completed
            </h3>
            <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto">
              Complete the 24-question objective diagnostic to generate your verified 10-dimension skill breakdown.
            </p>
            <button
              onClick={onNavigateToAssessment}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium shadow hover:bg-[var(--primary-hover)] cursor-pointer"
            >
              <span>Take 10-Dimension Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Pathway Summary Card with Weekly Schedule Plan */}
      <section className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">
              Personalized Pathway Study Schedule
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--primary-light)] text-[var(--primary)]">
            {recommendations.length} Modules • {schedule.totalHours} hrs Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {schedule.weeks.slice(0, 8).map((w) => (
            <div
              key={w.weekNumber}
              className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-[var(--ink)]">
                <span>Week {w.weekNumber}</span>
                <span className="text-[var(--primary)] font-mono">{w.hours}h</span>
              </div>
              <div className="space-y-1">
                {w.modules.map((m) => {
                  const isDone = state.moduleProgress[m.id]?.status === 'completed';
                  return (
                    <div
                      key={m.id}
                      onClick={() => onOpenModule(m.id)}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-[var(--panel)] cursor-pointer transition-colors"
                    >
                      <span className="truncate pr-1 text-[var(--ink)] font-medium">
                        {m.id}: {m.title}
                      </span>
                      {isDone && <CheckCircle2 className="w-3 h-3 text-[var(--success)] shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practice Portfolio: Completed Modules + Assignment Tasks */}
      <section className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">
              Practice Portfolio & Verification Log
            </h2>
            <p className="text-xs text-[var(--ink-soft)]">
              Documented practical assignment tasks and completed domain verifications.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--ink-soft)]">
            {completedModules.length} verified
          </span>
        </div>

        {completedModules.length > 0 ? (
          <div className="space-y-3">
            {completedModules.map((m) => {
              const progress = state.moduleProgress[m.id];
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 sm:w-3/4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--success-light)] text-[var(--success)]">
                        {m.id}
                      </span>
                      <h4 className="text-sm font-semibold text-[var(--ink)]">{m.title}</h4>
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                      <strong>Assignment:</strong> {m.task}
                    </p>
                    {progress?.notes && (
                      <div className="p-2 rounded bg-[var(--panel)] border border-[var(--line)] text-xs text-[var(--ink)] mt-1">
                        <strong>Your Notes:</strong> {progress.notes}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <span className="text-xs font-bold text-[var(--success)] px-2.5 py-1 rounded bg-[var(--panel)] border border-[var(--line)]">
                      {progress?.quizScore}% Quiz Pass
                    </span>
                    <button
                      onClick={() => onOpenModule(m.id)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-medium hover:bg-[var(--panel-subtle)] text-[var(--ink)] cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-[var(--line)] text-xs text-[var(--ink-soft)] space-y-1">
            <p className="font-medium text-[var(--ink)]">No modules completed yet.</p>
            <p>
              Open any module from the library, review the curriculum, and score ≥80% on the 5-question domain quiz to log your verified achievement.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
