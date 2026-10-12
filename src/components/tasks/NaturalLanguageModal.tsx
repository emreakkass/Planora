import React, { useState } from 'react';
import { X, Sparkles, Check, Loader2, Calendar, Clock, BookOpen } from 'lucide-react';
import { useStudyStore } from '../../store/useStudyStore';
import { parseNaturalLanguageTask, createNewTaskFromParsed, ParsedTaskResult } from '../../lib/ai/smartParser';

interface NaturalLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PROMPTS = [
  "18 Ekim'de web projem var, %40'ını yaptım",
  "20 Ekim'de veri yapıları sınavı var, 6 saat çalışmam lazım",
  "24 Ekim'de matematik vizesi var, acil tekrar etmeliyim",
  "Yarın teslim işletim sistemleri ödevim var, 2 saat sürer",
];

export function NaturalLanguageModal({ isOpen, onClose }: NaturalLanguageModalProps) {
  const { addTask, settings } = useStudyStore();
  const [inputText, setInputText] = useState("18 Ekim'de web projem var, %40'ını yaptım");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedTaskResult | null>(null);

  if (!isOpen) return null;

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || inputText;
    if (!text.trim()) return;

    setIsParsing(true);
    try {
      const result = await parseNaturalLanguageTask(text, settings.geminiApiKey);
      setParsedResult(result);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAndAdd = () => {
    if (!parsedResult) return;
    const newTask = createNewTaskFromParsed(parsedResult);
    addTask(newTask);
    setParsedResult(null);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-theme)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--accent)]/15 text-[var(--accent)] rounded-xl border border-[var(--accent)]/30">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                Doğal Dil ile Görev Ekle
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Gündelik Türkçe cümlelerinizi saniyeler içinde akıllı çalışma planına dönüştürün.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick preset buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              Örnek İfadeler:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setInputText(sample);
                    handleParse(sample);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-[var(--bg-page)] hover:bg-[var(--border-light)] border border-[var(--border-theme)] text-[var(--text-secondary)] transition-colors cursor-pointer text-left"
                >
                  &ldquo;{sample}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Text input area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Cümlenizi Yazın:
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Örn: 18 Ekim'de web projem var, %40'ını yaptım"
                className="w-full p-3 text-sm bg-[var(--bg-page)] border border-[var(--border-theme)] rounded-2xl outline-hidden focus:border-[var(--accent)] text-[var(--text-primary)] resize-none"
              />
            </div>
          </div>

          {/* Parse button */}
          <button
            type="button"
            disabled={!inputText.trim() || isParsing}
            onClick={() => handleParse()}
            className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Cümleyi Göreve Dönüştür</span>
              </>
            )}
          </button>

          {/* Extracted Preview Result */}
          {parsedResult && (
            <div className="p-4 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Ayrıştırılan Görev Önizlemesi
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {parsedResult.source === 'gemini_ai' ? '✨ Gemini AI' : '⚙️ Akıllı Kural Motoru'}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {parsedResult.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                    {parsedResult.course}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">
                    {parsedResult.type === 'exam' ? 'Sınav' : parsedResult.type === 'project' ? 'Proje' : 'Ödev'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Calendar className="w-3 h-3 text-[var(--accent)]" />
                    {parsedResult.dueDate}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3 text-[var(--accent)]" />
                    {parsedResult.estimatedTotalMinutes} dk
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums font-semibold text-[var(--accent)]">
                    %{parsedResult.completionPercentage}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmAndAdd}
                className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Onayla ve Planora&apos;ya Ekle</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
