import React, { useState, useEffect } from 'react';
import { AppState, ModuleItem } from './types';
import { loadAppState, saveAppState } from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AssessmentWizard } from './components/AssessmentWizard';
import { LibraryGrid } from './components/LibraryGrid';
import { DashboardView } from './components/DashboardView';
import { ModuleDetailModal } from './components/ModuleDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { MODULES } from './data';
import { getTranslation } from './utils/translations';
import { Sparkles, Shield, Heart } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'assessment' | 'library' | 'dashboard'
  >('home');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Auto-save state changes to LocalStorage
  const handleUpdateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  // Sync theme with DOM document element
  useEffect(() => {
    const root = document.documentElement;
    const theme = state.settings.theme;

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.removeAttribute('data-theme');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }, [state.settings.theme]);

  const activeModule: ModuleItem | undefined = activeModuleId
    ? MODULES.find((m) => m.id === activeModuleId)
    : undefined;

  const handleToggleTheme = () => {
    const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: nextTheme },
    }));
  };

  const handleToggleLibraryFilter = () => {
    handleUpdateState((prev) => ({
      ...prev,
      libraryShowAll: !prev.libraryShowAll,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] transition-colors duration-200">
      {/* Sticky Top Header */}
      <Navbar
        state={state}
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        onToggleLibraryFilter={handleToggleLibraryFilter}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentScreen === 'home' && (
          <HomeView
            state={state}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartAssessment={() => {
              setCurrentScreen('assessment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectModule={(mId) => setActiveModuleId(mId)}
          />
        )}

        {currentScreen === 'assessment' && (
          <AssessmentWizard
            state={state}
            onUpdateState={handleUpdateState}
            onOpenModule={(mId) => setActiveModuleId(mId)}
            onNavigateToLibrary={() => {
              setCurrentScreen('library');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentScreen === 'library' && (
          <LibraryGrid
            state={state}
            onUpdateState={handleUpdateState}
            onOpenModule={(mId) => setActiveModuleId(mId)}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardView
            state={state}
            onNavigateToAssessment={() => {
              setCurrentScreen('assessment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenModule={(mId) => setActiveModuleId(mId)}
          />
        )}
      </main>

      {/* Module Detail Modal */}
      {activeModule && (
        <ModuleDetailModal
          module={activeModule}
          state={state}
          onClose={() => setActiveModuleId(null)}
          onUpdateState={handleUpdateState}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        state={state}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateState={handleUpdateState}
      />

      {/* Minimal, Professional Footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--panel)] py-8 mt-auto text-xs text-[var(--ink-soft)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-[var(--ink)]">
              {getTranslation('appName', state.settings.language)}
            </span>
            <span>•</span>
            <span>{getTranslation('tagline', state.settings.language)}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>24 Verified Modules</span>
            <span>•</span>
            <span>10 Dimension Scored Diagnostic</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[var(--ink)] underline cursor-pointer"
            >
              Settings & Verification Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
