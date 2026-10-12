import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { Task, UserSettings, RiskAssessment, RiskLevel } from '../../types';

/**
 * ============================================================================
 * PLANORA RİSK DEĞERLENDİRME ALGORİTMASI & FORMÜL AÇIKLAMASI
 * ============================================================================
 * 
 * Bu risk sistemi, öğrencinin akademik yükünü deterministik bir matematiksel
 * modele göre 0 ile 100 arasında bir risk skoru olarak hesaplar.
 * 
 * Risk Skoru Hesaplama Adımları:
 * 
 * 1. Kalan İş Yükü (Remaining Minutes):
 *    remainingMinutes = estimatedTotalMinutes * (1 - completionPercentage / 100)
 *    Eğer görev %100 tamamlandıysa, Risk = 0 (Risk Yok / Tamamlandı).
 * 
 * 2. Kalan Gün Sayısı (Remaining Days):
 *    remainingDays = differenceInCalendarDays(dueDate, currentDate)
 *    - remainingDays < 0: Görev gecikmiş (Overdue). Anında Risk = 100.
 *    - remainingDays === 0: Teslim tarihi bugün! Anında minimum Risk = 90.
 * 
 * 3. Günlük Gerekli Çalışma Yoğunluğu (Required Daily Minutes):
 *    requiredDailyMinutes = remainingMinutes / Math.max(1, remainingDays)
 * 
 * 4. Öğrencinin Günlük Çalışma Kapasitesi (Effective Daily Capacity):
 *    avgDailyCapacity = (settings.weekdayMinutes * 5 + settings.weekendMinutes * 2) / 7
 * 
 * 5. Kapasite Baskı Oranı (Capacity Pressure Ratio):
 *    pressureRatio = requiredDailyMinutes / Math.max(30, avgDailyCapacity)
 * 
 * 6. Öncelik Çarpanı (Priority Factor):
 *    - critical : 1.35
 *    - high     : 1.15
 *    - medium   : 1.00
 *    - low      : 0.80
 * 
 * 7. Tür Çarpanı (Type Factor):
 *    - exam (Sınav)       : 1.25 (Telafisi zor ve yoğun tekrar ister)
 *    - project (Proje)    : 1.15 (Öngörülemeyen teknik hata payı taşır)
 *    - assignment (Ödev)  : 1.00
 * 
 * 8. Zorluk Çarpanı (Difficulty Factor - 1-5 Skalası):
 *    difficulty = task.difficulty || 3 (Varsayılan: 3)
 *    difficultyFactor = 0.75 + (difficulty * 0.12)
 *    - 1/5 (Çok Kolay) : 0.87
 *    - 2/5 (Kolay)      : 0.99
 *    - 3/5 (Orta)       : 1.11
 *    - 4/5 (Zor)        : 1.23
 *    - 5/5 (Çok Zor)    : 1.35 (Karmaşık dersler risk skorunu yukarı taşır)
 * 
 * 9. Yakınlık Katlama Cezası (Urgency Penalty):
 *    - Kalan gün <= 2 ise: +22 ek puan (Kritik son dönemeç)
 *    - Kalan gün <= 4 ise: +12 ek puan
 *    - Kalan gün <= 7 ise: +5 ek puan
 * 
 * 10. Nihai Skor (Final Score):
 *    rawScore = (pressureRatio * 52) * priorityFactor * typeFactor * difficultyFactor + urgencyPenalty
 *    riskScore = clamp(0, 100, Math.round(rawScore))
 * 
 * 11. Seviye Sınıflandırması:
 *    - 75 - 100 : CRITICAL / YÜKSEK RİSK (Kırmızı 🔴)
 *    - 45 - 74  : MEDIUM / ORTA RİSK    (Turuncu 🟠)
 *    - 0  - 44  : LOW / DÜŞÜK RİSK      (Yeşil 🟢)
 * ============================================================================
 */

export function calculateRiskScore(
  task: Task,
  settings: UserSettings,
  currentDateInput: Date = new Date()
): RiskAssessment {
  const difficulty = typeof task.difficulty === 'number' ? task.difficulty : 3;
  const difficultyFactor = Number((0.75 + difficulty * 0.12).toFixed(2));

  // Görev tamamlandıysa sıfır risk
  if (task.isCompleted || task.completionPercentage >= 100) {
    return {
      score: 0,
      level: 'low',
      label: 'Tamamlandı',
      colorHex: '#10B981', // Emerald (Tamamlandı)
      warningMessage: 'Tebrikler! Bu görev başarıyla tamamlandı.',
      remainingMinutes: 0,
      remainingDays: 0,
      dailyMinutesRequired: 0,
      isOverdue: false,
      pressureFactor: 0,
      difficultyFactor,
    };
  }

  const currentDate = startOfDay(currentDateInput);
  const dueDate = startOfDay(parseISO(task.dueDate));
  const remainingDays = differenceInCalendarDays(dueDate, currentDate);

  // Kalan iş dakikası
  const remainingMinutes = Math.max(
    0,
    Math.round(task.estimatedTotalMinutes * (1 - task.completionPercentage / 100))
  );

  // Gecikmiş görev (Overdue)
  if (remainingDays < 0) {
    return {
      score: 100,
      level: 'critical',
      label: 'Süresi Geçti',
      colorHex: '#EF4444', // Red-500 (High Risk)
      warningMessage: `Teslim tarihi ${Math.abs(remainingDays)} gün önce geçti! Kalan ${remainingMinutes} dakikalık iş yükü acil tamamlanmalıdır.`,
      remainingMinutes,
      remainingDays,
      dailyMinutesRequired: remainingMinutes,
      isOverdue: true,
      pressureFactor: 2.0,
      difficultyFactor,
    };
  }

  // Teslim tarihi tam bugün
  if (remainingDays === 0) {
    const isHigh = remainingMinutes > 60;
    return {
      score: isHigh ? 100 : 90,
      level: 'critical',
      label: 'Bugün Teslim!',
      colorHex: '#EF4444', // Red-500 (High Risk)
      warningMessage: `Teslim tarihi bugün! Bitirmek için yaklaşık ${remainingMinutes} dakika (${(remainingMinutes / 60).toFixed(1)} saat) çalışma gerekiyor.`,
      remainingMinutes,
      remainingDays: 0,
      dailyMinutesRequired: remainingMinutes,
      isOverdue: false,
      pressureFactor: 1.8,
      difficultyFactor,
    };
  }

  // Öğrencinin ortalama günlük kapasitesi
  const avgDailyCapacity = Math.max(
    30,
    (settings.weekdayMinutes * 5 + settings.weekendMinutes * 2) / 7
  );

  // Günlük gereken süre
  const dailyMinutesRequired = Math.round(remainingMinutes / Math.max(1, remainingDays));

  // Kapasite baskı oranı
  const pressureRatio = dailyMinutesRequired / avgDailyCapacity;

  // Öncelik çarpanı
  let priorityFactor = 1.0;
  if (task.priority === 'critical') priorityFactor = 1.35;
  else if (task.priority === 'high') priorityFactor = 1.15;
  else if (task.priority === 'low') priorityFactor = 0.8;

  // Tür çarpanı
  let typeFactor = 1.0;
  if (task.type === 'exam') typeFactor = 1.25;
  else if (task.type === 'project') typeFactor = 1.15;

  // Kalan gün aciliyet cezası
  let urgencyPenalty = 0;
  if (remainingDays <= 2) urgencyPenalty = 22;
  else if (remainingDays <= 4) urgencyPenalty = 12;
  else if (remainingDays <= 7) urgencyPenalty = 5;

  // Baz skor hesaplaması (Zorluk çarpanı dahil)
  const baseScore = pressureRatio * 52 * priorityFactor * typeFactor * difficultyFactor;
  const totalScore = Math.min(100, Math.max(5, Math.round(baseScore + urgencyPenalty)));

  // Risk sınıflandırması ve uyarı metni
  let level: RiskLevel = 'low';
  let colorHex = '#10B981'; // Emerald (Düşük Risk)
  let label = 'Kontrol Altında';
  let warningMessage = 'Plan dengeli. Günlük düzenli çalışma ile zamanında rahatça tamamlanabilir.';

  if (totalScore >= 75) {
    level = 'critical';
    colorHex = '#EF4444'; // Red-500 (Yüksek Risk)
    label = 'Yüksek Risk';
    if (difficulty >= 4) {
      warningMessage = `Kritik: Yüksek zorluk derecesi (${difficulty}/5) ve yaklaşan teslim (${remainingDays} gün) acil odaklanma gerektiriyor.`;
    } else if (pressureRatio > 0.8) {
      warningMessage = `Kritik Uyarı: Teslim tarihine yalnızca ${remainingDays} gün kaldı ve gereken günlük süre (${dailyMinutesRequired} dk) kapasitenizi zorluyor.`;
    } else {
      warningMessage = `Yüksek Öncelik: Teslim tarihine ${remainingDays} gün var; gecikme yaşamamak için bugün çalışmaya başlanmalıdır.`;
    }
  } else if (totalScore >= 45) {
    level = 'medium';
    colorHex = '#F59E0B'; // Amber-500 (Orta Risk)
    label = 'Orta Risk';
    warningMessage = `Dikkat: Teslim tarihine ${remainingDays} gün var. Günlük yaklaşık ${dailyMinutesRequired} dk ayırarak güvenli tempoyu koruyabilirsiniz.`;
  }

  return {
    score: totalScore,
    level,
    label,
    colorHex,
    warningMessage,
    remainingMinutes,
    remainingDays,
    dailyMinutesRequired,
    isOverdue: false,
    pressureFactor: Number(pressureRatio.toFixed(2)),
    difficultyFactor,
  };
}
