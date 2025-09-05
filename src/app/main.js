(function(){
  const $ = (id) => document.getElementById(id);
  const out = $("output");
  const checks = $("checks");
  const scoreBox = $("score");
  const outRed = $("output_redline");

  // Configuration
  const CFG = Object.freeze({
    TODO_MIN: 20,
    TODO_MAX: 40,
    EASE_MIN_PLACES: 3,
    EASE_MAX_STOCKOUT: 10,
    SCORE_TARGET: 8,
    STORAGE_VERSION: 2
  });

  const defaultBan = [
    "ペネトレーション","アベイラビリティ","UGC","プレファレンス","CEP",
    "リテンション","ファネル","アトリビューション","LTV","CPA","CPC",
    "エンゲージメント","インフルエンサー","バイラル","バズ","ROI","ROAS","CRM"
  ];

  const altDict = {
    "アベイラビリティ":"買える場所の多さ",
    "UGC":"お客さんの写真や声",
    "プレファレンス":"好きになってもらう気持ち",
    "リテンション":"また買ってもらうこと",
    "ファネル":"お客さんの流れ",
    "LTV":"ひとりのお客さんからの合計の売上",
    "CPA":"1人に買ってもらうまでの費用",
    "CPC":"1回のクリックにかかる費用",
    "エンゲージメント":"反応の強さ",
    "インフルエンサー":"有名人・発信力のある人",
    "バイラル":"口コミで広がること",
    "ROI":"投じたお金に対する戻り",
    "ROAS":"広告に使ったお金の戻り"
  };

  const presets = {
    retail: {
      theme: "地域密着の小型スーパー",
      situation: "競合の大型店が近くにあり、平日昼の来店が弱い。近隣に高齢世帯と子育て世帯が混在。",
      problem: "初めての人に店を思い出してもらう場面が少ない／惣菜の買いやすさが足りない",
      profit_months: 6,
      payback_months: 18,
      distinct: "深い緑、買い忘れゼロの看板、合言葉『毎日ちょうど良い』",
      core: "夕方に家族の食卓を支える30〜40代の親層",
      broad: "徒歩圏の住民全般と昼の高齢層",
      todo: "夕方の初来店を増やす導線に集中",
      dont: "大規模改装／高額広告／複雑な新商品",
      p_product: "定番惣菜を固定化し、取りやすい配置にする",
      p_price: "惣菜は手頃、まとめ買いで小さな割引",
      p_place: "入口すぐ惣菜コーナー／棚の見やすさ改善",
      p_promo: "夕方の看板と色を統一し、同じ言葉を反復"
    },
    hospitality: {
      theme: "週末eスポーツ合宿向けの小規模ホテル",
      situation: "駅から徒歩10分。平日は稼働が低いが週末は混む。",
      problem: "初めての団体に思い出されない／予約の手間が多い",
      profit_months: 9,
      payback_months: 24,
      distinct: "紺色、斜線ロゴ、合言葉『勝ちに寄り添う宿』",
      core: "高校〜大学のゲームチーム代表者",
      broad: "競技系チーム全般・コーチ・引率",
      todo: "週末団体の初回予約を最短化に集中",
      dont: "高級改装／広報イベント乱発／平日プラン乱造",
      p_product: "練習室24h・回線保証・機材レンタルを固定",
      p_price: "団体一括料金＋平日割",
      p_place: "予約フォームは3クリック以内、電話も可",
      p_promo: "代表者に届く導線で同じ色と合言葉を反復"
    },
    subscription: {
      theme: "月イチ花の定期便",
      situation: "SNSで単発購入は好調。定期の継続が課題。",
      problem: "思い出す場面が少ない／受け取りが面倒",
      profit_months: 8,
      payback_months: 20,
      distinct: "薄い紫、丸いロゴ、合言葉『暮らしに一輪』",
      core: "インテリア好きの20〜30代女性",
      broad: "季節の飾りを楽しむ世帯全般",
      todo: "初回の体験と継続の手間減に集中",
      dont: "過剰な限定箱／高額コラボ／複雑な選択肢",
      p_product: "花の長持ち案内と水替え目安を同梱",
      p_price: "送料無料込みのわかりやすい価格",
      p_place: "ポスト投函・受け取り日時の事前選択",
      p_promo: "同じ色と一言をメール・箱・紙面に反復"
    },
    food: {
      theme: "アレルギー対応の高級ジェラート専門店",
      situation: "観光客と地元客が混在。冷凍配送が一般化。",
      problem: "初めての人に思い出してもらうきっかけが弱い",
      profit_months: 6,
      payback_months: 18,
      distinct: "深いボルドー、手書き風、合言葉『やさしい贅沢』",
      core: "子どもに安心な素材を選びたい30代親層",
      broad: "ご褒美スイーツを探す甘党全般",
      todo: "週末の初来店を増やす導線に集中",
      dont: "大型タイアップ／高額な設備拡張／複雑な限定メニュー",
      p_product: "通年の定番を固定し、表示を大きく",
      p_price: "店内は中価格、贈答は箱代込み",
      p_place: "駅近ポップアップとEC定番セット",
      p_promo: "週末朝の試食と看板・色の統一"
    }
  };

  function sanitize(s){
    return (s||"").toString().trim();
  }

  function splitList(s){
    return sanitize(s).split(/[／/、,\n]/).map(x=>x.trim()).filter(Boolean);
  }

  function findDictionaryBans(text, banned){
    const hits = [];
    banned.forEach(w=>{ if(w && text.includes(w)) hits.push(w); });
    return Array.from(new Set(hits));
  }
  function findSuspiciousAsciiKata(text){
    const asciiHits = (text.match(/[A-Za-z]{4,}/g)||[]).filter((v,i,a)=>a.indexOf(v)===i);
    const kataHits = (text.match(/[ァ-ヴー]{8,}/g)||[]).filter((v,i,a)=>a.indexOf(v)===i);
    return {ascii: asciiHits, kata: kataHits};
  }

  function oneSentence(s){
    const t = sanitize(s);
    // Count Japanese/period punctuation
    const dots = (t.match(/[。\.]/g)||[]).length;
    return dots <= 1;
  }

  function inLength20to40(s){
    const len = sanitize(s).length;
    return len>=CFG.TODO_MIN && len<=CFG.TODO_MAX;
  }

  function hasProfitObjective(text){
    // Require either 黒字 or 回収 present in Objective block
    return /黒字/.test(text) || /回収/.test(text);
  }

  function buildProblem(theme,situation,challenge,profitMonths,paybackMonths){
    const t = sanitize(theme)||"（ここにテーマを入力）";
    const s = sanitize(situation);
    const c = sanitize(challenge);
    const pm = profitMonths? `${profitMonths}か月` : "（未設定）";
    const pb = paybackMonths? `${paybackMonths}か月` : "（未設定）";
    return [
      "### 【問題】\n",
      `あなたは「${t}」を立ち上げる責任者です。`,
      s ? `現状は次のとおりです。${s}` : "",
      c ? `いまの課題は、${c}ことです。` : "",
      `また、月次黒字まで${pm}、投資回収まで${pb}という条件があります。`,
      "限られた資源をどう配分し、まず誰に選んでもらい、どう広げるかを考えてください。どんな戦略を取るべきか答えてください。\n"
    ].filter(Boolean).join("\n\n");
  }

  function buildAnswer(obj){
    const dontArr = splitList(obj.dont).slice(0,3);
    const donts = dontArr.map(x=>`- ${x}`).join("\n");
    const placeMetrics = [];
    if(obj.placeCount!=="" && obj.placeCount!=null) placeMetrics.push(`買える場所数: ${obj.placeCount}`);
    if(obj.stockout!=="" && obj.stockout!=null) placeMetrics.push(`在庫切れ率(想定): ${obj.stockout}%`);
    if(obj.firstpath) placeMetrics.push("初回導線: あり");
    return [
      "### 【解答例】\n",
      "#### Objective（目的）",
      sanitize(obj.objective||"（黒字化／回収の目標を明記）"),
      "\n#### 対象 (Who)",
      "* **コアターゲット（マーケティング資産を集中させるターゲット）:**",
      sanitize(obj.core),
      "* **戦略ターゲット（買いうる人すべて）:**",
      sanitize(obj.broad),
      "\n#### 戦略 (What・リソース配分の選択)",
      "* **やること:**",
      sanitize(obj.todo),
      "* **やらないこと（リソースを割かないこと）:**",
      donts || "- （なし）",
      "\n#### How（戦術）",
      "* **Product (製品/サービス):**",
      sanitize(obj.product),
      "* **Price (価格):**",
      sanitize(obj.price),
      "* **Place (売り場所/買いやすさ):**",
      [sanitize(obj.place), placeMetrics.length? `（指標）${placeMetrics.join(' ／ ')}` : ""].filter(Boolean).join("\n"),
      "* **Promotion (宣伝/販促):**",
      sanitize(obj.promo)
    ].join("\n");
  }

  function buildMetaPrompt(opts){
    const {
      askTheme, theme, situation, challenge,
      profitMonths, paybackMonths, banned
    } = opts;

    const banLine = banned.join('、 ');
    const themeLine = askTheme
      ? "最初に、ユーザーに『考えたいビジネスのテーマ』を1行で質問し、回答を使って作成してください。"
      : `テーマは次のとおりです: 「${sanitize(theme)||'（テーマ未設定）'}」`;

    const hints = [];
    if(sanitize(situation)) hints.push(`状況ヒント: ${sanitize(situation)}`);
    if(sanitize(challenge)) hints.push(`課題ヒント: ${sanitize(challenge)}`);
    if(Number.isFinite(profitMonths)) hints.push(`月次黒字までの目安: ${profitMonths}か月`);
    if(Number.isFinite(paybackMonths)) hints.push(`投資回収までの目安: ${paybackMonths}か月`);
    const hintBlock = hints.length ? `前提メモ:\n- ${hints.join('\n- ')}` : '';

    return [
`あなたは、マーケティング戦略の思考トレーニングを支援するアシスタントです。以下の条件とフレームワークに厳密に従って、マーケティング思考を養うためのケーススタディ（問題と解答のセット）を1つ作成してください。`,
themeLine,
hintBlock,
"",
"絶対に守るべき条件:",
"1) 平易な言葉だけを使い、専門用語は一切使わない。",
`   禁止例: ${banLine} など（出力に含めない。含みそうな場合は日常語に言い換える）。`,
"2) 思考プロセスには、次のエッセンスを反映する（理論名や専門用語は書かない）。",
"   - 一部の熱心な人よりも、新しいお客さんを増やし続けることを重視する。",
"   - 機能の差よりも、ふとした時に思い出してもらえることを重視する。",
"   - 欲しい時にすぐ買えるようにしておくことを重視する。",
"   - 色や言葉など見た目の一貫性を保つ。",
"3) 事業としての現実性を保ち、黒字化や投資回収を必ず目的に含める。",
"",
"アウトプットの形式（この通りに出力する）:",
"### 【問題】",
"（状況設定・課題・条件を自然なストーリーで）",
"",
"### 【解答例】",
"",
"#### Objective（目的）",
"（黒字化、回収、成長の最終ゴールを短く）",
"",
"#### 対象 (Who)",
"* **コアターゲット（マーケティング資産を集中させるターゲット）:**",
"（まず攻める層を具体的に）",
"* **戦略ターゲット（買いうる人すべて）:**",
"（最終的に広げる広い層）",
"",
"#### 戦略 (What・リソース配分の選択)",
"* **やること:**",
"（1文・短く）",
"* **やらないこと（リソースを割かないこと）:**",
"- （最大3項目）",
"",
"#### How（戦術）",
"* **Product (製品/サービス):**",
"* **Price (価格):**",
"* **Place (売り場所/買いやすさ):**",
"* **Promotion (宣伝/販促):**",
"",
"注意: 出力には専門用語を含めないこと。数字の目安（黒字・回収の月数など）がある場合は自然に織り込むこと。"
    ].filter(Boolean).join('\n');
  }

  function generate(){
    const theme = $("theme").value;
    const situation = $("situation").value;
    const challenge = $("problem").value;
    const profitMonths = parseInt($("profit_months").value || "");
    const paybackMonths = parseInt($("payback_months").value || "");
    const distinct = $("distinct").value;
    const core = $("core").value;
    const broad = $("broad").value;
    const todo = $("todo").value;
    const dont = $("dont").value;
    const product = $("p_product").value + (distinct?`\n（らしさ）${distinct}`:"");
    const price = $("p_price").value;
    const place = $("p_place").value;
    const placeCount = $("p_place_count").value;
    const stockout = $("p_stockout").value;
    const firstpath = $("p_firstpath").checked;
    const promo = $("p_promo").value + (distinct?`\n（見た目を揃える）${distinct}`:"");
    const extraBan = splitList($("extra_ban").value);
    const banned = [...new Set(defaultBan.concat(extraBan))];

    const problemText = buildProblem(theme, situation, challenge, profitMonths, paybackMonths);

    const answerText = buildAnswer({
      objective: `（目標）月次黒字を${isFinite(profitMonths)?profitMonths+"か月":'（未設定）'}以内、投資回収を${isFinite(paybackMonths)?paybackMonths+"か月":'（未設定）'}で達成` ,
      core, broad, todo, dont,
      product, price, place, promo,
      placeCount, stockout, firstpath
    });

    const full = [problemText, "", answerText, ""].join("\n");
    const meta = buildMetaPrompt({
      askTheme: $("ask_theme").checked,
      theme, situation, challenge,
      profitMonths, paybackMonths, banned
    });

    // checks
    const dictBans = findDictionaryBans(full, banned);
    const susp = findSuspiciousAsciiKata(full);
    const okSentence = oneSentence(todo);
    const okLen = inLength20to40(todo);
    const okDontCount = splitList(dont).length <= 3;
    const okProfitNumbers = Number.isFinite(profitMonths) && Number.isFinite(paybackMonths);
    const okProfit = hasProfitObjective(answerText) && okProfitNumbers;

    const msgs = [];
    if(dictBans.length){
      const hints = dictBans.map(w=> altDict[w]? `${w}→${altDict[w]}`: w);
      msgs.push(`専門用語/横文字の疑い: ${hints.join('、')}`);
    }
    const soft = [];
    if(susp.ascii.length) soft.push(`英単語っぽい: ${susp.ascii.slice(0,5).join('、')}${susp.ascii.length>5?'…':''}`);
    if(susp.kata.length) soft.push(`カタカナ長語: ${susp.kata.slice(0,5).join('、')}${susp.kata.length>5?'…':''}`);
    if(soft.length) msgs.push(`参考: ${soft.join(' ／ ')}`);
    if(!okSentence) msgs.push("『やること』は句点を1つまでにしてください");
    if(!okLen) msgs.push(`『やること』は${CFG.TODO_MIN}〜${CFG.TODO_MAX}文字で短く`);
    if(!okDontCount) msgs.push("『やらないこと』は最大3つ（スラッシュ区切り）");
    if(!okProfitNumbers) msgs.push("黒字と回収の月数を入力してください");
    if(!okProfit) msgs.push("Objectiveに黒字または回収の表現を含めてください");
    const holes = requiredHoles({theme, core, broad, todo, product, price, place, promo, profitMonths, paybackMonths});
    highlightHoles(holes);
    const holeMsg = holes.length? `穴: ${holes.join('、')}` : "";
    const hardErrors = (!!dictBans.length) || !okSentence || !okLen || !okDontCount || !okProfitNumbers || !okProfit;
    const statusCls = hardErrors ? 'status-err' : (msgs.length||holes.length ? 'status-warn' : 'status-ok');
    checks.classList.remove('status-err','status-warn','status-ok');
    checks.classList.add(statusCls);
    checks.textContent = msgs.length || holes.length ? `${hardErrors?'⛔':''}チェック: ${[...msgs, holeMsg].filter(Boolean).join(' ／ ')}` : "✅ チェックOK";

    out.textContent = full;
    $("meta_prompt").textContent = meta;
    // redline view
    renderRedline(full, banned);
    // scoring
    renderScore({distinct, promo, place, placeCount, stockout, firstpath, core, broad, todo, profitMonths, paybackMonths});

    // disable copy when invalid
    const disabled = hardErrors;
    $("copy-md").disabled = disabled;
    $("copy-txt").disabled = disabled;
    $("download-md").disabled = disabled;
    $("download-txt").disabled = disabled;

    // Mark invalid fields and focus the first error
    markValidity({
      todo: okSentence && okLen,
      dont: okDontCount,
      profit_months: Number.isFinite(profitMonths),
      payback_months: Number.isFinite(paybackMonths)
    });
    if(hardErrors){
      focusFirstError(dictBans, {
        todo: okSentence && okLen,
        dont: okDontCount,
        profit_months: Number.isFinite(profitMonths),
        payback_months: Number.isFinite(paybackMonths)
      }, holes);
    }

    return {problemText, full, meta};
  }

  function markValidity(flags){
    Object.keys(flags).forEach(id=>{
      const el = $(id); if(!el) return;
      el.setAttribute('aria-invalid', flags[id] ? 'false' : 'true');
    });
  }
  function focusFirstError(dictBans, flags, holes){
    const order = ['todo','dont','profit_months','payback_months'];
    for(const id of order){ if(flags[id]===false){ const el=$(id); if(el){ el.focus(); return; } } }
    if(holes && holes.length){
      const map = {'テーマ':'theme','黒字までの月数':'profit_months','回収までの月数':'payback_months','コア':'core','広い対象':'broad','やること':'todo','Product':'p_product','Price':'p_price','Place':'p_place','Promotion':'p_promo'};
      const id = map[holes[0]]; const el=$(id); if(el){ el.focus(); return; }
    }
    if(dictBans && dictBans.length){ const el=$("p_promo"); if(el) el.focus(); }
  }

  // scoring (0-2 each): recall, ease, consistency, spread, profit
  function renderScore(ctx){
    const scores = { recall:0, ease:0, consistency:0, spread:0, profit:0 };
    // recall (思い出されやすさ): distinct present + promo mentions repetition/看板/色
    const hasDistinct = sanitize(ctx.distinct).length>=4;
    const promo = sanitize(ctx.promo||"");
    const recallHints = /(看板|色|同じ見た目|合言葉|毎週|反復|目立つ|統一)/.test(promo);
    scores.recall = (hasDistinct?1:0) + (recallHints?1:0);
    // ease (買いやすさ): placeCount >=3, stockout <=10, firstpath
    const pc = parseInt(ctx.placeCount||"0");
    const so = parseInt(ctx.stockout||"100");
    const fp = !!ctx.firstpath;
    let ease=0; if(pc>=CFG.EASE_MIN_PLACES) ease++; if(so<=CFG.EASE_MAX_STOCKOUT) ease++; if(fp) ease=Math.min(2, ease+1); scores.ease = Math.min(2,ease);
    // consistency (ブランドの一貫性): distinct referenced in product/promo/place
    const d = sanitize(ctx.distinct);
    const consistencyRefs = [sanitize(ctx.place), sanitize(ctx.promo)].filter(t=>d && t.includes(d.split(/[、,\s]/)[0]||""));
    scores.consistency = Math.min(2, (hasDistinct?1:0) + (consistencyRefs.length?1:0));
    // spread (広がり方): core and broad filled, todo mentions 初めて or 新規 or 週末 など拡張性
    const hasCore = sanitize(ctx.core).length>0;
    const hasBroad = sanitize(ctx.broad).length>0;
    const spreadHint = /(初めて|新規|週末|体験|お試し|紹介)/.test(sanitize(ctx.todo));
    scores.spread = Math.min(2, (hasCore&&hasBroad?1:0) + (spreadHint?1:0));
    // profit (黒字筋): both numbers present and moderate
    const pmOk = Number.isFinite(ctx.profitMonths);
    const pbOk = Number.isFinite(ctx.paybackMonths);
    const reasonable = (pmOk && ctx.profitMonths<=12) || (pbOk && ctx.paybackMonths<=24);
    scores.profit = Math.min(2, (pmOk&&pbOk?1:0) + (reasonable?1:0));

    const total = scores.recall + scores.ease + scores.consistency + scores.spread + scores.profit;
    const radar = `採点: 思=${scores.recall}/2 買=${scores.ease}/2 一=${scores.consistency}/2 広=${scores.spread}/2 黒=${scores.profit}/2 → 合計 ${total}/10`;
    const advice = adviceLine(scores);
    const badge = badgeFor(scores);
    scoreBox.textContent = `${radar}\n称号: ${badge} ／ 弱点: ${advice}`;
    if(total>=CFG.SCORE_TARGET){ confettiBurst(); }
    // render drill after scoring
    renderDrill(scores, ctx);
  }

  // return scores + total without side effects
  function computeScores(ctx){
    const scores = { recall:0, ease:0, consistency:0, spread:0, profit:0 };
    const hasDistinct = sanitize(ctx.distinct).length>=4;
    const promo = sanitize(ctx.promo||"");
    const recallHints = /(看板|色|同じ見た目|合言葉|毎週|反復|目立つ|統一)/.test(promo);
    scores.recall = (hasDistinct?1:0) + (recallHints?1:0);
    const pc = parseInt(ctx.placeCount||"0");
    const so = parseInt(ctx.stockout||"100");
    const fp = !!ctx.firstpath;
    let ease=0; if(pc>=CFG.EASE_MIN_PLACES) ease++; if(so<=CFG.EASE_MAX_STOCKOUT) ease++; if(fp) ease=Math.min(2, ease+1); scores.ease = Math.min(2,ease);
    const d = sanitize(ctx.distinct);
    const consistencyRefs = [sanitize(ctx.place), sanitize(ctx.promo)].filter(t=>d && t.includes(d.split(/[、,\s]/)[0]||""));
    scores.consistency = Math.min(2, (hasDistinct?1:0) + (consistencyRefs.length?1:0));
    const hasCore = sanitize(ctx.core).length>0;
    const hasBroad = sanitize(ctx.broad).length>0;
    const spreadHint = /(初めて|新規|週末|体験|お試し|紹介)/.test(sanitize(ctx.todo));
    scores.spread = Math.min(2, (hasCore&&hasBroad?1:0) + (spreadHint?1:0));
    const pmOk = Number.isFinite(ctx.profitMonths);
    const pbOk = Number.isFinite(ctx.paybackMonths);
    const reasonable = (pmOk && ctx.profitMonths<=12) || (pbOk && ctx.paybackMonths<=24);
    scores.profit = Math.min(2, (pmOk&&pbOk?1:0) + (reasonable?1:0));
    const total = scores.recall + scores.ease + scores.consistency + scores.spread + scores.profit;
    return {scores, total};
  }

  function getCtx(){
    const distinct = $("distinct").value;
    const promo = $("p_promo").value + (distinct?`\n（見た目を揃える）${distinct}`:"");
    return {
      distinct,
      promo,
      place: $("p_place").value,
      placeCount: $("p_place_count").value,
      stockout: $("p_stockout").value,
      firstpath: $("p_firstpath").checked,
      core: $("core").value,
      broad: $("broad").value,
      todo: $("todo").value,
      profitMonths: parseInt($("profit_months").value || ""),
      paybackMonths: parseInt($("payback_months").value || "")
    };
  }

  function autoImproveOnce(log){
    let changed = false;
    const ctx = getCtx();
    const {scores, total} = computeScores(ctx);
    // 1) fix NG words
    const found = isPlainJapanese([ctx.place, ctx.promo, ctx.todo, ctx.core, ctx.broad].join('\n'), defaultBan);
    for(const w of found){ if(altDict[w]){ replaceWordInAllInputs(w, altDict[w]); log.push(`置換: ${w}→${altDict[w]}`); changed = true; } }
    // Re-read ctx
    const ctx2 = getCtx();
    const {scores: s} = computeScores(ctx2);
    // 2) recall
    if(s.recall<2){
      if(!sanitize($("distinct").value)){ $("distinct").value = '深い色と合言葉「〇〇」'; log.push('らしさ: 合言葉を設定'); changed = true; }
      $("p_promo").value += ("\n"+'看板と色を同じにして反復'); log.push('Promotion: 反復を追加'); changed = true;
    }
    // 3) ease
    if(s.ease<2){
      const pc = parseInt($("p_place_count").value||'0'); if(pc<3){ $("p_place_count").value = '3'; log.push('買える場所数=3'); changed = true; }
      const so = parseInt($("p_stockout").value||'100'); if(!(so<=10)){ $("p_stockout").value = '10'; log.push('在庫切れ率<=10%'); changed = true; }
      if(!$("p_firstpath").checked){ $("p_firstpath").checked = true; log.push('初回導線=あり'); changed = true; }
    }
    // 4) consistency
    if(s.consistency<2){
      const d = sanitize($("distinct").value)||'同じ色と合言葉';
      if(!$("p_place").value.includes('見た目')){ $("p_place").value += ("\n"+`見た目を${d}でそろえる`); log.push('Place: 見た目の統一を追加'); changed = true; }
    }
    // 5) spread
    if(s.spread<2){
      if(!/(初めて|新規|週末|体験|紹介)/.test($("todo").value)){
        $("todo").value = '初めての人の体験を増やす導線に集中'; log.push('やること: 初めて/体験を追加'); changed = true;
      }
    }
    // 6) profit
    if(s.profit<2){
      if(!Number.isFinite(parseInt($("profit_months").value||''))){ $("profit_months").value='6'; log.push('月次黒字=6か月'); changed = true; }
      if(!Number.isFinite(parseInt($("payback_months").value||''))){ $("payback_months").value='18'; log.push('回収=18か月'); changed = true; }
    }
    // 7) todo length
    const t = sanitize($("todo").value); if(t.length>40){ $("todo").value = t.slice(0,40); log.push('やること: 40文字に短縮'); changed = true; }

    if(changed){ save(); generate(); }
    return {changed, total};
  }

  $("auto-improve").addEventListener('click', async ()=>{
    const log = [];
    for(let i=1;i<=10;i++){
      const {changed, total} = autoImproveOnce(log);
      log.push(`第${i}回: 合計=${total}/10`);
      $("improve_log").textContent = log.join('\n');
      if(total>=CFG.SCORE_TARGET) { log.push('目標点に到達'); break; }
      if(!changed){ log.push('変更余地なし'); break; }
      await new Promise(r=>setTimeout(r, 120));
    }
  });

  function adviceLine(s){
    const entries = [
      [s.recall, "思い出されやすさが弱い。色/合言葉/同じ見た目を反復"],
      [s.ease, "買いやすさが弱い。買える場所を増やし在庫切れを下げる"],
      [s.consistency, "らしさの一貫性が弱い。色や言葉を全チャネルで統一"],
      [s.spread, "広がり方が弱い。初回体験や紹介の導線を入れる"],
      [s.profit, "黒字筋が弱い。黒字/回収の月数を明確に"],
    ];
    entries.sort((a,b)=>a[0]-b[0]);
    return entries[0][1];
  }

  function badgeFor(scores){
    const names = {
      recall:"想起マイスター",
      ease:"買いやすさ職人",
      consistency:"らしさ番長",
      spread:"ひろがり設計士",
      profit:"黒字プランナー"
    };
    const arr = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    return names[arr[0][0]];
  }

  function confettiBurst(){
    const colors = ['#ff2d55','#ff9500','#ffcc00','#34c759','#0a84ff','#5e5ce6'];
    const emojis = ['🎯','✨','🎉','📈','💡'];
    for(let i=0;i<18;i++){
      const span = document.createElement('span');
      span.className='confetti-piece';
      span.textContent = Math.random()<0.4 ? emojis[Math.floor(Math.random()*emojis.length)] : '●';
      span.style.left = Math.floor(Math.random()*100)+'vw';
      span.style.color = colors[Math.floor(Math.random()*colors.length)];
      span.style.fontSize = (12+Math.random()*16)+'px';
      span.style.animationDuration = (1.8+Math.random()*1.2)+'s';
      document.body.appendChild(span);
      setTimeout(()=>span.remove(), 3000);
    }
  }

  function replaceWordInAllInputs(src, dst){
    const fields = ['theme','situation','problem','distinct','core','broad','todo','dont','p_product','p_price','p_place','p_promo'];
    fields.forEach(id=>{ const el=$(id); el.value = el.value.split(src).join(dst); });
    save(); generate();
  }

  function makeChip(text, on){ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=text; b.addEventListener('click', on); return b; }

  function renderDrill(scores, ctx){
    const wrap = $("drill"); if(!wrap) return;
    wrap.innerHTML = '';
    // Coaching: jargon replacements
    const found = isPlainJapanese([ctx.place, ctx.promo, ctx.todo, ctx.core, ctx.broad].join('\n'), defaultBan);
    if(found.length){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>言い換え提案（横文字→日常語）</div>`;
      const row = document.createElement('div'); row.className='row chips';
      Array.from(new Set(found)).forEach(w=>{
        const alt = altDict[w]; if(!alt) return;
        row.appendChild(makeChip(`${w}→${alt}`, ()=> replaceWordInAllInputs(w, alt)));
      });
      block.appendChild(row); wrap.appendChild(block);
    }

    // Recall drill
    if(scores.recall<2){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>思い出されやすさを補強</div>`;
      const row = document.createElement('div'); row.className='row chips';
      if(!sanitize(ctx.distinct)){
        row.appendChild(makeChip('合言葉「〇〇」を決める', ()=>{ $("distinct").value = '合言葉「〇〇」'; save(); generate(); }));
      }
      row.appendChild(makeChip('看板と色を同じにする', ()=>{ $("p_promo").value += ("\n"+'看板と色を同じにして反復する'); save(); generate(); }));
      row.appendChild(makeChip('毎週同じ見た目で出す', ()=>{ $("p_promo").value += ("\n"+'毎週、同じ見た目で出す'); save(); generate(); }));
      block.appendChild(row); wrap.appendChild(block);
    }

    // Ease drill
    if(scores.ease<2){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>買いやすさを補強</div>`;
      const row = document.createElement('div'); row.className='row chips';
      row.appendChild(makeChip('買える場所を+1', ()=>{ const n=parseInt($("p_place_count").value||'0'); $("p_place_count").value = String(n+1); save(); generate(); }));
      row.appendChild(makeChip('在庫切れ率を5%に抑える', ()=>{ $("p_stockout").value='5'; save(); generate(); }));
      row.appendChild(makeChip('初回導線=あり', ()=>{ $("p_firstpath").checked=true; save(); generate(); }));
      block.appendChild(row); wrap.appendChild(block);
    }

    // Consistency drill
    if(scores.consistency<2){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>らしさの一貫性を補強</div>`;
      const row = document.createElement('div'); row.className='row chips';
      const d = sanitize(ctx.distinct)||'同じ色と合言葉';
      row.appendChild(makeChip('見た目をそろえる文を追記', ()=>{ $("p_place").value += ("\n"+`見た目を${d}でそろえる`); $("p_promo").value += ("\n"+`同じ見た目を反復`); save(); generate(); }));
      block.appendChild(row); wrap.appendChild(block);
    }

    // Spread drill
    if(scores.spread<2){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>広げ方を補強</div>`;
      const row = document.createElement('div'); row.className='row chips';
      row.appendChild(makeChip('初めての人の体験を入れる', ()=>{ $("todo").value = '初めての人の体験を増やす導線に集中'; save(); generate(); }));
      row.appendChild(makeChip('紹介の仕組みを入れる', ()=>{ $("p_promo").value += ("\n"+'紹介カードを配布する'); save(); generate(); }));
      block.appendChild(row); wrap.appendChild(block);
    }

    // Profit drill
    if(scores.profit<2){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>黒字筋を補強</div>`;
      const row = document.createElement('div'); row.className='row chips';
      row.appendChild(makeChip('黒字=6か月 回収=18か月', ()=>{ $("profit_months").value='6'; $("payback_months").value='18'; save(); generate(); }));
      row.appendChild(makeChip('Objectiveに数字を書く', ()=>{ $("p_promo").value += ("\n"+'目標月数を毎月伝える'); save(); generate(); }));
      block.appendChild(row); wrap.appendChild(block);
    }

    // TODO length coaching
    const tlen = sanitize($("todo").value).length;
    if(tlen>40){
      const block = document.createElement('div');
      block.innerHTML = `<div class=tiny>『やること』を短く（20〜40文字）</div>`;
      const row = document.createElement('div'); row.className='row chips';
      row.appendChild(makeChip('先頭40文字に短縮', ()=>{ const v=$("todo").value; $("todo").value = v.slice(0,40); save(); generate(); }));
      wrap.appendChild(block); block.appendChild(row);
    }
  }

  // localStorage autosave
  const form = $("editor");
  const storageKey = "prompt-editor-v1";
  function save(){
    const data = {_v: CFG.STORAGE_VERSION};
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      if(el.type==="checkbox") data[el.name]=el.checked; else data[el.name]=el.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
  function load(){
    try{
      const raw = localStorage.getItem(storageKey);
      if(!raw) return;
      const data = JSON.parse(raw);
      // migrate if needed
      if(!data._v){ data._v = 1; }
      if(data._v < CFG.STORAGE_VERSION){
        // placeholder for future migrations
        data._v = CFG.STORAGE_VERSION;
      }
      Object.keys(data).forEach(k=>{
        const el = form.elements.namedItem(k);
        if(!el) return;
        if(el.type==="checkbox") el.checked = !!data[k]; else el.value = data[k];
      });
    }catch(e){}
  }
  form.addEventListener("input", ()=>{ save(); });
  // live char count for 'todo'
  const todoInput = $("todo");
  const todoCount = $("todo_count");
  function updateTodoCount(){ const n = sanitize(todoInput.value).length; todoCount.textContent = `現在: ${n}文字`; }
  todoInput.addEventListener('input', updateTodoCount);

  // submit/Enter to generate
  form.addEventListener("submit", (e)=>{ e.preventDefault(); generate(); });
  document.addEventListener("keydown", (e)=>{
    if((e.ctrlKey||e.metaKey) && e.key==="Enter"){ e.preventDefault(); generate(); }
  });

  function toPlain(md){
    return md
      .replace(/^###?\s+/gm, "")
      .replace(/^\*\s\*\*(.*?)\*\*:\s*/gm, "$1: ")
      .replace(/^\*\s/gm, "- ")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`/g, "");
  }

  $("copy-md").addEventListener("click", ()=>{
    const {full} = generate();
    navigator.clipboard.writeText(full);
  });
  $("copy-txt").addEventListener("click", ()=>{
    const {full} = generate();
    navigator.clipboard.writeText(toPlain(full));
  });
  $("copy-prompt").addEventListener("click", ()=>{
    const {meta} = generate();
    navigator.clipboard.writeText(meta);
  });

  function download(name, content){
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); a.remove();
  }
  $("download-md").addEventListener("click", ()=>{ const {full}=generate(); download('case-study.md', full); });
  $("download-txt").addEventListener("click", ()=>{ const {full}=generate(); download('case-study.txt', toPlain(full)); });
  $("download-prompt").addEventListener("click", ()=>{ const {meta}=generate(); download('prompt.txt', meta); });

  // Evaluation mode: paste answer and score
  function evalFromText(text){
    const t = text || '';
    const banFound = findDictionaryBans(t, defaultBan);

    // extract sections by simple regex
    const getAfter = (label)=>{
      const re = new RegExp(label+"\n+([^\n].*?)\n", 'm');
      const m = t.match(re); return m? m[1].trim(): '';
    };
    const todoLine = getAfter("\\* \\*やること:\\*\\*") || getAfter("やること:") || '';
    // collect dont lines following the dont header
    let dontCount = 0;
    const dontBlockRe = /(\* \*やらないこと（リソースを割かないこと）:\*\*|やらないこと[:：])([\s\S]*)/m;
    const db = t.match(dontBlockRe);
    if(db){
      const lines = db[2].split(/\n/).slice(0,6);
      dontCount = lines.filter(l=>/^[-・]/.test(l.trim())).length;
    }
    // objective presence and months
    const objectiveRe = /####\s*Objective（目的）[\s\S]*?(?=####|$)/m;
    const objective = (t.match(objectiveRe)||[''])[0];
    const hasProfitWord = /黒字|回収/.test(objective);
    const months = (objective.match(/(\d{1,2})\s*か?月/g)||[]).map(s=>parseInt(s));
    const pmOk = months.some(n=>n<=12);
    const pbOk = months.some(n=>n<=24);

    // recall hints & distinct
    const distinctHint = /(色|ロゴ|合言葉|見た目)/.test(t);
    const recallHints = /(看板|色|同じ見た目|合言葉|毎週|反復|目立つ|統一)/.test(t);
    // ease hints
    const channelHint = /(駅|EC|通販|オンライン|自販機|ポップアップ|出店|コンビニ|受け取り|配送)/.test(t);
    const stockHint = /(在庫|欠品|切れ率|安定供給)/.test(t);
    const firstHint = /(初回|はじめて|お試し|体験|導線)/.test(t);
    // spread
    const hasCore = /コアターゲット/.test(t);
    const hasBroad = /戦略ターゲット/.test(t);
    const spreadHint = /(初めて|新規|週末|体験|お試し|紹介)/.test(t);

    // scoring
    const scores = {
      recall: (distinctHint?1:0) + (recallHints?1:0),
      ease: Math.min(2, (channelHint?1:0)+(stockHint?1:0)+(firstHint?1:0)),
      consistency: Math.min(2, (distinctHint?1:0) + (/(統一|同じ|揃える|反復)/.test(t)?1:0)),
      spread: Math.min(2, (hasCore&&hasBroad?1:0) + (spreadHint?1:0)),
      profit: Math.min(2, (hasProfitWord?1:0) + ((pmOk||pbOk)?1:0))
    };
    const total = scores.recall + scores.ease + scores.consistency + scores.spread + scores.profit;

    const okSentence = oneSentence(todoLine);
    const okLen = inLength20to40(todoLine);
    const okDont = dontCount<=3 && dontCount>0;

    const issues = [];
    if(banFound.length) issues.push(`専門用語の疑い: ${banFound.join('、')}`);
    if(!okSentence) issues.push('やることは1文にしてください');
    if(!okLen) issues.push('やることは20〜40文字が目安です');
    if(!okDont) issues.push('やらないことは最大3つ、箇条書きに');
    if(!hasProfitWord) issues.push('Objectiveに黒字または回収の語を含めてください');

    return {scores, total, issues, todoLine, dontCount, months};
  }

  $("evaluate").addEventListener('click', ()=>{
    const text = $("eval_text").value;
    const res = evalFromText(text);
    const radar = `採点: 思=${res.scores.recall}/2 買=${res.scores.ease}/2 一=${res.scores.consistency}/2 広=${res.scores.spread}/2 黒=${res.scores.profit}/2 → 合計 ${res.total}/10`;
    const lines = [radar];
    if(res.issues.length) lines.push(`注意: ${res.issues.join(' ／ ')}`);
    lines.push(`やること: 「${res.todoLine}」 / やらないこと: ${res.dontCount}項目 / 目安月数: ${res.months.join(', ')||'無し'}`);
    $("eval_result").textContent = lines.join('\n');
  });
  $("download-eval").addEventListener('click', ()=>{
    const text = $("eval_text").value;
    const res = evalFromText(text);
    download('evaluation.json', JSON.stringify(res, null, 2));
  });

  // Unit Economics simulator
  function calcUE(){
    const price = parseFloat($("ue_price").value||'0');
    const n = parseInt($("ue_customers").value||'0');
    const fixed = parseFloat($("ue_fixed").value||'0');
    const cogsRate = Math.max(0, Math.min(100, parseFloat($("ue_cogs").value||'0')))/100;
    const capex = parseFloat($("ue_capex").value||'0');
    const marginPer = price*(1-cogsRate);
    const revenue = price*n;
    const varCost = revenue*cogsRate;
    const gross = revenue - varCost;
    const profit = gross - fixed;
    const beCustomers = marginPer>0 ? Math.ceil(fixed / marginPer) : Infinity;
    const paybackMonths = profit>0 ? Math.ceil((capex||0)/profit) : Infinity;
    return {price,n,fixed,cogsRate,capex,marginPer,revenue,varCost,gross,profit,beCustomers,paybackMonths};
  }
  function renderUE(){
    const r = calcUE();
    const lines = [
      `売上: ${Math.round(r.revenue).toLocaleString()} 円/月`,
      `粗利: ${Math.round(r.gross).toLocaleString()} 円/月（単価粗利 ${Math.round(r.marginPer)} 円）`,
      `固定費: ${Math.round(r.fixed).toLocaleString()} 円/月`,
      `営業利益: ${Math.round(r.profit).toLocaleString()} 円/月`,
      `損益分岐の来店数: ${r.beCustomers===Infinity?'計算不可':r.beCustomers+' 人/月'}`,
      `回収月数（初期投資）: ${r.paybackMonths===Infinity?'黒字化後に再計算':r.paybackMonths+' か月'}`
    ];
    $("ue_output").textContent = lines.join('\n');
  }
  $("ue_calc").addEventListener('click', renderUE);
  $("ue_apply").addEventListener('click', ()=>{
    const r = calcUE();
    if(r.profit>0){
      $("profit_months").value = $("profit_months").value || '6';
      if(isFinite(r.paybackMonths)) $("payback_months").value = String(r.paybackMonths);
      save(); generate();
    }
  });

  // 3 variants generator
  function makeVariant(kind){
    const theme = $("theme").value;
    const situation = $("situation").value;
    const challenge = $("problem").value;
    const profitMonths = parseInt($("profit_months").value || "");
    const paybackMonths = parseInt($("payback_months").value || "");
    const base = {
      core: $("core").value,
      broad: $("broad").value,
      todo: $("todo").value,
      dont: $("dont").value,
      product: $("p_product").value,
      price: $("p_price").value,
      place: $("p_place").value,
      promo: $("p_promo").value
    };
    const v = JSON.parse(JSON.stringify(base));
    if(kind==='def'){ // 守
      v.todo = '既存の強みを繰り返し見せることに集中';
      v.dont = '高額投資／複雑な新規企画／一発花火';
      v.product = base.product + '\n定番を固定し、表示を見やすく';
      v.price = base.price + '\n値下げはせず、セットのわかりやすさ重視';
      v.place = base.place + '\n買える場所を1つずつ着実に増やす';
      v.promo = base.promo + '\n同じ色・言葉を反復して覚えてもらう';
    } else if(kind==='std'){ // 標準
      v.todo = '初回体験と買いやすさを同時に強化';
      v.dont = '大型タイアップ／複雑な限定メニュー／用途の分散';
      v.product = base.product + '\n初回お試しセットを用意';
      v.price = base.price + '\nセット割を明確化';
      v.place = base.place + '\n駅前ポップアップ+EC定番セット';
      v.promo = base.promo + '\n週末に同じ見た目で接点を増やす';
    } else { // 攻
      v.todo = '買える場面を一気に増やし想起を独占';
      v.dont = '短期売上に直結しない施策／見た目のバラつき';
      v.product = base.product + '\n限定ではなく定番の圧縮で記憶を一本化';
      v.price = base.price + '\nサブスク/回数券で継続の手間を減らす';
      v.place = base.place + '\n店頭+EC+自販機+近距離即日配送まで拡張';
      v.promo = base.promo + '\n朝/昼/夜で同じ色・言葉を反復露出';
    }
    const problemText = buildProblem(theme, situation, challenge, profitMonths, paybackMonths);
    const answerText = buildAnswer({
      objective: `（目標）月次黒字を${isFinite(profitMonths)?profitMonths+"か月":'（未設定）'}以内、投資回収を${isFinite(paybackMonths)?paybackMonths+"か月":'（未設定）'}で達成` ,
      ...v
    });
    return `# 【${kind==='def'?'守':kind==='std'?'標準':'攻'}】\n\n${problemText}\n\n${answerText}`;
  }
  function renderVariants(){
    const v1 = makeVariant('def');
    const v2 = makeVariant('std');
    const v3 = makeVariant('att');
    $("variant_def").textContent = v1;
    $("variant_std").textContent = v2;
    $("variant_att").textContent = v3;
    return {v1,v2,v3};
  }
  $("gen_variants").addEventListener('click', renderVariants);
  $("copy_def").addEventListener('click', ()=>{ const {v1}=renderVariants(); navigator.clipboard.writeText(v1); });
  $("copy_std").addEventListener('click', ()=>{ const {v2}=renderVariants(); navigator.clipboard.writeText(v2); });
  $("copy_att").addEventListener('click', ()=>{ const {v3}=renderVariants(); navigator.clipboard.writeText(v3); });
  $("download_variants").addEventListener('click', ()=>{ const {v1,v2,v3}=renderVariants(); download('variants.md', [v1,'',v2,'',v3].join('\n')); });

  function requiredHoles(v){
    const holes=[];
    if(!sanitize(v.theme)) holes.push('テーマ');
    if(!Number.isFinite(v.profitMonths)) holes.push('黒字までの月数');
    if(!Number.isFinite(v.paybackMonths)) holes.push('回収までの月数');
    if(!sanitize(v.core)) holes.push('コア');
    if(!sanitize(v.broad)) holes.push('広い対象');
    if(!sanitize(v.todo)) holes.push('やること');
    if(!sanitize(v.product)) holes.push('Product');
    if(!sanitize(v.price)) holes.push('Price');
    if(!sanitize(v.place)) holes.push('Place');
    if(!sanitize(v.promo)) holes.push('Promotion');
    return holes;
  }
  function highlightHoles(holes){
    const map = {
      'テーマ':'theme','黒字までの月数':'profit_months','回収までの月数':'payback_months',
      'コア':'core','広い対象':'broad','やること':'todo','Product':'p_product','Price':'p_price','Place':'p_place','Promotion':'p_promo'
    };
    // clear
    Array.from(document.querySelectorAll('.missing')).forEach(el=>el.classList.remove('missing'));
    holes.forEach(h=>{ const id = map[h]; const el = $(id); if(el) el.classList.add('missing'); });
  }

  function escapeHtml(s){
    return s.replace(/[&<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  }
  function renderRedline(md,banned){
    const esc = escapeHtml(md);
    // strike banned and show alt if exists
    let html = esc;
    const unique = Array.from(new Set(banned.concat(Object.keys(altDict)))).sort((a,b)=>b.length-a.length);
    unique.forEach(w=>{
      if(!w) return;
      const alt = altDict[w] ? `(<span class=hl>${escapeHtml(altDict[w])}</span>)` : '';
      const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
      html = html.replace(re, `<del>${escapeHtml(w)}</del>${alt}`);
    });
    outRed.innerHTML = html;
  }

  // redline toggle
  $("toggle-redline").addEventListener("click", (e)=>{
    const on = outRed.hasAttribute('hidden');
    e.currentTarget.setAttribute('aria-pressed', on? 'true':'false');
    outRed.toggleAttribute('hidden');
  });

  // presets
  $("apply-preset").addEventListener('click', ()=>{
    const key = $("preset").value;
    if(!key || !presets[key]) return;
    const p = presets[key];
    $("theme").value = p.theme;
    $("situation").value = p.situation;
    $("problem").value = p.problem;
    $("profit_months").value = p.profit_months;
    $("payback_months").value = p.payback_months;
    $("distinct").value = p.distinct;
    $("core").value = p.core;
    $("broad").value = p.broad;
    $("todo").value = p.todo;
    $("dont").value = p.dont;
    $("p_product").value = p.p_product;
    $("p_price").value = p.p_price;
    $("p_place").value = p.p_place;
    $("p_promo").value = p.p_promo;
    save(); generate();
  });

  // dark mode toggle
  $("toggle-dark").addEventListener('click', (e)=>{
    const isDark = document.documentElement.getAttribute('data-theme')==='dark';
    document.documentElement.setAttribute('data-theme', isDark? 'light':'dark');
    e.currentTarget.setAttribute('aria-pressed', isDark? 'false':'true');
    save();
  });

  // jargon auto-replace in inputs
  $("replace-jargon").addEventListener('click', ()=>{
    const fields = ['theme','situation','problem','distinct','core','broad','todo','dont','p_product','p_price','p_place','p_promo'];
    fields.forEach(id=>{
      const el = $(id); let v = el.value; Object.keys(altDict).forEach(k=>{ v = v.split(k).join(altDict[k]); }); el.value = v;
    });
    save(); generate();
  });

  // fun: sparks, dice, suggestions
  const sparks = [
    '同じ色を3回続けて見せる場面を作る',
    '最寄り駅から5分以内で買える場所を増やす',
    '雨の日にだけ現れる看板で覚えてもらう',
    '初回の一口体験を10秒でできるようにする',
    '朝の通勤路にだけ出会う小さな広告'
  ];
  const diceConstraints = [
    '平日の昼は人手を増やせない',
    '在庫は各所で各日20個まで',
    '屋外の大きな広告は使えない',
    '電話対応は1日2時間まで',
    '雨の日は来店が半分になる'
  ];
  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  $("spark").addEventListener('click', ()=>{
    const t = rand(sparks);
    $("spark_text").textContent = `ひらめき: ${t}`;
    // softly append to Promotion field
    const p = $("p_promo"); p.value = (p.value? p.value+"\n":"")+`（ひらめき）${t}`; save(); generate();
  });
  $("dice").addEventListener('click', ()=>{
    const c1 = rand(diceConstraints), c2 = rand(diceConstraints);
    const sit = $("situation");
    sit.value = (sit.value? sit.value+"\n":"")+`制約: ${c1}／${c2}`; save(); generate();
  });
  function suggestFromTheme(theme){
    const base = sanitize(theme)||'サービス';
    return [
      `${base}を知らない人が最初に出会う場所を1つ増やす`,
      `${base}を思い出す合言葉を5文字で決める`,
      `${base}を買える場面を『朝/昼/夜』で1つずつ作る`
    ];
  }
  $("suggest").addEventListener('click', ()=>{
    const list = suggestFromTheme($("theme").value);
    const wrap = $("suggestions"); wrap.innerHTML = '';
    list.forEach(s=>{
      const b = document.createElement('button');
      b.type='button'; b.className='chip'; b.textContent=s; b.addEventListener('click',()=>{
        const todo = $("todo"); todo.value = s; save(); generate();
      });
      wrap.appendChild(b);
    });
  });

  // initial render
  load();
  generate();
  updateTodoCount();
})();
