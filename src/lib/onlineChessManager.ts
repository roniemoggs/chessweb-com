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

export interface OnlineMatchSyncData {
  mySide: 'w' | 'b';
  tcId: OnlineTimeControlId;
  fen: string;
  history?: string[];
  lastMove?: { from: string; to: string } | null;
  whiteTimeRemaining?: number | null;
  blackTimeRemaining?: number | null;
}

export type OnlineRematchState = 'none' | 'offered_by_me' | 'offered_by_opponent' | 'accepted';

export type OnlineMessage =
  | { type: 'GUEST_JOIN'; guestId: string }
  | { type: 'HOST_READY'; roomCode: string }
  | { type: 'HOST_WELCOME'; hostSide: 'w' | 'b'; guestSide: 'w' | 'b'; tcId: OnlineTimeControlId; fen: string }
  | { type: 'SETTINGS_UPDATE'; hostSidePref: HostSidePref; tcId: OnlineTimeControlId }
  | { type: 'MOVE'; move: OnlineMoveData }
  | { type: 'RESIGN'; side: 'w' | 'b' }
  | { type: 'TIMEOUT'; side: 'w' | 'b' }
  | { type: 'REMATCH_OFFER' }
  | { type: 'REMATCH_ACCEPT' }
  | { type: 'REMATCH_DECLINE' }
  | { type: 'REMATCH_CANCEL' }
  | { type: 'REMATCH_START'; hostSide: 'w' | 'b'; guestSide: 'w' | 'b'; tcId: OnlineTimeControlId; fen: string }
  | { type: 'PLAYER_LEFT' }
  | { type: 'PING'; ts: number }
  | { type: 'PONG'; ts: number }
  | { type: 'DISCONNECT_INTENT'; side: 'w' | 'b' }
  | { type: 'HEARTBEAT'; ts: number }
  | { type: 'HEARTBEAT_ACK'; ts: number }
  | { type: 'RECONNECT_REQUEST'; guestId?: string; side?: 'w' | 'b' }
  | {
      type: 'RECONNECT_ACK';
      hostSide: 'w' | 'b';
      guestSide: 'w' | 'b';
      tcId: OnlineTimeControlId;
      fen: string;
      history?: string[];
      lastMove?: { from: string; to: string } | null;
      whiteTimeRemaining?: number | null;
      blackTimeRemaining?: number | null;
    }
  | { type: 'DISCONNECT_FORFEIT'; winnerSide: 'w' | 'b' };

export interface OnlineManagerEvents {
  onPhaseChange?: (phase: OnlinePhase) => void;
  onMatchStart?: (mySide: 'w' | 'b', tcId: OnlineTimeControlId) => void;
  onMatchSync?: (data: OnlineMatchSyncData) => void;
  onMoveReceived?: (data: OnlineMoveData) => void;
  onOpponentResigned?: (resignedSide: 'w' | 'b') => void;
  onOpponentTimeout?: (timedOutSide: 'w' | 'b') => void;
  onOpponentDisconnected?: (secondsRemaining: number) => void;
  onOpponentReconnected?: () => void;
  onDisconnectCountdownTick?: (secondsRemaining: number) => void;
  onDisconnectForfeit?: (winnerSide: 'w' | 'b') => void;
  onSelfConnectionState?: (isOnline: boolean) => void;
  onSettingsUpdated?: (sidePref: HostSidePref, tcId: OnlineTimeControlId) => void;
  onRematchOfferReceived?: () => void;
  onRematchAccepted?: () => void;
  onRematchDeclined?: () => void;
  onRematchCancelled?: () => void;
  onRematchStateChange?: (state: OnlineRematchState) => void;
  onOpponentLeftRoom?: () => void;
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
  private rematchState: OnlineRematchState = 'none';
  private opponentHasLeft: boolean = false;
  private hasOpponentJoined: boolean = false;
  private events: OnlineManagerEvents = {};
  private processedMsgIds: Set<string> = new Set();

  // 15-second grace period & heartbeat state
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private watchdogInterval: ReturnType<typeof setInterval> | null = null;
  private disconnectTimer: ReturnType<typeof setInterval> | null = null;
  private lastOpponentSeenAt: number = 0;
  private isOpponentDisconnected: boolean = false;
  private disconnectSecondsRemaining: number = 15;
  private gameStateGetter: (() => {
    fen: string;
    history?: string[];
    lastMove?: { from: string; to: string } | null;
    whiteTimeRemaining?: number | null;
    blackTimeRemaining?: number | null;
  }) | null = null;
  private hasBoundWindowEvents: boolean = false;
  private hostPollInterval: ReturnType<typeof setInterval> | null = null;
  private joinPollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(events: OnlineManagerEvents = {}) {
    this.events = events;
  }

  public setEvents(events: OnlineManagerEvents) {
    this.events = { ...this.events, ...events };
  }

  public setGameStateGetter(
    getter: () => {
      fen: string;
      history?: string[];
      lastMove?: { from: string; to: string } | null;
      whiteTimeRemaining?: number | null;
      blackTimeRemaining?: number | null;
    }
  ) {
    this.gameStateGetter = getter;
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

  public getDisconnectSecondsRemaining(): number {
    return this.disconnectSecondsRemaining;
  }

  public isDisconnectGraceActive(): boolean {
    return this.isOpponentDisconnected;
  }

  public getRematchState(): OnlineRematchState {
    return this.rematchState;
  }

  public isOpponentOnline(): boolean {
    return !this.isOpponentDisconnected && !this.opponentHasLeft;
  }

  public hasOpponentLeft(): boolean {
    return this.opponentHasLeft;
  }

  public isOpponentAvailableForRematch(): boolean {
    if (this.opponentHasLeft) return false;
    if (this.isOpponentDisconnected) return false;
    if (this.connection && !this.connection.open && !this.broadcastChannel) {
      return false;
    }
    return true;
  }

  /**
   * Initializes host room
   */
  public async createRoom(
    sidePref: HostSidePref = 'white',
    tcId: OnlineTimeControlId = 'none',
    existingCode?: string
  ): Promise<string> {
    this.cleanup();
    this.isHost = true;
    this.hostSidePref = sidePref;
    this.tcId = tcId;
    this.roomCode = existingCode ? existingCode.trim().toUpperCase() : generateCleanRoomCode();
    this.phase = 'waiting';
    this.events.onPhaseChange?.('waiting');

    this.bindWindowEvents();
    this.initBroadcastChannel(this.roomCode);

    if (this.hostPollInterval) clearInterval(this.hostPollInterval);
    this.hostPollInterval = setInterval(() => {
      if (this.phase === 'waiting') {
        this.broadcastMessage({ type: 'HOST_READY', roomCode: this.roomCode });
      } else {
        if (this.hostPollInterval) {
          clearInterval(this.hostPollInterval);
          this.hostPollInterval = null;
        }
      }
    }, 1200);

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

    this.bindWindowEvents();
    this.initBroadcastChannel(cleanCode);

    if (this.joinPollInterval) clearInterval(this.joinPollInterval);
    this.joinPollInterval = setInterval(() => {
      if (this.phase === 'joining') {
        this.broadcastMessage({
          type: 'GUEST_JOIN',
          guestId: this.myId || 'tab_guest',
        });
      } else {
        if (this.joinPollInterval) {
          clearInterval(this.joinPollInterval);
          this.joinPollInterval = null;
        }
      }
    }, 1000);

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
    this.stopHeartbeat();
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
    this.stopHeartbeat();
    this.events.onPhaseChange?.('over');
    this.broadcastMessage({
      type: 'TIMEOUT',
      side,
    });
  }

  /**
   * Mark game as over locally
   */
  public setGameOver() {
    this.phase = 'over';
    this.stopHeartbeat();
    this.events.onPhaseChange?.('over');
  }

  /**
   * Propose a rematch to the opponent
   */
  public offerRematch(): { success: boolean; reason?: 'left' | 'disconnected' } {
    if (this.opponentHasLeft) {
      return { success: false, reason: 'left' };
    }
    if (this.isOpponentDisconnected || !this.isOpponentAvailableForRematch()) {
      return { success: false, reason: 'disconnected' };
    }
    if (this.rematchState === 'offered_by_opponent') {
      return this.acceptRematch();
    }
    this.rematchState = 'offered_by_me';
    this.events.onRematchStateChange?.(this.rematchState);
    this.broadcastMessage({ type: 'REMATCH_OFFER' });
    return { success: true };
  }

  /**
   * Accept an incoming rematch offer
   */
  public acceptRematch(): { success: boolean; reason?: 'left' | 'disconnected' } {
    if (this.opponentHasLeft) {
      return { success: false, reason: 'left' };
    }
    if (this.isOpponentDisconnected || !this.isOpponentAvailableForRematch()) {
      return { success: false, reason: 'disconnected' };
    }
    this.rematchState = 'accepted';
    this.events.onRematchStateChange?.(this.rematchState);

    if (this.isHost) {
      this.startRematchGame();
    } else {
      this.broadcastMessage({ type: 'REMATCH_ACCEPT' });
    }
    return { success: true };
  }

  /**
   * Decline an incoming rematch offer
   */
  public declineRematch() {
    this.rematchState = 'none';
    this.events.onRematchStateChange?.(this.rematchState);
    this.broadcastMessage({ type: 'REMATCH_DECLINE' });
  }

  /**
   * Cancel an outgoing rematch offer
   */
  public cancelRematch() {
    if (this.rematchState === 'offered_by_me') {
      this.rematchState = 'none';
      this.events.onRematchStateChange?.(this.rematchState);
      this.broadcastMessage({ type: 'REMATCH_CANCEL' });
    }
  }

  /**
   * Host starts the rematch match with swapped sides
   */
  public startRematchGame() {
    if (!this.isHost) return;
    const prevHostSide = this.mySide || 'w';
    const newHostSide: 'w' | 'b' = prevHostSide === 'w' ? 'b' : 'w';
    const newGuestSide: 'w' | 'b' = newHostSide === 'w' ? 'b' : 'w';

    this.mySide = newHostSide;
    this.phase = 'playing';
    this.rematchState = 'none';
    this.isOpponentDisconnected = false;
    this.disconnectSecondsRemaining = 15;
    this.startHeartbeat();

    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    this.events.onRematchStateChange?.('none');
    this.events.onMatchStart?.(newHostSide, this.tcId);
    this.events.onPhaseChange?.('playing');

    this.broadcastMessage({
      type: 'REMATCH_START',
      hostSide: newHostSide,
      guestSide: newGuestSide,
      tcId: this.tcId,
      fen: startFen,
    });
  }

  /**
   * Cleanup and disconnect
   */
  public leaveRoom() {
    this.broadcastMessage({ type: 'PLAYER_LEFT' });
    this.cleanup();
    this.phase = 'idle';
    this.mySide = null;
    this.roomCode = '';
    this.rematchState = 'none';
    this.events.onPhaseChange?.('idle');
  }

  /**
   * Starts heartbeat ping and watchdog during active match
   */
  public startHeartbeat() {
    this.stopHeartbeat();
    this.lastOpponentSeenAt = Date.now();
    this.isOpponentDisconnected = false;

    // Heartbeat ping every 1.5s
    this.heartbeatInterval = setInterval(() => {
      if (this.phase === 'playing') {
        this.broadcastMessage({ type: 'HEARTBEAT', ts: Date.now() });
      }
    }, 1500);

    // Watchdog check every 1s
    this.watchdogInterval = setInterval(() => {
      if (this.phase === 'playing' && !this.isOpponentDisconnected) {
        const elapsed = Date.now() - this.lastOpponentSeenAt;
        // If no message or heartbeat seen for > 4.5 seconds:
        if (elapsed > 4500) {
          this.handleOpponentDisconnect();
        }
      }
    }, 1000);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }

  /**
   * Triggers the 15-second countdown grace period when opponent disconnects
   */
  public handleOpponentDisconnect() {
    if (this.phase !== 'playing' || this.isOpponentDisconnected) return;
    this.isOpponentDisconnected = true;
    this.disconnectSecondsRemaining = 15;
    if (this.rematchState !== 'none') {
      this.rematchState = 'none';
      this.events.onRematchStateChange?.('none');
    }

    this.events.onOpponentDisconnected?.(15);
    this.events.onDisconnectCountdownTick?.(15);

    if (this.disconnectTimer) {
      clearInterval(this.disconnectTimer);
    }

    this.disconnectTimer = setInterval(() => {
      this.disconnectSecondsRemaining -= 1;
      this.events.onDisconnectCountdownTick?.(this.disconnectSecondsRemaining);

      if (this.disconnectSecondsRemaining <= 0) {
        if (this.disconnectTimer) {
          clearInterval(this.disconnectTimer);
          this.disconnectTimer = null;
        }
        this.phase = 'over';
        this.stopHeartbeat();
        this.opponentHasLeft = true;
        this.rematchState = 'none';
        this.events.onRematchStateChange?.('none');
        this.events.onOpponentLeftRoom?.();
        const winningSide = this.mySide || (this.isHost ? 'w' : 'b');
        this.events.onDisconnectForfeit?.(winningSide);
        this.broadcastMessage({
          type: 'DISCONNECT_FORFEIT',
          winnerSide: winningSide,
        });
      }
    }, 1000);
  }

  /**
   * Resumes the game normally if opponent reconnects before 15s countdown expires
   */
  public handleOpponentReconnect() {
    this.lastOpponentSeenAt = Date.now();
    const wasDisconnected = this.isOpponentDisconnected;
    this.isOpponentDisconnected = false;

    if (this.disconnectTimer) {
      clearInterval(this.disconnectTimer);
      this.disconnectTimer = null;
    }

    if (wasDisconnected) {
      this.events.onOpponentReconnected?.();
    }

    // Sync latest game state to reconnected peer
    if (this.gameStateGetter && this.phase === 'playing') {
      const state = this.gameStateGetter();
      if (state) {
        const hostSide = this.isHost ? (this.mySide || 'w') : (this.mySide === 'w' ? 'b' : 'w');
        const guestSide = hostSide === 'w' ? 'b' : 'w';
        this.broadcastMessage({
          type: 'RECONNECT_ACK',
          hostSide,
          guestSide,
          tcId: this.tcId,
          fen: state.fen,
          history: state.history,
          lastMove: state.lastMove,
          whiteTimeRemaining: state.whiteTimeRemaining,
          blackTimeRemaining: state.blackTimeRemaining,
        });
      }
    }
  }

  private bindWindowEvents() {
    if (typeof window === 'undefined' || this.hasBoundWindowEvents) return;
    this.hasBoundWindowEvents = true;
    window.addEventListener('beforeunload', this.handleWindowUnload);
    window.addEventListener('pagehide', this.handleWindowUnload);
    window.addEventListener('offline', this.handleWindowOffline);
    window.addEventListener('online', this.handleWindowOnline);
  }

  private unbindWindowEvents() {
    if (typeof window === 'undefined' || !this.hasBoundWindowEvents) return;
    this.hasBoundWindowEvents = false;
    window.removeEventListener('beforeunload', this.handleWindowUnload);
    window.removeEventListener('pagehide', this.handleWindowUnload);
    window.removeEventListener('offline', this.handleWindowOffline);
    window.removeEventListener('online', this.handleWindowOnline);
  }

  private handleWindowUnload = () => {
    this.broadcastMessage({
      type: 'PLAYER_LEFT',
    });
    if (this.phase === 'playing') {
      this.broadcastMessage({
        type: 'DISCONNECT_INTENT',
        side: this.mySide || (this.isHost ? 'w' : 'b'),
      });
    }
    if (this.connection) {
      try {
        this.connection.close();
      } catch (e) {}
    }
  };

  private handleWindowOffline = () => {
    this.events.onSelfConnectionState?.(false);
  };

  private handleWindowOnline = () => {
    this.events.onSelfConnectionState?.(true);
    if (this.phase === 'playing') {
      this.broadcastMessage({ type: 'HEARTBEAT', ts: Date.now() });
      if (!this.isHost) {
        this.broadcastMessage({
          type: 'RECONNECT_REQUEST',
          guestId: this.myId,
          side: this.mySide || 'b',
        });
      }
    }
  };

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
        // Broadcast guest join or reconnect
        setTimeout(() => {
          this.broadcastMessage({
            type: this.phase === 'playing' ? 'RECONNECT_REQUEST' : 'GUEST_JOIN',
            guestId: this.myId || 'tab_guest',
            side: this.mySide || 'b',
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
      const peerModule: any = await import('peerjs');
      const PeerClass = peerModule.default || peerModule.Peer || peerModule;
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
      const peerModule: any = await import('peerjs');
      const PeerClass = peerModule.default || peerModule.Peer || peerModule;
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
        if (this.phase === 'playing') {
          this.sendMessageDirect({
            type: 'RECONNECT_REQUEST',
            guestId: this.myId,
            side: this.mySide || 'b',
          });
        } else {
          this.sendMessageDirect({
            type: 'GUEST_JOIN',
            guestId: this.myId,
          });
        }
      } else {
        if (this.phase === 'playing') {
          this.handleOpponentReconnect();
        }
      }
    });

    conn.on('data', (data: any) => {
      this.handleIncomingRaw(data);
    });

    conn.on('close', () => {
      if (this.phase === 'playing') {
        this.handleOpponentDisconnect();
      } else if (this.phase === 'over') {
        this.opponentHasLeft = true;
        this.rematchState = 'none';
        this.events.onRematchStateChange?.('none');
        this.events.onOpponentLeftRoom?.();
      }
    });

    conn.on('error', (err: any) => {
      console.warn('Conn error:', err);
      if (this.phase === 'playing') {
        this.handleOpponentDisconnect();
      } else if (this.phase === 'over') {
        this.opponentHasLeft = true;
        this.rematchState = 'none';
        this.events.onRematchStateChange?.('none');
        this.events.onOpponentLeftRoom?.();
      }
    });

    if (conn.peerConnection) {
      try {
        conn.peerConnection.addEventListener('connectionstatechange', () => {
          const state = conn.peerConnection?.connectionState;
          if (state === 'disconnected' || state === 'failed' || state === 'closed') {
            if (this.phase === 'playing') {
              this.handleOpponentDisconnect();
            } else if (this.phase === 'over') {
              this.opponentHasLeft = true;
              this.rematchState = 'none';
              this.events.onRematchStateChange?.('none');
              this.events.onOpponentLeftRoom?.();
            }
          } else if (state === 'connected') {
            this.opponentHasLeft = false;
            this.hasOpponentJoined = true;
            if (this.phase === 'playing') {
              this.handleOpponentReconnect();
            }
          }
        });
      } catch (e) {}
    }
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

    // Deduplicate messages across Peer & BroadcastChannel
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
        this.hasOpponentJoined = true;
        this.opponentHasLeft = false;
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
          this.startHeartbeat();
          this.events.onMatchStart?.(this.mySide, this.tcId);
          this.events.onPhaseChange?.('playing');

          // Reply with welcome packet to guest
          this.broadcastMessage({
            type: 'HOST_WELCOME',
            hostSide: hostColor,
            guestSide: guestColor,
            tcId: this.tcId,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          });
        } else if (this.isHost && this.phase === 'playing') {
          // Guest reconnected with GUEST_JOIN while match is in progress
          this.handleOpponentReconnect();
        }
        break;
      }

      case 'HOST_READY': {
        if (!this.isHost && (this.phase === 'joining' || this.phase === 'idle')) {
          this.broadcastMessage({
            type: 'GUEST_JOIN',
            guestId: this.myId || 'tab_guest',
          });
        }
        break;
      }

      case 'HOST_WELCOME': {
        this.hasOpponentJoined = true;
        this.opponentHasLeft = false;
        if (!this.isHost && (this.phase === 'joining' || this.phase === 'waiting' || this.phase === 'idle')) {
          if (msg.guestSide === 'w' || msg.guestSide === 'b') {
            this.mySide = msg.guestSide;
            if (msg.tcId && TIME_CONTROLS[msg.tcId]) {
              this.tcId = msg.tcId;
            }
            this.phase = 'playing';
            this.startHeartbeat();
            this.events.onMatchStart?.(this.mySide, this.tcId);
            this.events.onPhaseChange?.('playing');
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
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
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
            promotion:
              typeof msg.move.promotion === 'string' && /^[qrbn]$/i.test(msg.move.promotion)
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
          this.stopHeartbeat();
          this.events.onPhaseChange?.('over');
          this.events.onOpponentResigned?.(msg.side);
        }
        break;
      }

      case 'TIMEOUT': {
        if (msg.side === 'w' || msg.side === 'b') {
          this.phase = 'over';
          this.stopHeartbeat();
          this.events.onPhaseChange?.('over');
          this.events.onOpponentTimeout?.(msg.side);
        }
        break;
      }

      case 'DISCONNECT_INTENT': {
        this.opponentHasLeft = true;
        this.rematchState = 'none';
        this.events.onRematchStateChange?.('none');
        this.events.onOpponentLeftRoom?.();
        if (this.phase === 'playing') {
          this.handleOpponentDisconnect();
        }
        break;
      }

      case 'HEARTBEAT': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        this.broadcastMessage({ type: 'HEARTBEAT_ACK', ts: msg.ts });
        break;
      }

      case 'HEARTBEAT_ACK': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        break;
      }

      case 'RECONNECT_REQUEST': {
        if (this.phase === 'playing') {
          this.handleOpponentReconnect();
        }
        break;
      }

      case 'RECONNECT_ACK': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        if (this.phase !== 'over') {
          this.phase = 'playing';
          this.startHeartbeat();
          const mySide = this.isHost ? msg.hostSide : msg.guestSide;
          this.mySide = mySide;
          if (msg.tcId && TIME_CONTROLS[msg.tcId]) {
            this.tcId = msg.tcId;
          }
          this.events.onPhaseChange?.('playing');
          this.events.onMatchSync?.({
            mySide,
            tcId: this.tcId,
            fen: msg.fen,
            history: msg.history,
            lastMove: msg.lastMove,
            whiteTimeRemaining: msg.whiteTimeRemaining,
            blackTimeRemaining: msg.blackTimeRemaining,
          });
        }
        break;
      }

      case 'DISCONNECT_FORFEIT': {
        if (this.phase === 'playing') {
          this.phase = 'over';
          this.stopHeartbeat();
          this.events.onPhaseChange?.('over');
          this.events.onDisconnectForfeit?.(msg.winnerSide);
        }
        break;
      }

      case 'PING': {
        if (typeof msg.ts === 'number' && Number.isFinite(msg.ts)) {
          this.broadcastMessage({ type: 'PONG', ts: msg.ts });
        }
        break;
      }

      case 'PONG': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        break;
      }

      case 'REMATCH_OFFER': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        if (this.phase === 'over' || this.phase === 'playing') {
          if (this.rematchState === 'offered_by_me') {
            // Both offered rematch simultaneously
            this.rematchState = 'accepted';
            this.events.onRematchStateChange?.(this.rematchState);
            if (this.isHost) {
              this.startRematchGame();
            } else {
              this.broadcastMessage({ type: 'REMATCH_ACCEPT' });
            }
          } else {
            this.rematchState = 'offered_by_opponent';
            this.events.onRematchOfferReceived?.();
            this.events.onRematchStateChange?.(this.rematchState);
          }
        }
        break;
      }

      case 'REMATCH_ACCEPT': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        if (this.isHost) {
          this.rematchState = 'accepted';
          this.events.onRematchStateChange?.(this.rematchState);
          this.startRematchGame();
        }
        break;
      }

      case 'REMATCH_START': {
        this.lastOpponentSeenAt = Date.now();
        if (this.isOpponentDisconnected) {
          this.handleOpponentReconnect();
        }
        if (!this.isHost) {
          this.rematchState = 'none';
          this.mySide = msg.guestSide;
          if (msg.tcId && TIME_CONTROLS[msg.tcId]) {
            this.tcId = msg.tcId;
          }
          this.phase = 'playing';
          this.isOpponentDisconnected = false;
          this.disconnectSecondsRemaining = 15;
          this.startHeartbeat();
          this.events.onRematchStateChange?.('none');
          this.events.onMatchStart?.(this.mySide, this.tcId);
          this.events.onPhaseChange?.('playing');
        }
        break;
      }

      case 'REMATCH_DECLINE': {
        this.lastOpponentSeenAt = Date.now();
        this.rematchState = 'none';
        this.events.onRematchDeclined?.();
        this.events.onRematchStateChange?.('none');
        break;
      }

      case 'REMATCH_CANCEL': {
        this.lastOpponentSeenAt = Date.now();
        if (this.rematchState === 'offered_by_opponent') {
          this.rematchState = 'none';
          this.events.onRematchCancelled?.();
          this.events.onRematchStateChange?.('none');
        }
        break;
      }

      case 'PLAYER_LEFT': {
        this.opponentHasLeft = true;
        this.rematchState = 'none';
        this.events.onRematchStateChange?.('none');
        this.events.onOpponentLeftRoom?.();
        break;
      }

      default:
        break;
    }
  }

  private cleanup() {
    this.stopHeartbeat();
    this.rematchState = 'none';
    this.opponentHasLeft = false;
    this.hasOpponentJoined = false;
    if (this.hostPollInterval) {
      clearInterval(this.hostPollInterval);
      this.hostPollInterval = null;
    }
    if (this.joinPollInterval) {
      clearInterval(this.joinPollInterval);
      this.joinPollInterval = null;
    }
    if (this.disconnectTimer) {
      clearInterval(this.disconnectTimer);
      this.disconnectTimer = null;
    }
    this.isOpponentDisconnected = false;
    this.disconnectSecondsRemaining = 15;
    this.mySide = null;
    this.phase = 'idle';
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
    this.unbindWindowEvents();
  }
}
