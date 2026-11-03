'use client';

import React, { useState } from 'react';
import { DeviceMode } from '@/types/canvas';
import { DeviceFrame } from '@/components/DeviceFrame';
import { SmartNotesCanvas } from '@/components/SmartNotesCanvas';
import {
  Tablet,
  Smartphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function Home() {
  // デバイス表示モード: 'ipad' (iPadOS) | 'iphone' (iOS)
  const [device, setDevice] = useState<DeviceMode>('ipad');
  const [forceMock, setForceMock] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* グローバルコントロールバー */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* ブランドタイトル */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Smart Notes Canvas</span>
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-1.5 py-0.2 rounded-full">
                  AI Single Best Layout
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                手書き ➔ 文字認識Markdown ➔ 指定箇所をAIがベストレイアウト1択で配置
              </p>
            </div>
          </div>

          {/* デバイス表示切り替えスイッチ（iPad ⇄ iPhone） */}
          <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-inner">
            <button
              onClick={() => {
                setDevice('ipad');
                showToast('iPad (iPadOS) 画面表示に切り替えました。');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                device === 'ipad'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>iPad 画面</span>
            </button>

            <button
              onClick={() => {
                setDevice('iphone');
                showToast('iPhone (iOS) 画面表示に切り替えました。');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                device === 'iphone'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone 画面</span>
            </button>
          </div>

          {/* モックモードトグル */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setForceMock(!forceMock);
                showToast(
                  !forceMock
                    ? 'Mockモードに切り替えました。'
                    : 'Gemini 3.8 Flash API接続モードに切り替えました。'
                );
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                forceMock
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  forceMock ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span>{forceMock ? 'Mockモード' : 'Gemini 3.8 Flash'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs md:text-sm font-medium shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* メインステージ（iPadまたはiPhoneのデバイスフレーム内にノートを表示） */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex items-center justify-center">
        <DeviceFrame device={device}>
          <SmartNotesCanvas
            device={device}
            forceMock={forceMock}
            onNotify={showToast}
          />
        </DeviceFrame>
      </main>
    </div>
  );
}
