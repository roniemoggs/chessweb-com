// Japanese terminology and texts for チェスweb.com (100% natural Japanese chess terminology)

export const JA_TEXTS = {
  appTitle: 'チェス web',
  appSubtitle: 'オンラインチェス対戦・AI対局',
  tagline: '初心者から上級者まで、ブラウザですぐに遊べる日本向けチェス',
  
  // Game modes
  modeAi: 'AI対戦',
  modeAiDesc: 'コンピュータと腕試し',
  modePvp: '2人対戦',
  modePvpDesc: '1台の端末で対局',
  
  // Difficulty levels
  diffVeryEasy: '超初級',
  diffVeryEasyDesc: 'ミスが多く最も勝ちやすいレベル (Lv.1)',
  diffEasy: '初級',
  diffEasyDesc: '手加減あり・気軽に楽しめる初級レベル (Lv.2)',
  diffMedium: '中級',
  diffMediumDesc: 'バランスの取れた堅実な戦術派 (Lv.3)',
  diffHard: '上級',
  diffHardDesc: '積極的な攻めと鋭い戦術派 (Lv.4)',
  diffExpert: '超級',
  diffExpertDesc: '激しい攻めと鋭い読みの超級レベル (Lv.5)',
  diffMaster: '達人級',
  diffMasterDesc: '堅実な定跡と粘り強い終盤戦 (Lv.6)',
  diffGrandmaster: '偉人級',
  diffGrandmasterDesc: '深層の精密な読みと鋭い指し手 (Lv.7)',
  diffTranscendent: '超越級',
  diffTranscendentDesc: '最高峰の妙手と終盤の極み (Lv.8)',
  diffLegendary: '伝説級',
  diffLegendaryDesc: 'チェスエンジンの最強手 (Lv.9)',
  
  // Player sides
  sideWhite: '先手（白）',
  sideBlack: '後手（黒）',
  sideRandom: 'ランダム',
  
  // Game controls
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
  
  // Time controls
  timeUnlimited: '無制限',
  time10Min: '10分',
  time3Min: '3分 (早指し)',
  time1Min: '1分 (超早指し)',
  
  // Board states
  turnWhite: '白の手番',
  turnBlack: '黒の手番',
  thinking: '考え中...',
  check: '王手！',
  checkmate: 'チェックメイト！',
  stalemate: 'ステイルメイト（引き分け）',
  drawInsufficient: '戦力不足（引き分け）',
  drawThreefold: '同形反復（引き分け）',
  draw50Moves: '50手ルール（引き分け）',
  timeout: '時間切れ',
  
  // Modals & Messages
  resignConfirmTitle: '投了の確認',
  resignConfirmBody: '本当に投了しますか？この対局はあなたの負けとなります。',
  restartConfirmTitle: '対局やり直しの確認',
  restartConfirmBody: '現在の対局を破棄して、最初からやり直しますか？',
  confirmYes: 'はい',
  confirmCancel: 'キャンセル',
  
  // Game over modal
  gameOverTitle: '対局終了',
  winPlayer: '🎉 おめでとうございます！あなたの勝利です！',
  winAi: 'AIの勝利です。次回リベンジしましょう！',
  winWhite: '先手（白）の勝利です！',
  winBlack: '後手（黒）の勝利です！',
  drawGame: '引き分けです。ナイスファイト！',
  playAgain: 'もう一度対局する',
  reviewBoard: '盤面を確認する',
  
  // Settings modal
  settingsTitle: '対局設定',
  soundLabel: '着手効果音',
  soundDesc: '駒の移動や捕獲時にサウンドを再生',
  coordinatesLabel: '座標表示 (a-h / 1-8)',
  coordinatesDesc: 'マスの番地を表示してわかりやすくします',
  themeLabel: '盤面テーマ',
  close: '閉じる',
  
  // Move history
  moveHistoryTitle: '棋譜（着手履歴）',
  noMovesYet: '対局を開始してください',
  evalLabel: '評価値',
  evalWhiteAdvantage: '白優勢',
  evalBlackAdvantage: '黒優勢',
  evalEven: '互角',
};
