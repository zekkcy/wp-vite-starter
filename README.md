# vite-dev_WordPress_flocss_PCtoSP

WordPressテーマ開発用の **Vite環境（FLOCSS / PCファースト）** です。  
SCSS・JS・画像（WebP）を `src/` で管理し、テーマ配下の `assets/` に出力します。

---

## 動作が確認できている環境

- Node（推奨：LTS）
- Vite

---

## 使い方

### 1. フォルダを開く

- ダウンロードしたフォルダを VSCode で開く

### 2. テーマ名（フォルダ名）を任意に変更

- `WordPressTheme` フォルダを任意のテーマ名に変更する  
  例：`my-theme`

> ※ 多くの場合、テーマ名は自動検出されます。  
> 手動指定したい場合は `THEME=テーマ名` を使います。

### 3. Local（ローカルURL）を用意

- Local などで WordPress を起動する
- 開発用ドメイン例：`http://xxxxx.local`

> 開発時は Vite を `http://vite.local:5173` で起動する想定です。

### 4. style.css を編集

- `（テーマフォルダ）/style.css` を任意の内容に変更する  
  （WordPressのテーマとして認識されるために必要です）

### 5. パッケージをインストール

ターミナルでプロジェクト直下（`themes` フォルダ）へ移動して実行：

```bash
npm i
```
