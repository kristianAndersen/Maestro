---
name: fetch
description: Activates for external data retrieval operations; provides guidance on error handling, retry logic, and validation
permissionMode: acceptAll
tools: WebSearch, WebFetch, Task
---

# Fetch Skill

## Purpose

This skill provides comprehensive guidance for retrieving data from external sources like APIs, web pages, files, and databases. It helps you handle errors gracefully, implement retry logic, validate responses, and manage caching effectively.

## When to Use This Skill

This skill automatically activates when:
- Fetching data from APIs or web services
- Scraping web pages for information
- Reading remote files or resources
- Querying external databases
- Retrieving any data from outside the current process

## Quick Start

For 80% of fetch operations, follow these principles:

1. **Expect failures** - External services fail; handle errors gracefully
2. **Validate responses** - Check status codes, verify data format
3. **Implement retries** - Transient failures are common; retry with backoff
4. **Cache when appropriate** - Reduce load and improve performance
5. **Set timeouts** - Don't wait forever; fail fast when service is down

## Core Principles

### 1. **Graceful Degradation**
External services fail. Design fetch operations to handle failures without crashing.

### 2. **Retry with Backoff**
Transient failures recover. Retry failed requests with exponential backoff.

### 3. **Validation Before Trust**
Always validate external data. Check format, type, and content before using.

### 4. **Resource Management**
Clean up connections, file handles, and other resources even when errors occur.

### 5. **Observability**
Log fetch operations for debugging. Track success rates, latency, and errors.

## Fetch Patterns

### Pattern 1: HTTP API Request with Error Handling

```bash
# Basic HTTP fetch with error handling
curl -f -s -S -m 10 https://api.example.com/data || {
  echo "API request failed"
  exit 1
}

# With retry logic
for i in {1..3}; do
  if curl -f -s -m 10 https://api.example.com/data > /tmp/data.json; then
    break
  fi
  echo "Retry $i failed, waiting..."
  sleep $((i * 2))
done
```

### Pattern 2: Validate Response Format

```bash
# Fetch and validate JSON
data=$(curl -s https://api.example.com/data)

# Validate it's valid JSON
if echo "$data" | jq empty 2>/dev/null; then
  echo "Valid JSON received"
else
  echo "Invalid JSON response"
  exit 1
fi
```

### Pattern 3: Fetch with Timeout

```bash
# Set timeout to avoid hanging
timeout 30s curl https://slow-api.example.com/data || {
  echo "Request timed out after 30 seconds"
  exit 1
}
```

### Pattern 4: Cache Fetch Results

```bash
# Check cache first
cache_file="/tmp/api_cache_$(date +%Y%m%d).json"

if [ -f "$cache_file" ] && [ $(find "$cache_file" -mmin -60 | wc -l) -gt 0 ]; then
  # Cache hit (less than 60 minutes old)
  cat "$cache_file"
else
  # Cache miss - fetch and cache
  curl -s https://api.example.com/data | tee "$cache_file"
fi
```

### Pattern 5: Fetch with Authentication

```bash
# API key in header
curl -H "Authorization: Bearer $API_KEY" \
     https://api.example.com/protected

# Basic auth
curl -u username:password \
     https://api.example.com/protected
```

## Error Handling

### HTTP Status Codes

```bash
# Check HTTP status
response=$(curl -s -w "\n%{http_code}" https://api.example.com/data)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

case $http_code in
  200)
    echo "Success"
    ;;
  404)
    echo "Not found"
    exit 1
    ;;
  429)
    echo "Rate limited - wait and retry"
    sleep 60
    ;;
  5*)
    echo "Server error - retry later"
    exit 1
    ;;
  *)
    echo "Unexpected status: $http_code"
    exit 1
    ;;
esac
```

### Network Errors

```bash
# Handle network failures
if ! curl -f -s -m 10 https://api.example.com/data > /tmp/data.json 2>/tmp/error.log; then
  # Check error type
  if grep -q "Could not resolve host" /tmp/error.log; then
    echo "DNS resolution failed"
  elif grep -q "Connection refused" /tmp/error.log; then
    echo "Connection refused"
  elif grep -q "timeout" /tmp/error.log; then
    echo "Request timed out"
  else
    echo "Network error: $(cat /tmp/error.log)"
  fi
  exit 1
fi
```

## Retry Strategies

### Exponential Backoff

```bash
#!/bin/bash
# Retry with exponential backoff

max_attempts=5
attempt=1

while [ $attempt -le $max_attempts ]; do
  if curl -f -s https://api.example.com/data > /tmp/data.json; then
    echo "Success on attempt $attempt"
    exit 0
  fi

  if [ $attempt -eq $max_attempts ]; then
    echo "Failed after $max_attempts attempts"
    exit 1
  fi

  wait_time=$((2 ** attempt))
  echo "Attempt $attempt failed. Waiting $wait_time seconds..."
  sleep $wait_time
  attempt=$((attempt + 1))
done
```

### Retry with Jitter

```bash
# Add randomness to prevent thundering herd
max_attempts=3

for attempt in $(seq 1 $max_attempts); do
  if fetch_data; then
    exit 0
  fi

  # Exponential backoff with jitter
  base_wait=$((2 ** attempt))
  jitter=$((RANDOM % base_wait))
  wait_time=$((base_wait + jitter))

  echo "Waiting $wait_time seconds..."
  sleep $wait_time
done
```

## Data Validation

### Validate JSON Structure

```bash
# Fetch and validate expected structure
data=$(curl -s https://api.example.com/user/123)

# Check required fields exist
if echo "$data" | jq -e '.id, .name, .email' > /dev/null; then
  echo "Valid user data"
else
  echo "Missing required fields"
  exit 1
fi

# Validate data types
if echo "$data" | jq -e '.id | type == "number"' > /dev/null; then
  echo "ID is number"
else
  echo "ID should be number"
  exit 1
fi
```

### Validate Content

```bash
# Check data is not empty
data=$(curl -s https://api.example.com/data)

if [ -z "$data" ]; then
  echo "Empty response"
  exit 1
fi

# Check minimum size
if [ ${#data} -lt 10 ]; then
  echo "Response too small (likely error)"
  exit 1
fi
```

## Caching Strategies

### Time-Based Cache

```bash
cache_file="/tmp/cache_${resource_id}.json"
cache_duration=3600  # 1 hour in seconds

if [ -f "$cache_file" ]; then
  cache_age=$(($(date +%s) - $(stat -c%Y "$cache_file" 2>/dev/null || stat -f%m "$cache_file")))

  if [ $cache_age -lt $cache_duration ]; then
    echo "Cache hit"
    cat "$cache_file"
    exit 0
  fi
fi

echo "Cache miss - fetching"
curl -s https://api.example.com/resource | tee "$cache_file"
```

### Conditional Requests (ETag)

```bash
# Store ETag from previous request
etag_file="/tmp/etag_${resource_id}.txt"

if [ -f "$etag_file" ]; then
  etag=$(cat "$etag_file")
  response=$(curl -s -w "\n%{http_code}" -H "If-None-Match: $etag" https://api.example.com/data)
  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" = "304" ]; then
    echo "Not modified - use cached data"
    cat "/tmp/cache_${resource_id}.json"
    exit 0
  fi
fi

# Fetch and update cache
new_data=$(curl -s -D /tmp/headers https://api.example.com/data)
new_etag=$(grep -i "^ETag:" /tmp/headers | cut -d' ' -f2)
echo "$new_etag" > "$etag_file"
echo "$new_data" | tee "/tmp/cache_${resource_id}.json"
```

## Resources (Progressive Disclosure)

- **`resources/methodology.md`** - Advanced fetch strategies, error recovery techniques, caching approaches
- **`resources/patterns.md`** - Concrete examples of API patterns, web scraping, data validation templates
- **`resources/troubleshooting.md`** - Network errors, rate limiting, timeout handling, authentication issues

## Anti-Patterns

### ❌ No Error Handling
```bash
# BAD
data=$(curl https://api.example.com/data)
process_data "$data"

# GOOD
if data=$(curl -f -s https://api.example.com/data); then
  process_data "$data"
else
  echo "Fetch failed"
  exit 1
fi
```

### ❌ No Timeout
```bash
# BAD: Might hang forever
curl https://slow-api.example.com/data

# GOOD: Fail after reasonable time
curl -m 30 https://slow-api.example.com/data
```

### ❌ No Retry Logic
```bash
# BAD: Single attempt
curl https://api.example.com/data || exit 1

# GOOD: Retry with backoff
for i in {1..3}; do
  curl https://api.example.com/data && break
  sleep $((i * 2))
done
```

### ❌ No Response Validation
```bash
# BAD: Trust external data
data=$(curl https://api.example.com/data)
process "$data"  # Might be error HTML!

# GOOD: Validate format
data=$(curl https://api.example.com/data)
echo "$data" | jq empty || exit 1  # Verify JSON
process "$data"
```

## Quick Reference

```bash
# Fetch with full error handling
curl -f -s -S -m 30 https://api.example.com/data

# Retry with backoff
for i in {1..3}; do
  curl -f -s https://api.example.com/data && break
  sleep $((2 ** i))
done

# Validate JSON
echo "$data" | jq empty

# Check HTTP status
curl -s -w "%{http_code}" https://api.example.com/data

# Use cache
[ -f cache.json ] && [ $(find cache.json -mmin -60 | wc -l) -gt 0 ] && cat cache.json || curl -s url | tee cache.json
```
