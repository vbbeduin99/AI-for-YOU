import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
} from 'lucide-react';
import { AppState, ModuleItem } from '../types';
import { MODULES } from '../data';
import { filterLibraryModules } from '../utils/engine';

interface LibraryGridProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenModule: (moduleId: string) => void;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  state,
  onUpdateState,
  onOpenModule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute filtered modules per core specification algorithm
  const filteredBaseModules = useMemo(() => {
    return filterLibraryModules(
      state.profile,
      state.priorities,
      state.moduleProgress,
      state.libraryShowAll
    );
  }, [state.profile, state.priorities, state.moduleProgress, state.libraryShowAll]);

  // Apply secondary UI search and category/level filters
  const displayedModules = useMemo(() => {
    return filteredBaseModules.filter((mod) => {
      const matchesSearch =
        !searchTerm.trim() ||
        mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.outcome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLevel = selectedLevel === 'All' || mod.level === selectedLevel;
      const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [filteredBaseModules, searchTerm, selectedLevel, selectedCategory]);

  const toggleShowAll = () => {
    onUpdateState((prev) => ({
      ...prev,
      libraryShowAll: !prev.libraryShowAll,
    }));
  };

  const isCustomFiltered =
    !state.libraryShowAll &&
    state.profile.profession !== 'Generic / show me every module' &&
    filteredBaseModules.length < MODULES.length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Filter Notification Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Skill Catalog</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--ink)]">
            Module Library
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-2xl">
            Self-contained instructional modules spanning prompt engineering, accuracy audits, spreadsheet automation, no-code integrations, and enterprise strategy.
          </p>
        </div>

        {/* Prominent Library Filter Toggle */}
        <div className="shrink-0 flex items-center space-x-2">
          <button
            id="library-filter-toggle-btn"
            type="button"
            onClick={toggleShowAll}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all shadow-xs cursor-pointer ${
              state.libraryShowAll
                ? 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
                : 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>
              {state.libraryShowAll
                ? 'Showing All 24 • Switch to Customized'
                : `Showing Customized (${filteredBaseModules.length}/${MODULES.length}) • Show All 24`}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Explanation Card */}
      <div
        className={`p-4 rounded-xl border transition-colors ${
          isCustomFiltered
            ? 'border-[var(--primary)]/30 bg-[var(--primary-light)]/20'
            : 'border-[var(--line)] bg-[var(--panel-subtle)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 font-medium text-[var(--ink)]">
              <span>Status:</span>
              <span className="font-semibold text-[var(--primary)]">
                {state.libraryShowAll
                  ? 'Showing full catalog of all 24 modules.'
                  : `Customized view active (${filteredBaseModules.length} of 24 modules displayed).`}
              </span>
            </div>
            <p className="text-[var(--ink-soft)]">
              {state.libraryShowAll
                ? 'All foundational, intermediate, and advanced modules across all categories are displayed.'
                : `Filtered based on your profile (${state.profile.profession || 'Default'}) and priorities, preserving all Foundations, prerequisites, and started modules.`}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleShowAll}
            className="text-xs font-semibold text-[var(--primary)] hover:underline self-start sm:self-center cursor-pointer"
          >
            {state.libraryShowAll ? 'Restore role filter' : 'View all 24 modules'}
          </button>
        </div>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--ink-soft)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, tag, or topic..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="All">All Skill Levels</option>
              <option value="Foundation">Foundation</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Applied">Applied</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="All">All Domains & Categories</option>
              <option value="fundamentals">Fundamentals</option>
              <option value="prompting">Prompt Engineering</option>
              <option value="verification">Verification & Critical Thinking</option>
              <option value="data">Data & Spreadsheets</option>
              <option value="communication">Content & Communication</option>
              <option value="automation">Automation & Agents</option>
              <option value="strategy">Business Strategy & ROI</option>
              <option value="implementation">Implementation & Coding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      {displayedModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedModules.map((module) => {
            const progress = state.moduleProgress[module.id];
            const isCompleted = progress?.status === 'completed';
            const isPending = progress?.status === 'practice_pending';

            return (
              <div
                key={module.id}
                onClick={() => onOpenModule(module.id)}
                className="p-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--primary)] hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                {/* Card Top */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary)]">
                        {module.id}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--line)] text-[var(--ink-soft)]">
                        {module.level}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-[var(--ink-soft)] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{module.hours}h</span>
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-base text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                    {module.title}
                  </h3>

                  <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                    {module.outcome}
                  </p>
                </div>

                {/* Card Bottom / Tags & Status */}
                <div className="space-y-3 pt-3 border-t border-[var(--line)]/60">
                  <div className="flex flex-wrap gap-1">
                    {module.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--panel-subtle)] text-[var(--ink-soft)] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center space-x-1 text-[var(--success)] font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed ({progress.quizScore}%)</span>
                        </span>
                      ) : isPending ? (
                        <span className="text-[var(--warning)] font-medium">
                          Practice Pending ({progress.quizScore}%)
                        </span>
                      ) : (
                        <span className="text-[var(--ink-soft)]">Not started</span>
                      )}
                    </div>

                    <span className="text-[var(--primary)] font-medium inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] space-y-4">
          <BookOpen className="w-8 h-8 text-[var(--ink-soft)] mx-auto opacity-50" />
          <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
            No modules match your current search or filter
          </h3>
          <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
            Try resetting your search query or toggling to show all 24 catalog modules.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('All');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg border border-[var(--line)] text-xs font-medium hover:bg-[var(--panel-subtle)] cursor-pointer"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={toggleShowAll}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium cursor-pointer"
            >
              Show all 24 modules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
