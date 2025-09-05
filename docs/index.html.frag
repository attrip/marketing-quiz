<!-- App content (copied from src/app/index.html) -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>マーケ戦略ケーススタディ・プロンプトエディター</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="wrap">
    <h1>マーケ戦略ケーススタディ・プロンプトエディター <span class="pill">採点モード搭載</span></h1>
    <form id="editor" class="grid" aria-label="プロンプトエディター">
      <!-- Toolbar -->
      <div class="card row" style="justify-content:space-between;align-items:center">
        <div class="row">
          <label for="preset">プリセット</label>
          <select id="preset" name="preset">
            <option value="">選択なし</option>
            <option value="retail">小売</option>
            <option value="hospitality">宿泊</option>
            <option value="subscription">サブスク</option>
            <option value="food">飲食</option>
          </select>
          <button type="button" class="btn sec" id="apply-preset">適用</button>
        </div>
        <div class="row">
          <div class="seg" role="group" aria-label="ビュー切替">
            <button type="button" id="toggle-redline" aria-pressed="false">赤入れ</button>
            <button type="button" id="replace-jargon">置換</button>
            <button type="button" id="toggle-dark" aria-pressed="false">ダーク</button>
          </div>
        </div>
      </div>
      <!-- Main form fields (snipped for brevity in frag) -->
    </form>
  </div>
  <script src="main.js"></script>
  <noscript>JavaScriptを有効にしてください。</noscript>
</body>
</html>

