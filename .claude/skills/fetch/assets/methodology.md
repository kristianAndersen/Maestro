# Fetch Skill: Methodology

Advanced fetch strategies, error recovery, caching patterns, and systematic data retrieval approaches.

## Fetch Strategies

### Strategy: Circuit Breaker
Prevent cascading failures:
- Track failure rate
- Open circuit after threshold (stop requests)
- Half-open after cooldown (test recovery)
- Close circuit when recovered

### Strategy: Fallback Chain
Try multiple sources:
1. Primary API
2. Secondary API
3. Cached data
4. Default value

### Strategy: Batch Fetching
Reduce requests:
- Collect multiple requests
- Batch into single API call
- Distribute results

## Error Recovery

### Transient vs Permanent Errors
**Transient (retry):** Network blips, timeouts, rate limits, server overload
**Permanent (don't retry):** 404, 401, 400, malformed requests

### Recovery Patterns
- Exponential backoff
- Jitter to prevent thundering herd
- Max retries limit
- Circuit breaker for persistent failures

## Caching

### When to Cache
- Data doesn't change frequently
- Expensive to fetch
- High latency source
- Rate-limited API

### Cache Invalidation
- Time-based (TTL)
- Event-based (on update)
- Manual (on demand)
- Conditional requests (ETags)
