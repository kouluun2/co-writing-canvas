export type DeviceMode = 'ipad' | 'iphone';

export type LayoutKind = 'step-flow' | 'comparison' | 'card-grid' | 'timeline';

// ユーザーの原文のフレーズをそのまま割り振るレイアウト要素
export interface LayoutElement {
  id: string;
  originalText: string; // ユーザーが書いた元のテキストそのもの
  label?: string; // 例: "Step 1", "Before", "Point 1" などの構造ラベル
  secondaryText?: string; // 比較時の対比テキストなど
  badge?: string;
}

// AIが「一番良い」と判断した単一のベストレイアウト
export interface BestLayoutResult {
  kind: LayoutKind;
  reason: string; // なぜこのレイアウトが一番適しているとAIが判断したか
  title: string; // 原文から抽出した見出し
  elements: LayoutElement[];
  noteCaption?: string;
  themeColor: 'blue' | 'emerald' | 'amber' | 'indigo';
}

export interface AnalyzeSingleRequest {
  selectedMarkdown: string; // ユーザーが指定したMarkdown箇所
  fullMarkdownContext?: string; // 前後の文脈
  imageBase64?: string; // 手書きキャンバス画像（OCR用）
  forceMock?: boolean;
}

export interface AnalyzeSingleResponse {
  markdownTranscription?: string; // 手書き画像から文字認識されたMarkdown
  bestLayout: BestLayoutResult; // AIが判断したベストな1つのレイアウト
  isMock: boolean;
  message?: string;
}

// 互換用型
export type LayoutType = 'step-flow' | 'comparison' | 'narrative';
export interface LayoutProposal {
  id: string;
  kind: LayoutKind;
  name: string;
  description: string;
  themeColor: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
  title: string;
  elements: LayoutElement[];
  noteCaption?: string;
}
export interface NoteItem {
  id: string;
  type: 'raw-note' | 'structured-layout';
  rawText: string;
  selected?: boolean;
  layout?: LayoutProposal | BestLayoutResult;
  createdAt: number;
}
