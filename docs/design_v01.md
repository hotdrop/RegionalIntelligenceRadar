# Regional Intelligence Radar v0.1

自治体・行政・地域創生に関する情報を、毎日眺めたくなるスタイリッシュなWebアプリとして可視化してください。

今回は本番サービスではなく、個人利用向けのプロトタイプです。  
ニュースAPI、DB、LLM連携、認証などはまだ実装しません。

最優先は「UI/UXを見て、この方向性で使いたいと思えること」です。

## 目的

地域創生、地域活性化、自治体DX、行政施策、地域課題に関する情報を、単なるニュース一覧ではなく「地域のシグナル」として俯瞰できるWebアプリを作ります。

将来的には以下のような流れへ発展させる予定です。

Signal → Opportunity → Hypothesis → Experiment

ただしv0.1では、まずSignalとOpportunityを魅力的に表示できれば十分です。

## 技術構成

以下を基本構成としてください。

- Next.js
- TypeScript
- React
- Tailwind CSS
- App Router
- ESLint
- npm

必要であれば、UIアイコン用途としてLucide React程度の軽量ライブラリは利用して構いません。

チャートや日本地図についても、適切なOSSライブラリを利用して構いません。ただし依存関係を必要以上に増やさないでください。

## デザインコンセプト

一般的な行政ダッシュボードにはしないでください。

「Intelligence Console」「Operations Center」「Cyber Intelligence Dashboard」のような雰囲気を目指します。

ただし、ゲーム画面のように派手すぎるものにはしません。

方向性としては、

- ダークモード固定
- 黒〜濃いグレーを基調
- 青、シアン系のアクセント
- 薄いグリッド
- 細い境界線
- 半透明パネル
- 過剰ではないGlow表現
- monospaceフォントを部分的に使用
- 情報密度は高いが整理されている
- PCの横長ディスプレイで映える

というデザインにしてください。

「自治体向け業務システム」ではなく、

REGIONAL INTELLIGENCE SYSTEM

のような印象を目指してください。

## アプリ名

画面上部には、

REGIONAL INTELLIGENCE RADAR

と表示してください。

サブタイトルとして、

Regional Signals / Public Policy / Local Innovation

程度の小さなテキストを表示してください。

## メイン画面

1画面で完結させます。

大きく以下の3領域を配置してください。

### 左側

日本地図を表示してください。

都道府県単位でクリック可能にしてください。

Signalが存在する都道府県には、何らかの視覚的なマーカーを表示してください。

Signal数や重要度によって、マーカーの強弱が多少変わっても構いません。

マーカーには軽いPulseアニメーションを付けても構いませんが、派手すぎないようにしてください。

都道府県をクリックすると、右側のSignal一覧をその都道府県でフィルタリングしてください。

再度解除できるようにしてください。

### 右上

「TODAY'S REGIONAL SIGNALS」

というパネルを表示してください。

直近の自治体・行政・地域創生に関するSignalをカードまたはリスト形式で表示します。

各Signalには以下を表示してください。

- 都道府県
- 自治体名
- タイトル
- カテゴリ
- 重要度
- 日付
- 1〜2行程度の概要

重要度は、

LOW
MEDIUM
HIGH
CRITICAL

程度で表現してください。

ただしCRITICALは災害等の意味ではなく、「地域創生・業務上の注目度が非常に高い」という意味で利用します。

### 右下

Signalをクリックすると詳細を表示してください。

以下を表示します。

SIGNAL

ニュースや施策の概要。

WHY IT MATTERS

なぜ地域創生や自治体業務の観点で重要なのか。

OPPORTUNITY

どのような可能性やビジネス・サービス上のOpportunityが考えられるか。

RELATED TOPICS

関連カテゴリをタグ形式で表示。

SOURCE

元記事URL。

v0.1ではすべてモックデータで構いません。

## Signalカテゴリ

以下を初期カテゴリとして利用してください。

- Regional Mobility
- Digital Currency
- Tourism
- GovTech
- AI
- Disaster Prevention
- Childcare
- Aging Society
- Healthcare
- Smart City
- Local Commerce
- Population Decline

カテゴリ名はUI上では英語でも日本語でも構いません。

統一感を優先してください。

## モックデータ

10〜15件程度作成してください。

現実にありそうな自治体施策として作ってください。

例：

岡山県 ○○市
地域通貨を活用した高齢者向け健康ポイント制度を開始

長野県 ○○市
AIオンデマンド交通の実証実験を開始

福岡県 ○○市
生成AIによる行政問い合わせ対応の実証開始

北海道 ○○町
観光客向けデジタルスタンプラリーを地域事業者と展開

東京都 ○○区
子育て支援手続きのオンライン統合を開始

など。

自治体名は架空でも構いません。

mockSignals.tsなど、後からAPIレスポンスへ容易に置き換えられる構造にしてください。

データモデルは最低限、

id
prefecture
municipality
title
summary
category
importance
publishedAt
whyItMatters
opportunity
relatedTopics
sourceUrl

程度を持たせてください。

## 上部ステータスバー

画面上部に小さなステータス表示も入れてください。

例：

SYSTEM ONLINE

LAST UPDATE 08:30 JST

SIGNALS 14

PREFECTURES 9

など。

これは機能的に重要ではありませんが、Intelligence Console感を出すために使用します。

## インタラクション

以下を実装してください。

- 日本地図から都道府県を選択
- Signal一覧のフィルタリング
- Signal選択
- Signal詳細表示
- カテゴリフィルター
- 選択中フィルターの解除

ページ遷移は不要です。

SPA的な操作感にしてください。

## Responsive

v0.1はPCを最優先してください。

1440px〜1920px程度の横長画面で最も美しく見えるようにしてください。

ただし画面幅が狭くなっても完全に崩壊しない程度のResponsive対応はしてください。

スマートフォン最適化は不要です。

## アニメーション

必要最低限にしてください。

利用してよい例：

- hover transition
- panel fade
- map marker pulse
- selected Signal glow
- 数値表示の軽いtransition

避けるもの：

- 激しいアニメーション
- 過剰なネオン
- 常時動き続ける背景
- 読みづらくなるエフェクト

60fpsを維持できる軽量な実装を優先してください。

## アーキテクチャ

将来的に、

mock data
↓
REST API / BFF
↓
Database
↓
ニュース収集Pipeline
↓
LLM Analysis

へ差し替える予定です。

そのため、UIコンポーネントがモックデータへ直接強く依存しすぎない構造にしてください。

ただしv0.1なので過剰な抽象化やClean Architectureは不要です。

適度に、

components
types
data

程度へ整理してください。

## 今回やらないこと

以下は実装しないでください。

- ログイン
- Firebase
- Supabase
- DB
- サーバーAPI
- LLM API
- ニュースAPI
- RSS取得
- Webスクレイピング
- Google Maps
- ユーザー管理
- 管理画面
- Push通知
- 本番デプロイ設定

これらは後続フェーズで実装します。

## 実装時の判断

不明点があった場合、細かく質問せず、プロトタイプとして最も自然だと思う方法で実装してください。

UIについても、この仕様を機械的に並べるのではなく、「毎朝開きたくなるIntelligence Console」という目的を優先してデザインしてください。

まずアプリ全体を完成させ、その後必要に応じてUIを改善してください。

## 完了条件

ローカルで、

npm install
npm run dev

を実行すると起動できること。

初期画面を開いた時点で、

- 日本地図
- Today's Regional Signals
- Signal詳細
- ステータス情報

が1画面に表示されること。

地図・Signal・フィルターを操作できること。

そして何より、

「自治体・地域創生の情報を探索するための専用Intelligence Console」

に見えること。

機能数よりも、最初の完成度と体験を優先してください。