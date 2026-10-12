import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudyStore } from '../../store/useStudyStore';
import { calculatePasswordStrength } from '../../lib/auth/crypto';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
}

export function AuthView({ initialMode = 'login' }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, guestLogin, isLoading, isAuthenticated } = useAuthStore();
  const { setActiveTab } = useStudyStore();

  // Oturum açıkken giriş/kayıt sayfasında kalmasın, doğrudan ana sayfaya gitsin
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('today');
    }
  }, [isAuthenticated, setActiveTab]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Touched state for instant validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const strength = calculatePasswordStrength(password);

  const errors = {
    name: mode === 'register' && touched.name && !name.trim() ? 'Lütfen adınızı ve soyadınızı girin.' : '',
    email:
      touched.email && (!email.trim() || !validateEmail(email))
        ? 'Lütfen geçerli bir e-posta adresi girin (örn. ad@universite.edu.tr).'
        : '',
    password:
      touched.password && password.length < 8
        ? 'Şifreniz en az 8 karakter olmalıdır.'
        : '',
    passwordConfirm:
      mode === 'register' && touched.passwordConfirm && password !== passwordConfirm
        ? 'Şifreler birbiriyle eşleşmiyor.'
        : '',
    terms:
      mode === 'register' && touched.terms && !acceptTerms
        ? 'Devam etmek için kullanım şartlarını kabul etmelisiniz.'
        : '',
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      passwordConfirm: true,
      terms: true,
    });

    if (!validateEmail(email)) {
      setFormError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (password.length < 8) {
      setFormError('Şifre en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setFormError('Lütfen ad ve soyadınızı girin.');
        return;
      }
      if (password !== passwordConfirm) {
        setFormError('Şifreler birbiriyle uyuşmuyor.');
        return;
      }
      if (!acceptTerms) {
        setFormError('Devam etmek için kullanım şartlarını onaylamalısınız.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password, rememberMe);
        if (!res.success) {
          setFormError(res.error || 'Giriş yapılamadı.');
        }
      } else {
        const res = await register(name, email, password);
        if (!res.success) {
          setFormError(res.error || 'Kayıt oluşturulamadı.');
        } else {
          // Kayıt onay mesajı göster ve kullanıcıyı hemen giriş yapmaya yönlendir
          setSuccessMessage('Hesabınız başarıyla kaydedildi! Lütfen belirlediğiniz şifre ile giriş yapın.');
          setMode('login');
          setPassword('');
          setPasswordConfirm('');
          setFormError(null);
          setTouched({});
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestEntry = async () => {
    setSubmitting(true);
    try {
      await guestLogin();
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--bg-page)] transition-colors duration-200">
      <div className="w-full max-w-5xl bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* SOL BÖLME: Replit Koyu Yeşil Marka Paneli */}
        <div className="hidden lg:flex lg:col-span-5 bg-[var(--sidebar-bg)] p-8 lg:p-10 text-white flex-col justify-between relative overflow-hidden">
          {/* Arka Plan Işık Efekti */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />

          {/* Üst Logo & Başlık */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-[var(--accent)]/40 flex items-center justify-center shadow-md p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[var(--accent)]" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M30 20 V80" />
                  <path d="M30 20 H60 C75 20 85 32 85 46 C85 60 75 72 60 72 H30" stroke="var(--accent)" />
                  <circle cx="58" cy="46" r="6" fill="var(--accent)" stroke="none" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white block">Planora</span>
                <span className="text-xs text-[var(--accent)] font-medium tracking-wide">AKILLI AKADEMİK PLANLAYICI</span>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed pt-2">
              Dersler, sınavlar ve projeler arasında boğulmadan haftanı dengeli planla.
            </p>
          </div>

          {/* Orta Özellikler */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-xl bg-white/10 text-[var(--accent)] shrink-0">
                <Calendar className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-white">A/B Hafta Ders Programı</div>
                <div className="text-white/70 leading-relaxed">
                  Uyanıklık aralığına göre gün içindeki boş zaman bloklarını otomatik bulur.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-xl bg-white/10 text-[var(--accent)] shrink-0">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-white">Aralıklı Tekrar & Risk Analizi</div>
                <div className="text-white/70 leading-relaxed">
                  1-3-7 gün spaced repetition oturumları ve gecikme riski uyarı motoru.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="p-2 rounded-xl bg-white/10 text-[var(--accent)] shrink-0">
                <Clock className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-white">Pomodoro & Seri (Streak) Takibi</div>
                <div className="text-white/70 leading-relaxed">
                  Odak oturumlarıyla çalışma alışkanlığını koru, motivasyonunu artır.
                </div>
              </div>
            </div>
          </div>

          {/* Alt Güvenlik Notu */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center gap-2.5 text-[11px] text-white/70">
            <Shield className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>Web Crypto PBKDF2 (SHA-256) yerel şifreleme ve güvenli oturum.</span>
          </div>
        </div>

        {/* SAĞ BÖLME: Giriş / Kayıt Formu */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Mobil Logo Görünümü */}
            <div className="flex lg:hidden items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--accent)]/40 flex items-center justify-center p-2 text-white">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[var(--accent)]" strokeWidth="12">
                  <path d="M30 20 V80" />
                  <path d="M30 20 H60 C75 20 85 32 85 46 C85 60 75 72 60 72 H30" stroke="var(--accent)" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-[var(--text-primary)]">Planora</span>
                <span className="text-[11px] text-[var(--text-muted)] block">Akıllı Ders & Sınav Planlayıcı</span>
              </div>
            </div>

            {/* Segmentli Sekme: Giriş Yap / Kayıt Ol */}
            <div className="flex p-1 bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-primary-text)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Yeni Hesap Oluştur
              </button>
            </div>

            {/* Başlık */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {mode === 'login' ? 'Tekrar Hoş Geldin' : 'Planora Ailesine Katıl'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {mode === 'login'
                  ? 'Kayıtlı e-posta adresin ve şifren ile oturum aç.'
                  : 'Çalışma planını, ders programını ve hedeflerini kişiselleştir.'}
              </p>
            </div>

            {/* Başarı Bildirimi (Kayıt Sonrası Doğrulama) */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span className="font-semibold leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Hata Bildirimi */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ad Soyad (Sadece Kayıt) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                    <span>Ad Soyad</span>
                    {touched.name && !errors.name && name && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Örn: Deniz Yılmaz"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] focus:border-[var(--accent)] rounded-xl outline-hidden text-[var(--text-primary)] transition-all"
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
                </div>
              )}

              {/* E-posta */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                  <span>E-posta Adresi</span>
                  {touched.email && !errors.email && email && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="ogrenci@universite.edu.tr"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] focus:border-[var(--accent)] rounded-xl outline-hidden text-[var(--text-primary)] transition-all font-sans"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
              </div>

              {/* Şifre */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between">
                  <span>Şifre</span>
                  {mode === 'register' && password && (
                    <span className="text-[11px] font-semibold" style={{ color: strength.color }}>
                      Güç: {strength.label}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="En az 8 karakter"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] focus:border-[var(--accent)] rounded-xl outline-hidden text-[var(--text-primary)] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    aria-label="Şifreyi Göster/Gizle"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Şifre Güç Göstergesi (Kayıt ekranında) */}
                {mode === 'register' && password && (
                  <div className="pt-1 space-y-1">
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      <div
                        className={`rounded-full transition-all ${
                          strength.score >= 1 ? 'bg-rose-500' : 'bg-[var(--border-theme)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all ${
                          strength.score >= 2 ? 'bg-amber-500' : 'bg-[var(--border-theme)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all ${
                          strength.score >= 3 ? 'bg-blue-500' : 'bg-[var(--border-theme)]'
                        }`}
                      />
                      <div
                        className={`rounded-full transition-all ${
                          strength.score >= 4 ? 'bg-emerald-500' : 'bg-[var(--border-theme)]'
                        }`}
                      />
                    </div>
                    {strength.hints.length > 0 && (
                      <p className="text-[10px] text-[var(--text-muted)]">
                        İpucu: {strength.hints.join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {errors.password && <p className="text-[11px] text-rose-500">{errors.password}</p>}
              </div>

              {/* Şifre Tekrar (Kayıt) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showPasswordConfirm ? 'text' : 'password'}
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      onBlur={() => handleBlur('passwordConfirm')}
                      placeholder="Şifrenizi doğrulayın"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-[var(--bg-page)] border border-[var(--border-theme)] focus:border-[var(--accent)] rounded-xl outline-hidden text-[var(--text-primary)] transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.passwordConfirm && (
                    <p className="text-[11px] text-rose-500">{errors.passwordConfirm}</p>
                  )}
                </div>
              )}

              {/* Beni Hatırla / Şartlar Onayı */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[var(--accent)] cursor-pointer"
                  />
                  <span>Beni hatırla (30 gün boyunca oturumu koru)</span>
                </label>

                {mode === 'register' && (
                  <div>
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => {
                          setAcceptTerms(e.target.checked);
                          handleBlur('terms');
                        }}
                        className="w-4 h-4 mt-0.5 rounded-md accent-[var(--accent)] cursor-pointer"
                      />
                      <span>
                        Kullanım şartlarını ve verilerimin tarayıcımda yerel olarak saklanmasını kabul ediyorum.
                      </span>
                    </label>
                    {errors.terms && <p className="text-[11px] text-rose-500 mt-1">{errors.terms}</p>}
                  </div>
                )}
              </div>

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full btn-primary py-3 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>İşlem Yapılıyor...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Hesabımı Oluştur</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Ayrım Çizgisi */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-theme)]" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)]">veya hızlı inceleme</span>
              </div>
            </div>

            {/* Misafir Olarak Dene Butonu */}
            <button
              type="button"
              onClick={handleGuestEntry}
              disabled={submitting}
              className="w-full btn-secondary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[var(--accent)]" />
              <span>Misafir Olarak Dene (Örnek Verilerle Hızlı Giriş)</span>
            </button>
          </div>

          {/* Alt Bilgi */}
          <div className="mt-8 pt-4 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--border-theme)]">
            {mode === 'login' ? (
              <p>
                Hesabın yok mu?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFormError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Hemen Kayıt Ol
                </button>
              </p>
            ) : (
              <p>
                Zaten hesabın var mı?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Giriş Yap
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
