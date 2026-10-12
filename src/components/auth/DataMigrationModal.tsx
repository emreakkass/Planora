import React from 'react';
import { Database, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudyStore } from '../../store/useStudyStore';

export function DataMigrationModal() {
  const { showMigrationModal, legacyDataCounts, migrateLegacyData, dismissMigrationModal, user } = useAuthStore();
  const { loadUserData, setToast } = useStudyStore();

  if (!showMigrationModal) return null;

  const handleMigrate = async () => {
    const success = await migrateLegacyData();
    if (success && user) {
      loadUserData(user.id);
      setToast('Eski verileriniz başarıyla hesabınıza aktarıldı!');
    }
  };

  const handleDismiss = () => {
    dismissMigrationModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl p-6 space-y-5 text-[var(--text-primary)]">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Mevcut Verilerini Aktarmak İster misin?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Önceki oturumunuzdan kalan veriler tespit edildi:
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-theme)] text-xs space-y-1.5 font-medium">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Kaydedilmiş Görevler:</span>
            <span className="font-mono tabular-nums font-bold text-[var(--accent)]">
              {legacyDataCounts.tasks} adet
            </span>
          </div>
          {legacyDataCounts.schedule > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Ders Programı Öğeleri:</span>
              <span className="font-mono tabular-nums font-bold text-[var(--accent)]">
                {legacyDataCounts.schedule} ders
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Bu verileri yeni oluşturduğunuz <strong>{user?.name}</strong> hesabınıza aktarabilir veya temiz bir başlangıç yapabilirsiniz.
        </p>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 btn-secondary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Hayır, Sıfırdan Başla</span>
          </button>

          <button
            type="button"
            onClick={handleMigrate}
            className="flex-1 btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Evet, Hesabıma Aktar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
