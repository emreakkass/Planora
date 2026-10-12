import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { RiskAssessment } from '../../types';

interface RiskBadgeProps {
  assessment: RiskAssessment;
  showBar?: boolean;
  showExplanation?: boolean;
}

export function RiskBadge({ assessment, showBar = true, showExplanation = false }: RiskBadgeProps) {
  const { score, level, label, warningMessage } = assessment;

  let textColor = 'text-emerald-600';
  let barColor = 'bg-emerald-500';
  let Icon = CheckCircle2;

  if (level === 'critical') {
    textColor = 'text-rose-500';
    barColor = 'bg-rose-500';
    Icon = AlertTriangle;
  } else if (level === 'medium') {
    textColor = 'text-amber-500';
    barColor = 'bg-amber-500';
    Icon = AlertCircle;
  }

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${textColor}`} aria-hidden="true" />
          <span className={`font-semibold ${textColor}`}>{label}</span>
        </div>
        <span className="font-mono tabular-nums text-[var(--text-muted)] font-semibold">
          {score}/100 Risk
        </span>
      </div>

      {showBar && (
        <div className="w-full bg-[var(--bg-page)] border border-[var(--border-theme)] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${barColor}`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
      )}

      {showExplanation && warningMessage && (
        <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] pt-0.5">
          {warningMessage}
        </p>
      )}
    </div>
  );
}
