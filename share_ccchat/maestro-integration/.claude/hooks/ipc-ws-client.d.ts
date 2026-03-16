export declare function isBrokerAlive(): boolean;
export declare function spawnBroker(): Promise<void>;
export declare function ensureBroker(): Promise<void>;
export declare function connectBroker(timeoutMs?: number): Promise<WebSocket | null>;
export declare function registerWithBroker(
  ws: WebSocket,
  name: string,
  sessionId: string,
  timeoutMs?: number
): Promise<{ queuedCount: number } | null>;
export declare function sendToBroker(
  ws: WebSocket,
  payload: unknown,
  timeoutMs?: number
): Promise<unknown>;
export declare function closeBroker(ws: WebSocket | null): void;
