import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import {
  Calendar,
  CheckSquare,
  CalendarRange,
  Clock,
  Timer,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  RotateCcw,
  LogOut,
  User,
} from 'lucide-react';
import { useStudyStore } from '../../store/useStudyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ActiveTab } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNaturalLanguage: () => void;
}

export function Sidebar({
  isMobileOpen,
  onCloseMobile,
  onOpenNaturalLanguage,
}: SidebarProps) {
  const { activeTab, setActiveTab, resetToDemoData, tasks, schedule } = useStudyStore();
  const { user, isGuest, logout } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const navItems: { id: ActiveTab; label: string; icon: typeof Calendar; badge?: number }[] = [
    { id: 'today', label: 'Bugün', icon: Calendar },
    {
      id: 'schedule',
      label: 'Ders Programı',
      icon: Clock,
      badge: schedule.length,
    },
    {
      id: 'tasks',
      label: 'Görevler & Sınavlar',
      icon: CheckSquare,
      badge: tasks.filter((t) => !t.isCompleted).length,
    },
    { id: 'planner', label: 'Haftalık Plan', icon: CalendarRange },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'stats', label: 'İstatistikler', icon: BarChart3 },
    { id: 'report', label: 'Haftalık Rapor', icon: FileText },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.035,
      },
    },
  };

  const navItemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  };

  return (
    <>
      {/* Mobil Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[var(--sidebar-bg)] border-r border-white/10 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Header Alanı */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <motion.button
            type="button"
            onClick={() => handleSelect('today')}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-90 transition-opacity bg-transparent border-0 p-0 focus:outline-hidden w-full"
            title="Ana Sayfaya (Bugün) Git"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--sidebar-active-bg)] border border-[var(--accent)]/40 p-1.5 flex items-center justify-center shadow-xs shrink-0">
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
            <div>
              <span className="font-bold text-white text-base leading-tight block tracking-tight">
                Planora
              </span>
              <span className="text-[11px] text-[#A6C0BC] block font-normal">
                Akıllı Öğrenci Asistanı
              </span>
            </div>
          </motion.button>
        </div>

        {/* Hızlı Doğal Dil Butonu (Sidebar'da kalıyor) */}
        <div className="p-3">
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => {
              onOpenNaturalLanguage();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-[var(--accent)] bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-[var(--accent)]/35 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Doğal Dil ile Planla</span>
          </motion.button>
        </div>

        {/* Navigasyon Listesi */}
        <motion.nav
          variants={navContainerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 px-3 py-2 space-y-1 overflow-y-auto"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                variants={navItemVariants}
                whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => handleSelect(item.id)}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-white/75 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* layoutId ile kayan aktif arka plan */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute inset-0 bg-[var(--sidebar-active-bg)] rounded-xl border border-[var(--accent)]/25 shadow-xs"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 450, damping: 35 }
                    }
                  />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[var(--accent)]' : 'text-[#8EAFA9]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`relative z-10 text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.nav>

        {/* Alt Kullanıcı Profili & Geliştirici Aksiyonları */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Kullanıcı Kartı */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-[#182524] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-white truncate">
                  {user?.name || 'Öğrenci'}
                </div>
                <div className="text-[10px] text-[#A6C0BC] truncate font-mono">
                  {isGuest ? 'Misafir Modu' : user?.email}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => logout()}
              title="Çıkış Yap"
              className="p-1.5 text-white/60 hover:text-rose-400 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Sadece DEV modunda Örnek Verileri Yenile butonu */}
          {import.meta.env.DEV && (
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              onClick={() => resetToDemoData()}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Örnek Verileri Yenile</span>
            </motion.button>
          )}
        </div>
      </aside>
    </>
  );
}
