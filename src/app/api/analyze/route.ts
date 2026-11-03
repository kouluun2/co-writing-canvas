import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { AnalyzeSingleRequest, AnalyzeSingleResponse, BestLayoutResult } from '@/types/canvas';
import { determineBestLayout, HANDWRITING_MARKDOWN_SAMPLES } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeSingleRequest = await req.json();
    const { selectedMarkdown = '', imageBase64, forceMock } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. 手書き画像から文字認識（Markdown化）のリクエスト
    if (imageBase64 && !selectedMarkdown) {
      if (forceMock || !apiKey) {
        console.log('[API /api/analyze] OCR Fallback mock.');
        return NextResponse.json({
          markdownTranscription: HANDWRITING_MARKDOWN_SAMPLES[0].markdown,
          isMock: true,
          message: '手書きノートの文字認識が完了し、Markdown形式に変換しました。',
        });
      }

      try {
        const ai = new GoogleGenAI({ apiKey });
        const base64Data = imageBase64.includes('base64,')
          ? imageBase64.split('base64,')[1]
          : imageBase64;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Data,
              },
            },
            {
              text: `このiPad手書きノートの文字、箇条書き、図、矢印を正確に文字認識（OCR）し、見出し（#）、箇条書き（-）、番号リスト（1.）、引用（>）等を用いた綺麗なMarkdown形式としてテキスト出力してください。余計な挨拶は不要です。`,
            },
          ],
        });

        const markdownText = response.text || HANDWRITING_MARKDOWN_SAMPLES[0].markdown;
        return NextResponse.json({
          markdownTranscription: markdownText,
          isMock: false,
          message: 'Gemini 3.8 Flash による手書き文字認識でMarkdownに変換しました。',
        });
      } catch (err) {
        console.warn('[API /api/analyze] OCR API error, using mock sample.', err);
        return NextResponse.json({
          markdownTranscription: HANDWRITING_MARKDOWN_SAMPLES[0].markdown,
          isMock: true,
          message: '手書きノートの文字認識が完了し、Markdown形式に変換しました。',
        });
      }
    }

    // 2. 指定されたMarkdown箇所から「一番良いレイアウトを1択で判断」するリクエスト
    if (forceMock || !apiKey) {
      console.log('[API /api/analyze] Best layout determination (Mock).');
      const best = determineBestLayout(selectedMarkdown);
      const res: AnalyzeSingleResponse = {
        bestLayout: best,
        isMock: true,
        message: `AIが判定：この文章には「${best.kind === 'step-flow' ? 'ステップ・フロー' : best.kind === 'comparison' ? '左右対比マトリクス' : '要点カードグリッド'}」が最も最適と判断しました。`,
      };
      return NextResponse.json(res);
    }

    // Gemini APIによる「ベストな1つのレイアウト」判定
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `あなたはiPad/iPhoneスマートノートの知的レイアウトアシスタントです。
【絶対厳守の規則】
1. 新しい情報、勝手な肉付け、作文、追加の説明文、架空のエピソードは一切付け加えてはいけません。
2. ユーザーが書いた文章・フレーズ・単語のみを過不足なくそのまま使用してください。
3. 複数のパターンを提示せず、文章の論理構造（対比なのか、手順・進行なのか、並列の要点なのか）から【AIが一番良いと判断した1つのレイアウトのみ】を決定してください。

判定基準:
- "step-flow": 順序や手順、時間経過がある場合
- "comparison": 従来と新、BeforeとAfter、メリットとデメリットなどの対比がある場合
- "card-grid": 並列の要点やアイデアがある場合
`;

      const prompt = `以下の【ユーザーが指定したMarkdownテキスト】の内容を解析し、新しい情報を一切付け足さず、ユーザーの言葉のみを使って最も適した【1つのベストレイアウト】を決定・作成してください。

【ユーザーが指定したMarkdownテキスト】:
${selectedMarkdown}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bestLayout: {
                type: Type.OBJECT,
                properties: {
                  kind: {
                    type: Type.STRING,
                    description: 'step-flow | comparison | card-grid のうち最も適した1つ',
                  },
                  reason: {
                    type: Type.STRING,
                    description: 'なぜこのレイアウトが一番最適と判断したかの理由（1行）',
                  },
                  title: {
                    type: Type.STRING,
                    description: '原文から抽出したタイトル',
                  },
                  noteCaption: { type: Type.STRING },
                  themeColor: { type: Type.STRING },
                  elements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        originalText: {
                          type: Type.STRING,
                          description: 'ユーザーが書いた原文そのままのフレーズ',
                        },
                        label: { type: Type.STRING },
                        secondaryText: {
                          type: Type.STRING,
                          description: '比較時の対比テキスト（ユーザー原文そのまま）',
                        },
                        badge: { type: Type.STRING },
                      },
                      required: ['id', 'originalText'],
                    },
                  },
                },
                required: ['kind', 'reason', 'title', 'elements'],
              },
            },
            required: ['bestLayout'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.bestLayout) {
        return NextResponse.json({
          bestLayout: parsed.bestLayout as BestLayoutResult,
          isMock: false,
          message: `AI判定：${parsed.bestLayout.reason}`,
        });
      }

      throw new Error('Empty bestLayout from Gemini');
    } catch (apiErr) {
      console.warn('[API /api/analyze] Gemini error, fallback best layout.', apiErr);
      const best = determineBestLayout(selectedMarkdown);
      return NextResponse.json({
        bestLayout: best,
        isMock: true,
        message: `AIが判定：この文章には「${best.kind === 'step-flow' ? 'ステップ・フロー' : best.kind === 'comparison' ? '左右対比マトリクス' : '要点カードグリッド'}」が最も最適と判断しました。`,
      });
    }
  } catch (error) {
    console.error('[API /api/analyze] Error:', error);
    return NextResponse.json(
      { error: 'サーバー内部エラーが発生しました。' },
      { status: 500 }
    );
  }
}
