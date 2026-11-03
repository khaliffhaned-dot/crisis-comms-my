import mcpWorker from './index';
import { handleIncidentApi } from './incidentApi';
import type { Env } from './env';

/** Route incident CRUD to its authenticated API handler; keep MCP routes unchanged. */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (/^\/api\/incidents(?:\/|$)/.test(pathname)) {
      return handleIncidentApi(request, env);
    }
    return mcpWorker.fetch(request, env, ctx);
  },
};
