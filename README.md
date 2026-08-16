# Regional Intelligence Radar

地域創生、自治体DX、行政施策、地域課題の動きを「地域のSignal」として俯瞰する、個人利用向けWebアプリのv0.1プロトタイプです。

## Current scope

- 47都道府県のインタラクティブなSignalマップ
- 都道府県・カテゴリによるSignalフィルタリング
- 14件の架空モックSignalと詳細分析
- `SIGNAL` / `WHY IT MATTERS` / `OPPORTUNITY` の一画面表示
- PC横長画面を優先したダークなIntelligence Console UI

モック内容は実在ニュースではありません。ニュースAPI、DB、LLM連携、認証はv0.1の対象外です。

## Development

Node.js `>=22.13.0` と npm を使用します。

```bash
npm ci
npm run dev
npm run build
npm run lint
npm test
```

要件は `docs/design_v01.md`、実装規約は `AGENTS.md`、Codex向けの具体的ワークフローは `.agents/skills/regional-intelligence-radar/SKILL.md` を参照してください。
