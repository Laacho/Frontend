import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { LangProvider } from './contexts/LangContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'

// Auth pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { TwoFASetupPage } from './pages/auth/TwoFASetupPage'
import { TwoFAVerifyPage } from './pages/auth/TwoFAVerifyPage'

// App pages
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { AccountsPage } from './pages/accounts/AccountsPage'
import { AccountDetailPage } from './pages/accounts/AccountDetailPage'
import { OpenAccountPage } from './pages/accounts/OpenAccountPage'
import { CardsPage } from './pages/cards/CardsPage'
import { CardDetailPage } from './pages/cards/CardDetailPage'
import { IssueCardPage } from './pages/cards/IssueCardPage'
import { TransferPage } from './pages/transactions/TransferPage'
import { CardPaymentPage } from './pages/transactions/CardPaymentPage'
import { TransactionsPage } from './pages/transactions/TransactionsPage'
import { TransactionDetailPage } from './pages/transactions/TransactionDetailPage'
import { ScheduledPage } from './pages/scheduled/ScheduledPage'
import { ScheduledCreatePage } from './pages/scheduled/ScheduledCreatePage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { AdminSendPage } from './pages/admin/AdminSendPage'
import { AdminBulkPage } from './pages/admin/AdminBulkPage'
import { AdminBroadcastPage } from './pages/admin/AdminBroadcastPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/2fa/setup" element={<TwoFASetupPage />} />
      <Route path="/2fa/verify" element={<TwoFAVerifyPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected app routes inside AppShell */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppShell><DashboardPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/accounts" element={
        <ProtectedRoute>
          <AppShell><AccountsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/accounts/open" element={
        <ProtectedRoute>
          <AppShell><OpenAccountPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/accounts/:id" element={
        <ProtectedRoute>
          <AppShell><AccountDetailPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/cards" element={
        <ProtectedRoute>
          <AppShell><CardsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/cards/issue" element={
        <ProtectedRoute>
          <AppShell><IssueCardPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/cards/:id" element={
        <ProtectedRoute>
          <AppShell><CardDetailPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/transfer" element={
        <ProtectedRoute>
          <AppShell><TransferPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/card-payment" element={
        <ProtectedRoute>
          <AppShell><CardPaymentPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <AppShell><TransactionsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/transactions/:id" element={
        <ProtectedRoute>
          <AppShell><TransactionDetailPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/scheduled" element={
        <ProtectedRoute>
          <AppShell><ScheduledPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/scheduled/new" element={
        <ProtectedRoute>
          <AppShell><ScheduledCreatePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppShell><NotificationsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppShell><SettingsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/send" element={
        <ProtectedRoute requiredRole={['ADMIN', 'STAFF']}>
          <AppShell><AdminSendPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/bulk" element={
        <ProtectedRoute requiredRole={['ADMIN', 'STAFF']}>
          <AppShell><AdminBulkPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/broadcast" element={
        <ProtectedRoute requiredRole={['ADMIN', 'STAFF']}>
          <AppShell><AdminBroadcastPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole={['ADMIN', 'STAFF']}>
          <AppShell><AdminUsersPage /></AppShell>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LangProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </LangProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
