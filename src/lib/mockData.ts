import { BestLayoutResult, LayoutKind } from '@/types/canvas';

// 手書きから文字認識された想定のMarkdown初期データ
export const HANDWRITING_MARKDOWN_SAMPLES = [
  {
    id: 'sample-1',
    title: 'AI活用とエンジニア進化',
    handwritingDescription: '四角い枠で囲んだBefore/Afterと、下部に3つの矢印ステップが手書きされたノート',
    markdown: `## AI時代のエンジニアの役割変化

### 従来の手法
- 文法を覚えて手作業でコードを1行ずつ書くこと
- API仕様書の暗記と構文知識で勝負

### これからの時代
- 何を作るべきかの仕様策定と要件定義
- AIへの指示と全体アーキテクチャの設計力

### 実践ステップ
1. CopilotやCursorを手足のように使い倒す
2. 実装速度を10倍にして設計と仕様策定に時間を使う
3. プロダクトマネジメント領域にも染み出す

> 結論：コード書きからAIを活用したプロダクトビルダーへ`,
  },
  {
    id: 'sample-2',
    title: '初期SaaSのトラクション獲得',
    handwritingDescription: '左側に失敗パターン、右側に4つの進行ステップ矢印が手書きされたノート',
    markdown: `## 初期SaaSの顧客獲得ロードマップ

### やりがちな失敗
- いきなり広告を打つ
- 機能を作りすぎて誰の課題かわからない

### 成功への道筋
1. ペルソナ10人に泥臭くインタビューして課題解像度を上げる
2. 手動運用（コンシェルジュMVP）で熱狂的なファンを3社作る
3. 事例記事と口コミで業界コミュニティに浸透させる
4. 紹介とリファラルで再現性のあるセールスフローを確立

> 学び：プロダクトの完成度より熱狂的な1社の成功体験が全て`,
  },
];

/**
 * ユーザーが指定したMarkdown箇所をAIが判断し、
 * 【一番良いと判断した1つのレイアウトだけ】を決定する。
 * 新しい情報は一切付け加えず、ユーザーの書いた言葉のみを配置する。
 */
export function determineBestLayout(markdownText: string): BestLayoutResult {
  const cleanLines = markdownText
    .split('\n')
    .map((l) => l.trim().replace(/^[\#\-\*・\d\.\s\>\[\]]+/, ''))
    .filter((l) => l.length > 0);

  const title = cleanLines[0] || '指定したメモのレイアウト';
  const contentLines = cleanLines.slice(1).length > 0 ? cleanLines.slice(1) : cleanLines;

  const lower = markdownText.toLowerCase();

  // 1. 対比・比較キーワードがある場合 ➔ 「比較・対比マトリクス」がベスト！
  const isComparison =
    markdownText.includes('従来') ||
    markdownText.includes('これから') ||
    markdownText.includes('以前') ||
    markdownText.includes('失敗') ||
    markdownText.includes('成功') ||
    markdownText.includes('vs') ||
    markdownText.includes('Before') ||
    markdownText.includes('After') ||
    markdownText.includes('メリット');

  // 2. 順序・ステップの数字や矢印がある場合 ➔ 「ステップ・フロー」がベスト！
  const isStep =
    markdownText.includes('1.') ||
    markdownText.includes('2.') ||
    markdownText.includes('ステップ') ||
    markdownText.includes('まず') ||
    markdownText.includes('フェーズ') ||
    markdownText.includes('手順') ||
    markdownText.includes('プロセス');

  if (isComparison) {
    const half = Math.ceil(contentLines.length / 2);
    const left = contentLines.slice(0, half);
    const right = contentLines.slice(half);
    const count = Math.min(Math.max(left.length, right.length), 3);

    const elements = [];
    for (let i = 0; i < count; i++) {
      elements.push({
        id: `comp-${i + 1}`,
        originalText: left[i] || left[0] || '従来の前提',
        secondaryText: right[i] || right[0] || contentLines[contentLines.length - 1] || '新しい手法',
        label: `項目 0${i + 1}`,
      });
    }

    return {
      kind: 'comparison',
      reason: '文章内に対比関係（従来とこれからの違い、課題と解決）が含まれているため、左右対比マトリクスが最も伝わりやすいと判断しました。',
      title,
      themeColor: 'emerald',
      noteCaption: '左右のコントラストで違いを鮮明に伝えるレイアウト',
      elements,
    };
  }

  if (isStep) {
    const elements = contentLines.slice(0, 4).map((line, idx) => ({
      id: `step-${idx + 1}`,
      originalText: line,
      label: `Step ${idx + 1}`,
      badge: idx === 0 ? 'Start' : idx === contentLines.slice(0, 4).length - 1 ? 'Goal' : undefined,
    }));

    return {
      kind: 'step-flow',
      reason: '文章内に実行手順や時系列の番号が含まれているため、矢印で進捗を示すステップ・フローが最も論理的だと判断しました。',
      title,
      themeColor: 'blue',
      noteCaption: 'プロセスの流れが一目で理解できるフローレイアウト',
      elements,
    };
  }

  // デフォルト: 要点カードグリッド
  const elements = contentLines.slice(0, 4).map((line, idx) => ({
    id: `card-${idx + 1}`,
    originalText: line,
    label: `Point 0${idx + 1}`,
  }));

  return {
    kind: 'card-grid',
    reason: '並列のアイデアや要点が箇条書きされているため、均等なカードタイル形式で見通しを良くするのが最も効果的だと判断しました。',
    title,
    themeColor: 'amber',
    noteCaption: '複数の要点を整然と並べるカードグリッドレイアウト',
    elements,
  };
}
