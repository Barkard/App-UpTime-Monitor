export interface CheckerResult {
  success: boolean;
  latency: number | null;
  error: string | null;
  timestamp: Date;
}

export interface Checker {
  check(host: string, port?: number, timeout?: number): Promise<CheckerResult>;
}
