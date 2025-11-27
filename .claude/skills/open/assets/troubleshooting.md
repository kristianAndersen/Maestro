# Open Skill: Troubleshooting

Common issues with solutions, edge case handling, encoding problems, performance optimization, and known limitations for file reading operations.

---

## Table of Contents

1. [Common Issues](#common-issues)
2. [Encoding Problems](#encoding-problems)
3. [Performance Issues](#performance-issues)
4. [Edge Cases](#edge-cases)
5. [Known Limitations](#known-limitations)

---

## Common Issues

### Issue: File Won't Display Properly

**Problem:**
```bash
cat file.txt
# Output: Garbled characters, �, boxes
```

**Solutions:**

```bash
# Check encoding
file -bi file.txt

# Convert if needed
iconv -f ISO-8859-1 -t UTF-8 file.txt > file-utf8.txt

# Force UTF-8 interpretation
iconv -c -f UTF-8 -t UTF-8 file.txt

# Try different encoding
iconv -f WINDOWS-1252 -t UTF-8 file.txt
```

---

### Issue: Terminal Hangs When Reading

**Problem:**
```bash
cat huge-file.txt
# Terminal freezes or takes forever
```

**Solutions:**

```bash
# Check size FIRST
ls -lh huge-file.txt

# Use pagination
less huge-file.txt

# Read limited amount
head -n 100 huge-file.txt

# Sample instead
head -n 50 huge-file.txt && echo "..." && tail -n 50 huge-file.txt
```

---

### Issue: Binary File Shows Garbage

**Problem:**
```bash
cat binary-file
# Output: Corrupts terminal, shows random characters
```

**Solutions:**

```bash
# Check file type first
file binary-file

# Use hex dump instead
hexdump -C binary-file | head -20

# Extract strings
strings binary-file | head -100

# Reset terminal if corrupted
reset
```

---

### Issue: Cannot Read File (Permission Denied)

**Problem:**
```bash
cat protected-file.txt
# cat: protected-file.txt: Permission denied
```

**Solutions:**

```bash
# Check permissions
ls -l protected-file.txt

# Read with sudo (if appropriate)
sudo cat protected-file.txt

# Check if you're in the right group
groups
ls -l protected-file.txt

# Copy to readable location
sudo cp protected-file.txt /tmp/readable.txt
sudo chmod 644 /tmp/readable.txt
cat /tmp/readable.txt
```

---

## Encoding Problems

### Problem: Mixed Encodings in File

**Symptoms:**
- Some characters display correctly, others don't
- Inconsistent formatting
- Special characters broken

**Diagnosis:**

```bash
# Check detected encoding
file -bi file.txt

# Try to detect encoding with chardet
python3 -c "import chardet; print(chardet.detect(open('file.txt', 'rb').read()))"

# Look for byte order marks
hexdump -C file.txt | head -1
```

**Solutions:**

```bash
# Convert to UTF-8 (allowing errors)
iconv -f ISO-8859-1 -t UTF-8 -c file.txt > output.txt

# Use Python for robust handling
python3 << 'EOF'
with open('file.txt', 'rb') as f:
    content = f.read()
    # Try multiple encodings
    for encoding in ['utf-8', 'latin-1', 'cp1252']:
        try:
            decoded = content.decode(encoding)
            print(f"Successfully decoded with {encoding}")
            print(decoded)
            break
        except:
            continue
EOF
```

---

### Problem: Null Bytes in Text File

**Symptoms:**
- File appears truncated
- `cat` stops mid-file
- Tools behave unexpectedly

**Diagnosis:**

```bash
# Check for null bytes
hexdump -C file.txt | grep "00 "

# Count null bytes
tr -cd '\000' < file.txt | wc -c
```

**Solutions:**

```bash
# Remove null bytes
tr -d '\000' < file.txt > cleaned.txt

# Replace null bytes with newlines
tr '\000' '\n' < file.txt > output.txt

# View with strings (ignores nulls)
strings file.txt
```

---

### Problem: Line Endings (CRLF vs LF)

**Symptoms:**
- Extra ^M characters
- Scripts fail to execute
- Diff shows all lines changed

**Diagnosis:**

```bash
# Check line ending type
file file.txt  # Shows "CRLF" or "LF"

# Visualize line endings
cat -v file.txt | head
```

**Solutions:**

```bash
# Convert CRLF to LF
dos2unix file.txt

# Or using sed
sed -i 's/\r$//' file.txt

# Or using tr
tr -d '\r' < file.txt > output.txt

# Convert LF to CRLF (if needed for Windows)
unix2dos file.txt
```

---

## Performance Issues

### Issue: Reading Large Files is Slow

**Problem:**
File takes minutes to load or display.

**Solutions:**

```bash
# Don't load entire file
# Instead, use sampling

# First 1000 lines
head -n 1000 large-file.txt

# Specific line range
sed -n '1000,2000p' large-file.txt

# Search without full load
grep "pattern" large-file.txt

# Use less for interactive viewing
less large-file.txt
```

---

### Issue: Out of Memory Errors

**Problem:**
```bash
content=$(cat huge-file.txt)
# bash: cannot allocate memory
```

**Solutions:**

```bash
# NEVER load large files into variables
# Use streaming instead

# Stream processing
while IFS= read -r line; do
  process "$line"
done < huge-file.txt

# Or use tools that stream
grep "pattern" huge-file.txt | process_output.sh

# Process in chunks
split -l 10000 huge-file.txt chunk_
for chunk in chunk_*; do
  process_chunk "$chunk"
done
rm chunk_*
```

---

### Issue: Slow Over Network

**Problem:**
Reading files over network mount is very slow.

**Solutions:**

```bash
# Copy to local first
cp /network/mount/file.txt /tmp/local-file.txt
cat /tmp/local-file.txt

# Or use streaming with buffer
cat /network/mount/file.txt | buffer -s 1M > /tmp/output.txt

# Read specific parts only
ssh remote-host "head -n 100 file.txt"
```

---

## Edge Cases

### Edge Case: Files Without Newline at End

```bash
# Add newline if missing
[ -n "$(tail -c1 file.txt)" ] && echo "" >> file.txt
```

### Edge Case: Very Long Lines

```bash
# Wrap or truncate long lines
fold -w 80 file.txt  # Wrap
awk '{print substr($0,1,1000)}' file.txt  # Truncate
less -S file.txt  # View without wrapping
```

### Edge Case: Special Characters

```bash
# Show/strip special characters
cat -v file.txt  # Show
sed 's/\x1b\[[0-9;]*m//g' file.txt  # Strip ANSI codes
tr -d '[:cntrl:]' < file.txt  # Remove control chars
```

### Edge Case: File Being Written

```bash
# Copy for stable read
cp growing-file.txt /tmp/snapshot.txt && cat /tmp/snapshot.txt

# Or follow live
tail -f growing-file.txt
```

---

## Known Limitations

### Limitation: Maximum File Size

Most text tools struggle with files > 2GB.

**Workaround:**

```bash
# Split large file
split -b 1G huge-file.txt part_

# Process parts
for part in part_*; do
  process "$part"
done

# Or use specialized tools
# Use 'tail' for logs
# Use 'less' for viewing
# Use streaming tools for processing
```

---

### Limitation: Terminal Buffer Size

Terminal scrollback has limits.

**Workaround:**

```bash
# Redirect to file instead
cat large-output.txt > output.txt

# Or use less
cat large-output.txt | less

# Or limit output
cat large-output.txt | head -1000
```

---

### Limitation: Tool-Specific Limits

Different tools have different limits:

- `cat`: No practical limit
- `less`: Very high limit
- `head/tail`: No limit
- `grep`: Very high limit
- Variable assignment: Limited by memory

**Workaround:**

Choose appropriate tool for file size and use case.

---

## Debugging Techniques

```bash
# Check file properties
file file.txt && ls -lh file.txt && file -bi file.txt

# Test read incrementally
head -n 10 file.txt  # Small sample
head -n 100 file.txt  # Medium sample
cat file.txt  # Full if above worked

# Verify content type
file file.txt && hexdump -C file.txt | head -5
```

---

## Quick Troubleshooting Guide

```
Problem: Garbled output?
  ☐ Check encoding (file -bi)
  ☐ Try UTF-8 conversion
  ☐ Check for null bytes
  ☐ Look for line ending issues

Problem: Too slow?
  ☐ Check file size (ls -lh)
  ☐ Don't load into memory
  ☐ Use sampling (head/tail)
  ☐ Use streaming tools

Problem: Terminal corrupted?
  ☐ Was it binary? (file command)
  ☐ Reset terminal (reset)
  ☐ Use hexdump for binary
  ☐ Close and reopen terminal

Problem: Can't read at all?
  ☐ Check permissions (ls -l)
  ☐ Check file exists
  ☐ Try with sudo
  ☐ Check disk space
```
