# wp-vite-starter

WordPress テーマ開発用スターターキットです。  
**Vite + wp-env（Docker）+ FLOCSS / PC ファースト SCSS** 構成で、ローカル環境の構築からビルドまで一貫して管理できます。

---

## 技術スタック

| 役割 | ツール |
|---|---|
| ローカル WordPress | wp-env（Docker） |
| ビルドツール | Vite |
| CSS | SCSS（FLOCSS） |
| JS | jQuery 4 / Swiper 12（ESM） |
| 画像 | WebP 自動変換 |

---

## 必要な環境

- Node.js（LTS 推奨）
- Docker Desktop（無料プランで可）

---

## 新規プロジェクトの始め方

### 1. テンプレートをコピー

```bash
npx degit zekkcy/wp-vite-starter プロジェクト名
cd プロジェクト名
```

### 2. パッケージをインストール

```bash
npm install
```

### 3. テーマ名を変更

`WordPressTheme` フォルダを任意のテーマ名に変更します。  
`package.json` の `vite:dev` / `vite:build` スクリプト内の `THEME=WordPressTheme` も合わせて変更してください。

### 4. style.css を編集

`（テーマフォルダ）/style.css` のテーマ情報を書き換えます（WordPress がテーマとして認識するために必要）。

### 5. WordPress を起動

```bash
npm run wp:start
```

起動後、`http://localhost:8080` でアクセスできます。

- 管理画面：`http://localhost:8080/wp-admin`
- ユーザー名：`admin`
- パスワード：`password`

管理画面から 外観 → テーマ でテーマを有効化してください。

### 6. Vite を起動（別ターミナル）

```bash
npm run vite:dev
```

---

## 毎回の開発フロー

```bash
# 開発開始
npm run wp:start   # WordPress（Docker）起動
npm run vite:dev   # Vite 起動（別タブ）

# 終了
npm run wp:stop
```

---

## ビルド（本番用）

```bash
npm run vite:build
```

`WordPressTheme/assets/` に CSS・JS が出力されます。

---

## スクリプト一覧

| コマンド | 内容 |
|---|---|
| `npm run wp:start` | WordPress 起動 |
| `npm run wp:stop` | WordPress 停止 |
| `npm run wp:clean` | DB をリセット |
| `npm run vite:dev` | 開発サーバー起動（HMR） |
| `npm run vite:build` | 本番ビルド |

---

## ディレクトリ構成

```
themes/
├── WordPressTheme/       # テーマ本体（PHP）
│   ├── assets/           # ビルド出力先（git 管理外）
│   └── style.css         # テーマ情報
├── src/
│   ├── sass/             # SCSS（FLOCSS構成）
│   ├── js/               # JS
│   └── main.js           # エントリーポイント
├── plugins/              # Vite カスタムプラグイン
├── .wp-env.json          # wp-env 設定
├── vite.config.js        # Vite 設定
└── package.json
```
