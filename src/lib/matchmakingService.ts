/**
 * Client service for serverless quick match matchmaking.
 */

export type QuickMatchTimeControl = '3+0' | '5+0' | '10+0' | 'any';

export interface MatchData {
  roomCode: string;
  role: 'host' | 'guest';
  mySide: 'w' | 'b';
  timeControl: '3+0' | '5+0' | '10+0';
}

export type MatchmakingResponse =
  | { status: 'waiting'; ticketId: string; queueSize?: number; elapsedSeconds?: number }
  | { status: 'matched'; matchData: MatchData }
  | { status: 'cancelled' }
  | { status: 'expired' }
  | { status: 'error'; message: string };

export interface MatchmakingCallbacks {
  onWaiting?: (elapsedSeconds: number, ticketId: string) => void;
  onMatched?: (data: MatchData) => void;
  onTimeout?: () => void;
  onError?: (err: string) => void;
  onCancelled?: () => void;
}

function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let pid = sessionStorage.getItem('chess_online_player_id');
    if (!pid) {
      pid = 'p_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('chess_online_player_id', pid);
    }
    return pid;
  } catch (e) {
    return 'p_' + Math.random().toString(36).substring(2, 10);
  }
}

export class MatchmakingService {
  private currentTicketId: string | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private searchStartTime: number = 0;
  private isSearching: boolean = false;
  private callbacks: MatchmakingCallbacks = {};
  private playerId: string = '';

  constructor() {
    this.playerId = getOrCreatePlayerId();
  }

  public getIsSearching(): boolean {
    return this.isSearching;
  }

  public getCurrentTicketId(): string | null {
    return this.currentTicketId;
  }

  public async startMatchmaking(
    timeControl: QuickMatchTimeControl = 'any',
    callbacks: MatchmakingCallbacks = {}
  ): Promise<void> {
    this.cancelMatchmaking();
    this.callbacks = callbacks;
    this.isSearching = true;
    this.searchStartTime = Date.now();

    try {
      const res = await fetch('/api/matchmake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerId: this.playerId,
          timeControl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Matchmaking join failed: ${res.status}`);
      }

      const data: MatchmakingResponse = await res.json();

      if (data.status === 'matched') {
        this.isSearching = false;
        this.callbacks.onMatched?.(data.matchData);
        return;
      }

      if (data.status === 'waiting') {
        this.currentTicketId = data.ticketId;
        this.callbacks.onWaiting?.(0, data.ticketId);
        this.startPolling();
        return;
      }

      throw new Error(data.status === 'error' ? data.message : 'Failed to join queue');
    } catch (err: any) {
      console.error('Matchmaking error:', err);
      this.isSearching = false;
      this.callbacks.onError?.(err?.message || 'Matchmaking request failed');
    }
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(async () => {
      if (!this.isSearching || !this.currentTicketId) {
        this.stopPolling();
        return;
      }

      const elapsed = Math.floor((Date.now() - this.searchStartTime) / 1000);
      this.callbacks.onWaiting?.(elapsed, this.currentTicketId);

      try {
        const res = await fetch('/api/matchmake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'poll',
            ticketId: this.currentTicketId,
            playerId: this.playerId,
          }),
        });

        if (!res.ok) {
          return;
        }

        const data: MatchmakingResponse = await res.json();

        if (data.status === 'matched') {
          this.stopPolling();
          this.isSearching = false;
          this.currentTicketId = null;
          this.callbacks.onMatched?.(data.matchData);
        } else if (data.status === 'expired') {
          this.stopPolling();
          this.isSearching = false;
          this.currentTicketId = null;
          this.callbacks.onTimeout?.();
        }
      } catch (err) {
        console.warn('Matchmaking poll tick failed:', err);
      }
    }, 1200);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  public async cancelMatchmaking(): Promise<void> {
    const tid = this.currentTicketId;
    this.stopPolling();
    this.isSearching = false;
    this.currentTicketId = null;

    if (tid) {
      try {
        await fetch('/api/matchmake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cancel',
            ticketId: tid,
            playerId: this.playerId,
          }),
        });
      } catch (e) {
        // Ignore network cancellation error
      }
    }

    this.callbacks.onCancelled?.();
  }
}
