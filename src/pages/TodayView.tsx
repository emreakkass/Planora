import { useMemo } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Calendar,
  Play,
  CheckCircle,
  Clock,
  Flame,
  AlertCircle,
  Plus,
  Download,
  RotateCcw,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { generateStudyPlan } from '../lib/planner/planEngine';
import { calculateRiskScore } from '../lib/risk/riskEngine';
import { OvercapacityAlert } from '../components/common/OvercapacityAlert';
import { downloadICalendarFile } from '../lib/calendar/icsGenerator';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { AnimatedCheckButton } from '../components/common/AnimatedCheckButton';

interface TodayViewProps {
  onOpenTaskModal: () => void;
  onOpenNaturalLanguageModal?: () => void;
}

export function TodayView({
  onOpenTaskModal,
}: TodayViewProps) {
  const {
    tasks,
    settings,
    schedule,
    sessions,
    setActiveTab,
    setSelectedTaskIdForPomodoro,
    toggleTaskCompleted,
    getStreak,
  } = useStudyStore();
  const shouldReduceMotion = useReducedMotion();

  const todayDate = new Date();
  const todayDateStr = format(todayDate, 'yyyy-MM-dd');

  // Plan motoru ve boş zaman blokları
  const planResult = useMemo(() => {
    return generateStudyPlan(tasks, settings, schedule, todayDate, 7);
  }, [tasks, settings, schedule]);

  const { todayPlan, overcapacityTasks } = planResult;

  // Streak (Seri) bilgisi
  const streak = useMemo(() => {
    return getStreak();
  }, [sessions, getStreak]);

  // Bugün tamamlanan odaklanma dakikaları
  const completedMinutesToday = useMemo(() => {
    return sessions
      .filter((s) => s.completedAt && s.completedAt.startsWith(todayDateStr) && s.type === 'focus')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [sessions, todayDateStr]);

  const handleStartPomodoro = (taskId: string) => {
    setSelectedTaskIdForPomodoro(taskId);
    setActiveTab('pomodoro');
  };

  const handleExportICS = () => {
    downloadICalendarFile(planResult.days, schedule, settings.termStartDate);
  };

  const dayCapacity = todayPlan.capacityMinutes;
  const totalAllocated = todayPlan.totalAllocatedMinutes;
  const progressRatio =
    dayCapacity > 0 ? Math.min(100, Math.round((completedMinutesToday / dayCapacity) * 100)) : 0;

  // Stagger animasyon varyantları (her kart 60ms gecikmeli)
  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Gün Başlığı, Seri Rozeti ve Hızlı Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Bugünün Çalışma Akışı</span>
            </span>

            {/* Streak Rozeti */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" />
              <span>
                <AnimatedNumber value={streak.currentStreak} /> Gün Seri
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1 capitalize">
            {format(todayDate, 'd MMMM yyyy, EEEE', { locale: tr })}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Ders programınız arasındaki boş zaman dilimlerine göre optimize edilmiş çalışma saatleri.
          </p>
        </div>

        {/* Aksiyon Butonları (Mobilde tek grup halinde yan yana sığacak şekilde) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={handleExportICS}
            className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            title="Bugünü ve takvimi .ics olarak indir"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>Takvimi İndir</span>
          </motion.button>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={onOpenTaskModal}
            className="btn-primary py-2 px-3.5 text-xs shadow-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Yeni Görev</span>
          </motion.button>
        </div>
      </div>

      {/* Streak Uyarı Bandı (Bugün henüz çalışılmadıysa) */}
      {!streak.hasStudiedToday && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-between gap-3 text-xs text-[var(--text-primary)]">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[var(--accent)] shrink-0 fill-[var(--accent)]" />
            <span>
              <strong>Bugün henüz çalışmadın!</strong> Serini korumak için en az 1 Pomodoro odaklanma seansı bitir.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className="font-bold text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
          >
            Pomodoro&apos;ya Git →
          </button>
        </div>
      )}

      {/* Kapasite Aşımı Uyarısı */}
      {overcapacityTasks.length > 0 && (
        <OvercapacityAlert
          tasks={overcapacityTasks}
          onOpenSettings={() => setActiveTab('settings')}
        />
      )}

      {/* Boş Zaman Yetersizlik Uyarısı */}
      {todayPlan.warning && !todayPlan.overcapacity && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
          <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span>{todayPlan.warning}</span>
        </div>
      )}

      {/* Günlük Kapasite & Boş Zaman İlerleme Kartı */}
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.08)' }}
        transition={{ duration: 0.15 }}
        className="p-3.5 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Bugünkü Odaklanma Hedefi
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
                <AnimatedNumber value={completedMinutesToday} /> / <AnimatedNumber value={dayCapacity} /> dk
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                (<AnimatedNumber value={completedMinutesToday / 60} decimals={1} /> / <AnimatedNumber value={dayCapacity / 60} decimals={1} /> saat)
              </span>
            </div>
          </div>

          {/* İstatistikler: Mobilde alt alta tam genişlikte, masaüstünde yan yana */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-mono tabular-nums w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[var(--border-theme)]">
            <div className="flex items-center justify-between sm:block py-1 sm:py-0 px-2 sm:px-0 rounded-lg sm:rounded-none bg-[var(--bg-page)]/50 sm:bg-transparent">
              <span className="text-[var(--text-muted)] block text-[11px]">Dersler Arası Boşluk</span>
              <span className="font-semibold text-[var(--text-primary)]">
                <AnimatedNumber value={todayPlan.totalFreeMinutes} /> dk Boş Zaman
              </span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-[var(--border-theme)]" />
            <div className="flex items-center justify-between sm:block py-1 sm:py-0 px-2 sm:px-0 rounded-lg sm:rounded-none bg-[var(--bg-page)]/50 sm:bg-transparent">
              <span className="text-[var(--text-muted)] block text-[11px]">Planlanan Yük</span>
              <span className="font-semibold text-[var(--text-primary)]">
                <AnimatedNumber value={totalAllocated} /> dk
              </span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-[var(--border-theme)]" />
            <div className="flex items-center justify-between sm:block py-1 sm:py-0 px-2 sm:px-0 rounded-lg sm:rounded-none bg-[var(--bg-page)]/50 sm:bg-transparent">
              <span className="text-[var(--text-muted)] block text-[11px]">Tamamlanma</span>
              <span className="font-semibold text-[var(--accent)]">
                %<AnimatedNumber value={progressRatio} />
              </span>
            </div>
          </div>
        </div>

        {/* 0'dan gerçek değere 1 saniye yumuşak dolan ilerleme çubuğu */}
        <div className="w-full bg-[var(--bg-page)] h-2 rounded-full overflow-hidden border border-[var(--border-theme)]">
          <motion.div
            className="h-full bg-[var(--accent)] rounded-full"
            initial={shouldReduceMotion ? { width: `${progressRatio}%` } : { width: 0 }}
            animate={{ width: `${progressRatio}%` }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 1.0, ease: 'easeOut' }
            }
          />
        </div>
      </motion.div>

      {/* Bugünün Görev Dağılımı Listesi (Saat Aralıkları ile) */}
      <div className="space-y-3">
        {/* Başlık ve Açıklama: Mobilde alt alta, masaüstünde yan yana */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Boş Zamanlara Yerleştirilmiş Çalışma Blokları
            </h2>
            <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
              ({todayPlan.items.length} Oturum)
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Ders programı boşluklarına göre sıralandı
          </span>
        </div>

        {todayPlan.items.length === 0 ? (
          <div className="p-5 sm:p-8 text-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Bugün için acil bir çalışma oturumu görünmüyor!
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1">
                Tüm teslim tarihleri kontrol altında. Yeni bir ödev veya sınav ekleyebilir veya serbest tekrar yapabilirsiniz.
              </p>
            </div>
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              onClick={onOpenTaskModal}
              className="btn-primary py-2 px-4 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Görev Ekle</span>
            </motion.button>
          </div>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-3"
          >
            {todayPlan.items.map((item) => {
              const task = tasks.find((t) => t.id === item.taskId);
              const risk = task ? calculateRiskScore(task, settings, todayDate) : null;

              // Renk göstergesi
              const riskDotColor =
                item.isReview
                  ? 'bg-purple-500'
                  : item.riskLevel === 'critical'
                  ? 'bg-rose-500'
                  : item.riskLevel === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <motion.div
                  key={item.taskId}
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -2, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.09)' }
                  }
                  transition={{ duration: 0.15 }}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 ${
                    item.isReview
                      ? 'border-purple-500/30 bg-purple-500/5'
                      : 'border-[var(--border-card)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  {/* Sol Bölüm: Ders adı, saat aralığı ve başlık */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${riskDotColor}`}
                      title={item.isReview ? 'Aralıklı Tekrar' : `${item.riskLevel} Risk`}
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          {item.course}
                        </span>
                        <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                        <span className="text-xs text-[var(--text-secondary)] font-medium truncate">
                          {item.taskTitle}
                        </span>

                        {/* Tekrar Oturumu Rozeti */}
                        {item.isReview && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 flex items-center gap-1 border border-purple-500/20">
                            <RotateCcw className="w-3 h-3" />
                            <span>Tekrar Oturumu</span>
                          </span>
                        )}

                        {/* Zorluk Rozeti */}
                        {item.difficulty && (
                          <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">
                            Zorluk: {item.difficulty}/5
                          </span>
                        )}
                      </div>

                      {/* Görev Açıklaması, Teslim ve Boş Zaman Saat Aralığı */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-mono tabular-nums">
                        {item.timeSlot ? (
                          <span className="font-bold text-[var(--accent)] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[var(--accent)]" />
                            {item.timeSlot.startTime} – {item.timeSlot.endTime}
                          </span>
                        ) : (
                          <span>Günün Boş Zamanında</span>
                        )}
                        <span>·</span>
                        <span>Teslim: {item.dueDate}</span>
                        <span>·</span>
                        <span>Süre: {item.plannedMinutes} dk</span>
                        {task && (
                          <>
                            <span>·</span>
                            <span>İlerleme: %<AnimatedNumber value={task.completionPercentage} /></span>
                          </>
                        )}
                      </div>

                      {risk && (
                        <p className="text-[11px] text-[var(--text-secondary)] pt-0.5">
                          {risk.warningMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sağ Bölüm: Hedef Süre & Aksiyon Butonları */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-theme)]">
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--text-muted)] block">Önerilen Süre</span>
                      <span className="font-mono tabular-nums font-bold text-base text-[var(--text-primary)]">
                        {item.plannedMinutes} dk
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        onClick={() => handleStartPomodoro(task ? task.id : item.taskId)}
                        className="btn-primary py-2 px-3 text-xs shadow-xs"
                        title="Bu görev için Pomodoro başlat"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Başlat</span>
                      </motion.button>

                      {task && (
                        <AnimatedCheckButton
                          isCompleted={task.isCompleted}
                          onToggle={() => toggleTaskCompleted(task.id)}
                          title="Tamamlandı olarak işaretle"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
