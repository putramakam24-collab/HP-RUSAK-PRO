import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { WhatsAppFloating } from './components/public/WhatsAppFloating';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { GradeDirectoryPage } from './pages/public/GradeDirectoryPage';
import { IcDirectoryPage } from './pages/public/IcDirectoryPage';
import { HowToSellPage } from './pages/public/HowToSellPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { BrandsDevicesPage } from './pages/admin/BrandsDevicesPage';
import { PriceManagementPage } from './pages/admin/PriceManagementPage';
import { GradeManagementPage } from './pages/admin/GradeManagementPage';
import { IcManagementPage } from './pages/admin/IcManagementPage';
import { ImportDatabasePage } from './pages/admin/ImportDatabasePage';
import { TransactionsPage } from './pages/admin/TransactionsPage';
import { CreateTransactionPage } from './pages/admin/CreateTransactionPage';
import { PrintReceiptPage } from './pages/admin/PrintReceiptPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { ResalesPage } from './pages/admin/ResalesPage';
import { ExpensesPage } from './pages/admin/ExpensesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { StoreSettingsPage } from './pages/admin/StoreSettingsPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SupabaseMigrationPage } from './pages/admin/SupabaseMigrationPage';

import { StorageService } from './lib/storage';
import { SiteSettings, UserProfile } from './types';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(() => StorageService.getSettings());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

  useEffect(() => {
    // Listen for storage events (e.g. from settings updates)
    const handleStorageUpdate = () => {
      setSettings(StorageService.getSettings());
      setCurrentUser(StorageService.getCurrentUser());
    };
    window.addEventListener('hrp_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('hrp_storage_updated', handleStorageUpdate);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC LAYOUT */}
        <Route
          element={
            <div className="flex flex-col min-h-screen bg-slate-950 font-sans selection:bg-cyan-500 selection:text-slate-950">
              <Navbar settings={settings} />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer settings={settings} />
              <WhatsAppFloating phone={settings.phone_whatsapp} storeName={settings.store_name} />
            </div>
          }
        >
          <Route path="/" element={<HomePage settings={settings} />} />
          <Route path="/grades" element={<GradeDirectoryPage settings={settings} />} />
          <Route path="/ic-directory" element={<IcDirectoryPage settings={settings} />} />
          <Route path="/how-to-sell" element={<HowToSellPage settings={settings} />} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLoginPage settings={settings} />} />

        {/* ADMIN LAYOUT */}
        <Route
          path="/admin"
          element={
            <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-cyan-500 selection:text-slate-950">
              <AdminSidebar
                role={currentUser.role}
                storeName={settings.store_name}
                isOpen={adminSidebarOpen}
                onClose={() => setAdminSidebarOpen(false)}
              />
              <div className="flex-1 flex flex-col lg:pl-64">
                <AdminHeader
                  currentUser={currentUser}
                  onToggleSidebar={() => setAdminSidebarOpen(!adminSidebarOpen)}
                  onUserChanged={(u) => setCurrentUser(u)}
                />
                <main className="flex-1">
                  <Outlet />
                </main>
              </div>
            </div>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="devices" element={<BrandsDevicesPage />} />
          <Route path="prices" element={<PriceManagementPage />} />
          <Route path="grades" element={<GradeManagementPage />} />
          <Route path="ic-database" element={<IcManagementPage />} />
          <Route path="import" element={<ImportDatabasePage />} />
          <Route path="transactions" element={<TransactionsPage settings={settings} />} />
          <Route path="transactions/create" element={<CreateTransactionPage />} />
          <Route path="transactions/:id/print" element={<PrintReceiptPage settings={settings} />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="resales" element={<ResalesPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route
            path="settings"
            element={
              <StoreSettingsPage
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
              />
            }
          />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="supabase-migration" element={<SupabaseMigrationPage />} />
        </Route>

        {/* 404 NOT FOUND */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
