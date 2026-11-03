'use client';

import React, { useState } from 'react';
import { DeviceMode, BestLayoutResult, LayoutElement } from '@/types/canvas';
import { SingleBestLayoutBlock } from './SingleBestLayoutBlock';
import { determineBestLayout, DEFAULT_NOTE_PRESETS } from '@/lib/mockData';
import {
  Sparkles,
  Edit3,
  Undo2,
  Check,
  Plus,
  BookOpen,
  FileText,
  Trash2,
  Copy,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

interface SmartNotesCanvasProps {
  device: DeviceMode;
  forceMock: boolean;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface NoteBlock {
  id: string;
  text: string;
  layout?: BestLayoutResult; // AIによってレイアウト化されている場合
}

export function SmartNotesCanvas({
  device,
  forceMock,
  onNotify,
}: SmartNotesCanvasProps) {
  // 初期ノートブロック
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    {
      id: 'block-header',
      text: '## AI時代のエンジニアの生存戦略とキャリアシフト',
    },
    {
      id: 'block-compare',
      text: `従来の手法：文法を覚えて手作業でコードを1行ずつ書くこと、API構文の記憶で勝負
これからの時代：何を作るべきかの仕様策定、AIへの的確な指示と全体アーキテクチャの設計力`,
    },
    {
      id: 'block-steps',
      text: `1. まずCopilotやCursor等のAIツールを手足のように使い倒す
2. 実装速度を10倍にして浮いた時間を要件定義とシステム設計に投資する
3. ユーザーインタビューやプロダクトマネジメント領域にも染み出す`,
    },
    {
      id: 'block-footer',
      text: '> 結論：単なる「コード書き」から、AIを活用して最速で価値を届ける「プロダクトビルダー」への進化が生存戦略。',
    },
  ]);

  // ユーザーが現在指定（選択）しているブロックID
  const [selectedBlockId, setSelectedBlockId] = useState<string>('block-steps');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // 選択中のブロック
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // AIによるベストレイアウトの生成・適用
  const handleApplyBestLayout = async (blockId: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock || !targetBlock.text.trim()) {
      onNotify('レイアウトを適用する文章を入力してください。', 'error');
      return;
    }

    setIsAnalyzing(true);

    try {
      // APIリクエストを試行
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedMarkdown: targetBlock.text,
            forceMock,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.bestLayout) {
            applyLayoutToBlock(blockId, data.bestLayout);
            onNotify(
              `AI判定：この文章には「${
                data.bestLayout.kind === 'step-flow'
                  ? 'ステップ・フロー'
                  : data.bestLayout.kind === 'comparison'
                  ? '左右対比マトリクス'
                  : '要点カードグリッド'
              }」が最適と判断しました！`,
              'success'
            );
            return;
          }
        }
      } catch (e) {
        // オフライン/静的ホスティング時はクライアントで直接実行
      }

      // クライアント側で直接最適な1案を決定
      const best = determineBestLayout(targetBlock.text);
      applyLayoutToBlock(blockId, best);
      onNotify(
        `AI判定：この文章には「${
          best.kind === 'step-flow'
            ? 'ステップ・フロー'
            : best.kind === 'comparison'
            ? '左右対比マトリクス'
            : '要点カードグリッド'
        }」が最適と判断しました！`,
        'success'
      );
    } catch (err) {
      console.error(err);
      onNotify('レイアウト生成中にエラーが発生しました。', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyLayoutToBlock = (blockId: string, layout: BestLayoutResult) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, layout } : b))
    );
  };

  // 元のプレーン文章に戻す
  const handleRevertLayout = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, layout: undefined } : b))
    );
    onNotify('元のテキストメモに戻しました。');
  };

  // テキストの更新
  const handleUpdateText = (blockId: string, newText: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, text: newText } : b))
    );
  };

  // ブロック要素の更新（レイアウト展開後のインライン編集）
  const handleUpdateLayoutElement = (
    blockId: string,
    elemIdx: number,
    updated: Partial<LayoutElement>
  ) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId && b.layout) {
          const elements = [...b.layout.elements];
          elements[elemIdx] = { ...elements[elemIdx], ...updated };
          return {
            ...b,
            layout: { ...b.layout, elements },
          };
        }
        return b;
      })
    );
  };

  // ブロックの追加
  const handleAddBlock = () => {
    const newId = `block-${Date.now()}`;
    const newBlock: NoteBlock = {
      id: newId,
      text: '・新しいアイデアやメモをここに入力...',
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  // ブロックの削除
  const handleDeleteBlock = (blockId: string) => {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(blocks[0].id);
    }
  };

  // プリセットの読み込み
  const handleLoadPreset = (index: number) => {
    const preset = DEFAULT_NOTE_PRESETS[index];
    const parts = preset.text
      .split(/\n\n+/)
      .map((t, idx) => ({
        id: `block-${idx + 1}`,
        text: t.trim(),
      }))
      .filter((b) => b.text.length > 0);

    setBlocks(parts);
    setSelectedBlockId(parts[1]?.id || parts[0]?.id);
    onNotify(`「${preset.title}」をノートに読み込みました。`);
  };

  // ノート全体をコピー
  const handleCopyAll = () => {
    const fullText = blocks
      .map((b) => b.text)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('ノートの内容をクリップボードにコピーしました！', 'success');
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* ノート上部：プリセット切替 & アクションバー */}
      <div className="px-3 sm:px-5 py-2.5 border-b border-slate-200/80 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* サンプルノート切り替えボタン */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">サンプル:</span>
          </span>
          {DEFAULT_NOTE_PRESETS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(idx)}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              {p.title.slice(0, 10)}...
            </button>
          ))}
        </div>

        {/* 右側アクション */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddBlock}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">文章を追加</span>
          </button>

          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors"
            title="ノートをコピー"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">コピー</span>
          </button>
        </div>
      </div>

      {/* ノート紙面（Apple純正メモ風の上質なテクスチャ） */}
      <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:100%_32px]">
        {/* 操作ガイドバナー */}
        <div className="mb-4 p-2.5 sm:p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>使い方:</strong> 整えたい文章をクリックして「指定」し、AIボタンを押すと最適な1つのレイアウトに自動変形されます。
            </span>
          </div>
        </div>

        {/* ノート内の文章ブロック一覧 */}
        <div className="space-y-4 max-w-3xl mx-auto pb-10">
          {blocks.map((block, idx) => {
            const isSelected = block.id === selectedBlockId;
            const isHeader = block.text.startsWith('#');

            // 1. すでにAIによってベストレイアウト化されている場合
            if (block.layout) {
              return (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`relative transition-all rounded-2xl ${
                    isSelected ? 'ring-2 ring-indigo-500 shadow-md' : ''
                  }`}
                >
                  <SingleBestLayoutBlock
                    layout={block.layout}
                    onRevert={() => handleRevertLayout(block.id)}
                    onUpdateElement={(elemIdx, updated) =>
                      handleUpdateLayoutElement(block.id, elemIdx, updated)
                    }
                  />
                </div>
              );
            }

            // 2. 通常のメモ文章ブロック
            return (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={`relative group rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/60 border-2 border-indigo-500 shadow-lg ring-4 ring-indigo-500/10'
                    : 'bg-white/95 border border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* ユーザーが指定（選択）している時のアクションバー */}
                {isSelected && (
                  <div className="absolute -top-3.5 right-3 sm:right-4 z-20 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyBestLayout(block.id);
                      }}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md hover:shadow-lg transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isAnalyzing ? 'AIが最適化中...' : 'この指定箇所をAIが最適レイアウト化'}
                      </span>
                    </button>

                    {blocks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="p-1 rounded-full bg-white text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs"
                        title="このブロックを削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* ブロックヘッダーラベル */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span>文章ブロック 0{idx + 1}</span>
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-full">
                      ✓ 指定中
                    </span>
                  )}
                </div>

                {/* テキスト編集エリア（タイピングで自由に加筆・修正可能） */}
                <textarea
                  value={block.text}
                  onChange={(e) => handleUpdateText(block.id, e.target.value)}
                  rows={Math.max(block.text.split('\n').length, 2)}
                  className={`w-full bg-transparent resize-none focus:outline-none leading-relaxed text-slate-800 ${
                    isHeader
                      ? 'font-bold text-base sm:text-lg text-slate-900'
                      : 'text-xs sm:text-sm font-sans'
                  }`}
                  placeholder="文章を入力してください..."
                />

                {/* 下部クイックトリガー */}
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>{block.text.length} 文字</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                      handleApplyBestLayout(block.id);
                    }}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AIベストレイアウトを展開</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
