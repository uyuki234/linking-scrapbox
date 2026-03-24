#!/bin/bash
# linking-scrapbox デモスクリプト（APIを使わずに動作をシミュレート）

sleep 0.5

echo "$ npm start -- --input data/export.json --output data/output.json"
sleep 1

echo ""
echo "=== 分野ツリー提案 ==="
sleep 0.8
cat << 'EOF'
技術
├── プログラミング
│   ├── WSL
│   ├── Dockerの使い方
│   └── Homebrewセットアップ
└── 開発環境
    ├── Macでgccをインストール
    └── VSCodeの設定

日常
└── 食事
    └── 夕飯リスト
EOF

sleep 0.5
echo ""
printf "[y]承認  [e]編集  [r]再提案 > "
sleep 1
echo "y"
sleep 0.5

echo ""
echo "ページ紐づけをAIが一括分析中..."
sleep 1.5

echo ""
echo "=== ページ紐づけ (1/6): プログラミング ==="
echo "紐づけ候補: [WSL] [Dockerの使い方] [Homebrewセットアップ] [Macでgccをインストール]"
echo ""
printf "[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 > "
sleep 1
echo "y"
sleep 0.3

echo ""
echo "=== ページ紐づけ (2/6): 開発環境 ==="
echo "紐づけ候補: [WSL] [Macでgccをインストール] [VSCodeの設定]"
echo ""
printf "[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 > "
sleep 1
echo "y"
sleep 0.3

echo ""
echo "=== ページ紐づけ (3/6): 食事 ==="
echo "紐づけ候補: [夕飯リスト]"
echo ""
printf "[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 > "
sleep 1
echo "y"
sleep 0.3

echo ""
echo "=== ページ紐づけ (4/6): WSL ==="
echo "紐づけ候補: "
echo ""
printf "[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 > "
sleep 0.8
echo "s"
sleep 0.3

echo ""
echo "=== ページ紐づけ (5/6): 夕飯リスト ==="
echo "紐づけ候補: "
echo ""
printf "[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 > "
sleep 0.8
echo "s"
sleep 0.3

echo ""
echo "=== ページ紐づけ (6/6): VSCodeの設定 ==="
echo "紐づけ候補: "
echo ""
printf "[y]全採用  [e]編集  [s]スキップ  [q]終了・保存 > "
sleep 0.8
echo "s"
sleep 0.3

echo ""
echo "[プログラミング] [開発環境] → [技術]"
echo ""
printf "[y]作成  [n]スキップ  [e]名前変更 > "
sleep 1
echo "y"
sleep 0.3

echo ""
echo "出力完了: data/output.json"
sleep 1
