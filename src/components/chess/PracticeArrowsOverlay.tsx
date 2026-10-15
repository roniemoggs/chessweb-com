import React from 'react';
import type { Square } from 'chess.js';

export interface PracticeMoveOverlayItem {
  rank: number; // 1 to 5
  move: string; // UCI e.g. "e2e4"
  from: Square;
  to: Square;
  san: string;
  evalStr?: string;
  promotion?: string;
}

interface PracticeArrowsOverlayProps {
  moves: PracticeMoveOverlayItem[];
  boardOrientation: 'white' | 'black';
  hoveredIndex: number | null;
  onHoverMove?: (index: number | null) => void;
  onMoveClick?: (move: PracticeMoveOverlayItem) => void;
}

/**
 * Builds a single continuous SVG path for a chess arrow with a rounded tail cap.
 * Eliminates alpha-blending seams between the shaft and the arrowhead.
 */
function buildArrowPath(
  startX: number,
  startY: number,
  baseX: number,
  baseY: number,
  tipX: number,
  tipY: number,
  px: number,
  py: number,
  shaftWidth: number,
  headWidth: number
): string {
  const shaftHalf = shaftWidth / 2;
  const headHalf = headWidth / 2;

  // Head base barbs
  const leftBarbX = baseX - px * headHalf;
  const leftBarbY = baseY - py * headHalf;
  const rightBarbX = baseX + px * headHalf;
  const rightBarbY = baseY + py * headHalf;

  // Shaft junction at arrowhead base
  const leftJunctionX = baseX - px * shaftHalf;
  const leftJunctionY = baseY - py * shaftHalf;
  const rightJunctionX = baseX + px * shaftHalf;
  const rightJunctionY = baseY + py * shaftHalf;

  // Shaft tail points
  const rightTailX = startX + px * shaftHalf;
  const rightTailY = startY + py * shaftHalf;
  const leftTailX = startX - px * shaftHalf;
  const leftTailY = startY - py * shaftHalf;

  return (
    `M ${rightTailX.toFixed(2)} ${rightTailY.toFixed(2)} ` +
    `A ${shaftHalf} ${shaftHalf} 0 0 1 ${leftTailX.toFixed(2)} ${leftTailY.toFixed(2)} ` +
    `L ${leftJunctionX.toFixed(2)} ${leftJunctionY.toFixed(2)} ` +
    `L ${leftBarbX.toFixed(2)} ${leftBarbY.toFixed(2)} ` +
    `L ${tipX.toFixed(2)} ${tipY.toFixed(2)} ` +
    `L ${rightBarbX.toFixed(2)} ${rightBarbY.toFixed(2)} ` +
    `L ${rightJunctionX.toFixed(2)} ${rightJunctionY.toFixed(2)} ` +
    `Z`
  );
}

export const PracticeArrowsOverlay: React.FC<PracticeArrowsOverlayProps> = ({
  moves,
  boardOrientation,
  hoveredIndex,
  onHoverMove,
  onMoveClick,
}) => {
  if (!moves || moves.length === 0) return null;

  // Convert chess square (e.g. 'e4') to 800x800 coordinate
  const squareToCoords = (square: string): { x: number; y: number } => {
    const file = square.charCodeAt(0) - 97; // 0..7
    const rank = parseInt(square[1], 10);   // 1..8

    if (boardOrientation === 'white') {
      return {
        x: file * 100 + 50,
        y: (8 - rank) * 100 + 50,
      };
    } else {
      return {
        x: (7 - file) * 100 + 50,
        y: (rank - 1) * 100 + 50,
      };
    }
  };

  // Phase 1: Compute geometry and initial badge positions for all valid moves
  interface RawGeometry {
    item: PracticeMoveOverlayItem;
    index: number;
    dist: number;
    ux: number;
    uy: number;
    px: number;
    py: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    tipX: number;
    tipY: number;
    shaftWidth: number;
    headWidth: number;
    badgeX: number;
    badgeY: number;
  }

  const rawElements: RawGeometry[] = [];

  for (let index = 0; index < moves.length; index++) {
    const item = moves[index];
    const fromCoord = squareToCoords(item.from);
    const toCoord = squareToCoords(item.to);

    const dx = toCoord.x - fromCoord.x;
    const dy = toCoord.y - fromCoord.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) continue;

    const ux = dx / dist;
    const uy = dy / dist;
    const px = -uy;
    const py = ux;

    // Dimension hierarchy based on move rank
    const isRank1 = item.rank === 1;
    const shaftWidth = isRank1 ? 14 : item.rank === 2 ? 13 : item.rank === 3 ? 12 : 11;
    const headLen = isRank1 ? 26 : 24;
    const headWidth = isRank1 ? 32 : item.rank === 2 ? 30 : item.rank === 3 ? 28 : 26;

    // Arrow tip stops near square edge/center
    const tipX = toCoord.x - ux * 8;
    const tipY = toCoord.y - uy * 8;
    const baseX = tipX - ux * headLen;
    const baseY = tipY - uy * headLen;

    let startX: number;
    let startY: number;
    let badgeX: number;
    let badgeY: number;

    if (dist <= 120) {
      // 1-square moves (e.g. c2->c3, pawn 1-step):
      // Badge sits cleanly at the origin square base without covering the arrow shaft
      badgeX = fromCoord.x + ux * 22;
      badgeY = fromCoord.y + uy * 22;
      // Arrow starts comfortably ahead of the badge so the shaft is clearly visible
      startX = fromCoord.x + ux * 42;
      startY = fromCoord.y + uy * 42;
    } else if (dist <= 240) {
      // 2-square moves or knight moves (e.g. d2->d4, e2->e4, g1->f3):
      // Badge is placed near the midpoint (e.g. d3 for d2->d4)
      badgeX = fromCoord.x + ux * (dist * 0.5);
      badgeY = fromCoord.y + uy * (dist * 0.5);
      startX = fromCoord.x + ux * 32;
      startY = fromCoord.y + uy * 32;
    } else {
      // Long slider moves (e.g. f1->b5, queen/rook sweeps):
      // Badge is placed 1 square ahead along the move ray (~110px from origin),
      // preventing it from colliding with other center moves!
      const badgeDist = Math.min(dist * 0.35, 115);
      badgeX = fromCoord.x + ux * badgeDist;
      badgeY = fromCoord.y + uy * badgeDist;
      startX = fromCoord.x + ux * 32;
      startY = fromCoord.y + uy * 32;
    }

    rawElements.push({
      item,
      index,
      dist,
      ux,
      uy,
      px,
      py,
      startX,
      startY,
      baseX,
      baseY,
      tipX,
      tipY,
      shaftWidth,
      headWidth,
      badgeX,
      badgeY,
    });
  }

  // Phase 2: Multi-badge collision avoidance & relaxation
  // Prevents any two badges from overlapping if they are too close
  const minBadgeDistance = 42;
  for (let step = 0; step < 8; step++) {
    let hasOverlap = false;
    for (let i = 0; i < rawElements.length; i++) {
      for (let j = i + 1; j < rawElements.length; j++) {
        const b1 = rawElements[i];
        const b2 = rawElements[j];
        const cdx = b2.badgeX - b1.badgeX;
        const cdy = b2.badgeY - b1.badgeY;
        const currentDist = Math.hypot(cdx, cdy);

        if (currentDist < minBadgeDistance) {
          hasOverlap = true;
          const overlap = (minBadgeDistance - currentDist) / 2;
          let nx = currentDist > 0.5 ? cdx / currentDist : b1.px;
          let ny = currentDist > 0.5 ? cdy / currentDist : b1.py;

          b1.badgeX -= nx * overlap;
          b1.badgeY -= ny * overlap;
          b2.badgeX += nx * overlap;
          b2.badgeY += ny * overlap;
        }
      }
    }
    if (!hasOverlap) break;
  }

  // Phase 3: Build final render items with SVG paths & colors
  const finalElements = rawElements.map((geo) => {
    const isHovered = hoveredIndex === geo.index;
    const isOtherHovered = hoveredIndex !== null && !isHovered;

    // Rank-based color & opacity
    let fillColor = 'rgba(34, 197, 94, 0.70)';
    let badgeFill = '#15803d';

    if (geo.item.rank === 1) {
      fillColor = 'rgba(34, 197, 94, 0.88)';
      badgeFill = '#16a34a';
    } else if (geo.item.rank === 2) {
      fillColor = 'rgba(34, 197, 94, 0.72)';
      badgeFill = '#15803d';
    } else if (geo.item.rank === 3) {
      fillColor = 'rgba(34, 197, 94, 0.60)';
      badgeFill = '#166534';
    } else {
      fillColor = 'rgba(34, 197, 94, 0.50)';
      badgeFill = '#14532d';
    }

    if (isHovered) {
      fillColor = 'rgba(34, 197, 94, 0.98)';
      badgeFill = '#22c55e';
    } else if (isOtherHovered) {
      // Dim other moves when one move is hovered
      fillColor = fillColor.replace(/[\d\.]+\)$/, '0.28)');
    }

    const pathData = buildArrowPath(
      geo.startX,
      geo.startY,
      geo.baseX,
      geo.baseY,
      geo.tipX,
      geo.tipY,
      geo.px,
      geo.py,
      isHovered ? geo.shaftWidth + 2 : geo.shaftWidth,
      isHovered ? geo.headWidth + 3 : geo.headWidth
    );

    return {
      ...geo,
      isHovered,
      isOtherHovered,
      fillColor,
      badgeFill,
      pathData,
      badgeRadius: isHovered ? 21 : geo.item.rank === 1 ? 19 : 17.5,
    };
  });

  // Stacking order: Render lower ranks first, Rank 1 on top, and Hovered on very top
  const sortedArrowIndices = [...finalElements.keys()].sort((a, b) => {
    const elemA = finalElements[a];
    const elemB = finalElements[b];
    if (elemA.isHovered) return 1;
    if (elemB.isHovered) return -1;
    return elemB.item.rank - elemA.item.rank; // Descending rank (5 -> 1)
  });

  return (
    <svg
      viewBox="0 0 800 800"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-20"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="practiceBadgeShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" floodColor="#000000" />
        </filter>
        <filter id="arrowGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="arrowDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.3" floodColor="#000000" />
        </filter>
      </defs>

      {/* 1. Arrow bodies (ordered: lower ranks first, #1 on top, hovered on top) */}
      {sortedArrowIndices.map((i) => {
        const geo = finalElements[i];
        return (
          <g
            key={`arrow-${geo.item.move}-${geo.index}`}
            className="pointer-events-auto cursor-pointer transition-all duration-150"
            onClick={() => onMoveClick?.(geo.item)}
            onMouseEnter={() => onHoverMove?.(geo.index)}
            onMouseLeave={() => onHoverMove?.(null)}
          >
            {/* Wide transparent hit line for effortless clicking/hovering */}
            <line
              x1={geo.startX}
              y1={geo.startY}
              x2={geo.tipX}
              y2={geo.tipY}
              stroke="transparent"
              strokeWidth={36}
              strokeLinecap="round"
            />
            {/* Unified seamless arrow path */}
            <path
              d={geo.pathData}
              fill={geo.fillColor}
              filter={geo.isHovered ? 'url(#arrowGlow)' : 'url(#arrowDropShadow)'}
              className="transition-colors duration-150"
            />
          </g>
        );
      })}

      {/* 2. Circular number badges (ordered so #1 and hovered badge are on top) */}
      {sortedArrowIndices.map((i) => {
        const geo = finalElements[i];
        const isRank1 = geo.item.rank === 1;

        return (
          <g
            key={`badge-${geo.item.move}-${geo.index}`}
            className="pointer-events-auto cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              onMoveClick?.(geo.item);
            }}
            onMouseEnter={() => onHoverMove?.(geo.index)}
            onMouseLeave={() => onHoverMove?.(null)}
          >
            <title>{`#${geo.item.rank}: ${geo.item.san} (${geo.item.evalStr || ''})`}</title>

            {/* Badge Background Circle with Drop Shadow */}
            <circle
              cx={geo.badgeX}
              cy={geo.badgeY}
              r={geo.badgeRadius}
              fill={geo.badgeFill}
              stroke={isRank1 ? '#14532d' : '#0f381e'}
              strokeWidth={isRank1 ? '2.8' : '2.2'}
              filter="url(#practiceBadgeShadow)"
              className="transition-all duration-150"
            />

            {/* Subtle inner highlight ring for Rank 1 */}
            {isRank1 && (
              <circle
                cx={geo.badgeX}
                cy={geo.badgeY}
                r={geo.badgeRadius - 2.8}
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
                className="pointer-events-none select-none"
              />
            )}

            {/* Number (1..5) */}
            <text
              x={geo.badgeX}
              y={geo.badgeY}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={geo.isHovered ? '21' : isRank1 ? '19' : '17.5'}
              fontWeight="900"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              className="pointer-events-none select-none transition-all duration-150"
            >
              {geo.item.rank}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
