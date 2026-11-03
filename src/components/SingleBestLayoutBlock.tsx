'use client';

import React from 'react';
import { BestLayoutResult, LayoutElement } from '@/types/canvas';
import {
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  LayoutGrid,
  Undo2,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

interface SingleBestLayoutBlockProps {
  layout: BestLayoutResult;
  onRevert?: () => void;
  onUpdateElement?: (index: number, updated: Partial<LayoutElement>) => void;
}

export function SingleBestLayoutBlock({
  layout,
  onRevert,
  onUpdateElement,
}: SingleBestLayoutBlockProps) {
  const isStep = layout.kind === 'step-flow';
  const isComp = layout.kind === 'comparison';
  const isGrid = layout.kind === 'card-grid';

  const themeConfig = isStep
    ? {
        border: 'border-blue-300',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        cardBg: 'bg-blue-50/50',
        activeDot: 'bg-blue-600',
        name: 'ステップ・フロー配置',
        icon: <ArrowRight className="w-3.5 h-3.5 text-blue-600" />,
      }
    : isComp
    ? {
        border: 'border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cardBg: 'bg-emerald-50/40',
        activeDot: 'bg-emerald-600',
        name: '左右対比マトリクス',
        icon: <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />,
      }
    : {
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-900 border-amber-200',
        cardBg: 'bg-amber-50/40',
        activeDot: 'bg-amber-600',
        name: '要点カードグリッド',
        icon: <LayoutGrid className="w-3.5 h-3.5 text-amber-700" />,
      };

  return (
    <div
      className={`my-3 p-3.5 sm:p-5 rounded-2xl border-2 shadow-sm bg-white/95 backdrop-blur-xs transition-all ${themeConfig.border}`}
    >
      {/* AI自動選定バッジ & ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${themeConfig.badge}`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AIベスト選定：{themeConfig.name}</span>
          </span>
        </div>

        {onRevert && (
          <button
            onClick={onRevert}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
            title="元のMarkdownテキストに戻す"
          >
            <Undo2 className="w-3 h-3" />
            <span>Markdownに戻す</span>
          </button>
        )}
      </div>

      {/* AIの判定理由（なぜこのレイアウトが一番良いか） */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-[11px] text-slate-600 mb-3 flex items-start gap-1.5 leading-relaxed">
        <span className="font-bold text-slate-800 shrink-0">💡 判定理由:</span>
        <span>{layout.reason}</span>
      </div>

      {/* 原文の見出しタイトル */}
      <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 leading-snug">
        {layout.title}
      </h4>

      {/* 1. ステップ・フローレイアウト */}
      {isStep && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
          {layout.elements.map((elem, idx) => (
            <div key={elem.id || idx} className="relative flex flex-col">
              <div className="flex-1 rounded-xl border border-blue-200/90 bg-blue-50/50 p-2.5 sm:p-3 shadow-2xs hover:bg-blue-50/70 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {elem.badge && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                      {elem.badge}
                    </span>
                  )}
                </div>
                <textarea
                  value={elem.originalText}
                  onChange={(e) =>
                    onUpdateElement?.(idx, { originalText: e.target.value })
                  }
                  rows={2}
                  className="w-full text-xs text-slate-800 bg-transparent resize-none focus:outline-none focus:bg-white rounded p-0.5 leading-relaxed font-medium"
                />
              </div>

              {idx < layout.elements.length - 1 && (
                <div className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center rounded-full bg-blue-500 text-white text-[9px] shadow-xs">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. 比較・対比マトリクス */}
      {isComp && (
        <div className="space-y-2">
          {layout.elements.map((elem, idx) => (
            <div
              key={elem.id || idx}
              className="rounded-xl border border-emerald-200 bg-white overflow-hidden text-xs shadow-2xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100">
                <div className="p-2.5 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    ◀ 従来 / 前提
                  </span>
                  <textarea
                    value={elem.originalText}
                    onChange={(e) =>
                      onUpdateElement?.(idx, { originalText: e.target.value })
                    }
                    rows={2}
                    className="w-full text-xs text-slate-700 bg-transparent resize-none focus:outline-none focus:bg-white rounded p-0.5 leading-relaxed"
                  />
                </div>
                <div className="p-2.5 bg-emerald-50/40">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    ▶ これから / 改善後
                  </span>
                  <textarea
                    value={elem.secondaryText || ''}
                    onChange={(e) =>
                      onUpdateElement?.(idx, { secondaryText: e.target.value })
                    }
                    rows={2}
                    className="w-full text-xs text-emerald-950 font-medium bg-transparent resize-none focus:outline-none focus:bg-white rounded p-0.5 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. 要点カードグリッド */}
      {isGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {layout.elements.map((elem, idx) => (
            <div
              key={elem.id || idx}
              className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 shadow-2xs hover:bg-amber-50/70 transition-colors"
            >
              <span className="text-[10px] font-bold text-amber-800 block mb-1">
                • {elem.label || `Point 0${idx + 1}`}
              </span>
              <textarea
                value={elem.originalText}
                onChange={(e) =>
                  onUpdateElement?.(idx, { originalText: e.target.value })
                }
                rows={2}
                className="w-full text-xs text-stone-800 bg-transparent resize-none focus:outline-none focus:bg-white rounded p-0.5 leading-relaxed"
              />
            </div>
          ))}
        </div>
      )}

      {layout.noteCaption && (
        <p className="text-[10px] text-slate-400 mt-2 text-right">
          ※ {layout.noteCaption}
        </p>
      )}
    </div>
  );
}
