/**
 * Feature modules planned for later phases.
 * Each module will own its RTK Query slice, pages, and user-scoped models.
 */
export const FUTURE_MODULES = [
  { id: 'notes', title: 'Notes', isolation: 'userId' },
  { id: 'passwords', title: 'Password vault', isolation: 'userId' },
  { id: 'secrets', title: 'ENV secrets', isolation: 'userId' },
  { id: 'expenses', title: 'Expenses', isolation: 'userId' },
  { id: 'income', title: 'Income', isolation: 'userId' },
  { id: 'debts', title: 'Debts', isolation: 'userId' },
  { id: 'goals', title: 'Goals', isolation: 'userId' },
  { id: 'categories', title: 'Categories', isolation: 'userId' },
  { id: 'reports', title: 'Reports', isolation: 'userId' },
  { id: 'audit', title: 'Audit logs', isolation: 'userId' },
];
