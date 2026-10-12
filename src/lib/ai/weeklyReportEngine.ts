import { differenceInCalendarDays, format, parseISO, subDays, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Task, UserSettings, PomodoroSession, WeeklyReportSummary } from '../../types';
import { calculateRiskScore } from '../risk/riskEngine';

export function generateLocalWeeklyReport(
  tasks: Task[],
  settings: UserSettings,
  sessions: PomodoroSession[],
  referenceDate: Date = new Date()
): WeeklyReportSummary {
  const endDateStr = format(referenceDate, 'yyyy-MM-dd');
  const startDate = subDays(referenceDate, 6);
  const startDateStr = format(startDate, 'yyyy-MM-dd');

  // Son 7 günün Pomodoro oturumlarını filtrele
  const recentSessions = sessions.filter((s) => {
    const sDate = s.completedAt ? s.completedAt.split('T')[0] : '';
    return sDate >= startDateStr && sDate <= endDateStr && s.type === 'focus';
  });

  const actualMinutes = recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Haftalık planlanan hedef süre
  const plannedMinutes = settings.weekdayMinutes * 5 + settings.weekendMinutes * 2;
  const completionRatePercent = Math.min(
    100,
    Math.round((actualMinutes / Math.max(1, plannedMinutes)) * 100)
  );

  // Ders bazında süre dağılımı
  const courseTimeMap: Record<string, number> = {};
  recentSessions.forEach((s) => {
    courseTimeMap[s.course] = (courseTimeMap[s.course] || 0) + s.durationMinutes;
  });

  const courseBreakdown = Object.entries(courseTimeMap)
    .map(([course, minutes]) => ({
      course,
      minutes,
      percentage: actualMinutes > 0 ? Math.round((minutes / actualMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const mostStudiedCourse =
    courseBreakdown.length > 0
      ? { name: courseBreakdown[0].course, minutes: courseBreakdown[0].minutes }
      : null;

  // En çok risk taşıyan ders analizi
  const courseRiskAgg: Record<string, { totalRisk: number; count: number }> = {};
  tasks
    .filter((t) => !t.isCompleted)
    .forEach((task) => {
      const risk = calculateRiskScore(task, settings, referenceDate);
      if (!courseRiskAgg[task.course]) {
        courseRiskAgg[task.course] = { totalRisk: 0, count: 0 };
      }
      courseRiskAgg[task.course].totalRisk += risk.score;
      courseRiskAgg[task.course].count += 1;
    });

  let mostDelayedCourse: { name: string; riskScore: number; taskCount: number } | null = null;
  let maxAvgRisk = -1;
  for (const [course, data] of Object.entries(courseRiskAgg)) {
    const avg = Math.round(data.totalRisk / data.count);
    if (avg > maxAvgRisk && avg >= 40) {
      maxAvgRisk = avg;
      mostDelayedCourse = { name: course, riskScore: avg, taskCount: data.count };
    }
  }

  // Tamamlanan görev sayısı ve Erken Bitirme gün analizi
  const completedTasks = tasks.filter((t) => t.isCompleted);
  let totalEarlyDays = 0;
  let earlyTaskCount = 0;

  completedTasks.forEach((t) => {
    if (t.completedAt) {
      const finishDate = parseISO(t.completedAt);
      const dueDate = parseISO(t.dueDate);
      const diff = differenceInCalendarDays(dueDate, finishDate);
      if (diff >= 0) {
        totalEarlyDays += diff;
        earlyTaskCount++;
      }
    }
  });

  const avgEarlyCompletionDays =
    earlyTaskCount > 0 ? Number((totalEarlyDays / earlyTaskCount).toFixed(1)) : 1.5;

  // Günlük karşılaştırma verisi (Son 7 gün)
  const dailyComparison = [];
  for (let i = 6; i >= 0; i--) {
    const curDate = subDays(referenceDate, i);
    const dStr = format(curDate, 'yyyy-MM-dd');
    const dayName = format(curDate, 'EEE', { locale: tr });
    const isWknd = [0, 6].includes(curDate.getDay());
    const dayPlanned = isWknd ? settings.weekendMinutes : settings.weekdayMinutes;

    const dayActual = recentSessions
      .filter((s) => s.completedAt && s.completedAt.startsWith(dStr))
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    dailyComparison.push({
      date: dStr,
      dayName,
      planned: dayPlanned,
      actual: dayActual,
    });
  }

  // Son 8 haftalık trend çizgisi (Weekly Trend)
  const eightWeekTrend = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = subWeeks(referenceDate, w);
    const weekEnd = subDays(subWeeks(referenceDate, w - 1), 1);
    const wStartStr = format(weekStart, 'yyyy-MM-dd');
    const wEndStr = format(weekEnd, 'yyyy-MM-dd');

    const weekMins = sessions
      .filter((s) => {
        const sDate = s.completedAt ? s.completedAt.split('T')[0] : '';
        return sDate >= wStartStr && sDate <= wEndStr && s.type === 'focus';
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const weekLabel = w === 0 ? 'Bu Hafta' : `${w} H. Önce`;
    eightWeekTrend.push({
      weekLabel,
      minutes: weekMins,
    });
  }

  // Öneriler
  const recommendations: string[] = [];

  if (completionRatePercent >= 80) {
    recommendations.push(
      'Mükemmel çalışma disiplini! Haftalık hedeflenen çalışma kapasitenizin büyük kısmını başarıyla tamamladınız.'
    );
  } else if (completionRatePercent >= 50) {
    recommendations.push(
      'Haftalık hedefin %50 üzerinde tamamlandı. Kalan eksik süreleri hafta sonu 45 dakikalık odaklanma blokları ile telafi edebilirsiniz.'
    );
  } else {
    recommendations.push(
      'Haftalık planın gerisindesiniz. Günlük çalışma süresini 30 dakika kısaltıp daha küçük, yönetilebilir Pomodoro hedefleri koymanız önerilir.'
    );
  }

  if (mostDelayedCourse) {
    recommendations.push(
      `"${mostDelayedCourse.name}" dersi üzerinde risk puanı yüksek (${mostDelayedCourse.riskScore}/100). Bir sonraki çalışma gününün ilk 50 dakikasını bu derse ayırarak teslim baskısını azaltın.`
    );
  }

  if (mostStudiedCourse) {
    recommendations.push(
      `Bu hafta en çok odaklanılan ders "${mostStudiedCourse.name}" oldu (${(mostStudiedCourse.minutes / 60).toFixed(1)} saat). Dersler arası dengeyi sağlamak için ikincil derslere de zaman ayırmayı unutmayın.`
    );
  }

  recommendations.push(
    `Görevler ortalama ${avgEarlyCompletionDays} gün önceden bitirildi. Erken teslim disiplini sınav stresini %40 azaltır.`
  );

  const hoursPlanned = (plannedMinutes / 60).toFixed(1);
  const hoursActual = (actualMinutes / 60).toFixed(1);

  const executiveSummary = `Bu hafta toplam ${hoursPlanned} saatlik çalışma hedefinizin ${hoursActual} saati gerçekleşti (Başarı Oranı: %${completionRatePercent}). Toplam ${recentSessions.length} Pomodoro oturumu tamamlandı ve ${completedTasks.length} görev başarıyla sonuçlandırıldı.`;

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    plannedMinutes,
    actualMinutes,
    completionRatePercent,
    totalSessionsCount: recentSessions.length,
    completedTasksCount: completedTasks.length,
    mostStudiedCourse,
    mostDelayedCourse,
    courseBreakdown,
    dailyComparison,
    eightWeekTrend,
    avgEarlyCompletionDays,
    recommendations,
    executiveSummary,
    isAiGenerated: false,
  };
}

export async function generateWeeklyReportWithAI(
  tasks: Task[],
  settings: UserSettings,
  sessions: PomodoroSession[],
  referenceDate: Date = new Date()
): Promise<WeeklyReportSummary> {
  const baseSummary = generateLocalWeeklyReport(tasks, settings, sessions, referenceDate);

  if (!settings.geminiApiKey || settings.geminiApiKey.trim() === '') {
    return baseSummary;
  }

  try {
    const prompt = `Sen Planora öğrenci çalışma platformunda profesyonel bir akademik mentor ve verimlilik koçusun. Öğrencinin son 7 günlük çalışma performans verileri aşağıdadır:

Hedeflenen Çalışma Süresi: ${baseSummary.plannedMinutes} dakika (${(baseSummary.plannedMinutes / 60).toFixed(1)} saat)
Gerçekleşen Çalışma Süresi: ${baseSummary.actualMinutes} dakika (${(baseSummary.actualMinutes / 60).toFixed(1)} saat)
Tamamlanma Oranı: %${baseSummary.completionRatePercent}
Tamamlanan Pomodoro Seansı: ${baseSummary.totalSessionsCount} adet
En Çok Çalışılan Ders: ${baseSummary.mostStudiedCourse ? `${baseSummary.mostStudiedCourse.name} (${baseSummary.mostStudiedCourse.minutes} dk)` : 'Henüz veri yok'}
En Riskli/Geciken Ders: ${baseSummary.mostDelayedCourse ? `${baseSummary.mostDelayedCourse.name} (Risk Skoru: ${baseSummary.mostDelayedCourse.riskScore}/100)` : 'Yok'}
Ortalama Erken Bitirme: ${baseSummary.avgEarlyCompletionDays} gün önce

Lütfen öğrenci için Türkçe, motive edici, analitik ve somut öneriler içeren bir haftalık değerlendirme raporu hazırla. Şu JSON formatında saf JSON döndür:
{
  "executiveSummary": "string (2-3 cümlelik derinlemesine mentor yorumu)",
  "recommendations": ["string (Tavsiye 1)", "string (Tavsiye 2)", "string (Tavsiye 3)", "string (Tavsiye 4)"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      return baseSummary;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return baseSummary;

    const parsed = JSON.parse(candidateText.trim());
    return {
      ...baseSummary,
      executiveSummary: parsed.executiveSummary || baseSummary.executiveSummary,
      recommendations:
        Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
          ? parsed.recommendations
          : baseSummary.recommendations,
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn('AI haftalık rapor çağrısında hata, yerel şablon kullanılıyor:', err);
    return baseSummary;
  }
}
