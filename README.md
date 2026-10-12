# 🎓 Planora

**Planora**, üniversite öğrencileri için ders programı, sınav ve ödev planlayıcısıdır. Ders programındaki boşlukları bulur, görevlerini zorluk ve teslim tarihine göre sıralar ve çalışma bloklarını senin için yerleştirir.

> ⚠️ **Not:** Bu proje bir eğitim ve portfolyo çalışmasıdır. Sunucu tarafı yoktur, kimlik doğrulama tarayıcı içinde çalışır.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-443E38)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)

---

## ✨ Özellikler

- **📅 Bugünün çalışma akışı:** Ders programındaki boş zamanlara göre çalışma blokları. Uyanıklık saatleri ve 15 dakikadan kısa boşluklar hesaba katılır.
- **🗓️ Haftalık ders programı:** Ders, derslik, öğretim üyesi ve renk bilgileriyle. A/B hafta, dönem başlangıç tarihine göre otomatik hesaplanır.
- **✅ Görev ve sınavlar:** Teslim tarihi, tahmini süre, ilerleme ve 1-5 zorluk puanı. Risk motoru yaklaşan ve zor görevleri öne çıkarır.
- **🧠 Aralıklı tekrar:** Sınavdan 7, 3 ve 1 gün önce otomatik tekrar oturumları planlanır.
- **🗣️ Doğal dil ile planlama:** "Salı 2 saat veri yapıları çalış" gibi cümlelerden görev oluşturur. Kural tabanlı çalışır.
- **⏱️ Pomodoro:** Odak ve mola süreleri ayarlanabilir, seanslar kaydedilir, bitişte ses çalar.
- **🔥 Seri takibi:** Günde en az bir odak seansı tamamlandığında seri artar.
- **📊 İstatistikler ve haftalık rapor:** Odak grafikleri, ders bazında dağılım ve haftalık özet.
- **📆 Takvim dışa aktarma:** Programını `.ics` dosyası olarak Google, Apple veya Outlook takvimine aktar.
- **🔔 Tarayıcı bildirimleri:** Çalışma bloğundan önce hatırlatma.
- **🌗 Açık, koyu ve sistem teması**
- **📱 PWA:** Ana ekrana eklenebilir.

---

## 🔐 Kimlik Doğrulama

Kayıt ve giriş tarayıcının localStorage alanında çalışır. Şifreler **Web Crypto API** ile **PBKDF2** (SHA-256, 100.000 iterasyon, rastgele tuz) kullanılarak hash'lenir.

Veriler yalnızca kullanılan tarayıcıda kalır, cihazlar arasında senkronize edilmez. Hızlı denemek için giriş ekranındaki **Misafir Olarak Dene** butonunu kullan.

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|---|---|
| Arayüz | React 19, TypeScript, Tailwind CSS 4 |
| Derleme | Vite 8, vite-plugin-pwa |
| Durum | Zustand |
| Animasyon & grafik | Motion, Recharts |
| Tarih | date-fns |
| Test | Vitest |

---

## 🚀 Kurulum

**Gereksinim:** Node.js 20.19 veya üzeri

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim sürümünü derler |
| `npm run lint` | TypeScript tip kontrolü |
| `npm test` | Birim testlerini çalıştırır |

---

## 🧪 Testler

| Test | Kapsam |
|---|---|
| `freeTimeFinder` | Boş zaman hesabı, çakışan dersleri birleştirme |
| `spacedReview` | 7, 3 ve 1 gün kala tekrar kuralları |
| `streakCalculator` | Seri hesabı |
| `icsGenerator` | `.ics` çıktısı |
| `riskEngine` | Zorluk ve teslim baskısı |
| `crypto` | PBKDF2 hash ve doğrulama |

---

## 🗺️ Yol Haritası

- [ ] Sunucu tarafı kimlik doğrulama ve veritabanı
- [ ] Cihazlar arası senkronizasyon
- [ ] Doğal dil planlama için Gemini entegrasyonu

---

## 📸 Ekran Görüntüleri

<!-- Ekran görüntüleri eklenecek -->

---

**Geliştirici:** Emre
