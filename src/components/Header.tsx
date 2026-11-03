'use client';

import React from 'react';
import { PenTool, Sparkles, RefreshCw, Layout, CheckCircle, Code } from 'lucide-react';

interface HeaderProps {
  isMock: boolean;
  hasProposals: boolean;
  selectedPlanTitle?: string;
  onReset: () => void;
  onToggleMock?: () => void;
  forceMock: boolean;
}

export function Header({
  isMock,
  hasProposals,
  selectedPlanTitle,
  onReset,
  onToggleMock,
  forceMock,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
            <PenTool className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Co-Writing Canvas
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Prototype v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              断片メモから構造化・図解レイアウト案を提案するAI共同執筆エディタ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* モック/ライブAPIステータスバッジ */}
          <button
            onClick={onToggleMock}
            title="クリックしてMockモードとAPI通信を切り替え"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              forceMock || isMock
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                forceMock || isMock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span>{forceMock ? 'Mockモード (固定)' : isMock ? '内蔵Mock動作' : 'Gemini 3.8 Flash'}</span>
          </button>

          {hasProposals && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>最初から</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
