import { EventEmitter } from 'events';
import { Event } from '../infrastructure/events';

export class OrchestrationEngine {
  private bus = new EventEmitter();
  private agents = new Map<string, { lastHeartbeat: Date }>();

  public publish(event: Event) {
    this.bus.emit(event.type, event);
  }

  public subscribe(type: string, handler: (event: Event) => void) {
    this.bus.on(type, handler);
  }

  public registerAgent(agentId: string) {
    this.agents.set(agentId, { lastHeartbeat: new Date() });
    console.log(`Agent ${agentId} registered.`);
  }

  public heartbeat(agentId: string) {
    if (this.agents.has(agentId)) {
      this.agents.get(agentId)!.lastHeartbeat = new Date();
    }
  }
}

export const ceo = new OrchestrationEngine();
