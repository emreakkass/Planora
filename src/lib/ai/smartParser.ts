import { addDays, format, getYear } from 'date-fns';
import { Task, TaskPriority, TaskType } from '../../types';
import { getCourseColor } from '../storage';

export interface ParsedTaskResult {
  title: string;
  course: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  estimatedTotalMinutes: number;
  completionPercentage: number;
  priority: TaskPriority;
  difficulty: number; // 1 - 5
  notes?: string;
  source: 'rule_based' | 'gemini_ai';
}

const MONTH_NAMES_TR: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  eylül: 9,
  ekim: 10,
  kasım: 11,
  aralık: 12,
};

const KNOWN_COURSES = [
  'Web Programlama',
  'Veri Yapıları',
  'Matematik',
  'İşletim Sistemleri',
  'Veritabanı Sistemleri',
  'Yapay Zeka',
  'Algoritmalar',
  'Bilgisayar Ağları',
  'Yazılım Mühendisliği',
  'Fizik',
  'Olasılık ve İstatistik',
  'Mikroişlemciler',
  'Siber Güvenlik',
];

export function parseTaskWithRules(rawText: string): ParsedTaskResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Görev Türü Tespiti
  let type: TaskType = 'assignment';
  if (lower.includes('sınav') || lower.includes('vize') || lower.includes('final') || lower.includes('quiz')) {
    type = 'exam';
  } else if (lower.includes('proje') || lower.includes('project') || lower.includes('bitirme')) {
    type = 'project';
  } else if (lower.includes('ödev') || lower.includes('lab') || lower.includes('laboratuvar') || lower.includes('rapor')) {
    type = 'assignment';
  }

  // 2. Tamamlanma Yüzdesi Tespiti
  let completionPercentage = 0;
  const percentMatch = lower.match(/(?:%|yüzde\s*)(\d{1,3})|(\d{1,3})\s*%/);
  if (percentMatch) {
    const pVal = parseInt(percentMatch[1] || percentMatch[2], 10);
    if (!isNaN(pVal)) {
      completionPercentage = Math.min(100, Math.max(0, pVal));
    }
  } else if (lower.includes('yarıs') || lower.includes('yarı yarıya')) {
    completionPercentage = 50;
  } else if (lower.includes('çeyreğ')) {
    completionPercentage = 25;
  } else if (lower.includes('çoğ') || lower.includes('büyük kısmı')) {
    completionPercentage = 75;
  } else if (lower.includes('bitti') || lower.includes('tamamlandı')) {
    completionPercentage = 100;
  }

  // 3. Teslim Tarihi Tespiti
  const currentYear = getYear(new Date());
  let dueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const dateNameMatch = lower.match(
    /(\d{1,2})\s+(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/
  );
  if (dateNameMatch) {
    const day = parseInt(dateNameMatch[1], 10);
    const month = MONTH_NAMES_TR[dateNameMatch[2]];
    if (day >= 1 && day <= 31 && month) {
      dueDate = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  } else if (lower.includes('yarın')) {
    dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  } else if (lower.includes('bugün')) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
  } else {
    const daysLaterMatch = lower.match(/(\d+)\s*gün\s*(?:sonra|içinde|kaldı)/);
    if (daysLaterMatch) {
      const days = parseInt(daysLaterMatch[1], 10);
      dueDate = format(addDays(new Date(), days), 'yyyy-MM-dd');
    } else if (lower.includes('haftaya')) {
      dueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    }
  }

  // 4. Ders Adı Tespiti
  let matchedCourse = 'Genel Ders';
  for (const course of KNOWN_COURSES) {
    const cLower = course.toLowerCase();
    if (lower.includes(cLower)) {
      matchedCourse = course;
      break;
    }
    const words = cLower.split(' ');
    if (words.some((w) => w.length > 3 && lower.includes(w))) {
      matchedCourse = course;
      break;
    }
  }

  if (matchedCourse === 'Genel Ders') {
    if (lower.includes('web')) matchedCourse = 'Web Programlama';
    else if (lower.includes('veri') || lower.includes('data')) matchedCourse = 'Veri Yapıları';
    else if (lower.includes('matematik') || lower.includes('lineer') || lower.includes('kalkülüs'))
      matchedCourse = 'Matematik';
    else if (lower.includes('işletim') || lower.includes('os') || lower.includes('linux'))
      matchedCourse = 'İşletim Sistemleri';
    else if (lower.includes('ai') || lower.includes('yapay zeka') || lower.includes('ml'))
      matchedCourse = 'Yapay Zeka';
    else if (lower.includes('sql') || lower.includes('veritabanı'))
      matchedCourse = 'Veritabanı Sistemleri';
    else if (lower.includes('algoritma')) matchedCourse = 'Algoritmalar';
  }

  // 5. Tahmini Süre Tespiti
  let estimatedTotalMinutes = type === 'project' ? 300 : type === 'exam' ? 240 : 120;
  const hourMatch = lower.match(/(\d+)\s*(?:saat|sa)/);
  const minMatch = lower.match(/(\d+)\s*(?:dakika|dk)/);

  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10);
    estimatedTotalMinutes = hours * 60;
    if (minMatch) {
      estimatedTotalMinutes += parseInt(minMatch[1], 10);
    }
  } else if (minMatch) {
    estimatedTotalMinutes = parseInt(minMatch[1], 10);
  }

  // 6. Öncelik Tespiti
  let priority: TaskPriority = 'medium';
  if (lower.includes('acil') || lower.includes('kritik') || lower.includes('çok önemli') || lower.includes('final')) {
    priority = 'critical';
  } else if (lower.includes('önemli') || lower.includes('yüksek') || type === 'exam' || lower.includes('vize')) {
    priority = 'high';
  } else if (lower.includes('düşük') || lower.includes('kolay') || lower.includes('rahat')) {
    priority = 'low';
  }

  // 7. Zorluk Derecesi Tespiti (1 - 5)
  let difficulty = 3;
  if (lower.includes('çok zor') || lower.includes('ağır') || lower.includes('zorlu')) {
    difficulty = 5;
  } else if (lower.includes('zor') || lower.includes('karmaşık')) {
    difficulty = 4;
  } else if (lower.includes('çok kolay') || lower.includes('çerez')) {
    difficulty = 1;
  } else if (lower.includes('kolay') || lower.includes('basit')) {
    difficulty = 2;
  }

  // 8. Başlık Oluşturma
  let title = '';
  if (type === 'project') {
    title = `${matchedCourse} Geliştirme Projesi`;
  } else if (type === 'exam') {
    title = `${matchedCourse} Sınavı Hazırlığı`;
  } else {
    title = `${matchedCourse} Ödev Teslimi`;
  }

  if (text.length > 5 && text.length < 50 && !text.includes('var') && !text.includes('yaptım')) {
    title = text;
  }

  return {
    title,
    course: matchedCourse,
    type,
    dueDate,
    estimatedTotalMinutes,
    completionPercentage,
    priority,
    difficulty,
    notes: `Doğal dil girdisinden otomatik üretildi: "${text}"`,
    source: 'rule_based',
  };
}

export async function parseNaturalLanguageTask(
  promptText: string,
  apiKey?: string
): Promise<ParsedTaskResult> {
  const fallback = parseTaskWithRules(promptText);

  if (!apiKey || apiKey.trim() === '') {
    return fallback;
  }

  try {
    const prompt = `Sen Planora öğrenci çalışma asistanısın. Şu Türkçe ifadeyi analiz edip verilen JSON formatında saf JSON döndür:
Girdi: "${promptText}"
Bugünün Tarihi: ${format(new Date(), 'yyyy-MM-dd')}

Format:
{
  "title": "string",
  "course": "string",
  "type": "exam" | "assignment" | "project",
  "dueDate": "YYYY-MM-DD",
  "estimatedTotalMinutes": number,
  "completionPercentage": number,
  "priority": "low" | "medium" | "high" | "critical",
  "difficulty": number (1-5)
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return fallback;

    const parsed = JSON.parse(candidateText.trim());
    return {
      title: parsed.title || fallback.title,
      course: parsed.course || fallback.course,
      type: ['exam', 'assignment', 'project'].includes(parsed.type) ? parsed.type : fallback.type,
      dueDate: parsed.dueDate || fallback.dueDate,
      estimatedTotalMinutes: Number(parsed.estimatedTotalMinutes) || fallback.estimatedTotalMinutes,
      completionPercentage: Math.min(
        100,
        Math.max(0, Number(parsed.completionPercentage) || fallback.completionPercentage)
      ),
      priority: ['low', 'medium', 'high', 'critical'].includes(parsed.priority)
        ? parsed.priority
        : fallback.priority,
      difficulty: Number(parsed.difficulty) >= 1 && Number(parsed.difficulty) <= 5 ? Number(parsed.difficulty) : fallback.difficulty,
      notes: `Gemini AI ile ayrıştırıldı: "${promptText}"`,
      source: 'gemini_ai',
    };
  } catch (err) {
    console.warn('AI ayrıştırma hatası, yerel kural motoru devrede:', err);
    return fallback;
  }
}

export function createNewTaskFromParsed(parsed: ParsedTaskResult): Task {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: parsed.title,
    course: parsed.course,
    type: parsed.type,
    dueDate: parsed.dueDate,
    estimatedTotalMinutes: parsed.estimatedTotalMinutes,
    completionPercentage: parsed.completionPercentage,
    priority: parsed.priority,
    difficulty: parsed.difficulty || 3,
    notes: parsed.notes,
    isCompleted: parsed.completionPercentage >= 100,
    createdAt: new Date().toISOString(),
    courseColor: getCourseColor(parsed.course),
  };
}
