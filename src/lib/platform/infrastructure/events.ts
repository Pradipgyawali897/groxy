import { z } from 'zod';

export const EventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  source: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.any()),
});

export type Event = z.infer<typeof EventSchema>;

export const AUTH_SESSION_REFRESHED = 'AUTH_SESSION_REFRESHED';
export const AGENT_REGISTERED = 'AGENT_REGISTERED';
export const AGENT_HEARTBEAT = 'AGENT_HEARTBEAT';
export const SECURITY_POLICY_UPDATED = 'SECURITY_POLICY_UPDATED';
export const SESSION_EXPIRED = 'SESSION_EXPIRED';
export const SYSTEM_RECOVERY_STARTED = 'SYSTEM_RECOVERY_STARTED';
