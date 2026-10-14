import type Peer from 'peerjs';

export type OnlineTimeControlId = 'none' | '3+0' | '5+0' | '10+0' | '5+3' | '10+5' | '15+10';

export interface TimeControlConfig {
  id: OnlineTimeControlId;
  nameJa: string;
  nameEn: string;
  initialSeconds: number; // 0 for unlimited
  incrementSeconds: number;
}

export const TIME_CONTROLS: Record<OnlineTimeControlId, TimeControlConfig> = {
  none: { id: 'none', nameJa: '時間制限なし', nameEn: 'No time limit', initialSeconds: 0, incrementSeconds: 0 },
  '3+0': { id: '3+0', nameJa: '3分', nameEn: '3 min', initialSeconds: 180, incrementSeconds: 0 },
  '5+0': { id: '5+0', nameJa: '5分', nameEn: '5 min', initialSeconds: 300, incrementSeconds: 0 },
  '10+0': { id: '10+0', nameJa: '10分', nameEn: '10 min', initialSeconds: 600, incrementSeconds: 0 },
  '5+3': { id: '5+3', nameJa: '5分 + 3秒', nameEn: '5 min + 3 sec', initialSeconds: 300, incrementSeconds: 3 },
  '10+5': { id: '10+5', nameJa: '10分 + 5秒', nameEn: '10 min + 5 sec', initialSeconds: 600, incrementSeconds: 5 },
  '15+10': { id: '15+10', nameJa: '15分 + 10秒', nameEn: '15 min + 10 sec', initialSeconds: 900, incrementSeconds: 10 },
};

export type HostSidePref = 'white' | 'black' | 'random';
export type OnlinePhase = 'idle' | 'waiting' | 'joining' | 'playing' | 'over';

export interface OnlineMoveData {
  from: string;
  to: string;
  promotion?: string;
  fen: string;
  whiteTimeRemaining?: number | null;
  blackTimeRemaining?: number | null;
}

export type OnlineMessage =
  | { type: 'GUEST_JOIN'; guestId: string }
  | { type: 'HOST_WELCOME'; hostSide: 'w' | 'b'; guestSide: 'w' | 'b'; tcId: OnlineTimeControlId; fen: string }
  | { type: 'SETTINGS_UPDATE'; hostSidePref: HostSidePref; tcId: OnlineTimeControlId }
  | { type: 'MOVE'; move: OnlineMoveData }
  | { type: 'RESIGN'; side: 'w' | 'b' }
  | { type: 'TIMEOUT'; side: 'w' | 'b' }
  | { type: 'REMATCH_OFFER' }
  | { type: 'PING'; ts: number }
  | { type: 'PONG'; ts: number };

export interface OnlineManagerEvents {
  onPhaseChange?: (phase: OnlinePhase) => void;
  onMatchStart?: (mySide: 'w' | 'b', tcId: OnlineTimeControlId) => void;
  onMoveReceived?: (data: OnlineMoveData) => void;
  onOpponentResigned?: (resignedSide: 'w' | 'b') => void;
  onOpponentTimeout?: (timedOutSide: 'w' | 'b') => void;
  onSettingsUpdated?: (sidePref: HostSidePref, tcId: OnlineTimeControlId) => void;
  onError?: (err: string) => void;
  onStatusText?: (text: string) => void;
}

function generateCleanRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class OnlineChessManager {
  private peer: any = null;
  private connection: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private myId: string = '';
  private roomCode: string = '';
  private isHost: boolean = false;
  private phase: OnlinePhase = 'idle';
  private mySide: 'w' | 'b' | null = null;
  private hostSidePref: HostSidePref = 'white';
  private tcId: OnlineTimeControlId = 'none';
  private events: OnlineManagerEvents = {};
  private processedMsgIds: Set<string> = new Set();

  constructor(events: OnlineManagerEvents = {}) {
    this.events = events;
  }

  public setEvents(events: OnlineManagerEvents) {
    this.events = { ...this.events, ...events };
  }

  public getPhase(): OnlinePhase {
    return this.phase;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public getMySide(): 'w' | 'b' | null {
    return this.mySide;
  }

  public getHostSidePref(): HostSidePref {
    return this.hostSidePref;
  }

  public getTimeControlId(): OnlineTimeControlId {
    return this.tcId;
  }

  public isUserHost(): boolean {
    return this.isHost;
  }

  /**
   * Initializes host room
   */
  public async createRoom(sidePref: HostSidePref = 'white', tcId: OnlineTimeControlId = 'none'): Promise<string> {
    this.cleanup();
    this.isHost = true;
    this.hostSidePref = sidePref;
    this.tcId = tcId;
    this.roomCode = generateCleanRoomCode();
    this.phase = 'waiting';
    this.events.onPhaseChange?.('waiting');

    this.initBroadcastChannel(this.roomCode);
    await this.initPeerAsHost(this.roomCode);
    return this.roomCode;
  }

  /**
   * Joins an existing room by code
   */
  public async joinRoom(roomCode: string): Promise<boolean> {
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode || !/^[A-Z0-9]{3,16}$/.test(cleanCode)) return false;

    this.cleanup();
    this.isHost = false;
    this.roomCode = cleanCode;
    this.phase = 'joining';
    this.events.onPhaseChange?.('joining');

    this.initBroadcastChannel(cleanCode);
    return this.initPeerAsGuest(cleanCode);
  }

  /**
   * Host updates pre-game settings
   */
  public updateSettings(sidePref: HostSidePref, tcId: OnlineTimeControlId) {
    this.hostSidePref = sidePref;
    this.tcId = tcId;
    this.events.onSettingsUpdated?.(sidePref, tcId);

    this.broadcastMessage({
      type: 'SETTINGS_UPDATE',
      hostSidePref: sidePref,
      tcId,
    });
  }

  /**
   * Send a validated chess move to opponent
   */
  public sendMove(data: OnlineMoveData) {
    this.broadcastMessage({
      type: 'MOVE',
      move: data,
    });
  }

  /**
   * Resign match
   */
  public sendResign(side: 'w' | 'b') {
    this.phase = 'over';
    this.events.onPhaseChange?.('over');
    this.broadcastMessage({
      type: 'RESIGN',
      side,
    });
  }

  /**
   * Send clock timeout
   */
  public sendTimeout(side: 'w' | 'b') {
    this.phase = 'over';
    this.events.onPhaseChange?.('over');
    this.broadcastMessage({
      type: 'TIMEOUT',
      side,
    });
  }

  /**
   * Cleanup and disconnect
   */
  public leaveRoom() {
    this.cleanup();
    this.phase = 'idle';
    this.mySide = null;
    this.roomCode = '';
    this.events.onPhaseChange?.('idle');
  }

  private initBroadcastChannel(code: string) {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    try {
      this.broadcastChannel = new BroadcastChannel(`chess_web_room_${code}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && typeof event.data === 'object') {
          this.handleIncomingRaw(event.data);
        }
      };

      if (!this.isHost) {
        // Broadcast guest join immediately
        setTimeout(() => {
          this.broadcastMessage({
            type: 'GUEST_JOIN',
            guestId: this.myId || 'tab_guest',
          });
        }, 150);
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  }

  private async initPeerAsHost(code: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const { default: PeerClass } = await import('peerjs');
      const hostPeerId = `cw-${code}-host`;
      this.myId = hostPeerId;

      this.peer = new PeerClass(hostPeerId, {
        debug: 0,
      });

      this.peer.on('open', () => {
        // Peer ready
      });

      this.peer.on('connection', (conn: any) => {
        this.connection = conn;
        this.setupConnectionHandlers(conn);
      });

      this.peer.on('error', (err: any) => {
        console.warn('PeerJS host note:', err?.type || err);
      });
    } catch (e) {
      console.warn('PeerJS import error:', e);
    }
  }

  private async initPeerAsGuest(code: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const { default: PeerClass } = await import('peerjs');
      const hostPeerId = `cw-${code}-host`;

      this.peer = new PeerClass({
        debug: 0,
      });

      this.peer.on('open', (id: string) => {
        this.myId = id;
        try {
          const conn = this.peer.connect(hostPeerId, {
            reliable: true,
          });
          this.connection = conn;
          this.setupConnectionHandlers(conn);
        } catch (e) {
          console.warn('Peer connect error:', e);
        }
      });

      this.peer.on('error', (err: any) => {
        console.warn('PeerJS guest note:', err?.type || err);
      });

      return true;
    } catch (e) {
      console.warn('PeerJS guest error:', e);
      return false;
    }
  }

  private setupConnectionHandlers(conn: any) {
    conn.on('open', () => {
      if (!this.isHost) {
        this.sendMessageDirect({
          type: 'GUEST_JOIN',
          guestId: this.myId,
        });
      }
    });

    conn.on('data', (data: any) => {
      this.handleIncomingRaw(data);
    });

    conn.on('close', () => {
      // Disconnection handled gracefully
    });

    conn.on('error', (err: any) => {
      console.warn('Conn error:', err);
    });
  }

  private broadcastMessage(msg: OnlineMessage) {
    const packet = {
      ...msg,
      _senderId: this.myId || (this.isHost ? 'host' : 'guest'),
      _msgId: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };

    // Mark as processed by self
    this.processedMsgIds.add(packet._msgId);

    // Send via WebRTC DataConnection
    this.sendMessageDirect(packet);

    // Also send via BroadcastChannel for instant local testing
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
      } catch (e) {}
    }
  }

  private sendMessageDirect(data: any) {
    if (this.connection && this.connection.open) {
      try {
        this.connection.send(data);
      } catch (e) {}
    }
  }

  private handleIncomingRaw(data: any) {
    if (!data || typeof data !== 'object') return;

    // Deduplicate messages across Peer & BroadcastChannel and prevent unbounded memory leak
    if (data._msgId && typeof data._msgId === 'string') {
      if (this.processedMsgIds.has(data._msgId)) return;
      if (this.processedMsgIds.size >= 500) {
        this.processedMsgIds.clear();
      }
      this.processedMsgIds.add(data._msgId);
    }
    if (data._senderId && data._senderId === this.myId) return;

    this.handleMessage(data as OnlineMessage);
  }

  private handleMessage(msg: OnlineMessage) {
    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') return;

    switch (msg.type) {
      case 'GUEST_JOIN': {
        if (this.isHost && (this.phase === 'waiting' || this.phase === 'idle')) {
          // Determine side assignments
          let hostColor: 'w' | 'b' = 'w';
          if (this.hostSidePref === 'black') {
            hostColor = 'b';
          } else if (this.hostSidePref === 'random') {
            hostColor = Math.random() < 0.5 ? 'w' : 'b';
          }

          const guestColor: 'w' | 'b' = hostColor === 'w' ? 'b' : 'w';
          this.mySide = hostColor;
          this.phase = 'playing';
          this.events.onPhaseChange?.('playing');
          this.events.onMatchStart?.(this.mySide, this.tcId);

          // Reply with welcome packet to guest
          this.broadcastMessage({
            type: 'HOST_WELCOME',
            hostSide: hostColor,
            guestSide: guestColor,
            tcId: this.tcId,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          });
        }
        break;
      }

      case 'HOST_WELCOME': {
        if (!this.isHost && this.phase === 'joining') {
          if (msg.guestSide === 'w' || msg.guestSide === 'b') {
            this.mySide = msg.guestSide;
            if (msg.tcId && TIME_CONTROLS[msg.tcId]) {
              this.tcId = msg.tcId;
            }
            this.phase = 'playing';
            this.events.onPhaseChange?.('playing');
            this.events.onMatchStart?.(this.mySide, this.tcId);
          }
        }
        break;
      }

      case 'SETTINGS_UPDATE': {
        if (!this.isHost) {
          if (msg.tcId && TIME_CONTROLS[msg.tcId]) {
            this.tcId = msg.tcId;
          }
          const validPref: HostSidePref =
            msg.hostSidePref === 'white' || msg.hostSidePref === 'black' || msg.hostSidePref === 'random'
              ? msg.hostSidePref
              : 'white';
          this.events.onSettingsUpdated?.(validPref, this.tcId);
        }
        break;
      }

      case 'MOVE': {
        if (
          msg.move &&
          typeof msg.move === 'object' &&
          typeof msg.move.from === 'string' &&
          typeof msg.move.to === 'string' &&
          /^[a-h][1-8]$/.test(msg.move.from) &&
          /^[a-h][1-8]$/.test(msg.move.to)
        ) {
          const sanitizedMove: OnlineMoveData = {
            from: msg.move.from,
            to: msg.move.to,
            promotion: typeof msg.move.promotion === 'string' && /^[qrbn]$/i.test(msg.move.promotion)
              ? msg.move.promotion.toLowerCase()
              : undefined,
            fen: typeof msg.move.fen === 'string' ? msg.move.fen.slice(0, 128) : '',
            whiteTimeRemaining:
              typeof msg.move.whiteTimeRemaining === 'number' && Number.isFinite(msg.move.whiteTimeRemaining)
                ? Math.max(0, msg.move.whiteTimeRemaining)
                : undefined,
            blackTimeRemaining:
              typeof msg.move.blackTimeRemaining === 'number' && Number.isFinite(msg.move.blackTimeRemaining)
                ? Math.max(0, msg.move.blackTimeRemaining)
                : undefined,
          };
          this.events.onMoveReceived?.(sanitizedMove);
        }
        break;
      }

      case 'RESIGN': {
        if (msg.side === 'w' || msg.side === 'b') {
          this.phase = 'over';
          this.events.onPhaseChange?.('over');
          this.events.onOpponentResigned?.(msg.side);
        }
        break;
      }

      case 'TIMEOUT': {
        if (msg.side === 'w' || msg.side === 'b') {
          this.phase = 'over';
          this.events.onPhaseChange?.('over');
          this.events.onOpponentTimeout?.(msg.side);
        }
        break;
      }

      case 'PING': {
        if (typeof msg.ts === 'number' && Number.isFinite(msg.ts)) {
          this.broadcastMessage({ type: 'PONG', ts: msg.ts });
        }
        break;
      }

      default:
        break;
    }
  }

  private cleanup() {
    if (this.connection) {
      try {
        this.connection.close();
      } catch (e) {}
      this.connection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch (e) {}
      this.broadcastChannel = null;
    }
    this.processedMsgIds.clear();
  }
}
