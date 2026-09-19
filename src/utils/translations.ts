import { LanguageMode } from '../types';

export const TRANSLATIONS: Record<string, { en: string; bn: string; 'bn-en': string }> = {
  appName: {
    en: 'AI Skill Architect',
    bn: 'এআই স্কিল আর্কিটেক্ট',
    'bn-en': 'AI Skill Architect (এআই দক্ষতা মূল্যায়ন)',
  },
  tagline: {
    en: 'Your profession. Your priorities. Your AI journey.',
    bn: 'আপনার পেশা। আপনার অগ্রাধিকার। আপনার এআই যাত্রা।',
    'bn-en': 'Your profession. Your priorities. Your AI journey (আপনার এআই যাত্রা).',
  },
  navHome: {
    en: 'Overview',
    bn: 'সংক্ষিপ্ত বিবরণ',
    'bn-en': 'Overview (সংক্ষিপ্ত বিবরণ)',
  },
  navAssessment: {
    en: 'Skill Diagnostic',
    bn: 'দক্ষতা মূল্যায়ন',
    'bn-en': 'Skill Diagnostic (দক্ষতা মূল্যায়ন)',
  },
  navLibrary: {
    en: 'Module Library',
    bn: 'মডিউল লাইব্রেরি',
    'bn-en': 'Module Library (মডিউল লাইব্রেরি)',
  },
  navDashboard: {
    en: 'Learner Dashboard',
    bn: 'লার্নার ড্যাশবোর্ড',
    'bn-en': 'Learner Dashboard (লার্নার ড্যাশবোর্ড)',
  },
  navSettings: {
    en: 'Settings',
    bn: 'সেটিংস',
    'bn-en': 'Settings (সেটিংস)',
  },
  startAssessment: {
    en: 'Start Diagnostic Wizard',
    bn: 'মূল্যায়ন উইজার্ড শুরু করুন',
    'bn-en': 'Start Diagnostic Wizard (মূল্যায়ন শুরু করুন)',
  },
  retakeDiagnostic: {
    en: 'Retake Diagnostic',
    bn: 'পুনরায় মূল্যায়ন করুন',
    'bn-en': 'Retake Diagnostic (পুনরায় পরীক্ষা)',
  },
  stepProfile: {
    en: '1. Professional Profile',
    bn: '১. পেশাগত প্রোফাইল',
    'bn-en': '1. Professional Profile (পেশাগত প্রোফাইল)',
  },
  stepPriorities: {
    en: '2. Priorities & Ranking',
    bn: '২. অগ্রাধিকার এবং র্যাঙ্কিং',
    'bn-en': '2. Priorities & Ranking (অগ্রাধিকার বাছাই)',
  },
  stepDiagnostic: {
    en: '3. Skill Diagnostic',
    bn: '৩. জ্ঞান ও দক্ষতা যাচাই',
    'bn-en': '3. Skill Diagnostic (দক্ষতা মূল্যায়ন)',
  },
  stepResults: {
    en: '4. Dimension Results',
    bn: '৪. ফলাফল ও পর্যবেক্ষণ',
    'bn-en': '4. Dimension Results (ফলাফল ও পর্যবেক্ষণ)',
  },
  stepPathway: {
    en: '5. Personalized Pathway',
    bn: '৫. ব্যক্তিগত শিক্ষা পথ',
    'bn-en': '5. Personalized Pathway (লার্নিং পাথওয়ে)',
  },
  filteredLibraryBadge: {
    en: 'Tailored for your role and priorities',
    bn: 'আপনার পেশা ও অগ্রাধিকার অনুসারে ফিল্টার করা',
    'bn-en': 'Tailored for your role (আপনার ভূমিকা অনুযায়ী ফিল্টার)',
  },
  showAllModulesBtn: {
    en: 'Show All Modules (24)',
    bn: 'সব মডিউল দেখান (২৪)',
    'bn-en': 'Show All Modules (সব ২৪টি মডিউল)',
  },
  showTailoredBtn: {
    en: 'Show Customized Library',
    bn: 'কাস্টমাইজড মডিউল দেখান',
    'bn-en': 'Show Customized Library (কাস্টমাইজড লাইব্রেরি)',
  },
  languageNotice: {
    en: 'Language display preference applies to UI labels and navigation. Technical module lessons and practical quizzes are curated in English.',
    bn: 'ভাষা প্রদর্শন পছন্দ শুধুমাত্র ইন্টারফেসের লেবেলে প্রযোজ্য। মডিউলের বিস্তারিত পাঠ ও কুইজ ইংরেজিতে সংরক্ষিত।',
    'bn-en': 'Language preference applies to UI labels. Technical module lessons & quizzes remain in English (মডিউলের মূল পাঠ ইংরেজিতে বহাল থাকবে)।',
  },
  resourceDisclaimer: {
    en: "Resource links were last checked during this app's original build; please spot-check before relying on them.",
    bn: 'রিসোর্স লিংকগুলো মূল বিল্ড তৈরির সময় যাচাই করা হয়েছিল; নির্ভর করার পূর্বে অনুগ্রহ করে নিজে পরীক্ষা করে নিন।',
    'bn-en': "Resource links were verified during the original build session; please spot-check before relying on them (ব্যবহারের পূর্বে যাচাই করে নিন)।",
  },
};

export function getTranslation(key: string, lang: LanguageMode): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;
  return item[lang] || item.en;
}
