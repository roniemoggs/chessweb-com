import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard, type ChessboardOptions } from 'react-chessboard';
import type { PieceDropHandlerArgs, Arrow } from 'react-chessboard';
import { stockfishClient, type AIDifficulty } from '../../lib/stockfish-client';
import { playSound } from '../../lib/chess-sounds';
import { PlayerCard } from './PlayerCard';
import { GameControls } from './GameControls';
import { GameOverModal, type GameOverReason } from './GameOverModal';
import { SettingsModal } from './SettingsModal';
import { BOARD_THEMES } from './themes';
import { NewGameModal, type TimeControlOption } from './NewGameModal';
import { getGameTranslations } from './gameTranslations';
import { ChessPiece } from './ChessPiece';
import { PieceInfoModal, type PieceType } from './PieceInfoModal';
import { TimeControlInfoModal, type TimeControlTopic } from './TimeControlInfoModal';
import { Bot, Users, AlertCircle, Globe, BookOpen, Copy, Check, X, ChevronDown, Clock, Sparkles, RefreshCw } from 'lucide-react';
import {
  OnlineChessManager,
  type OnlinePhase,
  type HostSidePref,
  type OnlineTimeControlId,
  type OnlineRematchState,
  TIME_CONTROLS,
} from '../../lib/onlineChessManager';
import { OnlineCard } from './OnlineCard';
import {
  MatchmakingService,
  type QuickMatchTimeControl,
  type MatchData,
} from '../../lib/matchmakingService';
import { OnlineGuideModal } from './OnlineGuideModal';
import { OnlineQrModal } from './OnlineQrModal';
import { OnlineTimeControlModal } from './OnlineTimeControlModal';
import { OnlineResignModal } from './OnlineResignModal';
import { OnlineBoardControls } from './OnlineBoardControls';
import { useLockBodyScroll } from './useLockBodyScroll';
import { PracticeArrowsOverlay, type PracticeMoveOverlayItem } from './PracticeArrowsOverlay';
import { PracticeModePanel } from './PracticeModePanel';

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function cloneGame(sourceGame: Chess): Chess {
  const cloned = new Chess();
  try {
    const pgn = sourceGame.pgn();
    if (pgn) {
      cloned.loadPgn(pgn);
      return cloned;
    }
  } catch (err) {
    console.error('Failed to clone chess game via PGN:', err);
  }
  return new Chess(sourceGame.fen());
}

interface ChessAppProps {
  lang?: 'ja' | 'en';
  initialMode?: 'ai' | 'pvp' | 'online' | 'practice';
}

export default function ChessApp({ lang = 'ja', initialMode = 'ai' }: ChessAppProps) {
  const t = useMemo(() => getGameTranslations(lang), [lang]);

  // Game state
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [gameFen, setGameFen] = useState<string>(() => new Chess().fen());
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<Array<Array<{ from: Square; to: Square; promotion?: string }>>>([]);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Match configuration
  const [gameMode, setGameMode] = useState<'ai' | 'pvp' | 'online' | 'practice'>(initialMode);
  const [practiceTopMoves, setPracticeTopMoves] = useState<PracticeMoveOverlayItem[]>([]);
  const [practiceDepth, setPracticeDepth] = useState<number>(0);
  const [isPracticeEvaluating, setIsPracticeEvaluating] = useState<boolean>(false);
  const [showPracticeArrows, setShowPracticeArrows] = useState<boolean>(true);
  const [hoveredPracticeMoveIndex, setHoveredPracticeMoveIndex] = useState<number | null>(null);
  const [practiceAutoReply, setPracticeAutoReply] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState<boolean>(false);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const [isCardTcDropdownOpen, setIsCardTcDropdownOpen] = useState<boolean>(false);
  const timeControlDropdownRef = useRef<HTMLDivElement>(null);
  const [playerSide, setPlayerSide] = useState<'w' | 'b'>('w');
  const [timeControl, setTimeControl] = useState<TimeControlOption>('unlimited');

  // Online Multiplayer State
  const onlineManagerRef = useRef<OnlineChessManager | null>(null);
  const [onlinePhase, setOnlinePhase] = useState<OnlinePhase>('idle');
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>('');
  const [onlineHostSidePref, setOnlineHostSidePref] = useState<HostSidePref>('white');
  const [onlineTcId, setOnlineTcId] = useState<OnlineTimeControlId>('none');
  const [onlineMySide, setOnlineMySide] = useState<'w' | 'b' | null>(null);
  const [onlineToastNotice, setOnlineToastNotice] = useState<string | null>(null);
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null);
  const [isSelfDisconnected, setIsSelfDisconnected] = useState<boolean>(false);
  const [onlineRematchState, setOnlineRematchState] = useState<OnlineRematchState>('none');
  const [onlineOpponentHasLeft, setOnlineOpponentHasLeft] = useState<boolean>(false);

  // Quick Match State
  const matchmakingServiceRef = useRef<MatchmakingService | null>(null);
  const [onlineSubTab, setOnlineSubTab] = useState<'quick' | 'friend'>('quick');
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState<boolean>(false);
  const [quickMatchElapsedSeconds, setQuickMatchElapsedSeconds] = useState<number>(0);
  const [quickMatchTc, setQuickMatchTc] = useState<QuickMatchTimeControl>('5+0');

  // Effective online side determination to avoid null/mismatched side logic
  const effectiveOnlineMySide: 'w' | 'b' = useMemo(() => {
    if (onlineMySide) return onlineMySide;
    const mgrSide = onlineManagerRef.current?.getMySide();
    if (mgrSide) return mgrSide;
    if (onlineManagerRef.current?.isUserHost()) {
      return onlineHostSidePref === 'black' ? 'b' : 'w';
    }
    return 'b';
  }, [onlineMySide, onlineHostSidePref]);

  // Synchronize state if manager has side but local state hasn't updated
  useEffect(() => {
    if (gameMode === 'online' && onlinePhase === 'playing') {
      const mgrSide = onlineManagerRef.current?.getMySide();
      if (mgrSide && onlineMySide !== mgrSide) {
        setOnlineMySide(mgrSide);
        setBoardOrientation(mgrSide === 'b' ? 'black' : 'white');
      }
    }
  }, [gameMode, onlinePhase, onlineMySide]);

  // Online Modals
  const [showOnlineGuideModal, setShowOnlineGuideModal] = useState<boolean>(false);
  const [showOnlineQrModal, setShowOnlineQrModal] = useState<boolean>(false);
  const [showOnlineTcModal, setShowOnlineTcModal] = useState<boolean>(false);
  const [showOnlineResignModal, setShowOnlineResignModal] = useState<boolean>(false);

  // Automatically close pre-match modals (like QR Code or Time Control) instantly once match is connected and playing
  useEffect(() => {
    if (onlinePhase === 'playing') {
      setShowOnlineQrModal(false);
      setShowOnlineTcModal(false);
      setShowOnlineGuideModal(false);
    }
  }, [onlinePhase]);

  // Timer states (in seconds)
  const [whiteTime, setWhiteTime] = useState<number | null>(null);
  const [blackTime, setBlackTime] = useState<number | null>(null);

  // Engine evaluation & hints
  const [scoreNumeric, setScoreNumeric] = useState<number>(0);
  const [evalStr, setEvalStr] = useState<string>('0.00');
  const [hintArrow, setHintArrow] = useState<Arrow | null>(null);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [currentTheme, setCurrentTheme] = useState<string>('emerald');
  const [rotatePieces, setRotatePieces] = useState<boolean>(initialMode === 'pvp');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showResignConfirm, setShowResignConfirm] = useState<boolean>(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState<boolean>(false);
  const gameOverModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearGameOverModalTimer = useCallback(() => {
    if (gameOverModalTimerRef.current) {
      clearTimeout(gameOverModalTimerRef.current);
      gameOverModalTimerRef.current = null;
    }
  }, []);

  // Cleanup pending game over modal timer on unmount
  useEffect(() => {
    return () => {
      clearGameOverModalTimer();
    };
  }, [clearGameOverModalTimer]);

  // Lock body scroll for inline confirm modals
  useLockBodyScroll(showRestartConfirm || showResignConfirm);

  // Click-to-move square selection & Help "?" icon state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [helpSquare, setHelpSquare] = useState<Square | null>(null);
  const [showPieceInfoModal, setShowPieceInfoModal] = useState<boolean>(false);
  const [infoModalPiece, setInfoModalPiece] = useState<PieceType>('p');
  const [infoModalTab, setInfoModalTab] = useState<'pieces' | 'rules'>('pieces');
  const [showTimeControlInfoModal, setShowTimeControlInfoModal] = useState<boolean>(false);
  const [timeControlInfoTopic, setTimeControlInfoTopic] = useState<TimeControlTopic>('sudden-death');

  // Game over state
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>('checkmate');

  // Check dark mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  // Listen for global open-chess-rules event (e.g. from Rules section button or navbar)
  useEffect(() => {
    const handleOpenRules = (e: Event) => {
      const customEvent = e as CustomEvent<{ piece?: PieceType; tab?: 'pieces' | 'rules' }>;
      if (customEvent.detail?.piece) {
        setInfoModalPiece(customEvent.detail.piece);
        setInfoModalTab('pieces');
      } else if (customEvent.detail?.tab) {
        setInfoModalTab(customEvent.detail.tab);
      }
      setShowPieceInfoModal(true);
    };
    window.addEventListener('open-chess-rules', handleOpenRules);
    return () => window.removeEventListener('open-chess-rules', handleOpenRules);
  }, []);

  const toggleDarkMode = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.toggle('dark');
      setIsDarkMode(isDark);
      try {
        localStorage.setItem('chess_theme_mode', isDark ? 'dark' : 'light');
      } catch (e) {}
    }
  }, []);

  // Active theme configuration
  const activeTheme = useMemo(() => {
    return BOARD_THEMES.find((item) => item.id === currentTheme) || BOARD_THEMES[0];
  }, [currentTheme]);

  // Compute captured pieces & material difference
  const { whiteCaptured, blackCaptured, whiteMaterialAdv, blackMaterialAdv } = useMemo(() => {
    const fullSet = ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'n', 'n', 'b', 'b', 'r', 'r', 'q'];
    const currentPiecesWhite: string[] = [];
    const currentPiecesBlack: string[] = [];

    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === 'w' && piece.type !== 'k') {
            currentPiecesWhite.push(piece.type);
          } else if (piece.color === 'b' && piece.type !== 'k') {
            currentPiecesBlack.push(piece.type);
          }
        }
      }
    }

    // Pieces captured BY White (lost by Black)
    const blackRemaining = [...currentPiecesBlack];
    const capturedBlack: string[] = [];
    for (const p of fullSet) {
      const idx = blackRemaining.indexOf(p);
      if (idx !== -1) {
        blackRemaining.splice(idx, 1);
      } else {
        capturedBlack.push(p);
      }
    }

    // Pieces captured BY Black (lost by White)
    const whiteRemaining = [...currentPiecesWhite];
    const capturedWhite: string[] = [];
    for (const p of fullSet) {
      const idx = whiteRemaining.indexOf(p);
      if (idx !== -1) {
        whiteRemaining.splice(idx, 1);
      } else {
        capturedWhite.push(p);
      }
    }

    let wScore = currentPiecesWhite.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);
    let bScore = currentPiecesBlack.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);

    return {
      whiteCaptured: capturedBlack,
      blackCaptured: capturedWhite,
      whiteMaterialAdv: Math.max(0, wScore - bScore),
      blackMaterialAdv: Math.max(0, bScore - wScore),
    };
  }, [gameFen]);

  // Check game over triggers
  const checkGameOverStatus = useCallback((currentGame: Chess) => {
    if (currentGame.isCheckmate()) {
      const winningColor = currentGame.turn() === 'w' ? 'b' : 'w';
      setWinner(winningColor);
      setGameOverReason('checkmate');
      setIsGameOver(true);
      setHintArrow(null);
      setSelectedSquare(null);
      setHelpSquare(null);
      playSound('checkmate', soundEnabled);

      if (gameMode === 'online') {
        onlineManagerRef.current?.setGameOver();
      }

      // Delay showing the game over modal card by 1.5s so the player can process the checkmate
      clearGameOverModalTimer();
      gameOverModalTimerRef.current = setTimeout(() => {
        setShowGameOverModal(true);
        gameOverModalTimerRef.current = null;
      }, 1500);
      return true;
    }

    if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition() || currentGame.isInsufficientMaterial()) {
      setWinner('draw');
      setGameOverReason(currentGame.isStalemate() ? 'stalemate' : 'draw');
      setIsGameOver(true);
      if (gameMode === 'online') {
        onlineManagerRef.current?.setGameOver();
      }
      setShowGameOverModal(true);
      playSound('reset', soundEnabled);
      return true;
    }

    return false;
  }, [soundEnabled, clearGameOverModalTimer, gameMode]);

  // Online Multiplayer Helpers
  const showOnlineToast = useCallback((msg: string, durationMs: number = 3000) => {
    setOnlineToastNotice(msg);
    setTimeout(() => {
      setOnlineToastNotice((curr) => (curr === msg ? null : curr));
    }, durationMs);
  }, []);

  const handleStartOnlineHost = useCallback(async (sidePref?: HostSidePref, tc?: OnlineTimeControlId, existingCode?: string) => {
    if (!onlineManagerRef.current) {
      onlineManagerRef.current = new OnlineChessManager();
    }
    const currentSidePref = sidePref || onlineHostSidePref;
    const currentTc = tc || onlineTcId;
    setOnlineOpponentHasLeft(false);
    setOnlineRematchState('none');
    const code = await onlineManagerRef.current.createRoom(currentSidePref, currentTc, existingCode);
    setOnlineRoomCode(code);
    setOnlinePhase('waiting');
    try {
      sessionStorage.setItem(`chess_online_session_${code}`, JSON.stringify({
        roomCode: code,
        isHost: true,
        hostSidePref: currentSidePref,
        tcId: currentTc,
      }));
    } catch (e) {}
  }, [onlineHostSidePref, onlineTcId]);

  const handleJoinOnlineRoom = useCallback(async (roomCode: string) => {
    if (!onlineManagerRef.current) {
      onlineManagerRef.current = new OnlineChessManager();
    }
    const clean = roomCode.trim().toUpperCase();
    setOnlineOpponentHasLeft(false);
    setOnlineRematchState('none');
    setOnlineRoomCode(clean);
    setOnlinePhase('joining');
    try {
      sessionStorage.setItem(`chess_online_session_${clean}`, JSON.stringify({
        roomCode: clean,
        isHost: false,
      }));
    } catch (e) {}
    await onlineManagerRef.current.joinRoom(clean);
  }, []);

  const handleHostSidePrefChange = useCallback((side: HostSidePref) => {
    setOnlineHostSidePref(side);
    if (onlineManagerRef.current && onlinePhase === 'waiting') {
      onlineManagerRef.current.updateSettings(side, onlineTcId);
    }
  }, [onlinePhase, onlineTcId]);

  const handleOnlineTcSelect = useCallback((tcId: OnlineTimeControlId) => {
    setOnlineTcId(tcId);
    if (onlineManagerRef.current && onlinePhase === 'waiting') {
      onlineManagerRef.current.updateSettings(onlineHostSidePref, tcId);
    }
  }, [onlinePhase, onlineHostSidePref]);

  const onlineInviteUrl = useMemo(() => {
    if (typeof window === 'undefined' || !onlineRoomCode) return '';
    const prefix = lang === 'en' ? '/en' : '';
    return `${window.location.origin}${prefix}/online?room=${onlineRoomCode}`;
  }, [onlineRoomCode, lang]);

  const handleCancelQuickMatch = useCallback(() => {
    matchmakingServiceRef.current?.cancelMatchmaking();
    setIsSearchingQuickMatch(false);
  }, []);

  const handleStartQuickMatch = useCallback(
    (selectedTc: QuickMatchTimeControl = '5+0') => {
      if (!matchmakingServiceRef.current && typeof window !== 'undefined') {
        matchmakingServiceRef.current = new MatchmakingService();
      }
      onlineManagerRef.current?.leaveRoom();
      setOnlineRoomCode('');
      setOnlinePhase('idle');
      setIsSearchingQuickMatch(true);
      setQuickMatchElapsedSeconds(0);
      setQuickMatchTc(selectedTc);

      matchmakingServiceRef.current?.startMatchmaking(selectedTc, {
        onWaiting: (elapsed) => {
          setQuickMatchElapsedSeconds(elapsed);
        },
        onMatched: async (matchData: MatchData) => {
          setIsSearchingQuickMatch(false);
          showOnlineToast(t.quickMatchFound, 4000);
          playSound('reset', soundEnabled);

          const mappedTc = matchData.timeControl as OnlineTimeControlId;
          setOnlineTcId(mappedTc);

          if (matchData.role === 'host') {
            const sidePref: HostSidePref = matchData.mySide === 'w' ? 'white' : 'black';
            await handleStartOnlineHost(sidePref, mappedTc, matchData.roomCode);
          } else {
            setOnlineMySide(matchData.mySide);
            setBoardOrientation(matchData.mySide === 'b' ? 'black' : 'white');
            setTimeout(async () => {
              await handleJoinOnlineRoom(matchData.roomCode);
            }, 700);
          }
        },
        onTimeout: () => {
          setIsSearchingQuickMatch(false);
          showOnlineToast(
            lang === 'ja'
              ? '待機中のプレイヤーが見つかりませんでした。再度探すか、友達招待をお試しください。'
              : 'No available opponent found yet. Try searching again or invite a friend!',
            6000
          );
        },
        onError: (err) => {
          setIsSearchingQuickMatch(false);
          showOnlineToast(err, 4000);
        },
        onCancelled: () => {
          setIsSearchingQuickMatch(false);
        },
      });
    },
    [handleStartOnlineHost, handleJoinOnlineRoom, showOnlineToast, t, soundEnabled, lang]
  );

  // Keep manager aware of latest game state for automatic reconnection sync
  useEffect(() => {
    if (onlineManagerRef.current) {
      onlineManagerRef.current.setGameStateGetter(() => ({
        fen: game.fen(),
        history: history,
        lastMove: lastMove,
        whiteTimeRemaining: whiteTime,
        blackTimeRemaining: blackTime,
      }));
    }
  }, [game, history, lastMove, whiteTime, blackTime]);

  // Setup Online Manager Event Listeners
  useEffect(() => {
    if (!onlineManagerRef.current) {
      onlineManagerRef.current = new OnlineChessManager();
    }

    onlineManagerRef.current.setEvents({
      onPhaseChange: (phase) => {
        setOnlinePhase(phase);
        if (phase === 'playing') {
          setShowOnlineQrModal(false);
          setShowOnlineGuideModal(false);
          setShowOnlineTcModal(false);
        }
      },
      onMatchStart: (mySide, tcId) => {
        setShowOnlineQrModal(false);
        setShowOnlineGuideModal(false);
        setShowOnlineTcModal(false);
        setShowGameOverModal(false);
        clearGameOverModalTimer();
        setOnlineRematchState('none');
        setOnlineOpponentHasLeft(false);

        setOnlineMySide(mySide);
        setBoardOrientation(mySide === 'b' ? 'black' : 'white');
        setDisconnectCountdown(null);

        const initSec = TIME_CONTROLS[tcId]?.initialSeconds || 0;
        setWhiteTime(initSec > 0 ? initSec : null);
        setBlackTime(initSec > 0 ? initSec : null);

        const freshGame = new Chess();
        setGame(freshGame);
        setGameFen(freshGame.fen());
        setHistory([]);
        setLastMove(null);
        setSelectedSquare(null);
        setHelpSquare(null);
        setIsGameOver(false);
        setWinner(null);

        const sideLabel = mySide === 'w'
          ? (lang === 'ja' ? '先手（白）' : 'White (1st)')
          : (lang === 'ja' ? '後手（黒）' : 'Black (2nd)');
        showOnlineToast(t.onlineMatchStarted.replace('{side}', sideLabel), 4000);
        playSound('reset', soundEnabled);
      },
      onMoveReceived: (moveData) => {
        setGame((currGame) => {
          try {
            const nextGame = cloneGame(currGame);
            const moveRes = nextGame.move({
              from: moveData.from as Square,
              to: moveData.to as Square,
              promotion: moveData.promotion || 'q',
            });
            if (moveRes) {
              setGameFen(nextGame.fen());
              setHistory(nextGame.history());
              setLastMove({ from: moveData.from as Square, to: moveData.to as Square });

              if (!nextGame.isCheckmate()) {
                if (moveRes.captured) {
                  playSound('capture', soundEnabled);
                } else if (nextGame.inCheck()) {
                  playSound('check', soundEnabled);
                } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
                  playSound('castle', soundEnabled);
                } else {
                  playSound('move', soundEnabled);
                }
              }

              checkGameOverStatus(nextGame);
            }
            return nextGame;
          } catch (e) {
            return currGame;
          }
        });

        if (moveData.whiteTimeRemaining !== undefined && moveData.whiteTimeRemaining !== null) {
          setWhiteTime(moveData.whiteTimeRemaining);
        }
        if (moveData.blackTimeRemaining !== undefined && moveData.blackTimeRemaining !== null) {
          setBlackTime(moveData.blackTimeRemaining);
        }
      },
      onOpponentDisconnected: (secondsRemaining) => {
        setDisconnectCountdown(secondsRemaining);
      },
      onOpponentReconnected: () => {
        setDisconnectCountdown(null);
        showOnlineToast(t.onlineOpponentReconnected, 4000);
        playSound('reset', soundEnabled);
      },
      onDisconnectCountdownTick: (secondsRemaining) => {
        setDisconnectCountdown(secondsRemaining);
      },
      onDisconnectForfeit: (winnerSide) => {
        setDisconnectCountdown(null);
        setIsGameOver(true);
        setWinner(winnerSide);
        setGameOverReason('abandonment');
        setShowGameOverModal(true);
        playSound('checkmate', soundEnabled);
      },
      onSelfConnectionState: (isOnline) => {
        setIsSelfDisconnected(!isOnline);
        if (!isOnline) {
          setDisconnectCountdown(15);
        } else {
          setDisconnectCountdown(null);
        }
      },
      onMatchSync: (syncData) => {
        setDisconnectCountdown(null);
        setOnlineMySide(syncData.mySide);
        setBoardOrientation(syncData.mySide === 'b' ? 'black' : 'white');
        setOnlineTcId(syncData.tcId);

        const freshGame = new Chess();
        if (syncData.history && syncData.history.length > 0) {
          for (const m of syncData.history) {
            try {
              freshGame.move(m);
            } catch (e) {
              break;
            }
          }
        } else if (syncData.fen) {
          try {
            freshGame.load(syncData.fen);
          } catch (e) {}
        }
        setGame(freshGame);
        setGameFen(freshGame.fen());
        setHistory(freshGame.history());
        if (syncData.lastMove) {
          setLastMove({
            from: syncData.lastMove.from as Square,
            to: syncData.lastMove.to as Square,
          });
        }
        if (syncData.whiteTimeRemaining !== undefined && syncData.whiteTimeRemaining !== null) {
          setWhiteTime(syncData.whiteTimeRemaining);
        }
        if (syncData.blackTimeRemaining !== undefined && syncData.blackTimeRemaining !== null) {
          setBlackTime(syncData.blackTimeRemaining);
        }
        showOnlineToast(t.onlineOpponentReconnected, 3500);
        playSound('reset', soundEnabled);
      },
      onOpponentResigned: (resignedSide) => {
        setDisconnectCountdown(null);
        setIsGameOver(true);
        setWinner(resignedSide === 'w' ? 'b' : 'w');
        setGameOverReason('resignation');
        setShowGameOverModal(true);
        playSound('checkmate', soundEnabled);
      },
      onOpponentTimeout: (timedOutSide) => {
        setDisconnectCountdown(null);
        setIsGameOver(true);
        setWinner(timedOutSide === 'w' ? 'b' : 'w');
        setGameOverReason('timeout');
        setShowGameOverModal(true);
        playSound('checkmate', soundEnabled);
      },
      onSettingsUpdated: (sidePref, tcId) => {
        setOnlineHostSidePref(sidePref);
        setOnlineTcId(tcId);
      },
      onRematchOfferReceived: () => {
        setOnlineRematchState('offered_by_opponent');
        showOnlineToast(t.onlineOpponentOfferedRematch, 5000);
        playSound('move', soundEnabled);
      },
      onRematchAccepted: () => {
        setOnlineRematchState('accepted');
      },
      onRematchDeclined: () => {
        setOnlineRematchState('none');
        showOnlineToast(t.onlineRematchDeclined, 4000);
      },
      onRematchCancelled: () => {
        setOnlineRematchState('none');
      },
      onRematchStateChange: (state) => {
        setOnlineRematchState(state);
      },
      onOpponentLeftRoom: () => {
        setOnlineOpponentHasLeft(true);
        setOnlineRematchState('none');
        showOnlineToast(t.onlineOpponentLeftCannotRematch, 5000);
      },
    });
  }, [lang, soundEnabled, t, checkGameOverStatus, showOnlineToast]);

  // Mount URL listener for ?room=... or initialMode === 'online'
  const hasInitializedOnlineRef = useRef<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined' || hasInitializedOnlineRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const modeParam = params.get('mode');

    if (roomParam) {
      const cleanRoom = roomParam.trim().toUpperCase();
      if (/^[A-Z0-9]{3,16}$/.test(cleanRoom)) {
        hasInitializedOnlineRef.current = true;
        setGameMode('online');
        let wasHost = false;
        try {
          const saved = sessionStorage.getItem(`chess_online_session_${cleanRoom}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.isHost) wasHost = true;
          }
        } catch (e) {}

        setOnlineSubTab('friend');
        if (wasHost) {
          handleStartOnlineHost(undefined, undefined, cleanRoom);
        } else {
          handleJoinOnlineRoom(cleanRoom);
        }
      }
    } else if (initialMode === 'online' || modeParam === 'online') {
      hasInitializedOnlineRef.current = true;
      setGameMode('online');
      setOnlineSubTab('quick');
      setOnlinePhase('idle');
    }
  }, [initialMode, handleJoinOnlineRoom, handleStartOnlineHost]);

  // Clean up any ongoing quick match search on unmount
  useEffect(() => {
    return () => {
      matchmakingServiceRef.current?.cancelMatchmaking();
    };
  }, []);

  // Clocks / Timers effect
  useEffect(() => {
    if (isGameOver) return;
    if (gameMode === 'online') {
      if (onlinePhase !== 'playing' || onlineTcId === 'none' || disconnectCountdown !== null) return;
    } else {
      if (timeControl === 'unlimited') return;
    }

    const timer = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            if (gameMode === 'online') {
              onlineManagerRef.current?.sendTimeout('w');
            }
            setWinner('b');
            setGameOverReason('timeout');
            setIsGameOver(true);
            setShowGameOverModal(true);
            playSound('checkmate', soundEnabled);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            if (gameMode === 'online') {
              onlineManagerRef.current?.sendTimeout('b');
            }
            setWinner('w');
            setGameOverReason('timeout');
            setIsGameOver(true);
            setShowGameOverModal(true);
            playSound('checkmate', soundEnabled);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameFen, isGameOver, gameMode, onlinePhase, onlineTcId, timeControl, soundEnabled, disconnectCountdown]);

  // AI Automatic Response Move Trigger
  useEffect(() => {
    if (gameMode !== 'ai' || isGameOver) return;
    const currentTurn = game.turn();

    if (currentTurn !== playerSide) {
      let isMounted = true;
      setIsAiThinking(true);

      const abortController = new AbortController();

      stockfishClient
        .getAIMove(game.fen(), difficulty, abortController.signal)
        .then((aiResult) => {
          if (!isMounted || !aiResult || !aiResult.uci) {
            setIsAiThinking(false);
            return;
          }

          const from = aiResult.uci.slice(0, 2) as Square;
          const to = aiResult.uci.slice(2, 4) as Square;
          const promotion = aiResult.uci[4] || 'q';

          try {
            const nextGame = cloneGame(game);
            const moveRes = nextGame.move({ from, to, promotion });

            if (moveRes) {
              setGame(nextGame);
              setGameFen(nextGame.fen());
              setHistory(nextGame.history());
              setHintArrow(null);
              setLastMove({ from, to });

              // Play appropriate sound
              if (!nextGame.isCheckmate()) {
                if (moveRes.captured) {
                  playSound('capture', soundEnabled);
                } else if (nextGame.inCheck()) {
                  playSound('check', soundEnabled);
                } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
                  playSound('castle', soundEnabled);
                } else {
                  playSound('move', soundEnabled);
                }
              }

              // Evaluate new position for bar
              stockfishClient.evaluate({ fen: nextGame.fen(), depth: 6, limit: 1 }).then((evalRes) => {
                if (evalRes && evalRes.positionEval) {
                  setScoreNumeric(evalRes.positionEval.numericScore);
                  setEvalStr(evalRes.positionEval.evalWhiteStr);
                }
              }).catch(() => {});

              checkGameOverStatus(nextGame);
            }
          } catch (e) {
            console.error('AI move execution error:', e);
          } finally {
            if (isMounted) setIsAiThinking(false);
          }
        })
        .catch((e) => {
          console.warn('AI getAIMove cancelled or failed:', e);
          if (isMounted) setIsAiThinking(false);
        });

      return () => {
        isMounted = false;
        abortController.abort();
      };
    }
  }, [game, gameFen, gameMode, playerSide, difficulty, isGameOver, soundEnabled, checkGameOverStatus]);

  // Execute move selected from Practice Mode overlay arrows or sidebar list
  const handleExecutePracticeMove = useCallback(
    (item: PracticeMoveOverlayItem) => {
      if (isGameOver) return;
      try {
        const nextGame = cloneGame(game);
        const moveRes = nextGame.move({
          from: item.from,
          to: item.to,
          promotion: item.promotion || 'q',
        });
        if (!moveRes) return;

        setGame(nextGame);
        setGameFen(nextGame.fen());
        setHistory(nextGame.history());
        setRedoStack([]);
        setHintArrow(null);
        setSelectedSquare(null);
        setHelpSquare(null);
        setLastMove({ from: item.from, to: item.to });

        if (!nextGame.isCheckmate()) {
          if (moveRes.captured) {
            playSound('capture', soundEnabled);
          } else if (nextGame.inCheck()) {
            playSound('check', soundEnabled);
          } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
            playSound('castle', soundEnabled);
          } else {
            playSound('move', soundEnabled);
          }
        }

        checkGameOverStatus(nextGame);
      } catch (e) {
        console.error('Failed to execute practice move:', e);
      }
    },
    [game, isGameOver, soundEnabled, checkGameOverStatus]
  );

  // Practice Mode Continuous Engine Evaluation (Top 5 moves for both sides)
  useEffect(() => {
    if (gameMode !== 'practice' || isGameOver) {
      setPracticeTopMoves([]);
      setPracticeDepth(0);
      setIsPracticeEvaluating(false);
      return;
    }

    let isMounted = true;
    setIsPracticeEvaluating(true);
    setPracticeTopMoves([]);
    setPracticeDepth(0);
    const abortController = new AbortController();

    const MIN_SUGGESTION_DEPTH = 10;

    const parseEngineMoves = (res: any): PracticeMoveOverlayItem[] => {
      if (!res || !res.best || res.best.length === 0) return [];
      return res.best.slice(0, 5).map((item: any, idx: number): PracticeMoveOverlayItem => {
        const from = item.move.slice(0, 2) as Square;
        const to = item.move.slice(2, 4) as Square;
        const promotion = item.move[4] || undefined;
        let san = item.move;
        try {
          const tempG = cloneGame(game);
          const m = tempG.move({ from, to, promotion: promotion || 'q' });
          if (m) san = m.san;
        } catch (e) {}

        return {
          rank: item.rank || idx + 1,
          move: item.move,
          from,
          to,
          san,
          evalStr: item.evalWhiteStr,
          promotion,
        };
      });
    };

    stockfishClient
      .evaluate({
        fen: gameFen,
        depth: 14,
        limit: 5,
        signal: abortController.signal,
        onProgress: (progressRes) => {
          if (!isMounted) return;
          const currentDepth = progressRes.depth || 0;
          setPracticeDepth(currentDepth);

          // Only render move arrows/suggestions once engine reaches minimum reliable depth (>= 10) or book
          if (progressRes.isBook || currentDepth >= MIN_SUGGESTION_DEPTH) {
            const moves = parseEngineMoves(progressRes);
            if (moves.length > 0) {
              setPracticeTopMoves(moves);
            }
            if (progressRes.positionEval) {
              setScoreNumeric(progressRes.positionEval.numericScore);
              setEvalStr(progressRes.positionEval.evalWhiteStr);
            }
          } else if (currentDepth >= 7 && progressRes.positionEval) {
            // Smoothly update evaluation as search progresses
            setScoreNumeric(progressRes.positionEval.numericScore);
            setEvalStr(progressRes.positionEval.evalWhiteStr);
          }
        },
      })
      .then((finalRes) => {
        if (!isMounted) return;
        const currentDepth = finalRes.depth || 14;
        setPracticeDepth(currentDepth);
        const moves = parseEngineMoves(finalRes);
        setPracticeTopMoves(moves);
        if (finalRes && finalRes.positionEval) {
          setScoreNumeric(finalRes.positionEval.numericScore);
          setEvalStr(finalRes.positionEval.evalWhiteStr);
        }

        // Auto-reply for Black if enabled
        if (practiceAutoReply && game.turn() === 'b' && moves.length > 0) {
          const topMove = moves[0];
          setTimeout(() => {
            if (isMounted && game.turn() === 'b') {
              handleExecutePracticeMove(topMove);
            }
          }, 600);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsPracticeEvaluating(false);
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [game, gameFen, gameMode, isGameOver, practiceAutoReply, handleExecutePracticeMove]);

  // Handle Piece Drop by human player
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (isGameOver || !targetSquare) return false;

      // In AI mode, restrict human from moving opponent's pieces
      if (gameMode === 'ai' && game.turn() !== playerSide) {
        return false;
      }

      // In online mode, restrict player to their turn and side
      if (gameMode === 'online') {
        if (onlinePhase !== 'playing') return false;
        if (game.turn() !== effectiveOnlineMySide) {
          showOnlineToast(t.onlineNotYourTurn);
          return false;
        }
      }

      try {
        const nextGame = cloneGame(game);
        const moveRes = nextGame.move({
          from: sourceSquare as Square,
          to: targetSquare as Square,
          promotion: 'q',
        });

        if (!moveRes) return false;

        setGame(nextGame);
        setGameFen(nextGame.fen());
        setHistory(nextGame.history());
        setRedoStack([]);
        setHintArrow(null);
        setLastMove({
          from: sourceSquare as Square,
          to: targetSquare as Square,
        });

        // Sound effects
        if (!nextGame.isCheckmate()) {
          if (moveRes.captured) {
            playSound('capture', soundEnabled);
          } else if (nextGame.inCheck()) {
            playSound('check', soundEnabled);
          } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
            playSound('castle', soundEnabled);
          } else {
            playSound('move', soundEnabled);
          }
        }


        // Online mode move broadcast & clocks
        if (gameMode === 'online') {
          const incSec = TIME_CONTROLS[onlineTcId]?.incrementSeconds || 0;
          let nextW = whiteTime;
          let nextB = blackTime;
          if (incSec > 0) {
            if (effectiveOnlineMySide === 'w' && nextW !== null) nextW += incSec;
            if (effectiveOnlineMySide === 'b' && nextB !== null) nextB += incSec;
            if (effectiveOnlineMySide === 'w') setWhiteTime(nextW);
            if (effectiveOnlineMySide === 'b') setBlackTime(nextB);
          }

          onlineManagerRef.current?.sendMove({
            from: sourceSquare as string,
            to: targetSquare as string,
            promotion: 'q',
            fen: nextGame.fen(),
            whiteTimeRemaining: nextW,
            blackTimeRemaining: nextB,
          });
        }

        // Quick evaluation for eval bar
        stockfishClient.evaluate({ fen: nextGame.fen(), depth: 6, limit: 1 }).then((evalRes) => {
          if (evalRes && evalRes.positionEval) {
            setScoreNumeric(evalRes.positionEval.numericScore);
            setEvalStr(evalRes.positionEval.evalWhiteStr);
          }
        }).catch(() => {});

        setSelectedSquare(null);
        setHelpSquare(null);
        checkGameOverStatus(nextGame);
        return true;
      } catch (err) {
        return false;
      }
    },
    [game, gameMode, playerSide, isGameOver, soundEnabled, checkGameOverStatus, onlinePhase, effectiveOnlineMySide, onlineTcId, whiteTime, blackTime, showOnlineToast, t]
  );

  // Square Click handler (tap-to-move for touch/mouse & Help "?" trigger)
  const onSquareClick = useCallback(
    ({ square }: { piece?: any; square: Square }): void => {
      const pieceOnSquare = game.get(square);

      if (isGameOver) {
        if (pieceOnSquare) {
          setHelpSquare((prev) => (prev === square ? null : square));
        } else {
          setHelpSquare(null);
        }
        return;
      }

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setHelpSquare(null);
          return;
        }

        // Online turn check
        if (gameMode === 'online') {
          if (onlinePhase !== 'playing') return;
          if (game.turn() !== effectiveOnlineMySide) {
            showOnlineToast(t.onlineNotYourTurn);
            return;
          }
        }

        try {
          const nextGame = cloneGame(game);
          const moveRes = nextGame.move({
            from: selectedSquare,
            to: square,
            promotion: 'q',
          });

          if (moveRes) {
            setGame(nextGame);
            setGameFen(nextGame.fen());
            setHistory(nextGame.history());
            setRedoStack([]);
            setHintArrow(null);
            setSelectedSquare(null);
            setHelpSquare(null);
            setLastMove({
              from: selectedSquare,
              to: square,
            });

            // Sound effects
            if (!nextGame.isCheckmate()) {
              if (moveRes.captured) {
                playSound('capture', soundEnabled);
              } else if (nextGame.inCheck()) {
                playSound('check', soundEnabled);
              } else if (moveRes.flags.includes('k') || moveRes.flags.includes('q')) {
                playSound('castle', soundEnabled);
              } else {
                playSound('move', soundEnabled);
              }
            }


            // Online mode move broadcast & clocks
            if (gameMode === 'online') {
              const incSec = TIME_CONTROLS[onlineTcId]?.incrementSeconds || 0;
              let nextW = whiteTime;
              let nextB = blackTime;
              if (incSec > 0) {
                if (effectiveOnlineMySide === 'w' && nextW !== null) nextW += incSec;
                if (effectiveOnlineMySide === 'b' && nextB !== null) nextB += incSec;
                if (effectiveOnlineMySide === 'w') setWhiteTime(nextW);
                if (effectiveOnlineMySide === 'b') setBlackTime(nextB);
              }

              onlineManagerRef.current?.sendMove({
                from: selectedSquare as string,
                to: square as string,
                promotion: 'q',
                fen: nextGame.fen(),
                whiteTimeRemaining: nextW,
                blackTimeRemaining: nextB,
              });
            }

            // Quick evaluation for eval bar
            stockfishClient.evaluate({ fen: nextGame.fen(), depth: 6, limit: 1 }).then((evalRes) => {
              if (evalRes && evalRes.positionEval) {
                setScoreNumeric(evalRes.positionEval.numericScore);
                setEvalStr(evalRes.positionEval.evalWhiteStr);
              }
            }).catch(() => {});

            checkGameOverStatus(nextGame);
            return;
          }
        } catch (e) {
          // Illegal move attempt
        }

        // If clicking another piece belonging to the active player, reselect it
        if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
          if (gameMode === 'online' && pieceOnSquare.color !== effectiveOnlineMySide) {
            // Cannot select opponent piece in online mode
            setSelectedSquare(null);
            setHelpSquare(square);
            return;
          }
          setSelectedSquare(square);
          setHelpSquare(square);
          return;
        }

        // If clicking an enemy piece that wasn't a valid capture, show help icon on that enemy piece
        if (pieceOnSquare) {
          setSelectedSquare(null);
          setHelpSquare(square);
          return;
        }

        setSelectedSquare(null);
        setHelpSquare(null);
        return;
      }

      // In AI mode, restrict move selection when it's AI's turn, but allow clicking any piece to inspect help
      if (gameMode === 'ai' && game.turn() !== playerSide) {
        if (pieceOnSquare) {
          setHelpSquare((prev) => (prev === square ? null : square));
        } else {
          setHelpSquare(null);
        }
        return;
      }

      // In Online mode, restrict move selection when it's opponent's turn
      if (gameMode === 'online' && game.turn() !== effectiveOnlineMySide) {
        if (pieceOnSquare) {
          setHelpSquare((prev) => (prev === square ? null : square));
        } else {
          setHelpSquare(null);
        }
        return;
      }

      // No piece currently selected
      if (pieceOnSquare) {
        setHelpSquare(square);
        if (pieceOnSquare.color === game.turn()) {
          if (gameMode === 'online' && pieceOnSquare.color !== effectiveOnlineMySide) {
            return;
          }
          setSelectedSquare(square);
        }
      } else {
        setHelpSquare(null);
      }
    },
    [game, isGameOver, gameMode, playerSide, selectedSquare, soundEnabled, checkGameOverStatus, onlinePhase, effectiveOnlineMySide, onlineTcId, whiteTime, blackTime, showOnlineToast, t]
  );

  // Compute square highlights for last move, selected piece & king check
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // 1. Subtle highlight for last move source and destination squares
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(245, 246, 130, 0.45)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(245, 246, 130, 0.45)',
      };
    }

    // 2. Valid moves cursor pointer
    if (selectedSquare) {
      const validMoves = game.moves({ square: selectedSquare, verbose: true });
      for (const m of validMoves) {
        styles[m.to] = {
          ...styles[m.to],
          cursor: 'pointer',
        };
      }
    }

    if (game.inCheck()) {
      const board = game.board();
      const turn = game.turn();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === turn) {
            const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
            styles[sq] = {
              boxShadow: 'inset 0 0 16px 4px rgba(239, 68, 68, 0.8)',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 80%)',
            };
          }
        }
      }
    }

    return styles;
  }, [lastMove, selectedSquare, game]);

  // Undo
  const handleUndo = useCallback(() => {
    if (isGameOver || isAiThinking) return;
    const nextGame = cloneGame(game);
    const batch: Array<{ from: Square; to: Square; promotion?: string }> = [];

    if (gameMode === 'ai') {
      if (nextGame.history().length >= 2) {
        const aiMove = nextGame.undo();
        const playerMove = nextGame.undo();
        if (playerMove && aiMove) {
          batch.push(
            { from: playerMove.from as Square, to: playerMove.to as Square, promotion: playerMove.promotion },
            { from: aiMove.from as Square, to: aiMove.to as Square, promotion: aiMove.promotion }
          );
        }
      } else if (nextGame.history().length === 1 && nextGame.turn() !== playerSide) {
        const aiMove = nextGame.undo();
        if (aiMove) {
          batch.push({ from: aiMove.from as Square, to: aiMove.to as Square, promotion: aiMove.promotion });
        }
      } else {
        return;
      }
    } else {
      if (nextGame.history().length >= 1) {
        const undone = nextGame.undo();
        if (undone) {
          batch.push({ from: undone.from as Square, to: undone.to as Square, promotion: undone.promotion });
        }
      } else {
        return;
      }
    }

    if (batch.length > 0) {
      setRedoStack((prev) => [...prev, batch]);
    }

    setGame(nextGame);
    setGameFen(nextGame.fen());
    setHistory(nextGame.history());
    setHintArrow(null);
    setSelectedSquare(null);
    setHelpSquare(null);
    const hist = nextGame.history({ verbose: true });
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove({ from: last.from as Square, to: last.to as Square });
    } else {
      setLastMove(null);
    }
    playSound('reset', soundEnabled);
  }, [game, gameMode, playerSide, isGameOver, isAiThinking, soundEnabled]);

  // Redo
  const handleRedo = useCallback(() => {
    if (isGameOver || isAiThinking || redoStack.length === 0) return;
    const nextRedoStack = [...redoStack];
    const batch = nextRedoStack.pop();
    if (!batch || batch.length === 0) return;

    const nextGame = cloneGame(game);
    let lastMoveRes: any = null;

    try {
      for (const m of batch) {
        lastMoveRes = nextGame.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
      }
    } catch (e) {
      console.error('Redo move execution error:', e);
      return;
    }

    if (!lastMoveRes) return;

    setGame(nextGame);
    setGameFen(nextGame.fen());
    setHistory(nextGame.history());
    setRedoStack(nextRedoStack);
    setHintArrow(null);
    setSelectedSquare(null);
    setHelpSquare(null);

    const hist = nextGame.history({ verbose: true });
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove({ from: last.from as Square, to: last.to as Square });
    } else {
      setLastMove(null);
    }

    if (lastMoveRes.captured) {
      playSound('capture', soundEnabled);
    } else if (nextGame.inCheck()) {
      playSound('check', soundEnabled);
    } else if (lastMoveRes.flags.includes('k') || lastMoveRes.flags.includes('q')) {
      playSound('castle', soundEnabled);
    } else {
      playSound('move', soundEnabled);
    }

    stockfishClient
      .evaluate({ fen: nextGame.fen(), depth: 6, limit: 1 })
      .then((evalRes) => {
        if (evalRes && evalRes.positionEval) {
          setScoreNumeric(evalRes.positionEval.numericScore);
          setEvalStr(evalRes.positionEval.evalWhiteStr);
        }
      })
      .catch(() => {});

    checkGameOverStatus(nextGame);
  }, [game, redoStack, isGameOver, isAiThinking, soundEnabled, checkGameOverStatus]);

  // Hint
  const handleHint = useCallback(() => {
    if (isGameOver || isHintLoading) return;
    setIsHintLoading(true);

    stockfishClient
      .evaluate({ fen: game.fen(), depth: 10, limit: 1 })
      .then((res) => {
        if (res && res.best && res.best.length > 0) {
          const best = res.best[0].move;
          if (best && best.length >= 4) {
            setHintArrow({
              startSquare: best.slice(0, 2),
              endSquare: best.slice(2, 4),
              color: 'rgb(245, 158, 11)',
            });
          }
        }
      })
      .catch((e) => console.warn('Hint evaluation failed:', e))
      .finally(() => setIsHintLoading(false));
  }, [game, isGameOver, isHintLoading]);

  // Restart / New Game configuration
  const startNewGame = useCallback(
    (config: {
      mode: 'ai' | 'pvp' | 'practice';
      difficulty: AIDifficulty;
      playerSide: 'w' | 'b' | 'random';
      timeControl: TimeControlOption;
    }) => {
      let chosenSide: 'w' | 'b' = 'w';
      if (config.playerSide === 'random') {
        chosenSide = Math.random() > 0.5 ? 'w' : 'b';
      } else {
        chosenSide = config.playerSide;
      }

      const freshGame = new Chess();
      setGame(freshGame);
      setGameFen(freshGame.fen());
      setHistory([]);
      setRedoStack([]);
      setBoardOrientation(chosenSide === 'b' && config.mode === 'ai' ? 'black' : 'white');
      setGameMode(config.mode);
      setDifficulty(config.difficulty);
      setPlayerSide(chosenSide);
      setTimeControl(config.timeControl);
      setRotatePieces(config.mode === 'pvp');

      // Timers reset
      let initSeconds: number | null = null;
      if (config.timeControl === '10min') initSeconds = 10 * 60;
      else if (config.timeControl === '5min') initSeconds = 5 * 60;
      else if (config.timeControl === '3min') initSeconds = 3 * 60;
      else if (config.timeControl === '1min') initSeconds = 1 * 60;

      setWhiteTime(initSeconds);
      setBlackTime(initSeconds);

      clearGameOverModalTimer();
      setIsGameOver(false);
      setWinner(null);
      setHintArrow(null);
      setSelectedSquare(null);
      setHelpSquare(null);
      setLastMove(null);
      setScoreNumeric(0);
      setEvalStr('0.00');
      setShowNewGameModal(false);
      setShowGameOverModal(false);
      setShowRestartConfirm(false);
      setShowResignConfirm(false);
      playSound('reset', soundEnabled);
    },
    [soundEnabled, clearGameOverModalTimer]
  );

  // Resign
  const handleResign = useCallback(() => {
    if (isGameOver) return;
    clearGameOverModalTimer();
    const opponent = playerSide === 'w' ? 'b' : 'w';
    setWinner(gameMode === 'ai' ? opponent : game.turn() === 'w' ? 'b' : 'w');
    setGameOverReason('resignation');
    setIsGameOver(true);
    setShowGameOverModal(true);
    setShowResignConfirm(false);
    playSound('reset', soundEnabled);
  }, [isGameOver, playerSide, gameMode, game, soundEnabled, clearGameOverModalTimer]);

  // Rotate pieces 180° when it's the top player's turn if piece rotation is enabled
  const isPiecesRotated =
    rotatePieces &&
    ((boardOrientation === 'white' && game.turn() === 'b') ||
     (boardOrientation === 'black' && game.turn() === 'w'));

  // Chessboard configuration options
  const chessboardOptions: ChessboardOptions = useMemo(() => {
    const renderPieceItem = (
      type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K',
      squareWidth?: number
    ) => (
      <div
        style={{
          width: squareWidth || '100%',
          height: squareWidth || '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isPiecesRotated ? 'rotate(180deg)' : 'rotate(0deg)',
          transformOrigin: '50% 50%',
          transition: 'transform 300ms ease-in-out',
          willChange: 'transform',
        }}
      >
        <ChessPiece type={type} />
      </div>
    );

    return {
      position: gameFen,
      onPieceDrop: onPieceDrop,
      onSquareClick: onSquareClick,
      onPieceClick: ({ square }) => {
        if (square) {
          onSquareClick({ square: square as Square });
        }
      },
      boardOrientation: boardOrientation,
      showNotation: showCoordinates,
      arrows: hintArrow ? [hintArrow] : [],
      darkSquareStyle: { backgroundColor: activeTheme.darkSquare },
      lightSquareStyle: { backgroundColor: activeTheme.lightSquare },
      squareStyles: customSquareStyles,
      customSquareStyles: customSquareStyles,
      boardStyle: {
        borderRadius: '16px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
      pieces: {
        wP: ({ squareWidth }) => renderPieceItem('P', squareWidth),
        wN: ({ squareWidth }) => renderPieceItem('N', squareWidth),
        wB: ({ squareWidth }) => renderPieceItem('B', squareWidth),
        wR: ({ squareWidth }) => renderPieceItem('R', squareWidth),
        wQ: ({ squareWidth }) => renderPieceItem('Q', squareWidth),
        wK: ({ squareWidth }) => renderPieceItem('K', squareWidth),
        bP: ({ squareWidth }) => renderPieceItem('p', squareWidth),
        bN: ({ squareWidth }) => renderPieceItem('n', squareWidth),
        bB: ({ squareWidth }) => renderPieceItem('b', squareWidth),
        bR: ({ squareWidth }) => renderPieceItem('r', squareWidth),
        bQ: ({ squareWidth }) => renderPieceItem('q', squareWidth),
        bK: ({ squareWidth }) => renderPieceItem('k', squareWidth),
      },
    };
  }, [
    gameFen,
    onPieceDrop,
    onSquareClick,
    boardOrientation,
    showCoordinates,
    hintArrow,
    activeTheme,
    customSquareStyles,
    isPiecesRotated,
  ]);

  // Difficulty helpers and outside click listener
  const getDifficultyLabel = useCallback(
    (diff: AIDifficulty) => {
      switch (diff) {
        case 'very-easy':
          return t.diffVeryEasy;
        case 'easy':
        case 'beginner':
          return t.diffEasy;
        case 'medium':
        case 'intermediate':
          return t.diffMedium;
        case 'hard':
        case 'advanced':
          return t.diffHard;
        case 'expert':
          return t.diffExpert;
        case 'master':
          return t.diffMaster;
        case 'grandmaster':
          return t.diffGrandmaster;
        case 'transcendent':
          return t.diffTranscendent;
        case 'legendary':
          return t.diffLegendary;
        default:
          return t.diffMedium;
      }
    },
    [t]
  );

  const difficultyOptions = useMemo<Array<{ id: AIDifficulty; label: string }>>(
    () => [
      { id: 'very-easy', label: t.diffVeryEasy },
      { id: 'easy', label: t.diffEasy },
      { id: 'medium', label: t.diffMedium },
      { id: 'hard', label: t.diffHard },
      { id: 'expert', label: t.diffExpert },
      { id: 'master', label: t.diffMaster },
      { id: 'grandmaster', label: t.diffGrandmaster },
      { id: 'transcendent', label: t.diffTranscendent },
      { id: 'legendary', label: t.diffLegendary },
    ],
    [t]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDifficultyDropdownOpen(false);
      }
      if (
        timeControlDropdownRef.current &&
        !timeControlDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCardTcDropdownOpen(false);
      }
    }
    if (isDifficultyDropdownOpen || isCardTcDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDifficultyDropdownOpen, isCardTcDropdownOpen]);

  // Top and Bottom Player determination based on boardOrientation
  const topColor: 'w' | 'b' = boardOrientation === 'white' ? 'b' : 'w';
  const bottomColor: 'w' | 'b' = boardOrientation === 'white' ? 'w' : 'b';

  const topIsAi = gameMode === 'ai' && topColor !== playerSide;
  const bottomIsAi = gameMode === 'ai' && bottomColor !== playerSide;

  const aiBotDisplayName = t.computerLabel;

  const topName = gameMode === 'online'
    ? (topColor === effectiveOnlineMySide ? t.onlineYou : t.onlineOpponent)
    : gameMode === 'ai'
    ? topIsAi
      ? aiBotDisplayName
      : t.youLabel
    : topColor === 'w' ? (lang === 'ja' ? '先手（白）' : 'Player 1 (White)') : (lang === 'ja' ? '後手（黒）' : 'Player 2 (Black)');

  const bottomName = gameMode === 'online'
    ? (bottomColor === effectiveOnlineMySide ? t.onlineYou : t.onlineOpponent)
    : gameMode === 'ai'
    ? bottomIsAi
      ? aiBotDisplayName
      : t.youLabel
    : bottomColor === 'w' ? (lang === 'ja' ? '先手（白）' : 'Player 1 (White)') : (lang === 'ja' ? '後手（黒）' : 'Player 2 (Black)');

  // Direct Mode Switcher handler (switches mode on same page without navigation)
  const handleModeSelect = useCallback(
    (mode: 'ai' | 'pvp' | 'online' | 'practice' | 'learn') => {
      if (mode === 'learn') {
        window.location.href = lang === 'ja' ? '/learn' : '/en/learn';
        return;
      }
      if (mode === 'online') {
        setGameMode('online');
        setIsAiThinking(false);
        setOnlineSubTab('quick');
        return;
      }
      if (mode === gameMode) return;
      clearGameOverModalTimer();
      setShowGameOverModal(false);

      if (mode === 'practice') {
        setGameMode('practice');
        setIsAiThinking(false);
        setBoardOrientation('white');
        setSelectedSquare(null);
        setHelpSquare(null);
        setLastMove(null);
        setRotatePieces(false);
        setShowPracticeArrows(true);

        // Reset to clean board for practice
        const freshGame = new Chess();
        setGame(freshGame);
        setGameFen(freshGame.fen());
        setHistory([]);
        setRedoStack([]);
        setHintArrow(null);
        setScoreNumeric(0);
        setEvalStr('0.00');
        setIsGameOver(false);
        setWinner(null);
        setWhiteTime(null);
        setBlackTime(null);
        playSound('reset', soundEnabled);
        return;
      }

      if (mode === 'pvp') {
        setGameMode('pvp');
        setIsAiThinking(false);
        setBoardOrientation('white');
        setSelectedSquare(null);
        setHelpSquare(null);
        setLastMove(null);
        setRotatePieces(true);

        // Reset to clean 2-player local match
        const freshGame = new Chess();
        setGame(freshGame);
        setGameFen(freshGame.fen());
        setHistory([]);
        setRedoStack([]);
        setHintArrow(null);
        setScoreNumeric(0);
        setEvalStr('0.00');
        setIsGameOver(false);
        setWinner(null);

        let initSeconds: number | null = null;
        if (timeControl === '10min') initSeconds = 10 * 60;
        else if (timeControl === '5min') initSeconds = 5 * 60;
        else if (timeControl === '3min') initSeconds = 3 * 60;
        else if (timeControl === '1min') initSeconds = 1 * 60;
        setWhiteTime(initSeconds);
        setBlackTime(initSeconds);
        playSound('reset', soundEnabled);
      } else if (mode === 'ai') {
        setGameMode('ai');
        setIsAiThinking(false);
        setBoardOrientation(playerSide === 'b' ? 'black' : 'white');
        setSelectedSquare(null);
        setHelpSquare(null);
        setLastMove(null);
        setRotatePieces(false);

        // Reset to clean AI match
        const freshGame = new Chess();
        setGame(freshGame);
        setGameFen(freshGame.fen());
        setHistory([]);
        setRedoStack([]);
        setHintArrow(null);
        setScoreNumeric(0);
        setEvalStr('0.00');
        setIsGameOver(false);
        setWinner(null);

        let initSeconds: number | null = null;
        if (timeControl === '10min') initSeconds = 10 * 60;
        else if (timeControl === '5min') initSeconds = 5 * 60;
        else if (timeControl === '3min') initSeconds = 3 * 60;
        else if (timeControl === '1min') initSeconds = 1 * 60;
        setWhiteTime(initSeconds);
        setBlackTime(initSeconds);
        playSound('reset', soundEnabled);
      }
    },
    [gameMode, playerSide, timeControl, soundEnabled, onlinePhase, handleStartOnlineHost, clearGameOverModalTimer]
  );

  const handleOnlineResignConfirm = useCallback(() => {
    setShowOnlineResignModal(false);
    if (effectiveOnlineMySide) {
      clearGameOverModalTimer();
      onlineManagerRef.current?.sendResign(effectiveOnlineMySide);
      setIsGameOver(true);
      setWinner(effectiveOnlineMySide === 'w' ? 'b' : 'w');
      setGameOverReason('resignation');
      setShowGameOverModal(true);
      playSound('checkmate', soundEnabled);
    }
  }, [effectiveOnlineMySide, soundEnabled, clearGameOverModalTimer]);

  const handleOnlineOfferRematch = useCallback(() => {
    if (onlineOpponentHasLeft || onlineManagerRef.current?.hasOpponentLeft()) {
      setOnlineOpponentHasLeft(true);
      showOnlineToast(t.onlineOpponentLeftCannotRematch, 5000);
      return;
    }
    if (onlineManagerRef.current?.isDisconnectGraceActive() || disconnectCountdown !== null || !onlineManagerRef.current?.isOpponentAvailableForRematch()) {
      showOnlineToast(t.onlineCannotRematchOffline);
      return;
    }
    const res = onlineManagerRef.current?.offerRematch();
    if (res && !res.success) {
      if (res.reason === 'left') {
        setOnlineOpponentHasLeft(true);
        showOnlineToast(t.onlineOpponentLeftCannotRematch, 5000);
      } else {
        showOnlineToast(t.onlineCannotRematchOffline);
      }
    }
  }, [onlineOpponentHasLeft, disconnectCountdown, showOnlineToast, t.onlineCannotRematchOffline, t.onlineOpponentLeftCannotRematch]);

  const handleOnlineAcceptRematch = useCallback(() => {
    if (onlineOpponentHasLeft || onlineManagerRef.current?.hasOpponentLeft()) {
      setOnlineOpponentHasLeft(true);
      showOnlineToast(t.onlineOpponentLeftCannotRematch, 5000);
      return;
    }
    if (onlineManagerRef.current?.isDisconnectGraceActive() || disconnectCountdown !== null || !onlineManagerRef.current?.isOpponentAvailableForRematch()) {
      showOnlineToast(t.onlineCannotRematchOffline);
      return;
    }
    const res = onlineManagerRef.current?.acceptRematch();
    if (res && !res.success) {
      if (res.reason === 'left') {
        setOnlineOpponentHasLeft(true);
        showOnlineToast(t.onlineOpponentLeftCannotRematch, 5000);
      } else {
        showOnlineToast(t.onlineCannotRematchOffline);
      }
    }
  }, [onlineOpponentHasLeft, disconnectCountdown, showOnlineToast, t.onlineCannotRematchOffline, t.onlineOpponentLeftCannotRematch]);

  const handleOnlineDeclineRematch = useCallback(() => {
    onlineManagerRef.current?.declineRematch();
  }, []);

  const handleOnlineCancelRematch = useCallback(() => {
    onlineManagerRef.current?.cancelRematch();
  }, []);

  const handleOnlineNewGame = useCallback(async () => {
    onlineManagerRef.current?.leaveRoom();
    setOnlineOpponentHasLeft(false);
    clearGameOverModalTimer();
    setIsGameOver(false);
    setWinner(null);
    setDisconnectCountdown(null);
    setShowGameOverModal(false);
    setOnlineMySide(null);
    setOnlineRematchState('none');
    setBoardOrientation('white');
    try {
      if (onlineRoomCode) {
        sessionStorage.removeItem(`chess_online_session_${onlineRoomCode}`);
      }
    } catch (e) {}
    const freshGame = new Chess();
    setGame(freshGame);
    setGameFen(freshGame.fen());
    setHistory([]);
    setLastMove(null);
    setSelectedSquare(null);
    setHelpSquare(null);
    await handleStartOnlineHost();
  }, [handleStartOnlineHost, clearGameOverModalTimer, onlineRoomCode]);

  const handlePlayAgain = useCallback(() => {
    clearGameOverModalTimer();
    if (gameMode === 'online') {
      handleOnlineOfferRematch();
    } else {
      setShowGameOverModal(false);
      startNewGame({
        mode: gameMode,
        difficulty,
        playerSide,
        timeControl,
      });
    }
  }, [gameMode, difficulty, playerSide, timeControl, handleOnlineOfferRematch, startNewGame, clearGameOverModalTimer]);

  const difficultyDropdownNode = (
    <div className="relative z-50 inline-flex items-center gap-1.5 sm:gap-2" ref={difficultyDropdownRef}>
      <span className="hidden sm:inline text-sm sm:text-base font-serif font-bold text-[#3f3f46] dark:text-[#e4e4e7] select-none tracking-tight">
        {lang === 'ja' ? '難易度:' : 'Difficulty:'}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsDifficultyDropdownOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isDifficultyDropdownOpen}
        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-[#18181b] hover:bg-[#fafaf9] dark:hover:bg-[#27272a] border border-[#d4d4d8] dark:border-[#3f3f46] hover:border-[#a1a1aa] dark:hover:border-[#71717a] text-[#18181b] dark:text-[#fafafa] text-xs sm:text-base font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
        title={lang === 'ja' ? '難易度を選択' : 'Select difficulty'}
      >
        <span className="font-serif sm:font-sans">{getDifficultyLabel(difficulty)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#71717a] dark:text-[#a1a1aa] transition-transform duration-200 ${
            isDifficultyDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isDifficultyDropdownOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 overflow-y-auto rounded-2xl bg-white dark:bg-[#18181b] border border-[#d4d4d8] dark:border-[#3f3f46] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 text-xs font-bold text-[#71717a] dark:text-[#a1a1aa] border-b border-[#e4e4e7] dark:border-[#27272a] mb-1">
            {t.difficultyLabel}
          </div>
          {difficultyOptions.map((item) => {
            const isSelected =
              difficulty === item.id ||
              (item.id === 'medium' && difficulty === 'intermediate') ||
              (item.id === 'easy' && difficulty === 'beginner') ||
              (item.id === 'hard' && difficulty === 'advanced');
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDifficulty(item.id);
                  setIsDifficultyDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/25'
                    : 'text-[#18181b] dark:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 text-center text-sm font-bold ${
                      isSelected ? 'text-amber-600 dark:text-amber-400' : 'opacity-0'
                    }`}
                  >
                    ✓
                  </span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const handleSetTimeControl = useCallback(
    (newTc: TimeControlOption) => {
      setTimeControl(newTc);
      let initSeconds: number | null = null;
      if (newTc === '10min') initSeconds = 10 * 60;
      else if (newTc === '5min') initSeconds = 5 * 60;
      else if (newTc === '3min') initSeconds = 3 * 60;
      else if (newTc === '1min') initSeconds = 1 * 60;

      setWhiteTime(initSeconds);
      setBlackTime(initSeconds);

      if (isGameOver && gameOverReason === 'timeout') {
        setIsGameOver(false);
        setWinner(null);
      }
    },
    [isGameOver, gameOverReason]
  );

  const getTimeControlLabel = useCallback(
    (tc: TimeControlOption) => {
      switch (tc) {
        case '10min':
          return t.time10Min;
        case '5min':
          return t.time5Min;
        case '3min':
          return t.time3Min;
        case '1min':
          return t.time1Min;
        case 'unlimited':
        default:
          return t.timeUnlimited;
      }
    },
    [t]
  );

  const timeControlOptions = useMemo<Array<{ id: TimeControlOption; label: string; desc: string }>>(
    () => [
      { id: 'unlimited', label: t.timeUnlimited, desc: lang === 'ja' ? '制限時間なし（デフォルト）' : 'No time limit (Default)' },
      { id: '10min', label: t.time10Min, desc: lang === 'ja' ? '早指し（各10分）' : 'Rapid (10 min each)' },
      { id: '5min', label: t.time5Min, desc: lang === 'ja' ? 'ブリッツ（各5分）' : 'Blitz (5 min each)' },
      { id: '3min', label: t.time3Min, desc: lang === 'ja' ? 'ブリッツ（各3分）' : 'Blitz (3 min each)' },
      { id: '1min', label: t.time1Min, desc: lang === 'ja' ? 'ブレット（各1分・超早指し）' : 'Bullet (1 min each)' },
    ],
    [t, lang]
  );

  const timeControlDropdownNode = (
    <div className="relative z-50 inline-flex items-center gap-1.5 sm:gap-2" ref={timeControlDropdownRef}>
      <span className="hidden sm:inline text-xs sm:text-base font-serif font-bold text-[#3f3f46] dark:text-[#e4e4e7] select-none tracking-tight">
        {lang === 'ja' ? '持ち時間:' : 'Time:'}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsCardTcDropdownOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isCardTcDropdownOpen}
        className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-[#18181b] hover:bg-[#fafaf9] dark:hover:bg-[#27272a] border border-[#d4d4d8] dark:border-[#3f3f46] hover:border-[#a1a1aa] dark:hover:border-[#71717a] text-[#18181b] dark:text-[#fafafa] text-xs sm:text-base font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
        title={lang === 'ja' ? '対局の持ち時間を設定・変更' : 'Change time control'}
      >
        <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="font-mono text-xs sm:text-sm">{getTimeControlLabel(timeControl)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa] transition-transform duration-200 ${
            isCardTcDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isCardTcDropdownOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 sm:w-64 overflow-y-auto rounded-2xl bg-white dark:bg-[#18181b] border border-[#d4d4d8] dark:border-[#3f3f46] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-[#71717a] dark:text-[#a1a1aa] border-b border-[#e4e4e7] dark:border-[#27272a] mb-1 flex items-center justify-between">
            <span>{t.timeLabel}</span>
            <span className="font-normal text-[10px] text-[#a1a1aa] dark:text-[#71717a]">
              {timeControl === 'unlimited' ? (lang === 'ja' ? '無制限' : 'Unlimited') : (lang === 'ja' ? '切れ負け' : 'Sudden Death')}
            </span>
          </div>
          {timeControlOptions.map((item) => {
            const isSelected = timeControl === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetTimeControl(item.id);
                  setIsCardTcDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/25'
                    : 'text-[#18181b] dark:text-[#f4f4f5] hover:bg-[#f4f4f5] dark:hover:bg-[#27272a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 text-center text-xs font-bold ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-0'
                    }`}
                  >
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] font-normal leading-tight">
                      {item.desc}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Top Banner / Mode Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 flex-wrap">
        {/* Mode Selector Segmented Group */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#f4f4f5] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
          {/* Play AI (Default) */}
          <button
            type="button"
            onClick={() => handleModeSelect('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              gameMode === 'ai'
                ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-xs'
                : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t.modeAi}</span>
          </button>

          {/* 2-Player */}
          <button
            type="button"
            onClick={() => handleModeSelect('pvp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              gameMode === 'pvp'
                ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-xs'
                : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.modePvp}</span>
          </button>

          {/* Online */}
          <button
            type="button"
            onClick={() => handleModeSelect('online')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              gameMode === 'online'
                ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-xs'
                : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.modeOnline}</span>
          </button>

          {/* Practice Mode */}
          <button
            type="button"
            onClick={() => handleModeSelect('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              gameMode === 'practice'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#71717a] hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.modePractice}</span>
          </button>

          {/* Learn */}
          <a
            href={lang === 'ja' ? '/learn' : '/en/learn'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed] transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.modeLearn}</span>
          </a>
        </div>

        {/* Right Info: Online Mode Time Indicator (if active) */}
        {gameMode === 'online' && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1.5 rounded-full bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] text-[#8f8f8f] dark:text-[#71717a] text-xs font-mono">
              {lang === 'ja' ? TIME_CONTROLS[onlineTcId]?.nameJa : TIME_CONTROLS[onlineTcId]?.nameEn}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area: Online Match Setup Card vs Board */}
      {gameMode === 'online' && (onlinePhase === 'idle' || onlinePhase === 'waiting' || onlinePhase === 'joining') ? (
        <OnlineCard
          phase={onlinePhase}
          roomCode={onlineRoomCode}
          inviteUrl={onlineInviteUrl}
          hostSidePref={onlineHostSidePref}
          timeControl={onlineTcId}
          isHost={onlineManagerRef.current ? onlineManagerRef.current.isUserHost() : true}
          onSidePrefChange={handleHostSidePrefChange}
          onOpenTimeControl={() => setShowOnlineTcModal(true)}
          onOpenGuide={() => setShowOnlineGuideModal(true)}
          onOpenQr={() => setShowOnlineQrModal(true)}
          t={t}
          lang={lang}
          activeTab={onlineSubTab}
          onTabChange={(tab) => {
            setOnlineSubTab(tab);
            if (tab === 'friend' && !onlineRoomCode) {
              handleStartOnlineHost();
            }
          }}
          isSearchingQuickMatch={isSearchingQuickMatch}
          quickMatchElapsedSeconds={quickMatchElapsedSeconds}
          quickMatchTc={quickMatchTc}
          onStartQuickMatch={handleStartQuickMatch}
          onCancelQuickMatch={handleCancelQuickMatch}
          onPlayAiWhileWaiting={() => handleModeSelect('ai')}
        />
      ) : (
        /* Main Game Layout: Grid of Board and Side Panel */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left: Board & Controls Container */}
          <div className="flex flex-col items-center w-full max-w-[540px] mx-auto space-y-3">
            {/* Top Player Card */}
            <div className="relative z-30 w-full">
              <PlayerCard
                name={topName}
                isAi={topIsAi}
                color={topColor}
                isCurrentTurn={game.turn() === topColor && !isGameOver}
                timeLeftSeconds={topColor === 'w' ? whiteTime : blackTime}
                capturedPieces={topColor === 'w' ? whiteCaptured : blackCaptured}
                materialDifference={topColor === 'w' ? whiteMaterialAdv : blackMaterialAdv}
                isThinking={topIsAi && isAiThinking}
                isCheck={game.turn() === topColor && game.inCheck() && !game.isCheckmate() && !(isGameOver && gameOverReason === 'checkmate')}
                isCheckmate={game.turn() === topColor && (game.isCheckmate() || (isGameOver && gameOverReason === 'checkmate'))}
                isDisconnected={gameMode === 'online' && onlinePhase === 'playing' && disconnectCountdown !== null && topColor !== effectiveOnlineMySide}
                disconnectCountdown={disconnectCountdown}
                difficultySelector={topIsAi ? difficultyDropdownNode : undefined}
                timeControlSelector={
                  gameMode === 'pvp'
                    ? timeControlDropdownNode
                    : gameMode === 'ai' && !topIsAi
                    ? timeControlDropdownNode
                    : undefined
                }
                lang={lang}
                onOpenTimeControlInfo={() => {
                  if (gameMode === 'online') {
                    setTimeControlInfoTopic(onlineTcId === 'none' ? 'none' : onlineTcId.includes('+') && !onlineTcId.endsWith('+0') ? 'increment' : 'sudden-death');
                  } else {
                    setTimeControlInfoTopic(timeControl === 'unlimited' ? 'none' : 'sudden-death');
                  }
                  setShowTimeControlInfoModal(true);
                }}
              />
            </div>

            {/* Center: Chessboard Area */}
            <div className="relative z-10 w-full aspect-square rounded-2xl overflow-hidden bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-sm">
              <Chessboard options={chessboardOptions} />

              {/* Practice Mode Arrows & Badges Overlay */}
              {gameMode === 'practice' && showPracticeArrows && practiceTopMoves.length > 0 && (
                <PracticeArrowsOverlay
                  moves={practiceTopMoves}
                  boardOrientation={boardOrientation}
                  hoveredIndex={hoveredPracticeMoveIndex}
                  onHoverMove={setHoveredPracticeMoveIndex}
                  onMoveClick={handleExecutePracticeMove}
                />
              )}

              {/* Floating Online Toast Notice */}
              {onlineToastNotice && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-[#171717]/95 dark:bg-white/95 text-white dark:text-[#171717] backdrop-blur-md text-xs font-semibold shadow-lg border border-white/10 dark:border-black/10 animate-in fade-in zoom-in-95 duration-200 pointer-events-none select-none text-center whitespace-nowrap">
                  {onlineToastNotice}
                </div>
              )}

              {/* Interactive Rematch Offer Banner when reviewing board */}
              {gameMode === 'online' && !showGameOverModal && isGameOver && onlineRematchState === 'offered_by_opponent' && !onlineOpponentHasLeft && (
                <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-6 z-40 mx-auto max-w-md rounded-2xl bg-white/95 dark:bg-[#18181b]/95 border-2 border-emerald-500/80 dark:border-emerald-400/80 backdrop-blur-md p-3 sm:p-3.5 shadow-2xl text-center select-none animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 text-left">
                      <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-[#171717] dark:text-white truncate">
                        {t.onlineOpponentOfferedRematch}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleOnlineAcceptRematch}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        {t.onlineAcceptRematch}
                      </button>
                      <button
                        type="button"
                        onClick={handleOnlineDeclineRematch}
                        title={t.onlineDeclineRematch}
                        className="p-1.5 rounded-full border border-rose-200 dark:border-rose-900 bg-white dark:bg-[#18181b] text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs transition-all cursor-pointer active:scale-95"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 15-Second Grace Period Disconnection Banner */}
              {gameMode === 'online' && onlinePhase === 'playing' && disconnectCountdown !== null && (
                <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-6 z-40 mx-auto max-w-md rounded-2xl bg-white/95 dark:bg-[#18181b]/95 border-2 border-amber-500/70 dark:border-amber-400/70 backdrop-blur-md p-3.5 sm:p-4 shadow-2xl text-center select-none animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm text-[#171717] dark:text-white truncate">
                        {isSelfDisconnected ? t.onlineSelfDisconnectedTitle : t.onlineOpponentDisconnected}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white font-mono font-extrabold text-xs shadow-xs shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{disconnectCountdown}s</span>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#52525b] dark:text-[#a1a1aa] leading-relaxed text-left sm:text-center">
                    {isSelfDisconnected ? t.onlineSelfDisconnectedDesc : t.onlineDisconnectWarning}
                  </p>
                  {/* Visual countdown progress bar */}
                  <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, (disconnectCountdown / 15) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

            {/* AI Thinking subtle overlay badge */}
            {isAiThinking && (
              <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{t.thinking}</span>
              </div>
            )}

            {/* Selected Square Highlight Overlay */}
            {selectedSquare && (() => {
              const col =
                boardOrientation === 'white'
                  ? selectedSquare.charCodeAt(0) - 97
                  : 7 - (selectedSquare.charCodeAt(0) - 97);
              const row =
                boardOrientation === 'white'
                  ? 8 - parseInt(selectedSquare[1], 10)
                  : parseInt(selectedSquare[1], 10) - 1;

              return (
                <div
                  className="absolute z-10 pointer-events-none bg-black/15 dark:bg-white/20 ring-2 ring-inset ring-black/30 dark:ring-white/40 transition-all duration-150"
                  style={{
                    left: `${col * 12.5}%`,
                    top: `${row * 12.5}%`,
                    width: '12.5%',
                    height: '12.5%',
                  }}
                />
              );
            })()}

            {/* Legal Move Destination Dots & Capture Rings Overlay */}
            {selectedSquare && (() => {
              const validMoves = game.moves({ square: selectedSquare, verbose: true });
              return validMoves.map((m) => {
                const targetSq = m.to;
                const col =
                  boardOrientation === 'white'
                    ? targetSq.charCodeAt(0) - 97
                    : 7 - (targetSq.charCodeAt(0) - 97);
                const row =
                  boardOrientation === 'white'
                    ? 8 - parseInt(targetSq[1], 10)
                    : parseInt(targetSq[1], 10) - 1;
                const isCapture = Boolean(m.captured) || m.flags.includes('e');

                return (
                  <div
                    key={`legal-dot-${targetSq}`}
                    className="absolute z-15 pointer-events-none flex items-center justify-center transition-all duration-150"
                    style={{
                      left: `${col * 12.5}%`,
                      top: `${row * 12.5}%`,
                      width: '12.5%',
                      height: '12.5%',
                    }}
                  >
                    {isCapture ? (
                      <div className="w-[84%] h-[84%] rounded-full border-4 sm:border-[5px] border-black/35 dark:border-white/35" />
                    ) : (
                      <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-black/30 dark:bg-black/45 shadow-xs" />
                    )}
                  </div>
                );
              });
            })()}

            {/* Help "?" icon near clicked piece */}
            {helpSquare && game.get(helpSquare) && (() => {
              const p = game.get(helpSquare)!;
              const col =
                boardOrientation === 'white'
                  ? helpSquare.charCodeAt(0) - 97
                  : 7 - (helpSquare.charCodeAt(0) - 97);
              const row =
                boardOrientation === 'white'
                  ? 8 - parseInt(helpSquare[1], 10)
                  : parseInt(helpSquare[1], 10) - 1;

              return (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-150"
                  style={{
                    left: `${col * 12.5}%`,
                    top: `${row * 12.5}%`,
                    width: '12.5%',
                    height: '12.5%',
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setInfoModalPiece(p.type.toLowerCase() as PieceType);
                      setInfoModalTab('pieces');
                      setShowPieceInfoModal(true);
                    }}
                    aria-label={lang === 'ja' ? '駒の動かし方・ルールを見る' : 'View piece movement & rules'}
                    className="pointer-events-auto absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full bg-[#8c6239] hover:bg-[#a07142] active:scale-95 text-white border-2 border-white/90 shadow-md flex items-center justify-center font-bold text-xs sm:text-sm cursor-pointer select-none transition-transform hover:scale-110 animate-in zoom-in-75 duration-150"
                    title={lang === 'ja' ? '駒の動かし方・ルールを見る' : 'How this piece moves and strategies'}
                  >
                    ?
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Bottom Player Card */}
          <PlayerCard
            name={bottomName}
            isAi={bottomIsAi}
            color={bottomColor}
            isCurrentTurn={game.turn() === bottomColor && !isGameOver}
            timeLeftSeconds={bottomColor === 'w' ? whiteTime : blackTime}
            capturedPieces={bottomColor === 'w' ? whiteCaptured : blackCaptured}
            materialDifference={bottomColor === 'w' ? whiteMaterialAdv : blackMaterialAdv}
            isThinking={bottomIsAi && isAiThinking}
            isCheck={game.turn() === bottomColor && game.inCheck() && !game.isCheckmate() && !(isGameOver && gameOverReason === 'checkmate')}
            isCheckmate={game.turn() === bottomColor && (game.isCheckmate() || (isGameOver && gameOverReason === 'checkmate'))}
            isDisconnected={gameMode === 'online' && onlinePhase === 'playing' && disconnectCountdown !== null && (bottomColor !== effectiveOnlineMySide || (isSelfDisconnected && bottomColor === effectiveOnlineMySide))}
            disconnectCountdown={disconnectCountdown}
            difficultySelector={bottomIsAi ? difficultyDropdownNode : undefined}
            timeControlSelector={
              gameMode === 'ai' && !bottomIsAi
                ? timeControlDropdownNode
                : undefined
            }
            lang={lang}
            onOpenTimeControlInfo={() => {
              if (gameMode === 'online') {
                setTimeControlInfoTopic(onlineTcId === 'none' ? 'none' : onlineTcId.includes('+') && !onlineTcId.endsWith('+0') ? 'increment' : 'sudden-death');
              } else {
                setTimeControlInfoTopic(timeControl === 'unlimited' ? 'none' : 'sudden-death');
              }
              setShowTimeControlInfoModal(true);
            }}
          />

          {/* Controls: Online controls or standard GameControls */}
          {gameMode === 'online' ? (
            <OnlineBoardControls
              onFlip={() => setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
              onResign={() => setShowOnlineResignModal(true)}
              onNewGame={handleOnlineNewGame}
              isGameOver={isGameOver}
              t={t}
              onlineRematchState={onlineRematchState}
              isOpponentDisconnected={onlineManagerRef.current?.isDisconnectGraceActive() || disconnectCountdown !== null}
              opponentHasLeft={onlineOpponentHasLeft || onlineManagerRef.current?.hasOpponentLeft()}
              onOfferRematch={handleOnlineOfferRematch}
              onAcceptRematch={handleOnlineAcceptRematch}
              onDeclineRematch={handleOnlineDeclineRematch}
              onCancelRematch={handleOnlineCancelRematch}
            />
          ) : (
            <GameControls
              t={t}
              canUndo={history.length > 0 && !isAiThinking}
              canRedo={redoStack.length > 0 && !isAiThinking}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onHint={handleHint}
              isHintLoading={isHintLoading}
              onFlip={() => setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
              rotatePieces={rotatePieces}
              onToggleRotatePieces={() => setRotatePieces((prev) => !prev)}
              onRestart={() => setShowRestartConfirm(true)}
              onResign={() => setShowResignConfirm(true)}
              onOpenSettings={() => setShowSettingsModal(true)}
              isGameOver={isGameOver}
            />
          )}
        </div>

        {/* Right / Side Panel: Move History & Match Information / Practice Mode Panel */}
        <div className="w-full flex flex-col gap-4">
          {gameMode === 'practice' ? (
            <PracticeModePanel
              t={t}
              lang={lang}
              turn={game.turn()}
              isGameOver={isGameOver}
              scoreNumeric={scoreNumeric}
              evalStr={evalStr}
              isEvaluating={isPracticeEvaluating}
              depth={practiceDepth}
              moves={practiceTopMoves}
              hoveredIndex={hoveredPracticeMoveIndex}
              showArrows={showPracticeArrows}
              autoAiReply={practiceAutoReply}
              isStartingPosition={history.length === 0}
              fen={game.fen()}
              onHoverMove={setHoveredPracticeMoveIndex}
              onMoveClick={handleExecutePracticeMove}
              onToggleArrows={() => setShowPracticeArrows((prev) => !prev)}
              onToggleAutoReply={() => setPracticeAutoReply((prev) => !prev)}
              onLoadOpening={(moveList) => {
                const fresh = new Chess();
                let lastM: { from: Square; to: Square } | null = null;
                for (const m of moveList) {
                  try {
                    const res = fresh.move(m);
                    if (res) {
                      lastM = { from: res.from as Square, to: res.to as Square };
                    }
                  } catch (e) {
                    console.error('Failed to play opening move', m, e);
                    break;
                  }
                }
                setGame(fresh);
                setGameFen(fresh.fen());
                setHistory(fresh.history());
                setRedoStack([]);
                setLastMove(lastM);
                setSelectedSquare(null);
                setHelpSquare(null);
                playSound('move', soundEnabled);
              }}
            />
          ) : (
            /* Game Status Info Card */
            <div className="w-full bg-white dark:bg-[#121214] rounded-2xl border border-[#ebebeb] dark:border-[#27272a] p-4 shadow-xs space-y-3 select-none transition-colors">
              <h3 className="font-semibold text-xs sm:text-sm text-[#171717] dark:text-[#ededed]">{t.gameInfoTitle}</h3>

              <div className="space-y-2 text-xs text-[#4d4d4d] dark:text-[#a1a1aa]">
                <div className="flex items-center justify-between py-1 border-b border-[#f2f2f2] dark:border-[#27272a]">
                  <span className="text-[#8f8f8f] dark:text-[#71717a]">{t.timeLabel}</span>
                  <span className="font-semibold text-[#171717] dark:text-white flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    {gameMode === 'online'
                      ? (lang === 'ja' ? TIME_CONTROLS[onlineTcId]?.nameJa : TIME_CONTROLS[onlineTcId]?.nameEn)
                      : getTimeControlLabel(timeControl)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#f2f2f2] dark:border-[#27272a]">
                  <span className="text-[#8f8f8f] dark:text-[#71717a]">{t.currentTurnLabel}</span>
                  <span className="font-semibold text-[#171717] dark:text-white">
                    {isGameOver ? t.gameOverTitle : (game.turn() === 'w' ? t.turnWhite : t.turnBlack)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#f2f2f2] dark:border-[#27272a]">
                  <span className="text-[#8f8f8f] dark:text-[#71717a]">{t.checkStatusLabel}</span>
                  <span className={`font-semibold ${
                    (game.isCheckmate() || (isGameOver && gameOverReason === 'checkmate'))
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : game.inCheck()
                      ? 'text-rose-500 font-bold'
                      : 'text-[#8f8f8f] dark:text-[#71717a]'
                  }`}>
                    {(game.isCheckmate() || (isGameOver && gameOverReason === 'checkmate'))
                      ? t.checkmate
                      : game.inCheck()
                      ? t.check
                      : t.none}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#8f8f8f] dark:text-[#71717a]">{t.evalLabel}</span>
                  <span className="font-mono font-semibold text-[#171717] dark:text-white">
                    {scoreNumeric > 0 ? `${t.whiteAdvantage} (${evalStr})` : scoreNumeric < 0 ? `${t.blackAdvantage} (${evalStr})` : `${t.evenPosition} (${evalStr})`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Modals */}
      <NewGameModal
        t={t}
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        onStartGame={startNewGame}
        initialMode={gameMode === 'online' ? 'pvp' : gameMode}
        initialDifficulty={difficulty}
        initialPlayerSide={playerSide}
        initialTimeControl={timeControl}
      />

      <SettingsModal
        t={t}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        showCoordinates={showCoordinates}
        setShowCoordinates={setShowCoordinates}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        rotatePieces={rotatePieces}
        setRotatePieces={setRotatePieces}
      />

      <GameOverModal
        t={t}
        isOpen={showGameOverModal}
        winner={winner}
        reason={gameOverReason}
        playerSide={gameMode === 'online' ? effectiveOnlineMySide : playerSide}
        gameMode={gameMode}
        moveCount={history.length}
        onPlayAgain={handlePlayAgain}
        onClose={() => {
          clearGameOverModalTimer();
          setShowGameOverModal(false);
        }}
        onlineRematchState={onlineRematchState}
        isOpponentDisconnected={onlineManagerRef.current?.isDisconnectGraceActive() || disconnectCountdown !== null}
        opponentHasLeft={onlineOpponentHasLeft || onlineManagerRef.current?.hasOpponentLeft()}
        onOfferRematch={handleOnlineOfferRematch}
        onAcceptRematch={handleOnlineAcceptRematch}
        onDeclineRematch={handleOnlineDeclineRematch}
        onCancelRematch={handleOnlineCancelRematch}
        onNewOnlineRoom={handleOnlineNewGame}
        onFindNewOpponent={() => {
          setShowGameOverModal(false);
          clearGameOverModalTimer();
          onlineManagerRef.current?.leaveRoom();
          setOnlinePhase('idle');
          setOnlineSubTab('quick');
          handleStartQuickMatch(quickMatchTc);
        }}
      />

      {/* Restart Confirm Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overscroll-contain">
          <div className="w-full max-w-sm bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-xl p-5 text-center transition-colors">
            <h3 className="font-bold text-[#171717] dark:text-white mb-2">{t.restartConfirmTitle}</h3>
            <p className="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] mb-5">{t.restartConfirmBody}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#18181b]"
              >
                {t.confirmCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  startNewGame({ mode: gameMode === 'online' ? 'pvp' : gameMode, difficulty, playerSide, timeControl });
                  setShowRestartConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold hover:bg-[#333333] dark:hover:bg-[#e4e4e7]"
              >
                {t.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resign Confirm Dialog */}
      {showResignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overscroll-contain">
          <div className="w-full max-w-sm bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-xl p-5 text-center transition-colors">
            <h3 className="font-bold text-[#171717] dark:text-white mb-2">{t.resignConfirmTitle}</h3>
            <p className="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] mb-5">{t.resignConfirmBody}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResignConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#18181b]"
              >
                {t.confirmCancel}
              </button>
              <button
                type="button"
                onClick={handleResign}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                {t.resignAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Modals */}
      <OnlineGuideModal
        isOpen={showOnlineGuideModal && onlinePhase !== 'playing'}
        onClose={() => setShowOnlineGuideModal(false)}
        t={t}
      />

      <OnlineQrModal
        isOpen={showOnlineQrModal && onlinePhase !== 'playing'}
        onClose={() => setShowOnlineQrModal(false)}
        inviteUrl={onlineInviteUrl}
        t={t}
      />

      <OnlineTimeControlModal
        isOpen={showOnlineTcModal && onlinePhase !== 'playing'}
        onClose={() => setShowOnlineTcModal(false)}
        selectedTc={onlineTcId}
        onSelectTc={handleOnlineTcSelect}
        t={t}
        lang={lang}
      />

      <OnlineResignModal
        isOpen={showOnlineResignModal}
        onClose={() => setShowOnlineResignModal(false)}
        onConfirm={handleOnlineResignConfirm}
        t={t}
      />

      {/* Piece Information Guide Modal */}
      <PieceInfoModal
        isOpen={showPieceInfoModal}
        onClose={() => setShowPieceInfoModal(false)}
        initialPiece={infoModalPiece}
        initialTab={infoModalTab}
        lang={lang}
      />

      {/* Time Control Educational Guide Modal */}
      <TimeControlInfoModal
        isOpen={showTimeControlInfoModal}
        onClose={() => setShowTimeControlInfoModal(false)}
        initialTopic={timeControlInfoTopic}
        lang={lang}
      />
    </div>
  );
}
