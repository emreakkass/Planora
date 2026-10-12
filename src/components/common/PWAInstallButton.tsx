import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Uygulamayı Cihazınıza Yükleyin"
      >
        <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span className="hidden sm:inline">Uygulamayı Yükle</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Smartphone className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden sm:inline">iOS'a Yükle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-card)] p-6 shadow-2xl border border-[var(--border-card)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  iPhone / iPad'e Yükle
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-2">
                <p>1. Safari tarayıcınızın alt çubuğundaki <strong>Paylaş</strong> (Share) butonuna dokunun.</p>
                <p>2. Menüyü aşağı kaydırıp <strong>Ana Ekrana Ekle</strong> (Add to Home Screen) seçeneğini seçin.</p>
                <p>3. Sağ üstteki <strong>Ekle</strong> butonuna dokunun.</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full btn-primary py-2 text-xs font-semibold rounded-xl"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
