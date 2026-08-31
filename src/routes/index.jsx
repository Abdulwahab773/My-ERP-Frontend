import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { PinSetupGate } from './PinSetupGate';
import { SensitiveRoute } from './SensitiveRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { OAuthCallbackPage } from '../pages/auth/OAuthCallbackPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SecurityCenterPage } from '../pages/security/SecurityCenterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoadingState } from '../components/ui';

const NotesPage = lazy(() => import('../pages/notes/NotesPage').then((mod) => ({ default: mod.NotesPage })));
const VaultPage = lazy(() => import('../pages/vault/VaultPage').then((mod) => ({ default: mod.VaultPage })));
const SecretsPage = lazy(() => import('../pages/secrets/SecretsPage').then((mod) => ({ default: mod.SecretsPage })));
const MoneyHubPage = lazy(() => import('../pages/money/MoneyHubPage').then((mod) => ({ default: mod.MoneyHubPage })));
const IncomePage = lazy(() => import('../pages/money/IncomePage').then((mod) => ({ default: mod.IncomePage })));
const ExpensePage = lazy(() => import('../pages/money/ExpensePage').then((mod) => ({ default: mod.ExpensePage })));
const TransactionsPage = lazy(() => import('../pages/money/TransactionsPage').then((mod) => ({ default: mod.TransactionsPage })));
const AnalyticsPage = lazy(() => import('../pages/money/AnalyticsPage').then((mod) => ({ default: mod.AnalyticsPage })));
const CategoriesPage = lazy(() => import('../pages/money/CategoriesPage').then((mod) => ({ default: mod.CategoriesPage })));
const DebtsPage = lazy(() => import('../pages/money/DebtsPage').then((mod) => ({ default: mod.DebtsPage })));
const DebtDetailPage = lazy(() => import('../pages/money/DebtDetailPage').then((mod) => ({ default: mod.DebtDetailPage })));
const MonthBookPage = lazy(() => import('../pages/money/MonthBookPage').then((mod) => ({ default: mod.MonthBookPage })));
const GoalsPage = lazy(() => import('../pages/goals/GoalsPage').then((mod) => ({ default: mod.GoalsPage })));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage').then((mod) => ({ default: mod.ReportsPage })));
const SharingPage = lazy(() => import('../pages/sharing/SharingPage').then((mod) => ({ default: mod.SharingPage })));
const SecurityActivityPage = lazy(() => import('../pages/security/SecurityActivityPage').then((mod) => ({ default: mod.SecurityActivityPage })));

function PageFallback() {
  return (
    <div className="workspace-fallback">
      <LoadingState label="Opening workspace" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PinSetupGate />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="notes"
              element={(
                <Suspense fallback={<PageFallback />}>
                  <NotesPage />
                </Suspense>
              )}
            />
            <Route
              path="goals"
              element={(
                <Suspense fallback={<PageFallback />}>
                  <GoalsPage />
                </Suspense>
              )}
            />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="security" element={<SecurityCenterPage />} />
            <Route
              path="security/activity"
              element={(
                <Suspense fallback={<PageFallback />}>
                  <SecurityActivityPage />
                </Suspense>
              )}
            />
            <Route
              path="sharing"
              element={(
                <Suspense fallback={<PageFallback />}>
                  <SharingPage />
                </Suspense>
              )}
            />
            <Route path="settings" element={<Navigate to="/app/security" replace />} />

            <Route element={<SensitiveRoute />}>
              <Route path="money" element={<Suspense fallback={<PageFallback />}><MoneyHubPage /></Suspense>} />
              <Route path="money/income" element={<Suspense fallback={<PageFallback />}><IncomePage /></Suspense>} />
              <Route path="money/expenses" element={<Suspense fallback={<PageFallback />}><ExpensePage /></Suspense>} />
              <Route path="money/transactions" element={<Suspense fallback={<PageFallback />}><TransactionsPage /></Suspense>} />
              <Route path="money/analytics" element={<Suspense fallback={<PageFallback />}><AnalyticsPage /></Suspense>} />
              <Route path="money/categories" element={<Suspense fallback={<PageFallback />}><CategoriesPage /></Suspense>} />
              <Route path="money/debts" element={<Suspense fallback={<PageFallback />}><DebtsPage /></Suspense>} />
              <Route path="money/debts/:debtId" element={<Suspense fallback={<PageFallback />}><DebtDetailPage /></Suspense>} />
              <Route path="money/months" element={<Suspense fallback={<PageFallback />}><MonthBookPage /></Suspense>} />
              <Route path="vault" element={<Suspense fallback={<PageFallback />}><VaultPage /></Suspense>} />
              <Route path="secrets" element={<Suspense fallback={<PageFallback />}><SecretsPage /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<PageFallback />}><ReportsPage /></Suspense>} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
