import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Target,
  Brain,
  Layers,
  BookOpen,
  CheckCircle2,
  Filter,
  BarChart3,
  Award,
  Clock,
  Compass,
} from 'lucide-react';
import { AppState } from '../types';
import { DIMENSIONS, MODULES } from '../data';
import { computeDimensionScores, computeOverallScore } from '../utils/engine';
import { getTranslation } from '../utils/translations';

interface HomeViewProps {
  state: AppState;
  onNavigate: (screen: 'home' | 'assessment' | 'library' | 'dashboard') => void;
  onStartAssessment: () => void;
  onSelectModule: (moduleId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onNavigate,
  onStartAssessment,
  onSelectModule,
}) => {
  const lang = state.settings.language;
  const isSubmitted = state.diagnostic.submitted;
  const dimensionScores = isSubmitted ? computeDimensionScores(state.diagnostic) : [];
  const overall = isSubmitted ? computeOverallScore(dimensionScores) : null;

  const completedCount = Object.values(state.moduleProgress).filter(
    (p) => p.status === 'completed'
  ).length;

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-8 sm:p-12 shadow-sm">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profession-Agnostic AI Skill Architecture</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[var(--ink)] leading-[1.15]">
            {getTranslation('tagline', lang)}
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-soft)] leading-relaxed">
            Move beyond generic prompts and self-reported quizzes. Measure your capabilities
            across 10 objective AI skill dimensions, receive an auditable, transparently-weighted
            learning pathway, and explore a library tailored directly to your professional responsibilities.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-start-assessment-btn"
              onClick={onStartAssessment}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium shadow hover:bg-[var(--primary-hover)] transition-colors text-sm sm:text-base cursor-pointer"
            >
              <span>{isSubmitted ? 'Review Diagnostic & Pathway' : 'Start 10-Dimension Diagnostic'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-browse-library-btn"
              onClick={() => onNavigate('library')}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] font-medium hover:bg-[var(--panel-subtle)] transition-colors text-sm sm:text-base cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[var(--ink-soft)]" />
              <span>Browse Module Library ({MODULES.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Status Snippet if submitted */}
        {isSubmitted && overall && (
          <div className="mt-8 pt-8 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--panel-subtle)] border border-[var(--line)]">
              <span className="text-xs text-[var(--ink-soft)] font-medium uppercase tracking-wider">
                Overall Diagnostic
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold font-display text-[var(--ink)]">
                  {overall.overallPercentage}%
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-medium">
                  {overall.band}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--panel-subtle)] border border-[var(--line)]">
              <span className="text-xs text-[var(--ink-soft)] font-medium uppercase tracking-wider">
                Catalog Completion
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold font-display text-[var(--ink)]">
                  {completedCount} / {MODULES.length}
                </span>
                <span className="text-xs text-[var(--ink-soft)] font-medium">modules verified</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--panel-subtle)] border border-[var(--line)]">
              <span className="text-xs text-[var(--ink-soft)] font-medium uppercase tracking-wider">
                Learner Profile
              </span>
              <p className="text-sm font-semibold text-[var(--ink)] truncate mt-1">
                {state.profile.jobTitle || 'Role Configured'}
              </p>
              <p className="text-xs text-[var(--ink-soft)] truncate">
                {state.profile.profession || 'Custom domain'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
              System Architecture & Principles
            </h2>
            <p className="text-sm text-[var(--ink-soft)] mt-1">
              Built upon mathematical rigor, code-checked assessment, and honest domain curation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
              10-Dimension Real Diagnostic
            </h3>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              No self-assessed star ratings. A 24-question scenario assessment (16 core foundations + 8 priority-targeted questions) tests practical judgment, verification habits, data literacy, and security.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
              Tailored Default Library
            </h3>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              Avoid catalog overwhelm. The library default-filters to modules matching your profession and selected priorities, plus essential prerequisites. Toggle to see all 24 modules at any time.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[var(--warning-light)] text-[var(--warning)] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
              Transparent Recommendation Engine
            </h3>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              Every recommended module displays a clear reason for its inclusion based on an auditable formula: 35% priority relevance, 30% assessed skill gap, 20% task rank, 10% career goal, and 5% preference.
            </p>
          </div>
        </div>
      </section>

      {/* 10 Assessment Dimensions Preview */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
            Assessed Skill Dimensions
          </h2>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            The core competencies evaluated in every diagnostic session.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {DIMENSIONS.map((dim, idx) => {
            const scoreObj = dimensionScores.find((d) => d.id === dim.id);
            return (
              <div
                key={dim.id}
                className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] flex flex-col justify-between space-y-2 hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-soft)]">
                  <span>{dim.id}</span>
                  {scoreObj && scoreObj.percentage !== null && (
                    <span className="font-semibold text-[var(--primary)]">
                      {scoreObj.percentage}%
                    </span>
                  )}
                  {scoreObj && scoreObj.percentage === null && (
                    <span className="text-[10px] text-[var(--ink-soft)]">Unassessed</span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-[var(--ink)] leading-snug">
                  {dim.name}
                </h4>
                {scoreObj && scoreObj.percentage !== null ? (
                  <div className="w-full bg-[var(--line)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--primary)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${scoreObj.percentage}%` }}
                    />
                  </div>
                ) : (
                  <div className="w-full bg-[var(--line)]/50 h-1.5 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Verified Resource Notice & Methodology */}
      <section className="p-6 rounded-xl border border-[var(--line)] bg-[var(--panel-subtle)] space-y-3">
        <div className="flex items-start space-x-3">
          <Award className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-display font-semibold text-[var(--ink)]">
              Domain Resource Integrity & Verification
            </h4>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              Every external reading guide (such as Google’s official 71-page Workspace Prompting Guide and Kaggle’s Agents Whitepaper) and curated lecture is verified. If a specific domain lacks an authentic, verified guide, an honest notice is displayed rather than fabricating placeholder links.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
