import React from 'react';
import {
  X,
  Languages,
  Moon,
  Sun,
  Laptop,
  Download,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { AppState, LanguageMode, ThemeMode } from '../types';
import { exportAppStateAsJson, resetAppState } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface SettingsModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  isOpen,
  onClose,
  onUpdateState,
}) => {
  if (!isOpen) return null;

  const currentLang = state.settings.language;
  const currentTheme = state.settings.theme;

  const handleLanguageChange = (lang: LanguageMode) => {
    onUpdateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: lang },
    }));
  };

  const handleThemeChange = (theme: ThemeMode) => {
    onUpdateState((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme },
    }));
  };

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all local progress, profile settings, and diagnostic answers? This cannot be undone.'
    );
    if (confirmed) {
      const reset = resetAppState();
      onUpdateState(() => reset);
      onClose();
    }
  };

  const handleExportJson = () => {
    exportAppStateAsJson(state);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-xl bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--panel)] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">
              {getTranslation('navSettings', currentLang)}
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

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-[var(--ink)]">
          {/* Theme Preference */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-[var(--ink)] flex items-center space-x-1.5">
              <span>Color Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'system', label: 'System', icon: Laptop },
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
              ].map((item) => {
                const isSel = currentTheme === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleThemeChange(item.key as ThemeMode)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSel
                        ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-semibold shadow-xs'
                        : 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Display Preference */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-[var(--ink)] flex items-center space-x-1.5">
              <Languages className="w-4 h-4 text-[var(--primary)]" />
              <span>Language Display Preference (UI Labels)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'en', label: 'English', desc: 'Default UI' },
                { key: 'bn', label: 'বাংলা (Bangla)', desc: 'বাংলা লেবেল' },
                { key: 'bn-en', label: 'Bangla-English', desc: 'দ্বিভাষিক Mixed' },
              ].map((item) => {
                const isSel = currentLang === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleLanguageChange(item.key as LanguageMode)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] shadow-xs'
                        : 'border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--panel-subtle)]'
                    }`}
                  >
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Honest language notice */}
            <div className="p-3 rounded-lg bg-[var(--panel-subtle)] border border-[var(--line)] text-xs text-[var(--ink-soft)] leading-relaxed">
              <span className="font-semibold text-[var(--ink)] block mb-0.5">Content Language Scope:</span>
              {getTranslation('languageNotice', currentLang)}
            </div>
          </div>

          {/* Mandatory Resource Link Disclaimer */}
          <div className="p-4 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-light)]/20 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-semibold text-[var(--warning)]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Verified Resource Disclaimer</span>
            </div>
            <p className="text-[var(--ink)] leading-relaxed">
              {getTranslation('resourceDisclaimer', currentLang)}
            </p>
          </div>

          {/* Data Export & Backup */}
          <div className="space-y-3 pt-2 border-t border-[var(--line)]">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Data Management & Persistence
            </label>
            <p className="text-xs text-[var(--ink-soft)]">
              All state (diagnostic answers, competency profile, priorities, and module quiz verification) is stored in your browser’s localStorage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--panel-subtle)] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--primary)]" />
                <span>Export State as JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-light)]/20 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset All Local Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--line)] bg-[var(--panel-subtle)] flex items-center justify-between shrink-0">
          <span className="text-xs text-[var(--ink-soft)]">
            AI Skill Architect • Version 3.1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
