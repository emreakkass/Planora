import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useStudyStore } from './store/useStudyStore';
import { useAuthStore } from './store/useAuthStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TaskModal } from './components/tasks/TaskModal';
import { NaturalLanguageModal } from './components/tasks/NaturalLanguageModal';
import { AuthView } from './components/auth/AuthView';
import { DataMigrationModal } from './components/auth/DataMigrationModal';
import { TodayView } from './pages/TodayView';
import { ScheduleView } from './pages/ScheduleView';
import { TasksView } from './pages/TasksView';
import { PlannerView } from './pages/PlannerView';
import { PomodoroView } from './pages/PomodoroView';
import { StatsView } from './pages/StatsView';
import { WeeklyReportView } from './pages/WeeklyReportView';
import { SettingsView } from './pages/SettingsView';
import { Task } from './types';
import { Calendar, CheckSquare, CalendarRange, Timer, Clock } from 'lucide-react';
import { applyTheme, listenToSystemThemeChanges } from './lib/theme';

export default function App() {
  const { activeTab, setActiveTab, settings, toastMessage, loadUserData } = useStudyStore();
  const { isAuthenticated, isLoading, initAuth, user } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isNaturalLanguageModalOpen, setIsNaturalLanguageModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Kimlik doğrulama durumunu başlat
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Kullanıcı değiştiğinde veya giriş yapıldığında kullanıcı verilerini yükle
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData(user.id);
    }
  }, [isAuthenticated, user?.id, loadUserData]);

  // Tema senkronizasyonu
  useEffect(() => {
    if (settings.theme) {
      applyTheme(settings.theme);
    }
    const cleanup = listenToSystemThemeChanges(() => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    });
    return cleanup;
  }, [settings.theme]);

  // Tarayıcı Bildirim İzni İsteme (Önceden izin istenmemişse)
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const handleOpenTaskModal = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  // Yükleme ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--sidebar-bg)] border border-[var(--accent)]/40 p-2 flex items-center justify-center animate-pulse shadow-md">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[var(--accent)]" strokeWidth="12">
            <path d="M30 20 V80" />
            <path d="M30 20 H60 C75 20 85 32 85 46 C85 60 75 72 60 72 H30" stroke="var(--accent)" />
          </svg>
        </div>
        <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)]">
          Planora Hazırlanıyor...
        </span>
      </div>
    );
  }

  // Korumalı Rota: Giriş yapılmamışsa AuthView render edilir
  if (!isAuthenticated) {
    return <AuthView initialMode="login" />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-150">
      {/* Yan Menü (Sidebar) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenNaturalLanguage={() => setIsNaturalLanguageModalOpen(true)}
      />

      {/* Ana İçerik Taşıyıcısı */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Üst Bar */}
        <Header
          onOpenTaskModal={() => handleOpenTaskModal()}
          onOpenNaturalLanguageModal={() => setIsNaturalLanguageModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Aktif Sayfa İçeriği */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 sm:pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activeTab === 'today' && (
                <TodayView
                  onOpenTaskModal={() => handleOpenTaskModal()}
                  onOpenNaturalLanguageModal={() => setIsNaturalLanguageModalOpen(true)}
                />
              )}
              {activeTab === 'schedule' && <ScheduleView />}
              {activeTab === 'tasks' && (
                <TasksView
                  onOpenTaskModal={(task) => handleOpenTaskModal(task)}
                  onOpenNaturalLanguageModal={() => setIsNaturalLanguageModalOpen(true)}
                />
              )}
              {activeTab === 'planner' && <PlannerView />}
              {activeTab === 'pomodoro' && <PomodoroView />}
              {activeTab === 'stats' && <StatsView />}
              {activeTab === 'report' && <WeeklyReportView />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobil Alt Menü (Bottom Navigation) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-theme)] flex items-center justify-around py-2 px-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'today'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bugün</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Program</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Görevler</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'planner'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'pomodoro'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Pomodoro</span>
          </button>
        </div>
      </div>

      {/* Görev Ekleme / Düzenleme Modalı */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      {/* Doğal Dil ile Görev Ekleme Modalı */}
      <NaturalLanguageModal
        isOpen={isNaturalLanguageModalOpen}
        onClose={() => setIsNaturalLanguageModalOpen(false)}
      />

      {/* Eski Veri Migrasyonu Soru Modalı */}
      <DataMigrationModal />

      {/* Toast Bildirim Kutusu */}
      {toastMessage && (
        <div className="fixed bottom-16 lg:bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[var(--sidebar-bg)] text-white text-xs font-semibold shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
