import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';

export interface PositionEvaluationProps {
  t: GameTranslations;
  lang: 'ja' | 'en';
  scoreNumeric: number;
  evalStr: string;
  isGameOver?: boolean;
  gameOverReason?: string | null;
  isEvaluating?: boolean;
  depth?: number;
  isStartingPosition?: boolean;
  fen?: string;
  className?: string;
}

export interface WdlResult {
  whiteChance: number;
  drawChance: number;
  blackChance: number;
  statusText: string;
  statusType: 'white' | 'black' | 'equal' | 'mate-white' | 'mate-black';
  mateMoves: number | null;
  mateColor: 'w' | 'b' | null;
  numericCp: number;
}

/**
 * Calculates beginner-friendly winning chances (Win/Draw/Loss percentages)
 * from engine evaluation (centipawns or mate), calibrated for human-level chess intuition.
 */
export function calculateWdl(
  scoreNumeric: number,
  evalStr: string,
  t: GameTranslations,
  isGameOver?: boolean,
  gameOverReason?: string | null,
  isStartingPosition?: boolean,
  fen?: string
): WdlResult {
  const isStart =
    Boolean(isStartingPosition) ||
    Boolean(
      fen &&
        fen
          .trim()
          .startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
    );

  // In the starting position of chess, the game is completely equal (50% - 50%)
  if (isStart) {
    return {
      whiteChance: 50,
      drawChance: 0,
      blackChance: 50,
      statusText: t.gameIsEqual,
      statusType: 'equal',
      mateMoves: null,
      mateColor: null,
      numericCp: 0,
    };
  }

  // 1. Detect Mate in N moves
  let mateMoves: number | null = null;
  let mateColor: 'w' | 'b' | null = null;

  const rawStr = (evalStr || '').trim();

  if (
    rawStr.startsWith('-#M') ||
    rawStr.includes('#M-') ||
    rawStr.startsWith('-M') ||
    scoreNumeric <= -90000
  ) {
    mateColor = 'b';
    const match = rawStr.match(/(\d+)/);
    if (match) {
      mateMoves = parseInt(match[1], 10);
    } else if (scoreNumeric <= -90000) {
      mateMoves = Math.max(1, 100000 - Math.abs(scoreNumeric));
    } else {
      mateMoves = 1;
    }
  } else if (
    rawStr.startsWith('#M') ||
    rawStr.includes('#M') ||
    rawStr.startsWith('+M') ||
    scoreNumeric >= 90000
  ) {
    mateColor = 'w';
    const match = rawStr.match(/(\d+)/);
    if (match) {
      mateMoves = parseInt(match[1], 10);
    } else if (scoreNumeric >= 90000) {
      mateMoves = Math.max(1, 100000 - scoreNumeric);
    } else {
      mateMoves = 1;
    }
  }

  // Handle Game Over
  if (isGameOver) {
    if (gameOverReason === 'checkmate') {
      if (mateColor === 'b' || scoreNumeric < 0) {
        return {
          whiteChance: 0,
          drawChance: 0,
          blackChance: 100,
          statusText: t.blackIsWinning,
          statusType: 'mate-black',
          mateMoves: 0,
          mateColor: 'b',
          numericCp: -10000,
        };
      }
      return {
        whiteChance: 100,
        drawChance: 0,
        blackChance: 0,
        statusText: t.whiteIsWinning,
        statusType: 'mate-white',
        mateMoves: 0,
        mateColor: 'w',
        numericCp: 10000,
      };
    }
    // Any draw
    return {
      whiteChance: 50,
      drawChance: 0,
      blackChance: 50,
      statusText: t.gameIsEqual,
      statusType: 'equal',
      mateMoves: null,
      mateColor: null,
      numericCp: 0,
    };
  }

  // Handle Forced Mate during active game
  if (mateColor !== null && mateMoves !== null) {
    if (mateColor === 'w') {
      return {
        whiteChance: 100,
        drawChance: 0,
        blackChance: 0,
        statusText: t.mateInMovesWhite.replace('{n}', String(mateMoves)),
        statusType: 'mate-white',
        mateMoves,
        mateColor: 'w',
        numericCp: 10000 - mateMoves,
      };
    } else {
      return {
        whiteChance: 0,
        drawChance: 0,
        blackChance: 100,
        statusText: t.mateInMovesBlack.replace('{n}', String(mateMoves)),
        statusType: 'mate-black',
        mateMoves,
        mateColor: 'b',
        numericCp: -10000 + mateMoves,
      };
    }
  }

  // 2. Standard Evaluation (Centipawns)
  let cp = scoreNumeric;
  const parsedFloat = parseFloat(rawStr);
  if (!isNaN(parsedFloat) && !rawStr.includes('#')) {
    cp = Math.round(parsedFloat * 100);
  }

  const clampedCp = Math.max(-1200, Math.min(1200, cp));

  // Small evaluation differences (<= 25 centipawns / 0.25 pawns) are balanced/equal (50% - 50%)
  if (Math.abs(clampedCp) <= 25) {
    return {
      whiteChance: 50,
      drawChance: 0,
      blackChance: 50,
      statusText: t.gameIsEqual,
      statusType: 'equal',
      mateMoves: null,
      mateColor: null,
      numericCp: cp,
    };
  }

  // Logistic curve mapping centipawns directly to White vs Black winning probability
  // Calibrated so cp = 0 -> 50% White / 50% Black
  // cp = +100 -> ~60% White / 40% Black
  // cp = +250 -> ~73% White / 27% Black
  // cp = +500 -> ~88% White / 12% Black
  const winProb = 1 / (1 + Math.exp(-0.004 * clampedCp));
  let whiteChance = Math.min(99, Math.max(1, Math.round(winProb * 100)));
  let blackChance = 100 - whiteChance;

  // Determine user-friendly status text
  let statusText = t.gameIsEqual;
  let statusType: 'white' | 'black' | 'equal' = 'equal';

  if (whiteChance >= 68 || cp >= 250) {
    statusText = t.whiteIsWinning;
    statusType = 'white';
  } else if (whiteChance >= 57 || cp >= 60) {
    statusText = t.whiteClearlyBetter;
    statusType = 'white';
  } else if (whiteChance >= 53 || cp >= 30) {
    statusText = t.whiteSlightlyBetter;
    statusType = 'white';
  } else if (blackChance >= 68 || cp <= -250) {
    statusText = t.blackIsWinning;
    statusType = 'black';
  } else if (blackChance >= 57 || cp <= -60) {
    statusText = t.blackClearlyBetter;
    statusType = 'black';
  } else if (blackChance >= 53 || cp <= -30) {
    statusText = t.blackSlightlyBetter;
    statusType = 'black';
  } else {
    statusText = t.gameIsEqual;
    statusType = 'equal';
  }

  return {
    whiteChance,
    drawChance: 0,
    blackChance,
    statusText,
    statusType,
    mateMoves: null,
    mateColor: null,
    numericCp: cp,
  };
}

export const PositionEvaluation: React.FC<PositionEvaluationProps> = ({
  t,
  lang,
  scoreNumeric,
  evalStr,
  isGameOver = false,
  gameOverReason = null,
  isEvaluating = false,
  depth,
  isStartingPosition = false,
  fen,
  className = '',
}) => {
  const wdl = calculateWdl(
    scoreNumeric,
    evalStr,
    t,
    isGameOver,
    gameOverReason,
    isStartingPosition,
    fen
  );

  // Status badge styling
  const badgeColors = {
    white: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
    black: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400',
    equal: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-700 dark:text-zinc-300',
    'mate-white': 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 animate-pulse',
    'mate-black': 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 animate-pulse',
  }[wdl.statusType];

  return (
    <div
      className={`p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2.5 transition-all shadow-2xs ${className}`}
    >
      {/* 1. Header Row: Title & Intuitive Status Badge */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#71717a] dark:text-[#a1a1aa] shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="whitespace-nowrap">{t.positionEvaluationTitle}</span>
          {isEvaluating && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          )}
        </div>

        {/* Clear Beginner-Friendly Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold tracking-tight shadow-2xs transition-all shrink-0 whitespace-nowrap ${badgeColors}`}
        >
          {wdl.mateColor ? (
            <Zap className="w-3 h-3 shrink-0 animate-bounce" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                wdl.statusType === 'white'
                  ? 'bg-emerald-500'
                  : wdl.statusType === 'black'
                  ? 'bg-indigo-500'
                  : 'bg-zinc-400'
              }`}
            />
          )}
          <span>{wdl.statusText}</span>
        </div>
      </div>

      {/* 2. Forced Checkmate Announcement Banner (if Mate in moves) */}
      {wdl.mateColor && wdl.mateMoves !== null && (
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${
            wdl.mateColor === 'w'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                wdl.mateColor === 'w' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs leading-snug">
              <span className="font-bold">
                {lang === 'ja'
                  ? wdl.mateColor === 'w'
                    ? `白が ${wdl.mateMoves} 手で強制チェックメイト（詰み）可能です！`
                    : `黒が ${wdl.mateMoves} 手で強制チェックメイト（詰み）可能です！`
                  : wdl.mateColor === 'w'
                  ? `⚡ White can force checkmate in ${wdl.mateMoves} move${
                      wdl.mateMoves > 1 ? 's' : ''
                    }!`
                  : `⚡ Black can force checkmate in ${wdl.mateMoves} move${
                      wdl.mateMoves > 1 ? 's' : ''
                    }!`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 uppercase font-bold shrink-0">
            {t.mateForcedCheckmate}
          </span>
        </div>
      )}

      {/* 3. High-Contrast Segmented Visual Probability Bar (White vs Black) */}
      <div className="space-y-1">
        <div
          className="w-full h-3 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex shadow-inner border border-black/5 dark:border-white/5 relative"
          title={`White: ${wdl.whiteChance}% | Black: ${wdl.blackChance}%`}
        >
          {/* White winning share */}
          <div
            className="h-full bg-white transition-all duration-500 ease-out shadow-xs border-r border-zinc-300/40 relative"
            style={{ width: `${wdl.whiteChance}%` }}
          />
          {/* Black winning share */}
          <div
            className="h-full bg-[#18181b] dark:bg-[#09090b] transition-all duration-500 ease-out"
            style={{ width: `${wdl.blackChance}%` }}
          />
        </div>

        {/* Bar legend percentages below bar */}
        <div className="flex items-center justify-between text-[11px] text-[#71717a] dark:text-[#a1a1aa] font-medium px-0.5">
          <span className="flex items-center gap-1 font-mono font-semibold">
            <span>⚪</span>
            <span>{wdl.whiteChance}%</span>
          </span>
          <span className="flex items-center gap-1 font-mono font-semibold">
            <span>{wdl.blackChance}%</span>
            <span>⚫</span>
          </span>
        </div>
      </div>

      {/* 4. Winning Chances Cards: Clear 2-Column Breakdown (White vs Black) */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        {/* White chances card */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-2xs text-center transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
            <span className="text-base leading-none">♔</span>
            <span className="truncate">
              {lang === 'ja' ? '白の勝率' : "White's win"}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#171717] dark:text-white leading-tight mt-0.5 font-mono">
            {wdl.whiteChance}%
          </div>
          <span className="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">
            {lang === 'ja' ? '勝率' : 'Winning chance'}
          </span>
        </div>

        {/* Black chances card */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-2xs text-center transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52525b] dark:text-[#a1a1aa]">
            <span className="text-base leading-none">♚</span>
            <span className="truncate">
              {lang === 'ja' ? '黒の勝率' : "Black's win"}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#171717] dark:text-white leading-tight mt-0.5 font-mono">
            {wdl.blackChance}%
          </div>
          <span className="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">
            {lang === 'ja' ? '勝率' : 'Winning chance'}
          </span>
        </div>
      </div>

    </div>
  );
};
