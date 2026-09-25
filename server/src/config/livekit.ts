import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { ENV } from './env';
import { logger } from '../utils/logger';

const LIVEKIT_URL = ENV.LIVEKIT_URL;
const LIVEKIT_API_KEY = ENV.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = ENV.LIVEKIT_API_SECRET;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  logger.warn('[LiveKit] Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET in environment variables.');
}

// Instantiate RoomServiceClient if config exists, or dummy client fallback
export const roomService = LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET
  ? new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
  : null;

export const LIVEKIT_WS_URL = LIVEKIT_URL;

export interface TokenParams {
  identity: string;
  name: string;
  roomName: string;
  canPublish: boolean; // true for broadcasting admin, false for viewer
}

/**
 * Generates an authorized LiveKit JWT token for publisher or subscriber
 */
export async function createAccessToken({
  identity,
  name,
  roomName,
  canPublish,
}: TokenParams): Promise<string> {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    // Generate fallback demo token for dev/testing when livekit keys are not yet configured
    logger.warn('[LiveKit] Returning demo token because LIVEKIT_API_KEY / SECRET is not set.');
    return `demo_token_${identity}_${roomName}`;
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: '6h',
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    canPublishData: true, // Data channel allowed for realtime signaling/chat if needed
  });

  return at.toJwt();
}
