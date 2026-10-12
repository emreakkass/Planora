import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import {
  generateLocalWeeklyReport,
  generateWeeklyReportWithAI,
} from '../lib/ai/weeklyReportEngine';
import { WeeklyReportSummary } from '../types';

export function WeeklyReportView() {
  const { tasks, settings, sessions, setToast } = useStudyStore();
  const [report, setReport] = useState<WeeklyReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sayfa açıldığında raporu oluştur
  useEffect(() => {
    handleGenerateReport();
  }, [tasks, settings, sessions]);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const summary = await generateWeeklyReportWithAI(tasks, settings, sessions, new Date());
      setReport(summary);
    } catch {
      setReport(generateLocalWeeklyReport(tasks, settings, sessions, new Date()));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const text = `PLANORA HAFTALIK AKADEMİK DEĞERLENDİRME RAPORU
Tarih Aralığı: ${report.startDate} — ${report.endDate}

GENEL ÖZET:
${report.executiveSummary}

METRİKLER:
- Planlanan Çalışma Süresi: ${(report.plannedMinutes / 60).toFixed(1)} saat
- Gerçekleşen Çalışma Süresi: ${(report.actualMinutes / 60).toFixed(1)} saat
- Hedef Başarı Oranı: %${report.completionRatePercent}
- Tamamlanan Pomodoro Seansı: ${report.totalSessionsCount}
- Tamamlanan Görev Sayısı: ${report.completedTasksCount}

ÖNERİLER:
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setToast('Rapor panoya kopyalandı.');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!report) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Üst Başlık & Aksiyonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-theme)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Akademik Değerlendirme Raporu</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Haftalık Çalışma Analizi & Mentor Raporu
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Dönem performansınızı artırmak için hazırlanan kişiselleştirilmiş haftalık geri bildirim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--accent)]" />}
            <span>{copied ? 'Kopyalandı' : 'Raporu Kopyala'}</span>
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="btn-primary py-2 px-3.5 text-xs shadow-xs disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Hesaplanıyor...' : 'Yenile'}</span>
          </button>
        </div>
      </div>

      {/* Rapor Kaynak Rozeti */}
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-mono tabular-nums">
            {report.startDate} — {report.endDate} Dönemi
          </span>
        </div>
        <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
          {report.isAiGenerated ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Gemini AI Mentor Analizi</span>
            </>
          ) : (
            <>
              <span>⚙️ Akıllı Kural Tabanlı Mentor Analizi</span>
            </>
          )}
        </span>
      </div>

      {/* Yönetici Özeti (Executive Summary Card) */}
      <div className="p-6 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <span>Haftalık Yönetici Değerlendirmesi</span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-primary)] font-medium">
          {report.executiveSummary}
        </p>
      </div>

      {/* Temel Performans Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
            Planlanan vs Gerçekleşen
          </span>
          <div className="text-lg font-bold font-mono tabular-nums text-[var(--text-primary)]">
            {(report.actualMinutes / 60).toFixed(1)} / {(report.plannedMinutes / 60).toFixed(1)} saat
          </div>
          <span className="text-xs text-[var(--accent)] font-mono tabular-nums font-semibold">
            %{report.completionRatePercent} Hedef Tutarlılığı
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
            En Çok Çalışılan Ders
          </span>
          <div className="text-lg font-bold text-[var(--text-primary)] truncate">
            {report.mostStudiedCourse ? report.mostStudiedCourse.name : 'Veri Yok'}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
            {report.mostStudiedCourse ? `${report.mostStudiedCourse.minutes} dk odaklanıldı` : '—'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] block font-medium">
            Geciken / Yüksek Riskli Ders
          </span>
          <div className="text-lg font-bold text-rose-500 truncate">
            {report.mostDelayedCourse ? report.mostDelayedCourse.name : 'Yok (Dengeli)'}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
            {report.mostDelayedCourse ? `Risk Skoru: ${report.mostDelayedCourse.riskScore}/100` : 'Tüm teslimler kontrol altında'}
          </span>
        </div>
      </div>

      {/* Aksiyon Odaklı Öneriler Listesi */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          <span>Gelecek Hafta İçin Mentor Tavsiyeleri</span>
        </h3>

        <div className="space-y-3">
          {report.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-theme)]"
            >
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-[#182524] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-mono tabular-nums">
                {index + 1}
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ders Dağılımı Tablosu */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-xs">
        <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--accent)]" />
          <span>Ders Bazında Zaman Kullanım Dökümü</span>
        </h3>

        {report.courseBreakdown.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-2">
            Son 7 gün içinde tamamlanmış oturum bulunmuyor.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border-theme)] text-xs">
            {report.courseBreakdown.map((item) => (
              <div key={item.course} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-[var(--text-primary)]">
                  {item.course}
                </span>
                <div className="flex items-center gap-4 font-mono tabular-nums">
                  <span className="text-[var(--text-muted)]">{item.minutes} dakika</span>
                  <span className="font-bold text-[var(--accent)]">
                    %{item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
