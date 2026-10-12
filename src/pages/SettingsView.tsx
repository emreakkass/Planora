import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  Bell,
  Calendar,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Sun,
  Moon,
  Laptop,
  User,
  LogOut,
  Palette,
} from 'lucide-react';
import { useStudyStore } from '../store/useStudyStore';
import { useAuthStore } from '../store/useAuthStore';
import { storageService } from '../lib/storage';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  NotificationStatus,
} from '../lib/notifications/notificationService';
import { ThemeMode } from '../lib/theme';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function SettingsView() {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    clearAllData,
    setToast,
    importJsonData,
  } = useStudyStore();

  const { user, isGuest, logout } = useAuthStore();

  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('default');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNotificationStatus(getNotificationPermissionStatus());
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(getNotificationPermissionStatus());
    if (granted) {
      updateSettings({ notificationsEnabled: true });
      setToast('Bildirimler başarıyla etkinleştirildi.');
    } else {
      updateSettings({ notificationsEnabled: false });
      setToast('Bildirim izni verilmedi.');
    }
  };

  const handleExportJson = () => {
    const jsonStr = storageService.exportAllData(user?.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planora-yedek-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Verileriniz planora-yedek JSON olarak indirildi.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importJsonData(content);
        if (res.success) {
          setToast('Yedek başarıyla Planora veritabanına aktarıldı.');
        } else {
          setToast(`Hata: ${res.message}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    updateSettings({ theme: newTheme });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Üst Başlık */}
      <div className="pb-3 border-b border-[var(--border-theme)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Uygulama Ayarları & Tercihler
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Görünüm, ders programı parametreleri, bildirimler ve çalışma kapasitenizi kişiselleştirin.
        </p>
      </div>

      {/* 1. GÖRÜNÜM (Açık / Koyu / Sistem) */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border-theme)] pb-3">
          <Palette className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            Görünüm & Tema Modu
          </h3>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Planora&apos;nın Replit tarzı sakinleştirici renk paletini tercih ettiğiniz ışık seviyesine göre ayarlayın.
        </p>

        {/* Segmented Control */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Açık</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Koyu</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              settings.theme === 'system'
                ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Sistem</span>
          </button>
        </div>

        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 pt-1">
          <span>Seçili Mod:</span>
          <strong className="text-[var(--accent)] font-semibold">
            {settings.theme === 'light'
              ? 'Açık Tema (#F9F6F1 / #243D3B)'
              : settings.theme === 'dark'
              ? 'Koyu Tema (#182524 / #EFBD67)'
              : 'İşletim Sistemi Ayarına Göre Otomatik'}
          </strong>
        </div>
      </div>

      {/* 2. KULLANICI HESABI & OTURUM */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-theme)] pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Kullanıcı Hesabı & Oturum
            </h3>
          </div>
          <span className="badge-accent">
            {isGuest ? 'Misafir Oturumu' : 'Kayıtlı Kullanıcı'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-theme)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--btn-primary)] text-[var(--btn-primary-text)] flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'Ö'}
            </div>
            <div>
              <div className="font-bold text-xs text-[var(--text-primary)]">
                {user?.name || 'Öğrenci'}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                {user?.email || 'ogrenci@planora.app'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* 3. Uyanıklık Saatleri (Boş Zaman Bulucu) */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border-theme)] pb-3">
          <Clock className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            Günlük Uyanıklık Aralığı (Boş Zaman Bulucu)
          </h3>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          Planora, çalışma bloklarını ders programınız ile uyanıklık saatleriniz arasındaki boşluklara yerleştirir.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Güne Başlama Saati (Uyanış)
            </label>
            <input
              type="time"
              value={settings.awakeStartTime || '08:00'}
              onChange={(e) => updateSettings({ awakeStartTime: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Günü Bitirme Saati (Yatış)
            </label>
            <input
              type="time"
              value={settings.awakeEndTime || '23:00'}
              onChange={(e) => updateSettings({ awakeEndTime: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. A/B Hafta Desteği & Dönem Başlangıcı */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border-theme)] pb-3">
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            A/B (Tek / Çift) Hafta Döngüsü
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                A/B Hafta Ayrımını Etkinleştir
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] block">
                Fakültenizde iki haftada bir değişen laboratuvar veya dersler varsa açın.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.abWeekEnabled}
              onChange={(e) => updateSettings({ abWeekEnabled: e.target.checked })}
              className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
            />
          </div>

          {settings.abWeekEnabled && (
            <div className="space-y-1.5 pt-2 border-t border-[var(--border-theme)]">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Akademik Dönem Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={settings.termStartDate || '2026-09-21'}
                onChange={(e) => updateSettings({ termStartDate: e.target.value })}
                className="w-full sm:w-64 px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
              />
              <p className="text-[11px] text-[var(--text-secondary)]">
                Hafta tipi (A veya B), bu tarihten itibaren geçen takvim haftası sayısına göre otomatik belirlenir.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bildirim Hatırlatmaları */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-theme)] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Tarayıcı Bildirimleri & Hatırlatıcılar
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              notificationStatus === 'granted'
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : notificationStatus === 'denied'
                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                : 'bg-[var(--bg-page)] text-[var(--text-muted)] border border-[var(--border-theme)]'
            }`}
          >
            {notificationStatus === 'granted'
              ? 'İzin Verildi'
              : notificationStatus === 'denied'
              ? 'Engellendi'
              : 'İzin Bekleniyor'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                Masaüstü Bildirim İzni
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Sabah plan özeti, yaklaşan ders blokları ve Pomodoro bitiş bildirimleri için gereklidir.
              </p>
            </div>

            {notificationStatus !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestNotifications}
                className="btn-primary py-2 px-3 text-xs whitespace-nowrap cursor-pointer"
              >
                Bildirim İzni İste
              </button>
            ) : (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Aktif
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-theme)]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Çalışma Bloğundan Kaç Dakika Önce Hatırlatılsın?
              </label>
              <select
                value={settings.notificationLeadMinutes || 15}
                onChange={(e) => updateSettings({ notificationLeadMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
              >
                <option value={5}>5 Dakika Önce</option>
                <option value={10}>10 Dakika Önce</option>
                <option value={15}>15 Dakika Önce (Önerilen)</option>
                <option value={30}>30 Dakika Önce</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Günlük Çalışma Kapasitesi */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[var(--border-theme)] pb-3">
          <Clock className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            Günlük Çalışma Kapasitesi (Planlama Motoru)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[var(--text-primary)]">
                Hafta İçi Günlük Kapasite
              </span>
              <span className="font-mono tabular-nums font-bold text-[var(--accent)]">
                {settings.weekdayMinutes} dk ({(settings.weekdayMinutes / 60).toFixed(1)} saat/gün)
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={480}
              step={15}
              value={settings.weekdayMinutes}
              onChange={(e) => updateSettings({ weekdayMinutes: Number(e.target.value) })}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[var(--text-primary)]">
                Hafta Sonu Günlük Kapasite
              </span>
              <span className="font-mono tabular-nums font-bold text-[var(--accent)]">
                {settings.weekendMinutes} dk ({(settings.weekendMinutes / 60).toFixed(1)} saat/gün)
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={600}
              step={15}
              value={settings.weekendMinutes}
              onChange={(e) => updateSettings({ weekendMinutes: Number(e.target.value) })}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 7. Pomodoro Zamanlayıcı Süreleri */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border-theme)] pb-3">
          <Clock className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            Pomodoro Zamanlayıcı Süreleri
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Odaklanma Süresi
            </label>
            <select
              value={settings.pomodoroFocusMinutes}
              onChange={(e) => updateSettings({ pomodoroFocusMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
            >
              <option value={20}>20 Dakika</option>
              <option value={25}>25 Dakika (Klasik)</option>
              <option value={30}>30 Dakika</option>
              <option value={45}>45 Dakika</option>
              <option value={50}>50 Dakika</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Kısa Mola
            </label>
            <select
              value={settings.pomodoroShortBreakMinutes}
              onChange={(e) => updateSettings({ pomodoroShortBreakMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
            >
              <option value={3}>3 Dakika</option>
              <option value={5}>5 Dakika</option>
              <option value={10}>10 Dakika</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Uzun Mola
            </label>
            <select
              value={settings.pomodoroLongBreakMinutes}
              onChange={(e) => updateSettings({ pomodoroLongBreakMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-lg text-[var(--text-primary)] font-mono"
            >
              <option value={15}>15 Dakika</option>
              <option value={20}>20 Dakika</option>
              <option value={30}>30 Dakika</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8. Veri Yönetimi & JSON Yedekleme */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border-theme)] pb-3">
          <Download className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            Veri Yönetimi & JSON Yedekleme
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-page)] hover:bg-[var(--border-light)] border border-[var(--border-theme)] rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[var(--accent)]" />
            <span>Tüm Verileri Dışa Aktar (planora-yedek.json)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-page)] hover:bg-[var(--border-light)] border border-[var(--border-theme)] rounded-xl transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[var(--accent)]" />
              <span>Yedekten Geri Yükle (JSON)</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border-theme)] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => resetToDemoData()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-page)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Örnek Demo Verilerini Yükle</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tüm Verileri Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Uygulama İçi Silme Onay Modalı */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => clearAllData()}
        title="Tüm Verileri Sıfırla"
        description="Tüm görevleriniz, ders programınız ve çalışma kayıtlarınız kalıcı olarak silinecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
        confirmText="Tümünü Sil"
        cancelText="İptal"
        isDanger={true}
      />
    </div>
  );
}
