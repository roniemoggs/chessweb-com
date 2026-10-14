export interface BoardTheme {
  id: string;
  name: string;
  darkSquare: string;
  lightSquare: string;
}

export const BOARD_THEMES: BoardTheme[] = [
  { id: 'emerald', name: 'エメラルドグリーン', darkSquare: '#769656', lightSquare: '#eeeed2' },
  { id: 'wood', name: 'クラシック木目', darkSquare: '#b58863', lightSquare: '#f0d9b5' },
  { id: 'ocean', name: 'オーシャンブルー', darkSquare: '#4e7399', lightSquare: '#c3d7ec' },
  { id: 'slate', name: 'モダンスレート', darkSquare: '#334155', lightSquare: '#94a3b8' },
];
