# 2026-06-08 Node 22 Alignment

## Plan

- [x] Node バージョン指定箇所を洗い出す
- [x] `package.json` とローカル用バージョンファイルを更新する
- [x] README を Node 22 前提にそろえる
- [x] 変更を検証する

## Review

- `package.json` に `engines.node: 22.x` と `packageManager` を追加した
- `.nvmrc` と `.node-version` を追加した
- README と README-vi に Node 22 前提を追記した
- Node 22 で `astro build` が成功することを確認した
