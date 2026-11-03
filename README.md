# Smart Notes Canvas (iPad & iPhone AI Note Layout)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkouluun2%2Fco-writing-canvas)

iPadおよびiPhoneの画面で動作する、手書き文字認識・Markdown変換・AI単一ベストレイアウト自動展開アプリです。

---

## 🌟 主な機能と特徴

### 1. iPad画面 ⇄ iPhone画面のシームレス切り替え
- **iPadモード（iPadOS 18風）**:
  - iPad Pro（11インチ）のワイドなキャンバス、Apple Pencil充電部、上部ステータスバー。
- **iPhoneモード（iOS 18風）**:
  - iPhone 16 Proの縦長フレーム、Dynamic Island、片手操作に最適化されたコンパクトなノートレイアウト。
- 上部のトグルスイッチでワンクリック切り替え可能。

### 2. 手書き ➔ 文字認識（OCR）でMarkdown形式に変換
- 手書きキャンバス（Apple Pencil・マウス対応のペン・マーカー・消しゴム）で殴り書きや矢印スケッチを描画。
- **「Markdownに変換」**ボタンを押すと、AIが文字・図・矢印を認識し、構造化されたMarkdown（見出し `#`、箇条書き `-`、リスト `1.`、引用 `>`）に即座に変換。

### 3. 指定箇所 ➔ AIが「一番良いレイアウト」を1択で直接配置
- 変換されたMarkdownの中で、整えたい段落やブロックをクリックして指定。
- **「指定箇所をAIが最適レイアウト化」**を実行すると、いろいろな選択肢で迷わせず、**AIが文脈を判断して最も効果的な1つのベストレイアウト（ステップフロー / 左右対比マトリクス / 要点カードグリッド）を決定・直接ノート上に配置！**
- **「新しい情報は付け加えない」原則**を徹底。ユーザーが書いた言葉・単語のみを過不足なくレイアウト要素に割り振ります。
- レイアウト展開後も、テキストの直接インライン編集や「Markdownに戻す」が可能です。

---

## 🚀 起動方法

```bash
cd co-writing-canvas
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。
Gemini APIキーがなくても、内蔵のインテリジェントモックエンジンで手書きOCR・ベストレイアウト判定の全フローを体験できます。
（実APIキーを使う場合は `.env.local` に `GEMINI_API_KEY=...` を設定）
