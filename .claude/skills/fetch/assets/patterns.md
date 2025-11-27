# Fetch Skill: Patterns

Concrete fetch examples and templates.

## API Patterns

```bash
# REST API with auth
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://api.example.com/v1/resource

# GraphQL query
curl -X POST https://api.example.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ user(id: 123) { name email } }"}'

# Paginated API
page=1
while true; do
  data=$(curl -s "https://api.example.com/items?page=$page")
  echo "$data" | jq -e '.items | length' > /dev/null || break
  echo "$data" | jq '.items[]'
  page=$((page + 1))
done
```

## Web Scraping

```bash
# Extract data with grep
curl -s https://example.com/page | \
  grep -oP '(?<=<title>).*(?=</title>)'

# Extract with HTML parsing
curl -s https://example.com | \
  pup 'h1 text{}'
```

## Rate Limiting

```bash
# Respect rate limits
rate_limit=10  # requests per second
interval=$(awk "BEGIN {print 1/$rate_limit}")

for url in "${urls[@]}"; do
  curl -s "$url"
  sleep $interval
done
```

## File Downloads

```bash
# Download with resume support
curl -C - -O https://example.com/large-file.zip

# Download with progress
curl -# -O https://example.com/file.zip

# Verify checksum
curl -s https://example.com/file.zip | sha256sum
```
