export interface FaqItem {
  id: string;
  category: 'culture' | 'brain' | 'beginner';
  categoryLabel: string;
  badge: string;
  question: string;
  answerPlain: string;
  answerHtml: string;
  isOpenDefault?: boolean;
}

export const faqCategories = [
  { id: 'all', label: 'すべて', icon: '♟️' },
  { id: 'culture', label: '将棋比較・文化・歴史', icon: '🏯' },
  { id: 'brain', label: '魅力・脳科学・IQ', icon: '🧠' },
  { id: 'beginner', label: '初心者入門・ルール', icon: '🔰' },
] as const;

export const faqData: FaqItem[] = [
  // --- カテゴリ1: 将棋比較・文化・歴史 ---
  {
    id: 'culture-why-not-popular-japan',
    category: 'culture',
    categoryLabel: '文化・歴史',
    badge: '日本と世界',
    question: 'チェスは日本では流行らないのはなぜですか？',
    isOpenDefault: true,
    answerPlain:
      '日本でチェスが欧米ほど普及しなかった最大の理由は、国民的ボードゲームである「将棋」が既に深く定着していたためです。江戸時代からプロ制度（名人制）を持ち、取った相手の駒を再利用できる独自の奥深さを持つ将棋が文化として根付いており、学校の部活動やメディア報道も将棋や囲碁が主流でした。しかし近年はNetflixドラマ『クイーンズ・ギャンビット』のヒットやオンライン対局、藤井聡太棋士の活躍に伴う頭脳スポーツ全般への関心向上により、日本でも10〜30代を中心に競技人口が急増しています。',
    answerHtml: `
      <p class="mb-3">
        日本でチェスが欧米ほど爆発的に流行しなかった最大の理由は、<strong>国民的ボードゲームである「将棋」が数百年かけて文化として深く根付いていたため</strong>です。
      </p>
      <ul class="space-y-2 mb-3 list-disc pl-5 text-[#4d4d4d] dark:text-[#a1a1aa]">
        <li><strong>将棋の圧倒的な存在感：</strong>江戸時代に徳川幕府の庇護を受け、プロ制度（名人制）が確立。取った駒を自軍として再利用できる唯一無二のゲーム性が日本人の気質に合致しました。</li>
        <li><strong>学校・地域での教育環境：</strong>学校の部活動や地域の将棋センター、テレビ（NHK杯）などで将棋や囲碁に触れる機会が圧倒的に多く、チェスを教える指導者やクラブが限られていました。</li>
      </ul>
      <p>
        <strong>現在の変化：</strong>近年ではNetflixドラマ『クイーンズ・ギャンビット』の世界的ヒットや、スマートフォンで手軽に世界中のプレイヤーと対戦できるオンライン対局の普及により、日本でも若い世代を中心にプレイヤーが急増しています。
      </p>
    `,
  },
  {
    id: 'culture-chess-vs-shogi-difficulty',
    category: 'culture',
    categoryLabel: '将棋比較',
    badge: '難易度比較',
    question: 'チェスと将棋はどっちが難しいですか？',
    isOpenDefault: true,
    answerPlain:
      '難しさの性質が異なるため一概には言えませんが、「終盤の計算量と選択肢の多さ」では将棋が難しく、「序盤の正確性とミスの許されなさ」ではチェスが難しいと言われています。将棋は取った駒を再利用できるため終盤になっても選択肢が減らず（平均80通り以上）、大逆転が起こりやすい複雑さがあります。一方のチェスは駒の再利用がないため、ポーン1個の損失でも致命傷になり、緻密なオープニング理論と厳密なポジショナルプレーが求められます。',
    answerHtml: `
      <p class="mb-3">
        難しさのベクトルが異なるため一概にどちらとは言えませんが、ゲームの性質から以下のように比較されます。
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div class="p-3.5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <div class="font-bold text-[#171717] dark:text-white mb-1 flex items-center gap-1.5">
            <span>☖ 将棋の難しさ</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">分岐の膨大さ</span>
          </div>
          <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            取った駒を再利用できる「持ち駒ルール」があるため、終盤になっても盤上の選択肢（平均80通り以上）が減りません。最後の1手まで読みの深さが問われます。
          </p>
        </div>
        <div class="p-3.5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <div class="font-bold text-[#171717] dark:text-white mb-1 flex items-center gap-1.5">
            <span>♚ チェスの難しさ</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">ミスの致命性</span>
          </div>
          <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            駒の再利用がないため、駒が減るほど局面が収束します。わずかポーン1個の駒損や序盤の微小な悪手でも取り返しがつかず、厳密な正確性が求められます。
          </p>
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        「大逆転が起こりやすいカオスな将棋」対「一度のミスも許されないシビアなチェス」という違いがあります。
      </p>
    `,
  },
  {
    id: 'culture-origin-country',
    category: 'culture',
    categoryLabel: '文化・歴史',
    badge: '起源・歴史',
    question: 'チェスはどこの国のゲーム？',
    isOpenDefault: false,
    answerPlain:
      'チェスの起源は6世紀頃の古代インドで遊ばれていた「チャトランガ（Chaturanga）」です。サンスクリット語で歩兵・騎兵・象兵・戦車の4軍隊を意味し、古代戦争を再現したものでした。これがペルシャ（現イラン）に伝わり「シャトランジ」となり、イスラム世界を経由して中世ヨーロッパに伝播。15世紀末の南欧（スペイン・イタリア等）でクイーンやビショップの動きが強化され、現在のモダンチェスが完成しました。なお、将棋や中国のシャンチーも同じチャトランガがルーツです。',
    answerHtml: `
      <p class="mb-3">
        チェスの起源（ルーツ）は、<strong>6世紀頃の古代インド</strong>で誕生したボードゲーム<strong>「チャトランガ（Chaturanga）」</strong>です。
      </p>
      <div class="space-y-2 mb-3 text-xs text-[#4d4d4d] dark:text-[#a1a1aa]">
        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">1. 古代インド：</span>
          <span>サンスクリット語で「4つの軍隊（歩兵・騎兵・象兵・戦車）」を意味し、古代の戦争をシミュレートした盤上遊戯として考案されました。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">2. ペルシャ・アラブ：</span>
          <span>シルクロードを経てペルシャ（現イラン）に伝わり「シャトランジ」となり、イスラム帝国の拡大とともに北アフリカや欧州へ広まりました。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">3. ヨーロッパ（15世紀末）：</span>
          <span>スペインやイタリアでクイーンやビショップが強力な動きに改定され、現代の「モダンチェス」ルールが完成しました。</span>
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        ※日本の将棋、中国のシャンチー（象棋）、タイのマックルックも、すべて同じインドのチャトランガから派生した兄弟ゲームです。
      </p>
    `,
  },
  {
    id: 'culture-chess-vs-shogi-fun',
    category: 'culture',
    categoryLabel: '将棋比較',
    badge: '魅力の比較',
    question: 'チェスと将棋、どちらが面白いですか？',
    isOpenDefault: false,
    answerPlain:
      'プレイヤーが好むゲームスタイルによって面白さの感じ方が異なります。チェスは「駒の機動力が非常に高く、スピーディーでダイナミックな展開」「世界中のプレイヤーと国境を越えて対戦できるグローバル性」「幾何学的に局面が収束していく美しさ」が好きな人に向いています。将棋は「持ち駒を使った劇的な大逆転」「陣形（囲い）をじっくり構築する美学」が好きな人に向いています。どちらも人類最高峰の頭脳スポーツであり、両方遊ぶことで互いの戦術眼が格段に高まります。',
    answerHtml: `
      <p class="mb-3">
        どちらが面白いかは、プレイヤーが<strong>「ゲームにどんな快感を求めるか」</strong>によって決まります。
      </p>
      <div class="space-y-3 mb-3">
        <div class="p-3.5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <h4 class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white mb-1">♚ チェスが面白いと感じる人</h4>
          <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            クイーンの圧倒的火力や、序盤からの激しいタクティクス（捨て駒・両取り）を楽しみたい人。世界共通ルールのため、言葉が通じない世界各国の相手と腕試しをしたい人におすすめです。
          </p>
        </div>
        <div class="p-3.5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <h4 class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white mb-1">☖ 将棋が面白いと感じる人</h4>
          <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            どれだけ劣勢でも一撃で相手玉を即詰みに仕留める「大逆転のスリル」が好きな人。美濃囲いや穴熊など、自陣をじっくり要塞化して攻め合う醍醐味を味わいたい人に向いています。
          </p>
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        結論として、両方プレイするのが最も贅沢です。チェスを指すと将棋の駒の利きやスピード感覚が鋭くなり、将棋を指すとチェスの終盤の読みが深くなります。
      </p>
    `,
  },

  // --- カテゴリ2: 魅力・脳科学・知能・IQ ---
  {
    id: 'brain-is-chess-fun',
    category: 'brain',
    categoryLabel: '魅力・効果',
    badge: 'ゲームの魅力',
    question: 'チェスって面白いですか？',
    isOpenDefault: true,
    answerPlain:
      '間違いなく最高に面白いゲームです！世界中で数億人以上が熱狂している最大の理由は、「運（サイコロやカードの引き）が一切なく、100%自分の知略と決断で勝敗が決まる完全情報ゲーム」だからです。相手の狙いを読んで裏をかいた瞬間や、鮮やかな捨て駒（サクリファイス）でチェックメイトを決めたときの快感は格別です。1局10分程度でも濃密な頭脳戦が楽しめ、勝っても負けても深い学びと自己成長を感じられます。',
    answerHtml: `
      <p class="mb-3">
        <strong>世界中で6億人以上の競技人口を持つ、最高峰の面白さを誇るゲームです！</strong>
      </p>
      <div class="space-y-2 mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        <div class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✔</span>
          <span><strong>完全な実力勝負：</strong>運の要素がゼロ。勝った時は完全に「自分の知略と読みの勝利」であり、極上の達成感を味わえます。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✔</span>
          <span><strong>鮮やかなコンビネーション：</strong>最強のクイーンを自ら差し出して相手をハメる「サクリファイス（捨て駒）」が決まった瞬間の脳汁が出るような快感。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✔</span>
          <span><strong>手軽さと奥深さの両立：</strong>1局10分程度のラピッド対局でも濃密なドラマが生まれ、一生かけても遊び尽くせない深遠な世界が広がっています。</span>
        </div>
      </div>
    `,
  },
  {
    id: 'brain-does-chess-make-you-smarter',
    category: 'brain',
    categoryLabel: '脳科学・効果',
    badge: '脳トレ科学',
    question: 'チェスをすることで頭が良くなる？',
    isOpenDefault: false,
    answerPlain:
      'はい、チェスを定期的にプレイすることは脳の認知機能向上に大きな好影響を与えることが数々の科学研究で証明されています。論理的思考力、数手先を頭の中で視覚化するワーキングメモリ（作業記憶）、空間認識能力、衝動を抑える自己抑制力が鍛えられます。アルメニアなど多くの国で小学校の必修科目として導入されており、子供の学力や集中力アップはもちろん、大人の脳トレや認知機能維持にも非常に効果的です。',
    answerHtml: `
      <p class="mb-3">
        科学的研究や教育学の観点からも、<strong>チェスは脳の認知機能トレーニングとして極めて優れている</strong>ことが立証されています。
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
          <span class="font-bold text-[#171717] dark:text-white">🧠 ワーキングメモリ（作業記憶）</span>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa]">数手先の盤面を脳内でシミュレーションして保持する空間視覚化能力が鍛えられます。</p>
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
          <span class="font-bold text-[#171717] dark:text-white">🔍 論理的思考・問題解決力</span>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa]">「原因と結果」を順序立てて推論し、最善の選択肢を論理的に選ぶ力が身につきます。</p>
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
          <span class="font-bold text-[#171717] dark:text-white">🎯 集中力と衝動の抑制</span>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa]">思いつきで慌てて指すミスを戒め、一手一手冷静に検証する自制心が育まれます。</p>
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
          <span class="font-bold text-[#171717] dark:text-white">🏫 世界の学校教育で採用</span>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa]">アルメニアや欧州各国の学校で必修科目化され、児童の算数力・読解力向上に貢献しています。</p>
        </div>
      </div>
    `,
  },
  {
    id: 'brain-benefits-of-playing-chess',
    category: 'brain',
    categoryLabel: '魅力・効果',
    badge: '5大メリット',
    question: 'チェスをやるメリットは？',
    isOpenDefault: false,
    answerPlain:
      'チェスをプレイする主なメリットは、①決断力と自己責任感の向上（誰にも頼れず自分で最善手を下す習慣）、②感情コントロールとレジリエンス（逆境でもパニックにならず打開策を探す精神力）、③世界共通のコミュニケーション言語（国境や言語を越えて対話可能）、④完全無料で一生続けられる趣味（スマホやPCさえあれば費用0円）、⑤シニアの認知症予防・脳の活性化、の5点です。',
    answerHtml: `
      <p class="mb-3">
        チェスを習慣にすることは、単なるゲームの枠を超えて実生活やメンタルに多くの好影響をもたらします。
      </p>
      <ol class="space-y-2 mb-3 list-decimal pl-5 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        <li><strong>決断力と自己責任能力：</strong>盤上では誰も助けてくれません。自分で一手を選び、その結果（勝ち負け）を受け止める健全な主体性が養われます。</li>
        <li><strong>感情のコントロール（逆境への強さ）：</strong>不利な局面に陥っても、焦らず「相手の隙」や「粘り手」を冷静に探すタフなメンタルが身につきます。</li>
        <li><strong>世界共通のコミュニケーションツール：</strong>言葉が通じない外国人とも、チェス盤を挟むだけで瞬時に深い意思疎通が成立します。</li>
        <li><strong>コストがかからず一生続けられる：</strong>本サイトのように完全無料で遊べ、体力の衰えに関係なく何歳になっても楽しめます。</li>
        <li><strong>脳のエイジングケア：</strong>認知症予防や前頭葉の活性化に理想的なマインドスポーツとして医学的にも注目されています。</li>
      </ol>
    `,
  },
  {
    id: 'brain-what-kind-of-people-are-good',
    category: 'brain',
    categoryLabel: '知能・適性',
    badge: 'プレイヤー適性',
    question: 'チェスが得意な人はどんな人ですか？',
    isOpenDefault: false,
    answerPlain:
      'チェスが強い人・上達が早い人には、「客観的で希望的観測をしない（相手の最も強い反撃を冷静に読める）」「ミスを感情的にならず素直に振り返り学べる（負けた対局の検討ができる）」「戦術や定跡のパターン認識が得意」「慌てず深く考える忍耐力がある」という共通点があります。生まれつきの天才であること以上に、丁寧な振り返りと反復練習を継続できる人が最も上達します。',
    answerHtml: `
      <p class="mb-3">
        チェスが得意な人・急激に強くなる人には、以下のような思考の共通パターンがあります。
      </p>
      <div class="space-y-2 mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <strong class="text-[#171717] dark:text-white">1. 客観的でリアリストな人：</strong>
          「相手がミスしてくれたら勝てる」という願望ではなく、「相手が最善手を指してきたらどう防ぐか」を冷静に考えられる人。
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <strong class="text-[#171717] dark:text-white">2. 負けから学べる改善志向の人：</strong>
          負けた悔しさを感情で流さず、「どこで悪手を指したか」をエンジンや検討で分析して次回に活かせる人。
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <strong class="text-[#171717] dark:text-white">3. パターン認識に長けている人：</strong>
          ピンやフォーク、典型的なチェックメイトの形を直感的に「視覚パターン」としてストックできる人。
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        特別なIQの高さよりも、「敗戦を振り返って手筋を覚える習慣」がある人が確実に上級者へステップアップします。
      </p>
    `,
  },
  {
    id: 'brain-chess-and-iq-relationship',
    category: 'brain',
    categoryLabel: '知能・適性',
    badge: 'IQの真実',
    question: 'チェスとIQは関係ありますか？',
    isOpenDefault: false,
    answerPlain:
      'チェスの実力とIQには一定の正の相関が認められるものの、「IQが高い＝チェスが強い」わけではありません。認知科学の研究（ブルックらによるメタ分析）によると、チェスの強さを最も決定づける要因はIQではなく「練習量」「戦術パターンの蓄積（長期記憶）」「定跡の研究」であることが判明しています。どれほど高IQの天才でも定跡や手筋を知らなければ熟練者に勝てません。正しい練習を積めば誰でも強くなれるフェアなゲームです。',
    answerHtml: `
      <p class="mb-3">
        結論として、<strong>相関関係はあるものの「IQが高い＝チェスが強い」という単純な関係ではありません。</strong>
      </p>
      <p class="mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        心理学や認知科学の研究（Bilalić et al., 2007など）によると、初心者の段階では空間認識力やIQが多少有利に働くものの、<strong>中級者以上になるとIQの差は実力に関係なくなり、「練習量」と「パターンの記憶量」が圧倒的な決定打になる</strong>ことが分かっています。
      </p>
      <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed mb-2">
        💡 <strong>ポイント：</strong>チェスの達人は「何十手も先を天才的な頭脳で総当たり計算している」のではなく、過去に学んだ数千・数万の「良形・悪形のパターン」を瞬時に長期記憶から引き出して指しています。
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        生まれ持った知能指数を心配する必要は全くありません。基本ルールと典型パターンを覚えた人から順番に強くなれます。
      </p>
    `,
  },

  // --- カテゴリ3: 初心者入門・始め方・基本ルール ---
  {
    id: 'beginner-how-to-start-easily',
    category: 'beginner',
    categoryLabel: '初心者入門',
    badge: '入門ガイド',
    question: 'チェスのルールは初心者でもすぐ覚えられますか？何から始めればいい？',
    isOpenDefault: true,
    answerPlain:
      'はい、チェスの基本ルールは30分〜1時間ほどですぐに覚えられます！駒の種類は6つ（キング・クイーン・ルーク・ビショップ・ナイト・ポーン）だけで、将棋のような複雑な成駒の変化もありません。初心者はまず、①各駒の動かし方とチェックメイトの勝利条件を覚える、②当サイトの「初級AI」と対戦してみる（動かせるマスが緑色に光るためルールが不安でも安心）、③中央を押さえる基本を意識する、の3点から始めるのがおすすめです。',
    answerHtml: `
      <p class="mb-3">
        <strong>基本ルールは30分〜1時間で十分にマスターできます！</strong>
      </p>
      <div class="space-y-2 mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
          <span><strong>駒の動きを覚える：</strong>駒はたった6種類。特に「前に進んで斜めに取るポーン」と「唯一他の駒を飛び越せるナイト」を把握しましょう。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
          <span><strong>勝利条件を知る：</strong>王手（チェック）をかけ、相手が逃げられなくなったら「チェックメイト（詰み）」であなたの勝ちです。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
          <span><strong>実際に指してみる：</strong>当サイトのチェス盤は、駒をタップすると動かせるマスが緑色にハイライトされるので、暗記していなくても直感的に遊べます。</span>
        </div>
      </div>
      <div class="pt-1">
        <a href="/rules" class="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
          <span>♟ 駒を動かして学べるルール解説ページを見る →</span>
        </a>
      </div>
    `,
  },
  {
    id: 'beginner-game-duration',
    category: 'beginner',
    categoryLabel: '基本知識',
    badge: '所要時間',
    question: '1ゲーム（対局）にかかる時間はどれくらいですか？',
    isOpenDefault: false,
    answerPlain:
      '持ち時間の設定によって数分から数十分まで自由に変えられます。カジュアルなオンライン対局や本サイトでは、1局あたり「10分（標準ラピッド）」や「3分（早指しブリッツ）」が最も人気で、スキマ時間の10〜15分程度で決着がつきます。じっくり考えたい初心者の方向けには「時間無制限」モードも選べるため、自分のペースに合わせて遊べます。',
    answerHtml: `
      <p class="mb-3">
        設定する「持ち時間（タイマー）」によって、数分〜数十分まで自由に選べます。
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
        <div class="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center">
          <div class="font-bold text-[#171717] dark:text-white">超早指し (1分)</div>
          <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">ブレット</div>
          <div class="text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">約 2〜3 分</div>
        </div>
        <div class="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center">
          <div class="font-bold text-[#171717] dark:text-white">早指し (3分)</div>
          <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">ブリッツ</div>
          <div class="text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">約 5〜8 分</div>
        </div>
        <div class="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center">
          <div class="font-bold text-[#171717] dark:text-white">標準 (10分)</div>
          <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">ラピッド</div>
          <div class="text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">約 15〜20 分</div>
        </div>
        <div class="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center">
          <div class="font-bold text-[#171717] dark:text-white">時間無制限</div>
          <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">練習・検討</div>
          <div class="text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">マイペース</div>
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        初心者の方の練習には、時計に追われずじっくり考えられる「10分」または「時間無制限」が最もおすすめです。
      </p>
    `,
  },
  {
    id: 'beginner-reusing-captured-pieces',
    category: 'beginner',
    categoryLabel: '基本ルール',
    badge: '将棋との違い',
    question: '相手の駒を取ったら、将棋のように持ち駒として使えますか？',
    isOpenDefault: false,
    answerPlain:
      'いいえ、チェスでは取った相手の駒を自分の持ち駒として盤上に再配置（持ち駒使用）することはできません。取られた駒はゲームから完全に除外されます。そのため、対局が進むにつれて盤上の駒はどんどん減っていき、終盤（エンドゲーム）ではキングと数個の駒だけのシンプルな戦いへと収束していきます。だからこそ「駒の損得（点数計算）」が非常に重要になります。',
    answerHtml: `
      <p class="mb-3">
        <strong>いいえ、チェスには「持ち駒」という概念はありません。</strong>
      </p>
      <p class="mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        相手から取った駒（テイクした駒）はそのまま盤外へ取り除かれ、二度と盤上に戻ることはありません。
      </p>
      <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-xs space-y-1.5 mb-2">
        <div class="font-bold text-[#171717] dark:text-white">💡 これがもたらすチェスならではの面白さ：</div>
        <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
          取った駒が復活しないため、序盤から中盤、そして終盤（エンドゲーム）へと向かうにつれて盤面が劇的にスッキリ収束していきます。残ったわずかなポーンを敵陣の奥まで進めてクイーンに昇格（プロモーション）させる終盤のドラマが極めて熱い展開を生み出します。
        </p>
      </div>
    `,
  },
  {
    id: 'beginner-play-alone-without-board',
    category: 'beginner',
    categoryLabel: '初心者入門',
    badge: '完全無料・即対局',
    question: 'チェス盤や駒を持っていなくても、一人ですぐ遊べますか？',
    isOpenDefault: false,
    answerPlain:
      'はい！実物のチェス盤や駒を持っていなくても、スマートフォンやパソコンのブラウザさえあれば「チェスweb」ですぐに一人で遊べます。会員登録やアプリのダウンロードも不要で、世界最強クラスのAI（Stockfish）が超初級から伝説級まであなたの実力に合わせた相手を務めてくれます。さらに、1台のスマホを挟んで友達や家族と遊べる「2人対戦モード」も完全無料で利用できます。',
    answerHtml: `
      <p class="mb-3">
        <strong>はい！本サイト「チェスweb」なら、ブラウザを開くだけで今すぐ一人で遊べます。</strong>
      </p>
      <div class="space-y-2 mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        <div class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✔</span>
          <span><strong>登録・ダウンロード不要：</strong>面倒な会員登録や課金は一切なし。完全無料です。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✔</span>
          <span><strong>9段階のAI対戦：</strong>ルールを覚えたての方に優しい「超初級」から最高峰の「伝説級」まで9段階のAI対戦が可能。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✔</span>
          <span><strong>親切なアシスト機能：</strong>動かせるマスの緑色表示、形勢を可視化する評価値バー、待った機能付き。</span>
        </div>
      </div>
    `,
  },
  {
    id: 'beginner-tips-to-win',
    category: 'beginner',
    categoryLabel: '初心者入門',
    badge: '3大原則',
    question: '初心者が勝つためのコツや基本戦略はありますか？',
    isOpenDefault: false,
    answerPlain:
      '初心者が劇的に勝率を上げるための黄金律（3大オープニング原則）は、①中央（センターの4マス: e4, d4, e5, d5）をポーンで支配する、②小駒（ナイトとビショップ）を早めに前線へ出して展開する、③早めにキャスリングしてキングを安全な隅に隠す、の3点です。また、最強の駒であるクイーンを序盤から不用意に突撃させない（相手の小駒に狙われてテンポ損するのを防ぐ）ことも重要です。',
    answerHtml: `
      <p class="mb-3">
        チェスの序盤戦（オープニング）で<strong>次の3原則を守るだけで、初心者の負け率は劇的に下がります。</strong>
      </p>
      <div class="space-y-2.5 mb-3 text-xs sm:text-sm">
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <strong class="text-[#171717] dark:text-white">1. 中央（センター）をポーンで押さえる：</strong>
          <span class="text-[#4d4d4d] dark:text-[#a1a1aa]">盤の中央4マス（e4, d4, e5, d5）を支配すると、背後の駒たちの射線が一気に広がり、盤面全体で優勢を築きやすくなります。</span>
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <strong class="text-[#171717] dark:text-white">2. ナイト・ビショップを素早く出撃させる：</strong>
          <span class="text-[#4d4d4d] dark:text-[#a1a1aa]">同じ駒ばかり動かさず、ナイトやビショップを早めに前線へ展開（デベロップ）して戦力に参加させます。</span>
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <strong class="text-[#171717] dark:text-white">3. 早めに「キャスリング」を済ませる：</strong>
          <span class="text-[#4d4d4d] dark:text-[#a1a1aa]">中央に残ったキングは狙い撃ちされます。早めにルークとキングの位置を入れ替えるキャスリングを行い、王を安全地帯に避難させましょう。</span>
        </div>
      </div>
    `,
  },
  {
    id: 'beginner-stalemate-vs-checkmate',
    category: 'beginner',
    categoryLabel: '基本ルール',
    badge: 'ルール注意点',
    question: '「ステイルメイト（引き分け）」とは何ですか？チェックメイトとの違いは？',
    isOpenDefault: false,
    answerPlain:
      'チェックメイトは「キングに王手（チェック）がかかっていて、逃げ場がない状態」で攻撃側の勝ちです。一方、ステイルメイトは「キングに王手はかかっていないが、手番のプレイヤーが動かせる合法手が盤上に1つもない状態」を指し、発生した瞬間に即座に「引き分け（ドロー）」となります。駒の数で大差をつけて圧倒的優勢であってもステイルメイトになると引き分けになってしまうため、初心者は追い詰める際に相手キングの逃げ道を完全に塞がないよう注意が必要です。',
    answerHtml: `
      <p class="mb-3">
        初心者の方が最も注意すべきルールが<strong>「ステイルメイト（引き分け）」</strong>です。
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div class="font-bold text-emerald-800 dark:text-emerald-300 mb-1">♔ チェックメイト（勝ち）</div>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            相手のキングに王手（チェック）がかかっており、逃げる・防ぐ・取るのいずれもできない状態。<strong>あなたの勝ち</strong>です。
          </p>
        </div>
        <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div class="font-bold text-amber-800 dark:text-amber-300 mb-1">⚖ ステイルメイト（引き分け）</div>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            相手のキングに王手は<strong>かかっていない</strong>が、相手がルール上動かせる駒がゼロの状態。<strong>即座に引き分け（ドロー）</strong>となります。
          </p>
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        ※大差で勝っている終盤に、相手キングを隅に追い詰めすぎてステイルメイトにしてしまい引き分けで終わるミスは初心者あるあるです！
      </p>
    `,
  },
  {
    id: 'beginner-white-vs-black-advantage',
    category: 'beginner',
    categoryLabel: '基本知識',
    badge: '先手・後手',
    question: '白と黒のどちらが有利ですか？先手・後手はどう決まりますか？',
    isOpenDefault: false,
    answerPlain:
      'チェスでは常に「白が先手（先攻）」「黒が後手（後攻）」と決まっています。統計上、先に主導権を握りやすい白の勝率が約52〜55%とわずかに有利とされています。ただし、これはグランドマスター同士のトップ対局での差であり、初心者〜中級者の対戦では先手後手の差よりも戦術ミス（ポカ）の有無が勝敗の9割を決めます。黒番でもしっかりした受けと反撃の手筋を身につければ十分に勝利できます。',
    answerHtml: `
      <p class="mb-3">
        チェスでは世界共通のルールとして、<strong>常に「白が先手（先攻）」「黒が後手（後攻）」</strong>と決まっています。
      </p>
      <div class="space-y-2 mb-3 text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
        <div class="flex items-start gap-2">
          <span class="font-bold text-[#171717] dark:text-white">⚪ 白番の勝率（統計）：</span>
          <span>プロの統計データでは白の勝率が約52〜55%、黒が約45〜48%で、先攻の白がわずかに有利です。</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-bold text-[#171717] dark:text-white">⚫ アマチュア・初心者の場合：</span>
          <span>先手・後手の差はほとんど勝敗に影響しません。駒のタダ取りやうっかりミスを防ぐことの方が何倍も重要です。</span>
        </div>
      </div>
      <p class="text-xs text-[#8f8f8f] dark:text-[#71717a]">
        当サイトのAI対戦では、白番（先手）はもちろん、黒番（後手）を選んで受ける練習も自由に切り替え可能です。
      </p>
    `,
  },
  {
    id: 'beginner-undo-and-hint-features',
    category: 'beginner',
    categoryLabel: '初心者入門',
    badge: '便利機能',
    question: '操作を間違えたときに「待った」やヒント機能は使えますか？',
    isOpenDefault: false,
    answerPlain:
      'はい、当サイト「チェスweb」では、初心者の方が安心して手筋や戦術を学べるよう、「待った（アンドゥ）」機能と「最善手ヒント」機能を完全無料で標準搭載しています。駒の操作を間違えたときやうっかりミスをしたときは盤面下の「待った」ボタンで一手前に戻せます。また、次の手で迷ったときは「ヒント」ボタンを押すと、世界最強AIが推奨する最善手を盤上に矢印でアシスト表示します。',
    answerHtml: `
      <p class="mb-3">
        <strong>はい！初心者の方が安心して上達できるよう、充実のサポート機能を完備しています。</strong>
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-xs">
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
          <div class="font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
            <span>↩ 「待った」ボタン</span>
          </div>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa]">
            うっかり駒を取られてしまった場合でも、盤面下の「待った」を押せば何手でも局面を巻き戻してやり直せます。
          </p>
        </div>
        <div class="p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
          <div class="font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
            <span>💡 「ヒント」ボタン</span>
          </div>
          <p class="text-[#4d4d4d] dark:text-[#a1a1aa]">
            どこを動かせばいいか迷った時は「ヒント」を押すと、Stockfish AIが推奨する最善手・好手を盤上に矢印でガイドします。
          </p>
        </div>
      </div>
    `,
  },
];

export function getFaqSchemaJsonLd(items: FaqItem[] = faqData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answerPlain,
      },
    })),
  };
}
