# ✍️ Smart Notes Canvas (iPad & iPhone AI Note Layout)

[![Live Demo](https://img.shields.io/badge/Live_Demo-kouluun2.github.io%2Fco--writing--canvas-blue?style=flat&logo=github)](https://kouluun2.github.io/co-writing-canvas/)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_API-Multimodal_OCR-8E75B2?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

手書きの殴り書きやスケッチを、AIが迷わず「一番伝わるベストなレイアウト」へ自動整形する、iPad & iPhone シミュレーション対応のスマートノートアプリです。

👉 **[今すぐWebブラウザで体験する（無料・登録不要）](https://kouluun2.github.io/co-writing-canvas/)**

---

## 🌟 コアコンセプト

従来のノートアプリは「手書きの自由さ」と「清書・構造化の美しさ」が分断されていました。  
本プロジェクトは、**「手書きの思考スピード ➔ Markdownへの瞬時構造化 ➔ 文脈に応じた最適なUIレイアウト配置」** をワンストップで実現します。

### 迷わせない「1択ベストレイアウト」思想
複数のテンプレートから選ばせるのではなく、**AIがメモの文脈（時系列・対比・要点列挙など）を判断して最も効果的な1つのレイアウトを直接配置**します。ユーザーが書いた言葉を勝手に要約・改変せず、「新しい情報を付け加えない原則」を厳格に守ります。

---

## ✨ 主な機能

### 1. 📱 iPad画面 ⇄ iPhone画面のワンクリック切り替え
* **iPadモード (iPadOS 18風)**:
  * iPad Pro（11インチ）の広大なキャンバス、Apple Pencil充電インジケーター、上部ステータスバーを忠実に再現。
* **iPhoneモード (iOS 18風)**:
  * iPhone 16 Proのフレーム、Dynamic Island、片手操作に最適化されたコンパクトレイアウト。

### 2. ✏️ 手書きキャンバス ➔ AI Markdown OCR
* ペン、マーカー、消しゴムに対応したApple Pencil・タッチ対応キャンバス。
* **「Markdownに変換」** を押すと、Gemini Vision が殴り書き文字・矢印・囲み枠を正確に解析し、構造化されたMarkdown（見出し `#`、箇条書き `-`、リスト `1.`、引用 `>`）へ即座にデジタル化。

### 3. 🎨 3種類の自動最適レイアウト展開
文脈に合わせて以下のレイアウトを自動判定・生成：
* **ステップフロー型**: 「手順」「流れ」「プロセス」をステップカードと矢印で整列
* **左右対比マトリクス型**: 「メリット/デメリット」「比較」「ビフォー/アフター」を2カラムカードで対比
* **要点カードグリッド型**: 「重要事項」「特徴」「キーポイント」をアイコン付きグリッドで配置
* ※展開後もテキストの直接インライン編集や「元のMarkdownに戻す」が可能です。

### 4. 🧠 インテリジェント・モックエンジン内蔵
* Gemini APIキーが未設定の環境でも、文脈解析・OCR・レイアウト生成の全UIフローを即座に体験できるスマートモックエンジンを標準搭載。

---

## 🛠️ 技術スタック

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Static Export)
* **Library**: React 19 / TypeScript 5
* **Styling**: Tailwind CSS v4
* **AI / Multimodal**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini 2.5 Flash / Gemini Pro Vision)
* **Icons**: Lucide React
* **Hosting**: GitHub Pages (`gh-pages`) / Vercel ready

---

## 🚀 クイックスタート（ローカル実行）

### 1. リポジトリのクローン
```bash
git clone https://github.com/kouluun2/co-writing-canvas.git
cd co-writing-canvas
```

### 2. 依存パッケージのインストール
```bash
npm install
```

### 3. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開きます。

### （任意）実際のGemini APIキーを使用する場合
ルート直下に `.env.local` を作成し、Google AI Studio で取得したAPIキーを設定します：
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
※ APIキーが設定されていない場合でも、自動的にインテリジェントモックモードが稼働し、全機能を体験できます。

---

## 📦 ビルド ＆ 静的デプロイ

```bash
# 静的HTMLのビルド (out/ ディレクトリ生成)
npm run build

# GitHub Pages へのデプロイ
npm run deploy
```

---

## 📄 ライセンス

本プロジェクトは [MIT License](LICENSE) のもとで公開されています。
