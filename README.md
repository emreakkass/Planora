# Planora

> Üniversite öğrencileri için ders programı, sınav ve ödev planlayıcı. Boş zamanlarını analiz edip çalışma bloklarını otomatik yerleştirir.

## Özellikler

- **Bugünün çalışma akışı:** Ders programındaki boş zamanlara göre optimize edilmiş çalışma blokları. Uyanıklık saatleri ve 15 dakikadan kısa boşluklar hesaba katılır.
- **Ders programı:** Ders adı, gün, saat, derslik, öğretim üyesi ve renk bilgileriyle haftalık program. A/B hafta desteği dönem başlangıç tarihine göre otomatik hesaplanır.
- **Görev ve sınav yönetimi:** Teslim tarihi, tahmini süre, ilerleme yüzdesi ve 1-5 zorluk puanı. Risk motoru, teslim tarihine yakın ve zor görevleri öne çıkarır.
- **Doğal dil ile planlama:** "Salı 2 saat veri yapıları çalış" gibi cümlelerden görev oluşturur. Şu an kural tabanlı çalışır.
- **Pomodoro sayacı:** Odak ve mola süreleri ayarlanabilir, her seans kaydedilir.
- **İstatistikler ve haftalık rapor:** Odak süresi grafikleri, ders bazında dağılım ve haftalık özet.
- **Seri takibi:** Her gün en az bir odak seansı tamamlandığında seri artar.
- **Takvim dışa aktarma:** Ders programı ve çalışma bloklarını `.ics` (RFC 5545) dosyası olarak indirip Google Takvim, Apple Takvim veya Outlook'a aktarabilirsin.
- **Aralıklı tekrar:** Sınavdan 7, 3 ve 1 gün önce tekrar oturumları planlanır.
- **Tarayıcı bildirimleri:** Çalışma bloğundan önce hatırlatma ve Pomodoro bitiş uyarısı.
- **Açık ve koyu tema:** Ayarlardan Açık, Koyu veya Sistem seçilebilir.
- **PWA desteği:** Ana ekrana eklenebilir, temel dosyalar çevrimdışı açılabilir.

## Kullanılan Teknolojiler

- React 19 ve TypeScript
- Vite 8
- Tailwind CSS 4
- Zustand (durum yönetimi)
- Motion (animasyonlar)
- Recharts (grafikler)
- date-fns (tarih işlemleri)
- Vitest (birim testleri)
- vite-plugin-pwa

## Kimlik Doğrulama Hakkında

Bu proje bir sunucu içermez. Kayıt ve giriş sistemi tarayıcının localStorage alanını kullanır. Şifreler Web Crypto API ile PBKDF2 (SHA-256, 100.000 iterasyon, rastgele tuz) kullanılarak hash'lenir. Veriler yalnızca kullanıldığı tarayıcıda saklanır, cihazlar arasında senkronize edilmez.

Bu yapı demo ve portfolyo amaçlıdır. Gerçek kullanıcı verisi için sunucu tarafında bir veritabanı ve kimlik doğrulama servisi gerekir. Kod, `IStorageAdapter` arayüzü üzerinden bu geçişe hazır şekilde yazıldı.

Hızlı denemek için giriş ekranındaki **Misafir Olarak Dene** butonunu kullanabilirsin.

## Kurulum

Gereksinimler: Node.js 20.19 veya üzeri.

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. (İsteğe bağlı) Ortam değişkenlerini hazırla
cp .env.example .env.local

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

### Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim sürümünü `dist/` klasörüne derler |
| `npm run preview` | Derlenmiş sürümü yerelde önizler |
| `npm run lint` | TypeScript tip kontrolü yapar |
| `npm test` | Birim testlerini çalıştırır |

### Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `GEMINI_API_KEY` | Hayır | Gemini entegrasyonu için ayrılmış alan. Mevcut sürümde kullanılmıyor. |
| `APP_URL` | Hayır | Uygulamanın yayın adresi |

## Testler

Planlama, risk, takvim, seri ve kimlik doğrulama mantığı Vitest ile test edilir:

- `freeTimeFinder`: boş zaman hesabı ve çakışan ders birleştirme
- `spacedReview`: aralıklı tekrar tetikleme kuralları
- `streakCalculator`: seri hesabı
- `icsGenerator`: `.ics` çıktısının biçimi
- `riskEngine`: zorluk ve teslim tarihi baskısı
- `crypto`: PBKDF2 hash ve doğrulama

```bash
npm test
```

## Proje
