# Regional Intelligence Radar

地域創生、自治体DX、行政施策、地域課題の週次レポートを「地域のSignal」として俯瞰する、個人利用向けWebアプリのPoCです。

## Current scope

- 47都道府県のインタラクティブなSignalマップ
- Latest・過去週・Allによる週次アーカイブ切り替え
- 都道府県・自治体・カテゴリによるSignalフィルタリング
- プロジェクト内JSONから読み込む架空サンプルSignalと詳細分析
- `SIGNAL` / `WHY IT MATTERS` / `OPPORTUNITY` の一画面表示
- PC横長画面を優先したダークなIntelligence Console UI

サンプル内容は実在ニュースではありません。ニュースAPI、DB、LLM連携、認証、自動同期はPoCの対象外です。

## Weekly JSON archive

ChatGPT等で作成した週次レポートを、起動前に `data/YYYY-MM-DD.json` として手動コピーします。管理用indexや設定変更は不要です。追加後に開発サーバーを再起動するか、再ビルドしてください。

```json
{
  "week": "2026-08-24",
  "generatedAt": "2026-08-24T09:00:00+09:00",
  "signals": [
    {
      "id": "2026-08-24-001",
      "prefecture": "長野県",
      "municipality": "○○市",
      "category": "Regional Mobility",
      "title": "AIオンデマンド交通の実証実験を開始",
      "summary": "高齢者や交通空白地域の移動手段確保を目的とした実証実験。",
      "importance": "HIGH",
      "publishedAt": "2026-08-20",
      "whyItMatters": "人口減少地域の公共交通維持に向けた新しいアプローチです。",
      "opportunity": "地域通貨、健康施策、高齢者支援との連携可能性があります。",
      "relatedTopics": ["Regional Mobility", "Aging Society"],
      "sourceUrl": "https://example.com"
    }
  ]
}
```

ファイル名と `week` は一致させ、日付はISO形式にします。対応カテゴリと重要度は `types/signal.ts` を参照してください。不正なJSON、未知の値、全週で重複するSignal IDは起動・ビルド時にエラーになります。

## Development

Node.js `>=22.13.0` と npm を使用します。

```bash
// 脆弱性確認
npm audit

// lintとtest
npm run lint
npm test

// 開発環境実行
npm ci
npm run dev
npm run build
```

現行要件は `docs/design_v02.md`、旧UI要件は `docs/design_v01.md`、実装規約は `AGENTS.md`、Codex向けワークフローは `.agents/skills/regional-intelligence-radar/SKILL.md` を参照してください。
