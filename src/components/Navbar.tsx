import React from 'react';
import {
  Compass,
  BookOpen,
  LayoutDashboard,
  Settings,
  Sun,
  Moon,
  CheckCircle2,
  Filter,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { AppState } from '../types';
import { getTranslation } from '../utils/translations';
import { MODULES } from '../data';

interface NavbarProps {
  state: AppState;
  currentScreen: 'home' | 'assessment' | 'library' | 'dashboard';
  onNavigate: (screen: 'home' | 'assessment' | 'library' | 'dashboard') => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleLibraryFilter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  currentScreen,
  onNavigate,
  onOpenSettings,
  onToggleTheme,
  onToggleLibraryFilter,
}) => {
  const lang = state.settings.language;
  const isDark = state.settings.theme === 'dark';

  const completedCount = Object.values(state.moduleProgress).filter(
    (p) => p.status === 'completed'
  ).length;

  const roleDisplay = state.profile.jobTitle || state.profile.profession;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            id="nav-brand"
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg tracking-tight text-[var(--ink)]">
                  {getTranslation('appName', lang)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  v3.1
                </span>
              </div>
              <p className="text-xs text-[var(--ink-soft)] hidden sm:block truncate max-w-xs">
                {getTranslation('tagline', lang)}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-btn-home"
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'home'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>{getTranslation('navHome', lang)}</span>
              </span>
            </button>

            <button
              id="nav-btn-assessment"
              onClick={() => onNavigate('assessment')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                currentScreen === 'assessment'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{getTranslation('navAssessment', lang)}</span>
                {state.diagnostic.submitted && (
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                )}
              </span>
            </button>

            <button
              id="nav-btn-library"
              onClick={() => onNavigate('library')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'library'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{getTranslation('navLibrary', lang)}</span>
                {!state.libraryShowAll && roleDisplay && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent)] font-medium">
                    Filtered
                  </span>
                )}
              </span>
            </button>

            <button
              id="nav-btn-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'dashboard'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{getTranslation('navDashboard', lang)}</span>
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-[var(--panel-subtle)] text-[var(--ink)] font-mono">
                  {completedCount}/{MODULES.length}
                </span>
              </span>
            </button>
          </nav>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center space-x-2">
            {roleDisplay && (
              <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[var(--panel-subtle)] text-xs text-[var(--ink-soft)] max-w-[180px] truncate border border-[var(--line)]">
                <span className="font-medium text-[var(--ink)] truncate">{roleDisplay}</span>
              </div>
            )}

            {/* Library filter quick indicator */}
            {currentScreen === 'library' && (
              <button
                id="navbar-toggle-library-filter"
                onClick={onToggleLibraryFilter}
                title={state.libraryShowAll ? 'Switch to customized filtered view' : 'Show all 24 catalog modules'}
                className={`hidden sm:flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                  state.libraryShowAll
                    ? 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink-soft)] hover:text-[var(--ink)]'
                    : 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{state.libraryShowAll ? 'Showing All 24' : 'Custom Tailored'}</span>
              </button>
            )}

            {/* Dark / Light Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)] transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings button */}
            <button
              id="open-settings-btn"
              onClick={onOpenSettings}
              aria-label="Settings"
              className="p-2 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--panel-subtle)] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden border-t border-[var(--line)] py-2 overflow-x-auto space-x-2 no-scrollbar">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              currentScreen === 'home'
                ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                : 'text-[var(--ink-soft)]'
            }`}
          >
            {getTranslation('navHome', lang)}
          </button>
          <button
            onClick={() => onNavigate('assessment')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              currentScreen === 'assessment'
                ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                : 'text-[var(--ink-soft)]'
            }`}
          >
            {getTranslation('navAssessment', lang)}
          </button>
          <button
            onClick={() => onNavigate('library')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              currentScreen === 'library'
                ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                : 'text-[var(--ink-soft)]'
            }`}
          >
            {getTranslation('navLibrary', lang)}
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              currentScreen === 'dashboard'
                ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                : 'text-[var(--ink-soft)]'
            }`}
          >
            {getTranslation('navDashboard', lang)} ({completedCount}/{MODULES.length})
          </button>
        </div>
      </div>
    </header>
  );
};
