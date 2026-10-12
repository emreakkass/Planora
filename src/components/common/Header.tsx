import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Plus, Menu, Flame, LogOut, User } from 'lucide-react';
import { useStudyStore } from '../../store/useStudyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenTaskModal: () => void;
  onOpenNaturalLanguageModal?: () => void;
  onToggleMobileMenu: () => void;
}

export function Header({
  onOpenTaskModal,
  onToggleMobileMenu,
}: HeaderProps) {
  const { tasks, getStreak, setActiveTab } = useStudyStore();
  const { user, isGuest, logout } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const activeTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const streak = getStreak();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-theme)] transition-colors">
      {/* Sol: Menü Düğmesi, Logo & Marka */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 sm:p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-page)] rounded-lg cursor-pointer shrink-0"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <motion.button
          type="button"
          onClick={() => setActiveTab('today')}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-90 transition-opacity bg-transparent border-0 p-0 focus:outline-hidden"
          title="Ana Sayfaya (Bugün) Git"
        >
          {/* Planora Vektörel Logo */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--sidebar-bg)] p-1 sm:p-1.5 flex items-center justify-center shadow-xs border border-[var(--border-theme)] shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full fill-none stroke-[var(--accent)]"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M30 20 V80" />
              <path d="M30 20 H60 C75 20 85 32 85 46 C85 60 75 72 60 72 H30" stroke="var(--accent)" />
              <circle cx="58" cy="46" r="6" fill="var(--accent)" stroke="none" />
            </svg>
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] truncate whitespace-nowrap">
            Planora
          </span>
        </motion.button>
      </div>

      {/* Orta: Bilgi & Seri Rozeti (Desktop) */}
      <div className="hidden md:flex items-center gap-2.5 text-xs text-[var(--text-muted)]">
        <span>Akıllı Planlayıcı</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono tabular-nums font-medium text-[var(--text-secondary)]">
          {activeTasksCount} Aktif Görev
        </span>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1 font-semibold text-[var(--accent)] font-mono bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2 py-0.5 rounded-md">
          <Flame className="w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" />
          {streak.currentStreak} Gün Seri
        </span>
      </div>

      {/* Sağ: PWA, Yeni Görev, Profil & Çıkış */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* PWA Butonu (Mobilde gizli, masaüstünde görünür) */}
        <div className="hidden sm:block">
          <PWAInstallButton />
        </div>

        {/* Yeni Görev Butonu (Mobilde gizli, sayfa içeriğindeki buton kullanılır) */}
        <motion.button
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          onClick={onOpenTaskModal}
          className="hidden sm:inline-flex btn-primary py-1.5 px-3 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Görev</span>
        </motion.button>

        {/* Kullanıcı Profili & Çıkış */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 ml-0.5 sm:ml-1 border-l border-[var(--border-theme)]">
          <div
            title={`${user?.name || 'Öğrenci'} (${isGuest ? 'Misafir' : user?.email})`}
            className="w-7 h-7 rounded-lg bg-[var(--btn-primary)] text-[var(--btn-primary-text)] flex items-center justify-center font-bold text-xs"
          >
            {user?.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
          </div>
          <button
            onClick={() => logout()}
            title="Çıkış Yap"
            className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
            aria-label="Çıkış Yap"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
