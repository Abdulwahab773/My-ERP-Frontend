export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Aether';

export const THEME_MODES = ['light', 'dark', 'system'];

export const STORAGE_KEYS = {
  THEME: 'aether.theme',
  OFFLINE_QUEUE: 'aether.offline-queue',
  FAILED_QUEUE: 'aether.failed-queue',
  CONFLICTS: 'aether.conflicts',
  NOTES_CACHE: 'aether.notes.cache',
  NOTES_DRAFTS: 'aether.notes.drafts',
  FINANCE_CACHE: 'aether.finance.cache',
  SYNC_STATUS: 'aether.sync-status',
  INSTALL_DISMISSED: 'aether.install-dismissed',
  SIDEBAR_COLLAPSED: 'aether.sidebar-collapsed',
};

export const SHARE_PERMISSIONS = [
  { id: 'view', label: 'View' },
  { id: 'edit', label: 'Edit' },
  { id: 'share', label: 'Share' },
  { id: 'admin', label: 'Admin' },
];

export const SHARE_RESOURCE_LABELS = {
  note: 'Note',
  password: 'Password',
  secret: 'ENV collection',
};

export const NAV_ITEMS = [
  { to: '/app', label: 'Home', icon: 'home', end: true },
  { to: '/app/money', label: 'Money', icon: 'wallet', sensitive: true },
  { to: '/app/notes', label: 'Notes', icon: 'note' },
  { to: '/app/vault', label: 'Vault', icon: 'lock', sensitive: true },
  { to: '/app/goals', label: 'Goals', icon: 'target' },
];

export const MORE_NAV_ITEMS = [
  { to: '/app/sharing', label: 'Sharing', icon: 'users' },
  { to: '/app/secrets', label: 'ENV secrets', icon: 'key', sensitive: true },
  { to: '/app/reports', label: 'Reports', icon: 'chart', sensitive: true },
  { to: '/app/profile', label: 'Profile', icon: 'user' },
  { to: '/app/security', label: 'Security', icon: 'lock' },
  { to: '/app/security/activity', label: 'Activity', icon: 'alert' },
];

export const NOTE_CATEGORIES = ['Personal', 'Work', 'Ideas', 'Journal', 'Meeting', 'Other'];

export const VAULT_CATEGORIES = ['Social', 'Email', 'Banking', 'Work', 'Shopping', 'Developer', 'Other'];

export const SENSITIVE_PATHS = ['/app/money', '/app/vault', '/app/secrets', '/app/reports'];

export const GOAL_TYPES = [
  { id: 'income', label: 'Income Goal' },
  { id: 'expense_limit', label: 'Expense Limit' },
  { id: 'saving', label: 'Saving Goal' },
  { id: 'custom', label: 'Custom Goal' },
];

export const GOAL_PRIORITIES = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export const GOAL_REMINDER_OFFSETS = [
  { id: 7, label: '7 days before' },
  { id: 3, label: '3 days before' },
  { id: 1, label: '1 day before' },
  { id: 0, label: 'Deadline day' },
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'CAD', 'AUD'];

export const CURRENCY_OPTIONS = [
  { id: 'USD', label: 'USD - United States Dollar' },
  { id: 'EUR', label: 'EUR - Euro' },
  { id: 'GBP', label: 'GBP - British Pound' },
  { id: 'PKR', label: 'PKR - Pakistani Rupee' },
  { id: 'INR', label: 'INR - Indian Rupee' },
  { id: 'AED', label: 'AED - UAE Dirham' },
  { id: 'CAD', label: 'CAD - Canadian Dollar' },
  { id: 'AUD', label: 'AUD - Australian Dollar' },
];

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'ar', label: 'العربية' },
  { id: 'ur', label: 'اردو' },
  { id: 'hi', label: 'हिन्दी' },
];

export const DATE_FORMATS = ['MMM d, yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export const ACCOUNTS = [
  { id: 'cash', label: 'Cash in hand' },
  { id: 'bank', label: 'Cash in bank' },
];

export const INCOME_CATEGORIES = ['Salary', 'Market', 'Profit', 'Freelancing', 'Business', 'Investment', 'Gift', 'Other'];

export const ENV_COLLECTION_CATEGORIES = ['Personal', 'Work', 'Client', 'Infrastructure', 'Other'];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Education',
  'Rent',
  'Health',
  'Entertainment',
  'Housing',
  'Utilities',
  'Other',
];

export const DEBT_TYPES = [
  { id: 'borrowed', label: 'Money I borrowed' },
  { id: 'lent', label: 'Money I lent' },
];

export const ENV_ENVIRONMENTS = ['local', 'development', 'staging', 'production'];

export const SENSITIVE_MODULE_COPY = {
  vault: {
    title: 'Password Manager',
    description: 'Stored credentials stay encrypted and scoped to your account. This route is locked until the server verifies your PIN.',
  },
  secrets: {
    title: 'ENV Manager',
    description: 'Environment keys never leave your workspace. Unlock is checked on every request, not only in the browser.',
  },
  expenses: {
    title: 'Expense Tracker',
    description: 'Spending records are private. The API refuses this module unless your PIN unlock is still valid.',
  },
  income: {
    title: 'Income',
    description: 'Earnings stay on your ledger only. Sensitive access expires automatically after 10 minutes.',
  },
  debts: {
    title: 'Debt',
    description: 'Balances and lenders are hidden behind the same PIN lock as the rest of your money stack.',
  },
};
