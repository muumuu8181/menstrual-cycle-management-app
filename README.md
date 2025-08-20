# FemCare Pro - 女性生理管理アプリ

![FemCare Pro](https://img.shields.io/badge/FemCare%20Pro-v1.0.0-pink)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

女性の健康を総合サポートする生理管理Progressive Web Appです。

## ✨ 主な機能

### 📱 核心機能
- **生理記録・管理**: 詳細な経血量・症状・痛みレベルの記録
- **カレンダー表示**: 直感的なビジュアルでの周期確認
- **AI予測**: 機械学習による高精度な生理・排卵日予測
- **症状追跡**: 気分・エネルギー・身体症状の包括的記録

### 📊 分析・インサイト
- **周期分析**: 平均周期・安定性・傾向の可視化
- **健康スコア**: 個人の健康状態の総合評価
- **データ可視化**: グラフ・チャートでの分析結果表示

### 🔒 プライバシー・セキュリティ
- **ローカルストレージ**: すべてのデータは端末内に安全保存
- **AES-256暗号化**: 機密データの強固な暗号化保護
- **オフライン対応**: インターネット接続不要で利用可能

### 📲 PWA機能
- **ネイティブアプリ体験**: ホーム画面からのアクセス
- **オフライン動作**: ネットワークなしでも完全機能
- **プッシュ通知**: リマインダー・アラート機能

## 🚀 技術スタック

### フロントエンド
- **React 18+**: 最新のReact機能を活用
- **TypeScript**: 型安全な開発環境
- **Material-UI v5**: Google Material Designベースの美しいUI
- **Redux Toolkit**: 効率的な状態管理
- **Framer Motion**: 滑らかなアニメーション

### データ管理
- **IndexedDB**: ブラウザ内データベース（Dexie使用）
- **Redux Persist**: 永続的な状態管理
- **Crypto-JS**: クライアントサイド暗号化

### 開発・品質
- **Vite**: 高速ビルドツール
- **Vitest**: 現代的テストフレームワーク
- **ESLint + Prettier**: コード品質管理
- **TypeScript**: 静的型チェック

### PWA・デプロイ
- **Vite PWA Plugin**: Progressive Web App機能
- **Workbox**: Service Worker最適化
- **Chart.js/Recharts**: データ可視化

## 📋 システム要件

### ブラウザ対応
- Safari 14+ (iOS 14+)
- Chrome 90+
- Firefox 88+
- Edge 90+

### デバイス対応
- iPhone (iOS 14+)
- iPad (iPadOS 14+)
- Android (Chrome browser)

## 🛠️ 開発環境のセットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 開発サーバーの起動
```bash
npm run dev
```

### 3. ブラウザでアクセス
`http://localhost:5173` でアプリケーションが起動します。

## 📦 ビルド・デプロイ

### 開発ビルド
```bash
npm run build
```

### プレビュー
```bash
npm run preview
```

### テスト実行
```bash
npm run test
```

### コード品質チェック
```bash
npm run lint
```

## 🏗️ プロジェクト構造

```
src/
├── components/          # 再利用可能なUIコンポーネント
│   ├── common/         # 汎用コンポーネント
│   ├── forms/          # フォーム関連
│   ├── charts/         # グラフ・可視化
│   └── calendar/       # カレンダー関連
├── pages/              # ページコンポーネント
│   ├── Home/
│   ├── Calendar/
│   ├── Records/
│   ├── Analytics/
│   └── Settings/
├── hooks/              # カスタムフック
├── services/           # ビジネスロジック
│   ├── database/       # データベース操作
│   ├── predictions/    # 予測アルゴリズム
│   ├── analytics/      # 分析処理
│   └── encryption/     # 暗号化処理
├── store/              # Redux設定
│   └── slices/         # Redux Toolkit slices
├── types/              # TypeScript型定義
├── constants/          # 定数・設定
└── utils/              # ユーティリティ関数
```

## 📱 PWA機能

### インストール
- ホーム画面への追加
- アプリライクな起動
- スプラッシュ画面

### オフライン機能
- 完全オフライン動作
- データ同期
- バックグラウンド更新

### 通知
- 生理予定通知
- 記録リマインダー
- 健康アラート

## 🎨 UI/UXデザイン

### デザイン原則
- **女性中心**: 女性が使いやすく親しみやすいデザイン
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **直感性**: 学習不要な直感的インターフェース
- **美しさ**: 洗練された美しいビジュアルデザイン

### カラーパレット
- **プライマリ**: ソフトピンク系 (#ec4899)
- **セカンダリ**: ラベンダー系 (#8b5cf6)
- **機能色**: 周期・症状に応じた意味のある色分け

## 📞 サポート

### 緊急時
重要な健康問題については、必ず医療機関にご相談ください。
このアプリは医療機器ではなく、診断・治療を目的としていません。

---

**FemCare Pro** - 女性の健康を技術で支える 💖
