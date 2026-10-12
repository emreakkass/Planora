<div align="center">

# 🎓 Planora

### Üniversite öğrencileri için akıllı ders, sınav ve çalışma planlayıcı

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

</div>

---

## ✨ Ne yapar?

Çok fazla ders, sınav ve teslim tarihi varken **neye, ne zaman ve hangi boşluğumda çalışmam gerektiğini** Planora senin yerine çözer. Ders programındaki boşlukları bulur, görevlerini zorluk ve teslim tarihine göre sıralar, çalışma bloklarını takvimine yerleştirir.

---

## 🚀 Özellikler

| | Özellik | Açıklama |
|:---:|---|---|
| 📅 | **Bugünün çalışma akışı** | Ders programındaki boş zamanlara göre optimize edilmiş çalışma blokları. Uyanıklık saatleri ve 15 dakikadan kısa boşluklar hesaba katılır. |
| 🗓️ | **Haftalık ders programı** | Ders, derslik, öğretim üyesi ve renk bilgileriyle. A/B hafta desteği dönem başlangıcına göre otomatik hesaplanır. |
| ✅ | **Görev ve sınav yönetimi** | Teslim tarihi, tahmini süre, ilerleme ve 1-5 zorluk puanı. Risk motoru yaklaşan ve zor görevleri öne çıkarır. |
| 🗣️ | **Doğal dil ile planlama** | "Salı 2 saat veri yapıları çalış" gibi cümlelerden görev oluşturur. |
| ⏱️ | **Pomodoro sayacı** | Odak ve mola süreleri ayarlanabilir, her seans kaydedilir, bitişte ses çalar. |
| 📊 | **İstatistikler & haftalık rapor** | Odak süresi grafikleri, ders bazında dağılım ve haftalık özet. |
| 🔥 | **Seri takibi** | Her gün en az bir odak seansı tamamlandığında serin artar. |
| 📆 | **Takvim dışa aktarma** | Programını `.ics` dosyası olarak Google, Apple veya Outlook takvimine aktar. |
| 🧠 | **Aralıklı tekrar** | Sınavdan 7, 3 ve 1 gün önce tekrar oturumları otomatik planlanır. |
| 🔔 | **Tarayıcı bildirimleri** | Çalışma bloğundan önce hatırlatma. |
| 🌗 | **Açık / koyu tema** | Ayarlardan Açık, Koyu veya Sistem seçilebilir. |
| 📱 | **PWA desteği** | Ana ekrana eklenebilir. |

---

## 🔐 Kimlik Doğrulama

> ⚠️ **Demo amaçlı:** Bu projede sunucu yok. Kayıt ve giriş sistemi tarayıcının localStorage alanını kullanır.

- 🔒 Şifreler **Web Crypto API** ile **PBKDF2** (SHA-256, 100.000 iterasyon, rastgele tuz) kullanılarak hash'lenir.
- 💾 Veriler yalnızca kullanıldığı tarayıcıda kalır, cihazlar arasında senkronize edilmez.
- 🧩 `IStorageAdapter` arayüzü sayesinde ileride Supabase gibi bir veritabanına geçiş tek bir adaptörle yapılabilir.

💡 Hızlı denemek için giriş ekranındaki **Misafir Olarak Dene** butonunu kullan.

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

<details>
<summary><b>📦 Kurulum (tıkla aç)</b></summary>

**Gereksinim:** Node.js 20.19 veya üzeri

```bash
npm install
npm run dev
```

🌐 Uygulama `http://localhost:3000` adresinde açılır.

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim sürümünü `dist/` klasörüne derler |
| `npm run lint` | TypeScript tip kontrolü yapar |
| `npm test` | Birim testlerini çalıştırır |

</details>

<details>
<summary><b>🧪 Testler (tıkla aç)</b></summary>

| Test dosyası | Kapsadığı mantık |
|---|---|
| `freeTimeFinder` | Boş zaman hesabı ve çakışan ders birleştirme |
| `spacedReview` | 7, 3 ve 1 gün kala tekrar kuralları |
| `streakCalculator` | Seri hesabı |
| `icsGenerator` | `.ics` çıktısının biçimi |
| `riskEngine` | Zorluk ve teslim tarihi baskısı |
| `crypto` | PBKDF2 hash ve doğrulama |

</details>

---

## 🗺️ Yol haritası

- [ ] 🔐 Sunucu tarafı kimlik doğrulama ve veritabanı
- [ ] 🔄 Cihazlar arası senkronizasyon
- [ ] 🤖 Doğal dil planlama için Gemini entegrasyonu

---

<div align="center">

**Geliştirici:** Emre 

</div>
