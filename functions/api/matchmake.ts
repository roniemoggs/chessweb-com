// Cloudflare Pages Function for serverless matchmaking

interface MatchTicket {
  ticketId: string;
  playerId: string;
  timeControl: '3+0' | '5+0' | '10+0' | 'any';
  createdAt: number;
  lastSeenAt: number;
  status: 'waiting' | 'matched' | 'cancelled';
  matchData?: {
    roomCode: string;
    role: 'host' | 'guest';
    mySide: 'w' | 'b';
    timeControl: '3+0' | '5+0' | '10+0';
  };
}

// In-memory global isolate store for Cloudflare Workers
const globalQueue = new Map<string, MatchTicket>();

function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function pruneExpiredTickets() {
  const now = Date.now();
  for (const [id, ticket] of globalQueue.entries()) {
    // Drop tickets older than 25 seconds without poll
    if (now - ticket.lastSeenAt > 25000 || ticket.status === 'cancelled') {
      globalQueue.delete(id);
    }
  }
}

export const onRequestPost: PagesFunction<{ MATCHMAKING_KV?: KVNamespace }> = async (context) => {
  try {
    const body: any = await context.request.json();
    const action = body?.action;
    const playerId = body?.playerId || 'anon';
    const now = Date.now();

    pruneExpiredTickets();

    // 1. JOIN MATCHMAKING QUEUE
    if (action === 'join') {
      const timeControl = body?.timeControl || 'any';

      // Look for a compatible waiting player
      let matchedTicket: MatchTicket | null = null;
      for (const ticket of globalQueue.values()) {
        if (
          ticket.status === 'waiting' &&
          ticket.playerId !== playerId &&
          (now - ticket.lastSeenAt < 20000)
        ) {
          const isTcCompatible =
            ticket.timeControl === 'any' ||
            timeControl === 'any' ||
            ticket.timeControl === timeControl;

          if (isTcCompatible) {
            matchedTicket = ticket;
            break;
          }
        }
      }

      if (matchedTicket) {
        // Form match
        const resolvedTc: '3+0' | '5+0' | '10+0' =
          matchedTicket.timeControl !== 'any'
            ? matchedTicket.timeControl
            : timeControl !== 'any'
            ? timeControl
            : '5+0';

        const roomCode = generateRoomCode();
        const waitingIsWhite = Math.random() < 0.5;

        // Waiting player becomes host
        matchedTicket.status = 'matched';
        matchedTicket.matchData = {
          roomCode,
          role: 'host',
          mySide: waitingIsWhite ? 'w' : 'b',
          timeControl: resolvedTc,
        };

        // Joining player becomes guest
        return new Response(
          JSON.stringify({
            status: 'matched',
            matchData: {
              roomCode,
              role: 'guest',
              mySide: waitingIsWhite ? 'b' : 'w',
              timeControl: resolvedTc,
            },
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // No match yet - create ticket
      const ticketId = 't_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const newTicket: MatchTicket = {
        ticketId,
        playerId,
        timeControl,
        createdAt: now,
        lastSeenAt: now,
        status: 'waiting',
      };
      globalQueue.set(ticketId, newTicket);

      return new Response(
        JSON.stringify({
          status: 'waiting',
          ticketId,
          queueSize: globalQueue.size,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. POLL FOR TICKET STATUS
    if (action === 'poll') {
      const ticketId = body?.ticketId;
      if (!ticketId || !globalQueue.has(ticketId)) {
        return new Response(
          JSON.stringify({ status: 'expired' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      const ticket = globalQueue.get(ticketId)!;

      if (ticket.status === 'matched' && ticket.matchData) {
        const matchData = ticket.matchData;
        globalQueue.delete(ticketId); // Finished
        return new Response(
          JSON.stringify({
            status: 'matched',
            matchData,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (ticket.status === 'waiting') {
        ticket.lastSeenAt = now;
        return new Response(
          JSON.stringify({
            status: 'waiting',
            ticketId,
            elapsedSeconds: Math.floor((now - ticket.createdAt) / 1000),
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ status: 'expired' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. CANCEL TICKET
    if (action === 'cancel') {
      const ticketId = body?.ticketId;
      if (ticketId && globalQueue.has(ticketId)) {
        globalQueue.delete(ticketId);
      }
      return new Response(
        JSON.stringify({ status: 'cancelled' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'error', message: 'Unknown action' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'error', message: err?.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};
