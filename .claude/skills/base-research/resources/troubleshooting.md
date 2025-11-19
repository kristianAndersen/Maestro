# BaseResearch Skill: Troubleshooting

Handling research challenges and verification strategies.

## Common Issues

### Issue: Conflicting Information

**Problem:** Different sources say different things.

**Solutions:**
1. Check source authority (official docs > blog posts)
2. Check recency (newer usually better)
3. Test yourself to verify
4. Look for consensus among reputable sources

### Issue: Incomplete Information

**Problem:** Can't find answer to specific question.

**Solutions:**
1. Broaden search (related terms)
2. Check source code directly
3. Look at tests for usage examples
4. Ask in appropriate forum/channel

### Issue: Outdated Information

**Problem:** Tutorial/docs don't match current version.

**Solutions:**
```bash
# Check version
cat package.json | jq '.version'

# Find docs for your version
ls docs/v* | grep "$(cat package.json | jq -r '.version' | cut -d. -f1)"

# Check changelog
cat CHANGELOG.md | grep -A 10 "$(cat package.json | jq -r '.version')"
```

### Issue: Too Much Information

**Problem:** Overwhelmed by volume of information.

**Solutions:**
1. Start with official quick start
2. Limit to top 3 sources initially
3. Focus on answering specific question
4. Use progressive refinement

## Verification Strategies

### Verify by Testing
```bash
# Don't just read - test it
# Create minimal example
cat > test.py << 'EOF'
from library import feature
result = feature.do_thing()
print(result)
EOF

python test.py  # Does it work as documented?
```

### Verify by Cross-Reference
```bash
# Check multiple sources
official=$(grep "definition" docs/official.md)
code=$(grep -A 5 "def definition" src/library.py)
test=$(grep "definition" tests/test_library.py)

# Do they agree?
```

### Verify Currency
```bash
# Check how recent information is
stat -c%y docs/guide.md
git log -1 --format="%ai" docs/guide.md

# Look for "Last updated" in docs
grep -i "last updated\|updated:" docs/
```
