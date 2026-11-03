'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DeviceMode, BestLayoutResult, LayoutElement } from '@/types/canvas';
import { SingleBestLayoutBlock } from './SingleBestLayoutBlock';
import { HANDWRITING_MARKDOWN_SAMPLES } from '@/lib/mockData';
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  Sparkles,
  FileText,
  Check,
  Undo2,
  Copy,
  Wand2,
  ChevronRight,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface SmartNotesCanvasProps {
  device: DeviceMode;
  forceMock: boolean;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export function SmartNotesCanvas({
  device,
  forceMock,
  onNotify,
}: SmartNotesCanvasProps) {
  // 現在のフェーズ: 'handwriting' (手書き) ➔ 'markdown' (文字認識後) ➔ 'layout' (指定箇所のAIレイアウト展開)
  const [phase, setPhase] = useState<'handwriting' | 'markdown' | 'layout'>('handwriting');

  // 手書きツール状態
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#1e293b');
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [isAnalyzingLayout, setIsAnalyzingLayout] = useState<boolean>(false);

  // 文字認識されたMarkdownテキスト
  const [markdownContent, setMarkdownContent] = useState<string>(
    HANDWRITING_MARKDOWN_SAMPLES[0].markdown
  );

  // ユーザーがMarkdown内で指定（選択）したブロック
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1); // デフォルトで実践ステップ・対比を指定

  // AIが一番良いと判断した単一のベストレイアウト
  const [bestLayout, setBestLayout] = useState<BestLayoutResult | null>(null);

  // 手書きキャンバスRef
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const strokesRef = useRef<any[]>([]);

  // Markdownを段落・セクション単位に分割
  const markdownBlocks = markdownContent
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  // 手書き初期描画デモ
  useEffect(() => {
    loadHandwritingDemo();
  }, [device]);

  const loadHandwritingDemo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];

    // デモストロークの構築
    const demo = [
      // タイトル「AI時代のエンジニア」ハイライト
      {
        tool: 'highlighter',
        color: '#fef08a',
        width: 16,
        points: [
          { x: 30, y: 40 },
          { x: 260, y: 40 },
        ],
      },
      // タイトル枠
      {
        tool: 'pen',
        color: '#0f172a',
        width: 2.5,
        points: [
          { x: 25, y: 25 },
          { x: 270, y: 23 },
          { x: 270, y: 55 },
          { x: 25, y: 57 },
          { x: 25, y: 25 },
        ],
      },
      // 従来（Before）ボックス
      {
        tool: 'pen',
        color: '#64748b',
        width: 2,
        points: [
          { x: 30, y: 90 },
          { x: 160, y: 90 },
          { x: 160, y: 170 },
          { x: 30, y: 170 },
          { x: 30, y: 90 },
        ],
      },
      // 矢印（→）
      {
        tool: 'pen',
        color: '#3b82f6',
        width: 3,
        points: [
          { x: 175, y: 130 },
          { x: 215, y: 130 },
          { x: 205, y: 120 },
          { x: 215, y: 130 },
          { x: 205, y: 140 },
        ],
      },
      // これからの時代（After）ボックス
      {
        tool: 'pen',
        color: '#2563eb',
        width: 2.5,
        points: [
          { x: 230, y: 85 },
          { x: 360, y: 85 },
          { x: 360, y: 175 },
          { x: 230, y: 175 },
          { x: 230, y: 85 },
        ],
      },
      // 下部の3ステップ矢印
      {
        tool: 'pen',
        color: '#334155',
        width: 2,
        points: [
          { x: 30, y: 220 },
          { x: 110, y: 220 },
          { x: 110, y: 280 },
          { x: 30, y: 280 },
          { x: 30, y: 220 },
        ],
      },
      {
        tool: 'pen',
        color: '#3b82f6',
        width: 2,
        points: [
          { x: 115, y: 250 },
          { x: 140, y: 250 },
        ],
      },
      {
        tool: 'pen',
        color: '#334155',
        width: 2,
        points: [
          { x: 145, y: 220 },
          { x: 225, y: 220 },
          { x: 225, y: 280 },
          { x: 145, y: 280 },
          { x: 145, y: 220 },
        ],
      },
      {
        tool: 'pen',
        color: '#3b82f6',
        width: 2,
        points: [
          { x: 230, y: 250 },
          { x: 255, y: 250 },
        ],
      },
      {
        tool: 'pen',
        color: '#334155',
        width: 2,
        points: [
          { x: 260, y: 220 },
          { x: 340, y: 220 },
          { x: 340, y: 280 },
          { x: 260, y: 280 },
          { x: 260, y: 220 },
        ],
      },
    ];

    demo.forEach((s) => {
      strokesRef.current.push(s);
      drawSingleStroke(ctx, s);
    });
  };

  const drawSingleStroke = (ctx: CanvasRenderingContext2D, stroke: any) => {
    if (!stroke.points || stroke.points.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width || 14;
    } else if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width || 2.5;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const newStroke = {
      tool: currentTool,
      color: currentTool === 'highlighter' ? '#fef08a' : penColor,
      width: currentTool === 'highlighter' ? 14 : 2.5,
      points: [pt],
    };
    strokesRef.current.push(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const current = strokesRef.current[strokesRef.current.length - 1];
    if (current) {
      current.points.push(pt);
      const ctx = canvas.getContext('2d');
      if (ctx) drawSingleStroke(ctx, current);
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  // 1. 手書きを文字認識（OCR）してMarkdown形式に変換
  const handleRecognizeToMarkdown = async () => {
    setIsRecognizing(true);
    try {
      const canvas = canvasRef.current;
      const imageBase64 = canvas ? canvas.toDataURL('image/png') : '';

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          forceMock,
        }),
      });

      if (!res.ok) throw new Error('文字認識に失敗しました');
      const data = await res.json();

      if (data.markdownTranscription) {
        setMarkdownContent(data.markdownTranscription);
        setPhase('markdown');
        onNotify(
          '手書きノートを文字認識し、Markdown形式に変換しました！',
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      onNotify('文字認識処理でエラーが発生しました。', 'error');
    } finally {
      setIsRecognizing(false);
    }
  };

  // 2. 指定したMarkdown箇所から「AIが一番良いと判断した1つのレイアウト」を直接適用
  const handleApplyBestLayout = async () => {
    const targetMarkdown = markdownBlocks[selectedBlockIndex] || markdownContent;
    setIsAnalyzingLayout(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedMarkdown: targetMarkdown,
          forceMock,
        }),
      });

      if (!res.ok) throw new Error('レイアウト判定に失敗しました');
      const data = await res.json();

      if (data.bestLayout) {
        setBestLayout(data.bestLayout);
        setPhase('layout');
        onNotify(
          `AI判定：この文章には「${
            data.bestLayout.kind === 'step-flow'
              ? 'ステップ・フロー'
              : data.bestLayout.kind === 'comparison'
              ? '左右対比マトリクス'
              : '要点カードグリッド'
          }」が最も最適と判断しました！`,
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      onNotify('AIレイアウト生成でエラーが発生しました。', 'error');
    } finally {
      setIsAnalyzingLayout(false);
    }
  };

  // 要素インライン編集
  const handleUpdateElement = (index: number, updated: Partial<LayoutElement>) => {
    if (!bestLayout) return;
    const elements = [...bestLayout.elements];
    elements[index] = { ...elements[index], ...updated };
    setBestLayout({ ...bestLayout, elements });
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* ノート上部：ステップ進行バー & ツールバー */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-2 text-xs">
        {/* フェーズ進行タブ */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPhase('handwriting')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              phase === 'handwriting'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>① 手書き</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />

          <button
            onClick={() => setPhase('markdown')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              phase === 'markdown'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>② Markdown認識</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />

          <button
            onClick={() => {
              if (bestLayout) setPhase('layout');
            }}
            disabled={!bestLayout}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              phase === 'layout'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-400 disabled:opacity-40'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>③ AIベスト選定</span>
          </button>
        </div>

        {/* 右側アクション */}
        {phase === 'handwriting' && (
          <button
            onClick={handleRecognizeToMarkdown}
            disabled={isRecognizing}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all text-xs"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isRecognizing ? '文字認識中...' : 'Markdownに変換'}</span>
          </button>
        )}

        {phase === 'markdown' && (
          <button
            onClick={handleApplyBestLayout}
            disabled={isAnalyzingLayout}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-2xs transition-all text-xs animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzingLayout ? '判定中...' : '指定箇所をAIが最適レイアウト化'}</span>
          </button>
        )}

        {phase === 'layout' && (
          <button
            onClick={() => setPhase('markdown')}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md text-xs font-medium"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Markdownに戻る</span>
          </button>
        )}
      </div>

      {/* ノート紙面エリア */}
      <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 bg-[linear-gradient(to_right,#cbd5e130_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e130_1px,transparent_1px)] bg-[size:24px_24px]">
        {/* ========================================================
            フェーズ 1: 手書きノート画面
        ======================================================== */}
        {phase === 'handwriting' && (
          <div className="flex flex-col h-full min-h-[500px]">
            {/* iPad/iPhone 手書きパレット */}
            <div className="flex items-center justify-between mb-3 bg-white/95 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    currentTool === 'pen'
                      ? 'bg-slate-100 text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="ペン"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentTool('highlighter')}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    currentTool === 'highlighter'
                      ? 'bg-amber-100 text-amber-800 shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="マーカー"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    currentTool === 'eraser'
                      ? 'bg-rose-100 text-rose-800 shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="消しゴム"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Apple Pencil / タッチ手書き対応
              </span>
            </div>

            {/* 手書きキャンバス */}
            <div className="relative flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-inner overflow-hidden cursor-crosshair min-h-[420px]">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="absolute inset-0 w-full h-full"
              />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
                <span className="bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                  ✏️ 手書きメモ & 矢印スケッチ
                </span>
                <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded border border-indigo-100 pointer-events-auto">
                  上の「Markdownに変換」を押すと文字認識されます
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            フェーズ 2: 文字認識されたMarkdownノート（指定箇所を選択）
        ======================================================== */}
        {phase === 'markdown' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>手書きの文字認識が完了しました（Markdown形式）</span>
              </span>
              <span className="text-[11px] text-indigo-600">
                整えたい箇所をクリックして指定してください
              </span>
            </div>

            {/* 各Markdownブロック（指定箇所をクリック） */}
            <div className="space-y-3">
              {markdownBlocks.map((block, idx) => {
                const isSelected = selectedBlockIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBlockIndex(idx)}
                    className={`relative p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white/90 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* 指定中バッジ */}
                    {isSelected && (
                      <div className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <span>✓ 指定箇所</span>
                      </div>
                    )}

                    <pre className="text-xs sm:text-sm text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                      {block}
                    </pre>
                  </div>
                );
              })}
            </div>

            {/* AIレイアウト適用ボタン */}
            <div className="pt-2 text-center">
              <button
                onClick={handleApplyBestLayout}
                disabled={isAnalyzingLayout}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isAnalyzingLayout
                    ? 'AIが文脈を判定中...'
                    : '指定した箇所の【ベストなレイアウト】をAIに自動展開させる'}
                </span>
              </button>
              <p className="text-[11px] text-slate-400 mt-1.5">
                ※ 複数の選択肢で迷わせず、AIが最も効果的と判断した1つの配置を直接適用します
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            フェーズ 3: AIが選んだベストレイアウトだけを表示・展開
        ======================================================== */}
        {phase === 'layout' && bestLayout && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* 前後のMarkdownコンテキストと、指定箇所が置換された様子 */}
            <div className="bg-white/90 p-3 sm:p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                Markdownノート（指定箇所をAIがベストレイアウトに整形）:
              </span>

              {/* 上部の前置きテキスト */}
              {selectedBlockIndex > 0 && (
                <div className="text-xs text-slate-600 mb-2 font-mono whitespace-pre-wrap opacity-75">
                  {markdownBlocks[0]}
                </div>
              )}

              {/* AIが一番良いと判断した1つのレイアウトブロック */}
              <SingleBestLayoutBlock
                layout={bestLayout}
                onRevert={() => setPhase('markdown')}
                onUpdateElement={handleUpdateElement}
              />

              {/* 後続のテキスト */}
              {selectedBlockIndex < markdownBlocks.length - 1 && (
                <div className="text-xs text-slate-600 mt-2 font-mono whitespace-pre-wrap opacity-75">
                  {markdownBlocks[markdownBlocks.length - 1]}
                </div>
              )}
            </div>

            {/* 再調整用アクション */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>※ 新しい情報は追加せず、あなたの元の言葉のみで配置しています</span>
              <button
                onClick={() => setPhase('markdown')}
                className="text-indigo-600 hover:underline font-bold"
              >
                別の箇所を指定する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
