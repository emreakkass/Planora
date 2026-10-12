# Planora 🎓⚡
> **Üniversite Öğrencileri İçin Akıllı Ders, Sınav Planlayıcı & Boş Zaman Asistanı**

Planora, üniversite öğrencilerinin yoğun sınav, proje ve ders dönemlerinde karşılaştığı *"Çok fazla ders, sınav ve teslim tarihi var ama neye, ne zaman ve hangi boşluğumda çalışmalıyım?"* sorununu çözen, üretim kalitesinde modern bir web uygulamasıdır.

Harici yapay zekaya muhtaç olmadan **%100 deterministik ve matematiksel algoritmalarla** çalışan haftalık ders programı, boş zaman bulucu, aralıklı tekrar, risk değerlendirme motoru ve Web Crypto PBKDF2 tabanlı yerel kimlik doğrulama sistemine sahiptir.

---

> ⚠️ **ÖNEMLİ KİMLİK DOĞRULAMA & GÜVENLİK BİLGİLENDİRMESİ:**  
> Bu projede harici bir backend/sunucu bulunmamaktadır. Uygulama içerisindeki **Kayıt Ol / Giriş Yap / Oturum** sistemi, tamamen modern tarayıcı standartları (**Web Crypto API - PBKDF2, SHA-256, 100.000 iterasyon, rastgele tuz (salt)**) kullanılarak geliştirilmiş **tarayıcı tabanlı, demo ve portfolyo seviyesinde bir kimlik doğrulama sistemidir**. Verileriniz tarayıcınızın yerel depolama alanında güvenle yalıtılır; ancak istemci taraflı bir mimari olduğundan kurumsal bir sunucu güvenliği sağlamaz. İnceleyenler için **"Misafir Olarak Dene"** butonu ile anında hazır örnek verilerle giriş imkanı sunulmuştur.

---

## 🎨 Görsel Kimlik: Orijinal Indigo & Slate

Uygulama, modern, net ve yüksek kontrastlı orijinal **Indigo & Slate** tasarım sistemi ile çalışmaktadır:

| Rol | Renk Kodu | Kullanım Alanı |
|---|---|---|
| **Ana Indigo** | `#4F46E5` / `#6366F1` | Ana butonlar, ikonlar, aktif durumlar, vurgular, rozetler |
| **Koyu Indigo** | `#3730A3` / `#4338CA` | Buton hover ve güçlü marka vurguları |
| **Açık Indigo** | `#EEF2FF` / `indigo-50` | Seçili durumlar, hafif etiketler, vurgu zeminleri |
| **Slate Nötrler** | `#0F172A`, `#334155`, `#64748B`, `#E2E8F0` | Sayfa zeminleri, kart kenarlıkları, tipografi hiyerarşisi |
| **Beyaz / Slate Yüzeyler** | `#FFFFFF` (Açık) / `#0F172A` - `#1E293B` (Koyu) | Kartlar, modallar ve yüzey katmanları |

- **WCAG AA Kontrast:** Tüm metin ve zemin çiftleri en az WCAG AA standartlarına uygundur.
- **Semantik Risk Renkleri:** Düşük risk için `#10B981` (zümrüt yeşil), orta risk için `#F59E0B` (kehribar), yüksek/kritik risk için `#EF4444` / `#E11D48` (kırmızı/gül) kullanılır; renk körlüğü için her zaman metin ve ikon eşlik eder.
- **Yumuşak Geçişler:** 12–16px yuvarlatılmış köşeler, yumuşak gölgeler ve `prefers-reduced-motion` erişilebilirlik desteği.

---

## 🔤 Yerel Tipografi

CDN bağımlılıkları ve ağ gecikmeleri tamamen kaldırılarak `@fontsource` paketleri üzerinden yerel fontlar entegre edilmiştir:
- **Arayüz Fontu:** `Plus Jakarta Sans` (Türkçe karakterleri — ğ, ü, ş, ı, İ, ö, ç — tüm ağırlıklarda 400, 500, 600, 700 tam destekler).
- **Rakamlar & Sayaçlar:** `JetBrains Mono` / `tabular-nums` (sayıların genişliği sabittir, süre sayaçları titreme yapmaz).

---

## 🌓 Gelişmiş Karanlık Mod (Dark Mode)

- **Görünüm Seçeneği:** Ayarlar sekmesinde **Açık / Koyu / Sistem** segmentli kontrolü.
- **Sıfır Ekran Çakması (Zero-Flash):** Tema tercihi `index.html` başında senkron script ile DOM'a henüz render başlamadan uygulanır.
- **Senkron Header Butonu:** Üst bardaki tema düğmesi ile Ayarlar sekmesindeki mod anlık olarak senkron çalışır.
- **Koyu Tema Renkleri:** Saf siyah yerine yeşil kimlikten türetilmiş koyu tonlar kullanılmıştır:
  - Sayfa arka planı: `#151A14` (koyu yeşil-gri)
  - Kart yüzeyleri: `#1E251D`
  - Kenarlıklar: `#2E382C`
  - Ana metin: `#E6E6E6`, İkincil metin: `#A9B8A3`
  - Vurgular: `#7B9669` ve `#BAC8B1`

---

## 🔐 Tarayıcı İçi Kimlik Doğrulama & Veri Yalıtımı

1. **Güvenli Şifreleme (Web Crypto API):**
   - Şifreler kesinlikle düz metin saklanmaz.
   - Rastgele 16 baytlık tuz (salt) üretilir.
   - PBKDF2 (SHA-256, **100.000 iterasyon**) ile hash'lenir ve hex formatında tutulur.
   - Constant-time doğrulama ile zamanlama saldırılarına (timing attacks) karşı korunur.
2. **Korumalı Rotalar (Protected Routes):**
   - Giriş yapılmamışsa tüm sayfalar şık iki bölmeli giriş/kayıt ekranına yönlendirilir.
   - Girişli kullanıcı giriş ekranına gitmek isterse ana sayfaya yönlendirilir.
3. **Kullanıcı Veri İzolasyonu:**
   - Her kullanıcının görevleri, ders programı, ayarları ve oturumları benzersiz anahtarlarla saklanır (`planora_user_<id>_tasks`, `planora_user_<id>_schedule` vb.).
   - Bir kullanıcı başka bir kullanıcının verilerine erişemez.
4. **Eski Veri Taşıma (Migration):**
   - Üyeliksiz dönemden kalan veriler tespit edilirse kullanıcıya *"Mevcut verilerini aktarmak ister misin?"* modalı çıkar ve isteğe bağlı tek tıkla hesabına taşınır.
5. **Veri Katmanı Soyutlaması (`IStorageAdapter`):**
   - Kod tabanında `IStorageAdapter` arayüzü tanımlanmıştır. Bugün `LocalStorageAdapter` çalışırken, ileride tek bir satırla Supabase veya Cloud DB takılabilir.

---

## 🌟 Temel Fonksiyonel Modüller

### 1. Haftalık Ders Programı & A/B Hafta
- **Ders Yönetimi:** Ders adı, gün, başlangıç-bitiş saati, derslik, öğretim üyesi, renk ve hafta türü.
- **Görünüm:** Masaüstünde 7 günlük grid takvim, mobilde gün bazlı liste.
- **A/B Hafta Desteği:** Dönem başlangıç tarihine göre bulunulan hafta otomatik hesaplanır ve canlı gösterilir.

### 2. Boş Zaman Bulucu (Free Time Finder)
- **Uyanıklık Saatleri:** Ayarlardan belirlenen uyanıklık aralığı (08:00–23:00) ile ders programını kesiştirir.
- **15 Dk Filtresi:** 15 dakikadan kısa blokları eleyerek çalışma için ergonomik boş zaman dilimleri üretir.
- **Bugün Ekranı Entegrasyonu:** Çalışma blokları bu boşluklara yerleşir (örn: *"Web Programlama — 45 dk · 10:30–11:15"*).

### 3. Aralıklı Tekrar (Spaced Review)
- Sınav hazırlığı tamamlandığında veya %60+ seviyeye geldiğinde, sınavdan **7, 3 ve 1 gün önce** otomatik hafıza pekiştirme oturumları planlanır.

### 4. Görev Zorluk Puanı (1-5)
- Görevlere 1-5 zorluk skalası eklenmiştir.
- Zorluk seviyesi yükseldikçe planlama algoritması göreve daha fazla çalışma payı ayırır ve risk motorundaki zorluk çarpanı (`0.75 + difficulty * 0.12`) artar.

### 5. Seri (Streak) Takibi
- En az 1 tamamlanan odak seansı olan takvim günleri sayılır.
- Mevcut seri ve en uzun seri hesaplanır; bugün henüz çalışılmadıysa nazikçe hatırlatılır.

### 6. Takvime Aktarma (.ics / iCalendar RFC 5545)
- Harici paket olmadan saf TypeScript ile üretilen standart `.ics` dosyası.
- Dersleri haftalık tekrar eden etkinlikler (`RRULE:FREQ=WEEKLY;COUNT=16`), çalışma bloklarını ise günün saatlerine (`Europe/Istanbul`) yerleştirilmiş etkinlikler olarak indirir.

### 7. Tarayıcı Bildirimleri (Notification API)
- Sabah plan hazır bildirimi, çalışma bloğundan X dakika önce hatırlatma ve Pomodoro bitiş uyarısı.
- İzin verilmediğinde uygulama hiçbir hata vermeden akıcı şekilde çalışmaya devam eder.

### 8. PWA & Çevrimdışı Çalışma
- `manifest.webmanifest`, service worker ve dahili "Ana Ekrana Ekle" yükleme butonu desteği.

---

## 🧪 Birim Testleri (Vitest)

Uygulamanın tüm saf matematiksel mantıkları ve kriptografik fonksiyonları kapsamlı Vitest birim testleri ile doğrulanmıştır:

| Test Dosyası | Kapsanan Mantık |
|---|---|
| `src/lib/planner/freeTimeFinder.test.ts` | Uyanıklık saatleri, çakışan ders birleştirme, 15 dk altı blok eleme, A/B hafta tespiti |
| `src/lib/planner/spacedReview.test.ts` | 7, 3, 1 gün aralıklı tekrar tetiklenmesi ve uygunluk koşulları |
| `src/lib/analytics/streakCalculator.test.ts` | Üst üste çalışma günleri, dün/bugün toleransı, en uzun seri hesabı |
| `src/lib/calendar/icsGenerator.test.ts` | RFC 5545 standart çıktısı, Europe/Istanbul saat dilimi, RRULE haftalık tekrar |
| `src/lib/risk/riskEngine.test.ts` | 1-5 zorluk çarpanı, teslim süresi baskısı, gecikmiş görev (overdue) değerlendirmesi |
| `src/lib/auth/crypto.test.ts` | Web Crypto PBKDF2 tuzlama, hash üretimi, şifre doğrulama ve şifre gücü analizi |

Testleri çalıştırmak için:
```bash
npm test
```

---

## 🚀 Kurulum ve Çalıştırma

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın (Port 3000)
npm run dev

# 3. Testleri çalıştırın
npm test

# 4. Üretim derlemesi (Production Build)
npm run build
```
