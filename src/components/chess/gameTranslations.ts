export interface GameTranslations {
  appTitle: string;
  appSubtitle: string;
  
  // Game modes
  modeAi: string;
  modeAiDesc: string;
  modePvp: string;
  modePvpDesc: string;
  modeOnline: string;
  modeOnlineDesc: string;
  modePractice: string;
  modePracticeDesc: string;
  modeLearn: string;
  modeLearnDesc: string;
  
  // Practice Mode
  practiceHeader: string;
  practiceTopMovesTitle: string;
  practiceWhiteTurn: string;
  practiceBlackTurn: string;
  practiceClickToPlay: string;
  practiceShowArrows: string;
  practiceHideArrows: string;
  practiceAutoAiReply: string;
  practiceManualBoth: string;
  practiceWithAi: string;
  practiceAnalyzing: string;
  practiceFlip: string;
  practiceReset: string;
  practiceEvalScore: string;
  practiceCandidateMove: string;
  practiceBestMove: string;
  practiceBothSidesDesc: string;
  
  // Beginner-friendly Evaluation & Winning Chances
  positionEvaluationTitle: string;
  whiteWinningChances: string;
  drawChances: string;
  blackWinningChances: string;
  whiteIsWinning: string;
  whiteClearlyBetter: string;
  whiteSlightlyBetter: string;
  gameIsEqual: string;
  blackSlightlyBetter: string;
  blackClearlyBetter: string;
  blackIsWinning: string;
  mateInMovesWhite: string;
  mateInMovesBlack: string;
  mateForcedCheckmate: string;
  showEngineScore: string;
  hideEngineScore: string;
  engineScoreDetails: string;
  
  // Difficulty levels
  diffVeryEasy: string;
  diffVeryEasyDesc: string;
  diffEasy: string;
  diffEasyDesc: string;
  diffMedium: string;
  diffMediumDesc: string;
  diffHard: string;
  diffHardDesc: string;
  diffExpert: string;
  diffExpertDesc: string;
  diffMaster: string;
  diffMasterDesc: string;
  diffGrandmaster: string;
  diffGrandmasterDesc: string;
  diffTranscendent: string;
  diffTranscendentDesc: string;
  diffLegendary: string;
  diffLegendaryDesc: string;
  diffBeginner: string;
  diffBeginnerDesc: string;
  diffIntermediate: string;
  diffIntermediateDesc: string;
  diffAdvanced: string;
  diffAdvancedDesc: string;
  difficultyLabel: string;
  
  // Player sides
  sideWhite: string;
  sideBlack: string;
  sideRandom: string;
  sideChoiceLabel: string;
  
  // Game controls
  undo: string;
  undoTooltip: string;
  redo: string;
  redoTooltip: string;
  restart: string;
  restartTooltip: string;
  resign: string;
  resignTooltip: string;
  hint: string;
  hintTooltip: string;
  flip: string;
  flipTooltip: string;
  rotatePieces: string;
  rotatePiecesTooltip: string;
  settings: string;
  newGame: string;
  
  // Time controls
  timeUnlimited: string;
  time10Min: string;
  time5Min: string;
  time3Min: string;
  time1Min: string;
  timeLabel: string;
  
  // Board states
  turnWhite: string;
  turnBlack: string;
  thinking: string;
  check: string;
  checkmate: string;
  stalemate: string;
  timeout: string;
  resignation: string;
  draw: string;
  currentTurnLabel: string;
  checkStatusLabel: string;
  evalLabel: string;
  whiteAdvantage: string;
  blackAdvantage: string;
  evenPosition: string;
  none: string;
  
  // Player labels
  youLabel: string;
  computerLabel: string;
  whitePlayer: string;
  blackPlayer: string;
  handTurnBadge: string;
  
  // Modals & Messages
  resignConfirmTitle: string;
  resignConfirmBody: string;
  resignAction: string;
  restartConfirmTitle: string;
  restartConfirmBody: string;
  confirmYes: string;
  confirmCancel: string;
  
  // Game over modal
  gameOverTitle: string;
  winPlayer: string;
  winAi: string;
  winWhite: string;
  winBlack: string;
  drawGame: string;
  playAgain: string;
  reviewBoard: string;
  totalMovesLabel: string;
  outcomeReasonLabel: string;
  movesUnit: string;
  
  // Settings modal
  settingsTitle: string;
  darkModeLabel: string;
  darkModeDesc: string;
  soundLabel: string;
  soundDesc: string;
  coordinatesLabel: string;
  coordinatesDesc: string;
  themeLabel: string;
  close: string;
  
  // Move history
  moveHistoryTitle: string;
  noMovesYet: string;
  gameInfoTitle: string;
  startGameCta: string;

  // Online match translations
  onlineTitle: string;
  onlineIntro: string;
  onlineIntroWaiting: string;
  onlineCopyInvite: string;
  onlineCopied: string;
  onlineQrInvite: string;
  onlineHostSideLabel: string;
  onlineTcLabel: string;
  onlineStatusWaiting: string;
  onlineStatusJoining: string;
  onlineStatusConnecting: string;
  onlineStatusPlaying: string;
  onlineStatusReconnecting: string;
  onlineGuideTitle: string;
  onlineGuideStep1: string;
  onlineGuideStep2: string;
  onlineGuideStep3: string;
  onlineQrTitle: string;
  onlineQrDesc: string;
  onlineResignTitle: string;
  onlineResignDesc: string;
  onlineResignConfirm: string;
  onlineResignCancel: string;
  onlineNotYourTurn: string;
  onlineMatchStarted: string;
  onlineYou: string;
  onlineOpponent: string;
  onlineYourTurn: string;
  onlineOpponentTurn: string;
  onlineVictory: string;
  onlineDefeat: string;
  onlineTcNone: string;
  onlineTcSuddenDeath: string;
  onlineTcIncrement: string;
  onlineTcIncrementDesc: string;
  onlineOpponentDisconnected: string;
  onlineWaitingReconnect: string;
  onlineDisconnectWarning: string;
  onlineSelfDisconnectedTitle: string;
  onlineSelfDisconnectedDesc: string;
  onlineOpponentReconnected: string;
  onlineWonByDisconnect: string;
  onlineLostByDisconnect: string;
  onlineDisconnectReason: string;
  onlineRematch: string;
  onlineOfferRematch: string;
  onlineAcceptRematch: string;
  onlineDeclineRematch: string;
  onlineCancelRematch: string;
  onlineWaitingRematch: string;
  onlineOpponentOfferedRematch: string;
  onlineRematchStarting: string;
  onlineRematchDeclined: string;
  onlineCreateNewRoom: string;
  onlineRematchStarted: string;
  onlineCannotRematchOffline: string;
  onlineOpponentLeftCannotRematch: string;
}

export const GAME_TRANSLATIONS: Record<'ja' | 'en', GameTranslations> = {
  ja: {
    appTitle: 'チェス web',
    appSubtitle: 'オンラインチェス対戦・AI対局',
    modeAi: 'AI対戦',
    modeAiDesc: 'コンピュータと腕試し',
    modePvp: '2人対戦',
    modePvpDesc: '1台の端末で対局',
    modeOnline: '友達対戦',
    modeOnlineDesc: '招待リンクでオンライン対戦',
    modePractice: '練習モード',
    modePracticeDesc: '両手番でAIがTop 5最善手を提示',
    modeLearn: '学ぶ',
    modeLearnDesc: 'ルールと駒の動かし方',

    // Practice Mode
    practiceHeader: '練習モード',
    practiceTopMovesTitle: 'AI最善候補手 (Top 5)',
    practiceWhiteTurn: '⚪ 先手（白）の手番',
    practiceBlackTurn: '⚫ 後手（黒）の手番',
    practiceClickToPlay: 'クリックして指す',
    practiceShowArrows: '矢印表示',
    practiceHideArrows: '矢印非表示',
    practiceAutoAiReply: 'AI自動返手',
    practiceManualBoth: '両手番自由練習',
    practiceWithAi: 'AIと練習',
    practiceAnalyzing: 'AI思考中...',
    practiceFlip: '盤面反転',
    practiceReset: '初期配置に戻す',
    practiceEvalScore: '局面評価値',
    practiceCandidateMove: '候補手',
    practiceBestMove: '最善手',
    practiceBothSidesDesc: '白・黒どちらの手番でも、AIが上位5つの有力候補手を矢印と順位バッジ（1〜5）で常時ガイドします。',
    positionEvaluationTitle: '勝率の目安',
    whiteWinningChances: '白の勝率',
    drawChances: '引き分け',
    blackWinningChances: '黒の勝率',
    whiteIsWinning: '白が勝勢（勝ち濃厚）',
    whiteClearlyBetter: '白が優勢',
    whiteSlightlyBetter: '白がやや有利',
    gameIsEqual: '形勢互角',
    blackSlightlyBetter: '黒がやや有利',
    blackClearlyBetter: '黒が優勢',
    blackIsWinning: '黒が勝勢（勝ち濃厚）',
    mateInMovesWhite: '白の {n} 手詰め',
    mateInMovesBlack: '黒の {n} 手詰め',
    mateForcedCheckmate: '強制チェックメイト（詰み）',
    showEngineScore: 'エンジンの詳細値を表示',
    hideEngineScore: '詳細値を隠す',
    engineScoreDetails: 'AIエンジン評価値',
    diffVeryEasy: '超初級',
    diffVeryEasyDesc: 'ミスが多く最も勝ちやすいレベル',
    diffEasy: '初級',
    diffEasyDesc: '手加減あり・気軽に楽しめる初級レベル',
    diffMedium: '中級',
    diffMediumDesc: 'バランスの取れた堅実な戦術派',
    diffHard: '上級',
    diffHardDesc: '積極的な攻めと鋭い戦術派',
    diffExpert: '超級',
    diffExpertDesc: '激しい攻めと鋭い読みの超級レベル',
    diffMaster: '達人級',
    diffMasterDesc: '堅実な定跡と粘り強い終盤戦',
    diffGrandmaster: '偉人級',
    diffGrandmasterDesc: '深層の精密な読みと鋭い指し手',
    diffTranscendent: '超越級',
    diffTranscendentDesc: '最高峰の妙手と終盤の極み',
    diffLegendary: '伝説級',
    diffLegendaryDesc: 'チェスエンジンの最強手',
    diffBeginner: '初級',
    diffBeginnerDesc: '手加減あり・気軽に楽しめる初級レベル',
    diffIntermediate: '中級',
    diffIntermediateDesc: 'バランスの取れた堅実な戦術派',
    diffAdvanced: '上級',
    diffAdvancedDesc: '積極的な攻めと鋭い戦術派',
    difficultyLabel: 'AI難易度',
    sideWhite: '⚪ 先手（白）',
    sideBlack: '⚫ 後手（黒）',
    sideRandom: '🎲 ランダム',
    sideChoiceLabel: '手番（色）の選択',
    undo: '待った',
    undoTooltip: '一手戻します',
    redo: '進む',
    redoTooltip: '取り消した手を一手進めます',
    restart: 'リスタート',
    restartTooltip: '対局を初手からやり直します',
    resign: '投了',
    resignTooltip: '投了して対局を終了します',
    hint: 'ヒント',
    hintTooltip: 'Stockfishが導く最善手を表示します',
    flip: '盤面反転',
    flipTooltip: '視点を白/黒切り替えます',
    rotatePieces: '駒回転',
    rotatePiecesTooltip: '手番交代時に駒の向きを180度自動回転',
    settings: '設定',
    newGame: '新規対局',
    timeUnlimited: '時間無制限',
    time10Min: '10分',
    time5Min: '5分',
    time3Min: '3分',
    time1Min: '1分',
    timeLabel: '持ち時間',
    turnWhite: '白の手番 (先手)',
    turnBlack: '黒の手番 (後手)',
    thinking: 'AI思考中...',
    check: '王手！',
    checkmate: 'チェックメイト',
    stalemate: 'ステイルメイト',
    timeout: '時間切れ',
    resignation: '投了',
    draw: '引き分け',
    currentTurnLabel: '現在の手番',
    checkStatusLabel: '王手判定',
    evalLabel: '局面評価',
    whiteAdvantage: '白優勢',
    blackAdvantage: '黒優勢',
    evenPosition: '互角',
    none: 'なし',
    youLabel: 'あなた',
    computerLabel: 'AI',
    whitePlayer: '先手（白）',
    blackPlayer: '後手（黒）',
    handTurnBadge: '手番',
    resignConfirmTitle: '投了の確認',
    resignConfirmBody: '本当に投了しますか？この対局はあなたの負けとなります。',
    resignAction: '投了する',
    restartConfirmTitle: '対局やり直しの確認',
    restartConfirmBody: '現在の対局を破棄して、最初からやり直しますか？',
    confirmYes: 'はい',
    confirmCancel: 'キャンセル',
    gameOverTitle: '対局終了',
    winPlayer: '🎉 おめでとうございます！あなたの勝利です！',
    winAi: 'AIの勝利です。次回リベンジしましょう！',
    winWhite: '先手（白）の勝利です！',
    winBlack: '後手（黒）の勝利です！',
    drawGame: '引き分けです。ナイスファイト！',
    playAgain: 'もう一度対局する',
    reviewBoard: '盤面を確認する',
    totalMovesLabel: '総手数',
    outcomeReasonLabel: '決着理由',
    movesUnit: '手',
    settingsTitle: '対局設定',
    darkModeLabel: 'ダークモード',
    darkModeDesc: '画面を落ち着いた暗色テーマに切り替え',
    soundLabel: '着手効果音',
    soundDesc: '駒の移動や捕獲時にサウンドを再生',
    coordinatesLabel: '座標表示 (a-h / 1-8)',
    coordinatesDesc: 'マスの番地を表示してわかりやすくします',
    themeLabel: '盤面テーマ',
    close: '閉じる',
    moveHistoryTitle: '棋譜（着手履歴）',
    noMovesYet: '対局を開始してください',
    gameInfoTitle: '対局情報',
    startGameCta: '対局を開始する',

    // Online match translations
    onlineTitle: '友達対戦',
    onlineIntro: '招待URLをコピーするか、QRコードで友達を招待できます。',
    onlineIntroWaiting: '招待URLを相手に共有してください。相手が参加すると自動で対局が始まります。',
    onlineCopyInvite: '招待URLをコピー',
    onlineCopied: 'コピー完了！',
    onlineQrInvite: 'QRコードで招待',
    onlineHostSideLabel: '招待側の手番',
    onlineTcLabel: '持ち時間',
    onlineStatusWaiting: '相手の参加を待っています',
    onlineStatusJoining: '対局に参加しています…',
    onlineStatusConnecting: '接続中…',
    onlineStatusPlaying: '対局中',
    onlineStatusReconnecting: '再接続を待っています…',
    onlineGuideTitle: '友達対戦の遊び方',
    onlineGuideStep1: '「招待URLをコピー」またはQRコードで、友達に招待を送ります。',
    onlineGuideStep2: '友達がURLを開くと、確認なしでそのまま対局が始まります。',
    onlineGuideStep3: '通信が切れても再接続して同じ盤面の続きから指せます。',
    onlineQrTitle: '招待用QRコード',
    onlineQrDesc: '相手にこのQRコードを読み取ってもらうと、そのまま対局が始まります。',
    onlineResignTitle: '投了しますか？',
    onlineResignDesc: 'この対局はあなたの負けになります。',
    onlineResignConfirm: '投了する',
    onlineResignCancel: 'キャンセル',
    onlineNotYourTurn: 'いまは相手の番です',
    onlineMatchStarted: '🎯 対局開始！ あなたは{side}',
    onlineYou: 'あなた',
    onlineOpponent: '相手',
    onlineYourTurn: 'あなたの番',
    onlineOpponentTurn: '相手の番',
    onlineVictory: '勝利！',
    onlineDefeat: '敗北',
    onlineTcNone: '時間制限なし',
    onlineTcSuddenDeath: '切れ負け',
    onlineTcIncrement: 'インクリメント',
    onlineTcIncrementDesc: '1手ごとに増える',
    onlineOpponentDisconnected: '相手の通信が切断されました',
    onlineWaitingReconnect: '再接続を待機中（残り {seconds} 秒）',
    onlineDisconnectWarning: '15秒以内に再接続されない場合、あなたの不戦勝となります',
    onlineSelfDisconnectedTitle: '通信が切断されました',
    onlineSelfDisconnectedDesc: '15秒以内に再接続してください。再接続されない場合、不戦敗となります',
    onlineOpponentReconnected: '相手が再接続しました！ 対局を再開します',
    onlineWonByDisconnect: '相手の通信が切断されたため、不戦勝となりました',
    onlineLostByDisconnect: '通信が切断されたため、不戦敗となりました',
    onlineDisconnectReason: '通信切断（不戦勝）',
    onlineRematch: '再戦',
    onlineOfferRematch: '再戦を申し込む',
    onlineAcceptRematch: '再戦を受ける',
    onlineDeclineRematch: '辞退する',
    onlineCancelRematch: '申し込みをキャンセル',
    onlineWaitingRematch: '再戦を申し込みました。相手の返答を待っています…',
    onlineOpponentOfferedRematch: '相手から再戦の申し込みが届きました！',
    onlineRematchStarting: '再戦を開始します…',
    onlineRematchDeclined: '相手が再戦を辞退しました',
    onlineCreateNewRoom: '新しい部屋を作成',
    onlineRematchStarted: '🎯 再戦開始！ あなたは{side}',
    onlineCannotRematchOffline: '相手がオフラインのため再戦できません',
    onlineOpponentLeftCannotRematch: '対戦相手が退室したため、再戦できません。',
  },
  en: {
    appTitle: 'Chess Web',
    appSubtitle: 'Play Chess Online vs AI & 2-Player',
    modeAi: 'Play AI',
    modeAiDesc: 'Challenge Stockfish',
    modePvp: '2-Player',
    modePvpDesc: 'Pass & Play locally',
    modeOnline: 'Online',
    modeOnlineDesc: 'Play with a friend',
    modePractice: 'Practice',
    modePracticeDesc: 'AI suggests Top 5 moves for both sides',
    modeLearn: 'Learn',
    modeLearnDesc: 'Rules & piece guides',

    // Practice Mode
    practiceHeader: 'Practice Mode',
    practiceTopMovesTitle: 'AI Top 5 Suggestions',
    practiceWhiteTurn: '⚪ White to Move',
    practiceBlackTurn: '⚫ Black to Move',
    practiceClickToPlay: 'Click to play move',
    practiceShowArrows: 'Show Arrows',
    practiceHideArrows: 'Hide Arrows',
    practiceAutoAiReply: 'AI Auto-Reply',
    practiceManualBoth: 'Free Both Sides',
    practiceWithAi: 'Practice with AI',
    practiceAnalyzing: 'AI Analyzing...',
    practiceFlip: 'Flip Board',
    practiceReset: 'Reset to Start',
    practiceEvalScore: 'Position Evaluation',
    practiceCandidateMove: 'Candidate',
    practiceBestMove: 'Best Move',
    practiceBothSidesDesc: 'Stockfish analyzes the board continuously, displaying top 5 engine recommendations for both White and Black with numbered arrow badges (1-5).',
    positionEvaluationTitle: 'Win Chance (approx)',
    whiteWinningChances: "White's winning chances",
    drawChances: 'Draw chances',
    blackWinningChances: "Black's winning chances",
    whiteIsWinning: 'White is winning',
    whiteClearlyBetter: 'White is clearly better',
    whiteSlightlyBetter: 'White is slightly better',
    gameIsEqual: 'Even position',
    blackSlightlyBetter: 'Black is slightly better',
    blackClearlyBetter: 'Black is clearly better',
    blackIsWinning: 'Black is winning',
    mateInMovesWhite: 'White has mate in {n} moves',
    mateInMovesBlack: 'Black has mate in {n} moves',
    mateForcedCheckmate: 'Forced Checkmate',
    showEngineScore: 'Show engine score',
    hideEngineScore: 'Hide engine score',
    engineScoreDetails: 'Engine Evaluation',
    diffVeryEasy: 'Very Easy',
    diffVeryEasyDesc: 'Very weak, best for beginners to practice',
    diffEasy: 'Easy',
    diffEasyDesc: 'Casual play with occasional mistakes',
    diffMedium: 'Medium',
    diffMediumDesc: 'Balanced tactical play & solid defense',
    diffHard: 'Hard',
    diffHardDesc: 'Aggressive attacks & tactical pressure',
    diffExpert: 'Expert',
    diffExpertDesc: 'Fiery attacks and sharp tactical play',
    diffMaster: 'Master',
    diffMasterDesc: 'Solid positional mastery & deep endgames',
    diffGrandmaster: 'Grandmaster',
    diffGrandmasterDesc: 'Deep precision & sharp calculation',
    diffTranscendent: 'Transcendent',
    diffTranscendentDesc: 'World-class endgame mastery & technique',
    diffLegendary: 'Legendary',
    diffLegendaryDesc: 'Maximum engine strength - top moves',
    diffBeginner: 'Easy',
    diffBeginnerDesc: 'Casual play with occasional mistakes',
    diffIntermediate: 'Medium',
    diffIntermediateDesc: 'Balanced tactical play & solid defense',
    diffAdvanced: 'Hard',
    diffAdvancedDesc: 'Aggressive attacks & tactical pressure',
    difficultyLabel: 'AI Difficulty',
    sideWhite: '⚪ White',
    sideBlack: '⚫ Black',
    sideRandom: '🎲 Random',
    sideChoiceLabel: 'Choose Your Side',
    undo: 'Undo',
    undoTooltip: 'Take back the last turn',
    redo: 'Redo',
    redoTooltip: 'Redo the last undone move',
    restart: 'Restart',
    restartTooltip: 'Restart this match from the beginning',
    resign: 'Resign',
    resignTooltip: 'Resign and concede the game',
    hint: 'Hint',
    hintTooltip: 'Show Stockfish recommended best move',
    flip: 'Flip',
    flipTooltip: 'Flip board orientation',
    rotatePieces: 'Rotate Pieces',
    rotatePiecesTooltip: 'Rotate pieces 180° on turn change',
    settings: 'Settings',
    newGame: 'New Game',
    timeUnlimited: 'Unlimited',
    time10Min: '10 Min',
    time5Min: '5 Min',
    time3Min: '3 Min',
    time1Min: '1 Min',
    timeLabel: 'Time Control',
    turnWhite: "White's Turn",
    turnBlack: "Black's Turn",
    thinking: 'AI Thinking...',
    check: 'Check!',
    checkmate: 'Checkmate',
    stalemate: 'Stalemate',
    timeout: 'Time Out',
    resignation: 'Resignation',
    draw: 'Draw',
    currentTurnLabel: 'Current Turn',
    checkStatusLabel: 'Check Status',
    evalLabel: 'Position Eval',
    whiteAdvantage: 'White Advantage',
    blackAdvantage: 'Black Advantage',
    evenPosition: 'Equal',
    none: 'None',
    youLabel: 'You',
    computerLabel: 'Computer',
    whitePlayer: 'White',
    blackPlayer: 'Black',
    handTurnBadge: 'Turn',
    resignConfirmTitle: 'Confirm Resignation',
    resignConfirmBody: 'Are you sure you want to resign? This match will be counted as a loss.',
    resignAction: 'Resign Game',
    restartConfirmTitle: 'Restart Match',
    restartConfirmBody: 'Reset the current board and start over?',
    confirmYes: 'Yes',
    confirmCancel: 'Cancel',
    gameOverTitle: 'Game Over',
    winPlayer: '🎉 Congratulations! You won!',
    winAi: 'AI wins the match. Better luck next time!',
    winWhite: 'White wins the game!',
    winBlack: 'Black wins the game!',
    drawGame: 'Game drawn! Great effort!',
    playAgain: 'Play Again',
    reviewBoard: 'Review Board',
    totalMovesLabel: 'Total Moves',
    outcomeReasonLabel: 'Result Reason',
    movesUnit: 'moves',
    settingsTitle: 'Game Settings',
    darkModeLabel: 'Dark Mode',
    darkModeDesc: 'Toggle sleek high-contrast dark theme',
    soundLabel: 'Move Sound Effects',
    soundDesc: 'Play audio on moves, captures, and checks',
    coordinatesLabel: 'Board Coordinates (a-h / 1-8)',
    coordinatesDesc: 'Show board coordinate labels along edges',
    themeLabel: 'Board Theme',
    close: 'Close',
    moveHistoryTitle: 'Move History',
    noMovesYet: 'Start playing to record moves',
    gameInfoTitle: 'Game Information',
    startGameCta: 'Start Game',

    // Online match translations
    onlineTitle: 'Play with Friend',
    onlineIntro: 'Invite a friend by copying the link or scanning the QR code.',
    onlineIntroWaiting: 'Share the invite URL with your opponent. The game begins as soon as they join.',
    onlineCopyInvite: 'Copy Invite Link',
    onlineCopied: 'Copied!',
    onlineQrInvite: 'QR Code Invite',
    onlineHostSideLabel: 'I play as',
    onlineTcLabel: 'Time Control',
    onlineStatusWaiting: 'Waiting for opponent to join',
    onlineStatusJoining: 'Joining match…',
    onlineStatusConnecting: 'Connecting…',
    onlineStatusPlaying: 'Match in Progress',
    onlineStatusReconnecting: 'Waiting for reconnect…',
    onlineGuideTitle: 'How to Play Online',
    onlineGuideStep1: 'Send an invitation to your friend via "Copy Invite Link" or QR code.',
    onlineGuideStep2: 'When your friend opens the URL, the match starts automatically with no setup required.',
    onlineGuideStep3: 'If disconnected, simply reconnect to resume from the current board position.',
    onlineQrTitle: 'Invite QR Code',
    onlineQrDesc: 'Have your opponent scan this QR code to join the game directly.',
    onlineResignTitle: 'Resign Match?',
    onlineResignDesc: 'This match will be recorded as a loss.',
    onlineResignConfirm: 'Resign',
    onlineResignCancel: 'Cancel',
    onlineNotYourTurn: "It is currently your opponent's turn",
    onlineMatchStarted: '🎯 Match started! You play {side}',
    onlineYou: 'You',
    onlineOpponent: 'Opponent',
    onlineYourTurn: 'Your turn',
    onlineOpponentTurn: "Opponent's turn",
    onlineVictory: 'Victory!',
    onlineDefeat: 'Defeat',
    onlineTcNone: 'No time limit',
    onlineTcSuddenDeath: 'Sudden Death',
    onlineTcIncrement: 'Increment',
    onlineTcIncrementDesc: '+ per move',
    onlineOpponentDisconnected: 'Opponent Disconnected',
    onlineWaitingReconnect: 'Waiting for opponent to reconnect ({seconds}s left)',
    onlineDisconnectWarning: 'You will win by forfeit if opponent does not reconnect within 15 seconds.',
    onlineSelfDisconnectedTitle: 'Connection Lost',
    onlineSelfDisconnectedDesc: 'Please reconnect within 15 seconds to avoid forfeiting.',
    onlineOpponentReconnected: 'Opponent reconnected! Game resumed.',
    onlineWonByDisconnect: 'Opponent disconnected. You won by abandonment.',
    onlineLostByDisconnect: 'Lost by disconnection (abandonment).',
    onlineDisconnectReason: 'Abandonment',
    onlineRematch: 'Rematch',
    onlineOfferRematch: 'Offer Rematch',
    onlineAcceptRematch: 'Accept Rematch',
    onlineDeclineRematch: 'Decline',
    onlineCancelRematch: 'Cancel Offer',
    onlineWaitingRematch: 'Rematch offered. Waiting for opponent…',
    onlineOpponentOfferedRematch: 'Opponent offered a rematch!',
    onlineRematchStarting: 'Starting rematch…',
    onlineRematchDeclined: 'Opponent declined rematch offer.',
    onlineCreateNewRoom: 'Create New Room',
    onlineRematchStarted: '🎯 Rematch started! You play {side}',
    onlineCannotRematchOffline: 'Cannot rematch: opponent is offline',
    onlineOpponentLeftCannotRematch: 'Your opponent has left the game and is no longer available for a rematch.',
  },
};

export function getGameTranslations(lang: 'ja' | 'en' = 'ja'): GameTranslations {
  return GAME_TRANSLATIONS[lang] || GAME_TRANSLATIONS.ja;
}
