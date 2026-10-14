import React from 'react';

interface EvaluationBarProps {
  scoreNumeric: number; // in centipawns or +100000 for mate
  evalStr: string;
  isFlipped?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  scoreNumeric,
  evalStr,
  isFlipped = false,
}) => {
  // Convert centipawns to percentage (0% to 100% white advantage)
  // 0 cp -> 50%
  // +500 cp (+5.0) -> ~85%
  // -500 cp (-5.0) -> ~15%
  // Sigmoid / smooth clamping
  let whitePercent = 50;
  if (scoreNumeric >= 90000) {
    whitePercent = 100;
  } else if (scoreNumeric <= -90000) {
    whitePercent = 0;
  } else {
    // Sigmoid mapping: 50 + 50 * (2 / (1 + exp(-0.0035 * cp)) - 1)
    const val = scoreNumeric / 100;
    const clamped = Math.max(-10, Math.min(10, val));
    whitePercent = Math.round(50 + clamped * 4.8);
    whitePercent = Math.max(4, Math.min(96, whitePercent));
  }

  const topPercent = isFlipped ? whitePercent : 100 - whitePercent;

  return (
    <div
      className="relative w-4 sm:w-5 h-full min-h-[320px] sm:min-h-[460px] bg-[#1c1c1f] rounded-full overflow-hidden border border-[#ebebeb]/20 shadow-sm flex flex-col select-none shrink-0"
      title={`評価値: ${evalStr || '0.00'}`}
    >
      {/* Top side (Black when white is bottom, White when flipped) */}
      <div
        className="w-full transition-all duration-500 ease-out bg-[#262626]"
        style={{ height: `${topPercent}%` }}
      />
      {/* Bottom side */}
      <div
        className="w-full transition-all duration-500 ease-out bg-[#ffffff]"
        style={{ height: `${100 - topPercent}%` }}
      />

      {/* Floating score label */}
      <div className="absolute inset-x-0 bottom-1 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-mono font-bold px-0.5 py-0.5 rounded bg-black/60 text-white leading-none">
          {evalStr || '0.0'}
        </span>
      </div>
    </div>
  );
};
