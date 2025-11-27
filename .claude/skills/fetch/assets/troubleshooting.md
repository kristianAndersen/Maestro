# Fetch Skill: Troubleshooting

Common fetch issues and solutions.

## Network Issues

### Connection Timeouts
```bash
# Increase timeout
curl -m 60 url  # 60 second timeout

# Check if host is reachable
ping -c 3 example.com
```

### DNS Resolution Failures
```bash
# Verify DNS
nslookup example.com

# Try different DNS
curl --dns-servers 8.8.8.8 url
```

### SSL/TLS Errors
```bash
# Check certificate
curl -vI https://example.com

# Ignore SSL (NOT for production)
curl -k https://example.com
```

## API Issues

### Rate Limiting (429)
```bash
# Check rate limit headers
curl -I https://api.example.com

# Implement backoff
if [ "$http_code" = "429" ]; then
  retry_after=$(grep -i "retry-after" headers.txt | cut -d' ' -f2)
  sleep $retry_after
fi
```

### Authentication Failures (401/403)
```bash
# Verify token
echo "Token: $API_KEY"

# Check token expiry
# Refresh if needed
```

### Malformed Responses
```bash
# Validate response format
if ! echo "$response" | jq empty 2>/dev/null; then
  echo "Invalid JSON: $response"
fi

# Check content type
content_type=$(curl -sI url | grep -i content-type)
```

## Performance Issues

### Slow Requests
```bash
# Measure time
time curl https://slow-api.com

# Use compression
curl --compressed url

# Parallel requests
for url in "${urls[@]}"; do
  curl -s "$url" &
done
wait
```

### Large Responses
```bash
# Stream processing
curl -s large-api | jq -c '.items[]' | while read item; do
  process "$item"
done

# Limit response size
curl -r 0-10000 url  # First 10KB only
```
