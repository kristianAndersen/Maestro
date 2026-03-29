# Large File Strategies — Excel Operations

Patterns for working with Excel files that exceed what fits comfortably in memory. Use these when the standard inspection-first approach reports a file over 10 MB or a sheet with more than 500,000 rows.

---

## When to Apply These Strategies

| File Size | Rows (approx) | Strategy |
|---|---|---|
| < 1 MB | < 50k | In-memory pandas — no special handling needed |
| 1–10 MB | 50k–500k | dtype optimization (see SKILL.md) |
| 10–50 MB | 500k–2M | openpyxl read-only iteration or usecols restriction |
| > 50 MB | > 2M | Delegate to gemini-brain |
| Unknown | Unknown | Always check file size first before reading |

---

## Step 0: Size Check Before Any Read

Always check file size before loading. This prevents surprise MemoryErrors and determines strategy selection.

```python
import os
import sys

path = '/absolute/path/to/file.xlsx'

if not os.path.exists(path):
    print(f"ERROR: {path} not found", file=sys.stderr)
    sys.exit(1)

size_bytes = os.path.getsize(path)
size_mb = size_bytes / 1024**2
print(f"File size: {size_mb:.2f} MB ({size_bytes:,} bytes)")

if size_mb < 1:
    print("Strategy: in-memory pandas")
elif size_mb < 10:
    print("Strategy: pandas with dtype optimization")
elif size_mb < 50:
    print("Strategy: openpyxl read-only iteration or column restriction")
else:
    print("Strategy: delegate to gemini-brain for bulk processing")
```

---

## Strategy 1: Column Restriction with usecols

When only a subset of columns is needed, `usecols` dramatically reduces memory — pandas only reads the specified columns, not the full row.

```python
import pandas as pd

path = '/absolute/path/to/large_file.xlsx'
sheet = 'Data'  # confirmed from inspection

# Option A: specify column names (use after inspection confirms actual names)
needed_cols = ['Date', 'Region', 'Product', 'Amount']
df = pd.read_excel(path, sheet_name=sheet, usecols=needed_cols)

# Option B: specify column letters (A, B, C or A:E range)
# df = pd.read_excel(path, sheet_name=sheet, usecols='A:D')

# Option C: specify column indices (0-based)
# df = pd.read_excel(path, sheet_name=sheet, usecols=[0, 2, 5, 8])

print(f"Loaded {df.shape[0]} rows x {df.shape[1]} cols")
print(f"Memory: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
```

---

## Strategy 2: Row Sampling for Exploration

When you need to understand structure or run exploratory statistics without reading all rows:

```python
import pandas as pd

path = '/absolute/path/to/large_file.xlsx'
sheet = 'Data'

# Read only the first N rows — fast, memory-safe
sample = pd.read_excel(path, sheet_name=sheet, nrows=10000)

print(f"Sample: {sample.shape}")
print(f"Memory: {sample.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
print(f"Columns: {list(sample.columns)}")
print(f"Dtypes:\n{sample.dtypes.to_string()}")

# Skip rows and read a middle section
# skip_n = 100000  # skip first 100k rows
# chunk = pd.read_excel(path, sheet_name=sheet, skiprows=range(1, skip_n+1), nrows=10000)
# Note: skiprows=range(1, N) preserves the header row (row 0)
```

---

## Strategy 3: openpyxl Read-Only Row Iteration

For files too large for pandas but still under 50 MB. This is memory-efficient because rows are streamed one at a time and never all held in memory simultaneously.

```python
import openpyxl
import sys

path = '/absolute/path/to/large_file.xlsx'
sheet_name = 'Data'  # confirmed from prior inspection

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)

if sheet_name not in wb.sheetnames:
    print(f"ERROR: Sheet '{sheet_name}' not found. Available: {wb.sheetnames}", file=sys.stderr)
    wb.close()
    sys.exit(1)

ws = wb[sheet_name]

# Read headers from first row
headers = None
row_count = 0
results = {}  # accumulator — replace with your actual aggregation logic

for row in ws.iter_rows(values_only=True):
    if headers is None:
        headers = [str(h) if h is not None else f'col_{i}' for i, h in enumerate(row)]
        continue

    row_count += 1

    # Example: accumulate sum of 'Amount' column
    amount_idx = headers.index('Amount') if 'Amount' in headers else None
    if amount_idx is not None:
        val = row[amount_idx]
        if isinstance(val, (int, float)):
            results['total_amount'] = results.get('total_amount', 0) + val

    # Progress reporting every 100k rows
    if row_count % 100000 == 0:
        print(f"  Processed {row_count:,} rows...", flush=True)

wb.close()

print(f"\nTotal rows processed: {row_count:,}")
print(f"Headers: {headers}")
print(f"Results: {results}")
```

**Limitation of read-only mode:** Merged cells may appear as `None` for cells in the merge range (only the top-left cell has the value). If merged cells are present, use `read_only=False` and accept higher memory usage, or detect and document the issue.

---

## Strategy 4: Sheet-by-Sheet Sequential Processing

When a multi-sheet file is large and you need to process all sheets:

```python
import pandas as pd
import gc  # garbage collector

path = '/absolute/path/to/large_file.xlsx'
all_results = []

xl = pd.ExcelFile(path)
print(f"Processing {len(xl.sheet_names)} sheets: {xl.sheet_names}")

for sheet_name in xl.sheet_names:
    print(f"\nProcessing: '{sheet_name}'")
    df = xl.parse(sheet_name)
    print(f"  Shape: {df.shape}")

    # Your operation per sheet — example: compute total
    if 'Amount' in df.columns:
        total = pd.to_numeric(df['Amount'], errors='coerce').sum()
        all_results.append({'Sheet': sheet_name, 'Rows': len(df), 'Total': total})
        print(f"  Total Amount: {total:,.2f}")
    else:
        all_results.append({'Sheet': sheet_name, 'Rows': len(df), 'Total': None})
        print(f"  No 'Amount' column found")

    # Free memory before loading next sheet
    del df
    gc.collect()

import pandas as pd
summary = pd.DataFrame(all_results)
print("\n=== SUMMARY ===")
print(summary.to_string(index=False))
```

---

## Strategy 5: Aggregation-Only Read (No Row Retention)

When you only need aggregate results (sums, counts, min/max) and not the rows themselves. This keeps peak memory to roughly one chunk at a time.

```python
import pandas as pd
import gc

path = '/absolute/path/to/large_file.xlsx'
sheet = 'Data'

# Read full sheet but immediately aggregate — do not store rows
df = pd.read_excel(path, sheet_name=sheet)

# Compute all needed aggregates immediately
aggregates = {
    'total_rows': len(df),
    'columns': list(df.columns),
}

# Numeric aggregations
numeric = df.select_dtypes(include='number')
for col in numeric.columns:
    aggregates[f'{col}_sum'] = numeric[col].sum()
    aggregates[f'{col}_mean'] = numeric[col].mean()
    aggregates[f'{col}_min'] = numeric[col].min()
    aggregates[f'{col}_max'] = numeric[col].max()

# Categorical counts
categorical = df.select_dtypes(include='object')
for col in categorical.columns:
    aggregates[f'{col}_unique_count'] = df[col].nunique()

# Free the large DataFrame immediately
del df
gc.collect()

# Now work only with the small aggregates dict
for key, val in aggregates.items():
    if isinstance(val, float):
        print(f"  {key}: {val:,.2f}")
    else:
        print(f"  {key}: {val}")
```

---

## Strategy 6: Delegate to gemini-brain (> 50 MB)

When the file exceeds 50 MB or 2 million rows, local processing is not appropriate. Delegate to gemini-brain using the Task tool with this format:

```
PRODUCT:
- Task: Process large Excel file at /absolute/path/to/large_file.xlsx
- Sheet: [sheet name from prior inspection]
- Operation: [specific operation — e.g., "compute sum of Amount column grouped by Region"]
- Expected: Aggregated results with row counts, values, and any relevant statistics

PROCESS:
- File is [X] MB with approximately [Y] rows — local processing not viable
- Use bulk processing capabilities to handle the full dataset
- Return aggregated results only, not raw rows
- Report processing time and memory if available

PERFORMANCE:
- Complete operation on all rows, not a sample
- Return exact values with column references
- Report any rows skipped due to errors or nulls
```

**What to include in the delegation:**
- The absolute file path (gemini-brain can read it directly)
- Sheet name (confirmed from prior inspection — never delegate without this)
- The exact operation needed (aggregation type, grouping keys, filter conditions)
- Whether output files should be written and where

---

## Memory Profiling

Use this to measure actual memory usage and identify whether optimization is needed:

```python
import pandas as pd
import tracemalloc

path = '/absolute/path/to/file.xlsx'
sheet = 'Data'

tracemalloc.start()

df = pd.read_excel(path, sheet_name=sheet)

current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()

print(f"DataFrame shape: {df.shape}")
print(f"DataFrame memory (pandas): {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
print(f"Peak process memory: {peak / 1024**2:.2f} MB")
print(f"Current process memory: {current / 1024**2:.2f} MB")
```

**Rule of thumb:** pandas typically uses 5–10x the file size in memory when loaded. A 10 MB file often consumes 50–100 MB RAM. Account for this in strategy selection, especially in constrained environments.

---

## Progress Reporting Pattern

For long-running operations, emit progress at regular intervals so the execution is observable:

```python
import openpyxl
import time

path = '/absolute/path/to/large_file.xlsx'
sheet_name = 'Data'

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb[sheet_name]

start_time = time.time()
headers = None
row_count = 0
report_interval = 50000

for row in ws.iter_rows(values_only=True):
    if headers is None:
        headers = list(row)
        continue

    row_count += 1

    # Your processing logic here

    if row_count % report_interval == 0:
        elapsed = time.time() - start_time
        rate = row_count / elapsed
        print(f"  {row_count:,} rows | {elapsed:.1f}s | {rate:,.0f} rows/sec", flush=True)

wb.close()
elapsed = time.time() - start_time
print(f"\nComplete: {row_count:,} rows in {elapsed:.1f}s ({row_count/elapsed:,.0f} rows/sec)")
```
