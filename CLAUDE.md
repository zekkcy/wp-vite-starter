# Coding Rules

## HTML

- semantic HTML優先
- 見出し階層を守る
- 不要なwrapper禁止
- sectionごとに構築
- aria属性を意識
- buttonよりa優先（リンク用途）
- 画像パスは `/images/` ルート基準（`dist/` が配信ルートのため）

## CSS / SCSS

- FLOCSS命名
- PC first
- rem使用
- SCSSの入れ子禁止。`&__element` は使わず、`.block__element {}` のフルクラス名でフラットに記述する
- gap優先
- utility class乱立禁止
- animationはtransform/opacity優先
- CLSを避ける
- img width/height指定
- imgにはクラス不要、スタイルは親要素の子孫セレクタ（`.block__image img {}`）で当てる

## JavaScript

- GSAP使用可
- 軽量実装優先
- イベントは適切に解除

## WordPress

- ACF前提
- WordPress関数はesc必須
- get_template_part優先
- 投稿取得はWP_Query優先

## Performance

- Lighthouse意識
- 不要CSS削除
- 過剰なanimation禁止
- lazyloadを意識

## Workflow

- まず修正方針を提案
- 一気に大規模変更しない
- 編集前に確認を入れる
