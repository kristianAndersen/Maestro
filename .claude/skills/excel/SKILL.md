---
name: excel
description: Activates for Excel and spreadsheet data operations. Use this skill whenever you need to read, analyze, calculate, filter, chart, or transform spreadsheet data — even if the user just says "look at this file" or "give me the numbers from this sheet".
tools: Bash, Read, Write
---

# Excel Skill

## Purpose

This skill provides methodology for working with Excel files (.xlsx, .xls) using Python-based tools. It guides you through inspection-first workflows, processing strategy selection, reliable script patterns, visualization recipes, and large-file handling — so every operation is safe, reproducible, and evidence-based.

## When to Use This Skill

- Reading or inspecting any .xlsx or .xls file
- Performing statistical analysis, aggregation, or calculation on spreadsheet data
- Filtering, transforming, or extracting rows and columns
- Generating charts or visualizations from tabular data
- Writing modified data back to Excel or exporting to CSV
- Processing large files that would exceed memory if read naively

## Quick Start (80% of cases)

1. **Inspect first** — never assume structure; always read sheet names and column headers before operating
2. **Choose processing strategy** — file size determines whether to use in-memory, chunked, or delegated processing
3. **Write script to temp file** — save the Python script, then execute it via Bash for full transparency
4. **Capture all output streams** — collect stdout, stderr, and return code; parse before reporting
5. **Verify with a spot check** — confirm one result manually before accepting the full output

---

## Inspection-First Principle

**Never operate on an Excel file without inspecting it first.** Structure always varies — sheets have unexpected names, columns have inconsistent types, rows have merged cells or header gaps.

### Standard Inspection Script

```python
import pandas as pd
import sys

path = '/absolute/path/to/file.xlsx'
xl = pd.ExcelFile(path)

print(f"=== FILE: {path} ===")
print(f"Sheets ({len(xl.sheet_names)}): {xl.sheet_names}")

for name in xl.sheet_names:
    df = xl.parse(name, nrows=5)
    full = xl.parse(name)
    print(f"\n--- Sheet: {name} ---")
    print(f"Dimensions: {full.shape[0]} rows x {full.shape[1]} cols")
    print(f"Columns: {list(full.columns)}")
    print(f"Dtypes:\n{full.dtypes.to_string()}")
    print(f"Nulls:\n{full.isnull().sum().to_string()}")
    print(f"Preview (5 rows):\n{df.to_string()}")
```

**What to extract from inspection output before proceeding:**
- Sheet names (verify against user's request — "Sheet1" is not always the right sheet)
- Column names as they actually appear (may differ from what the user described)
- Data types (numeric columns may be `object` due to mixed values or formatting)
- Null counts (determines whether to drop, fill, or flag before analysis)
- Row count (determines processing strategy — see below)

---

## Processing Strategy Selection

| File Size | Row Count | Strategy | Why |
|---|---|---|---|
| < 1 MB | < 50k rows | In-memory pandas | Fast, simple, no overhead |
| 1–10 MB | 50k–500k rows | pandas with dtype optimization | Reduce memory, still fits RAM |
| 10–50 MB | 500k–2M rows | Chunked iterator with `chunksize` | Process incrementally |
| > 50 MB | > 2M rows | Delegate to gemini-brain | Context overflow risk |

### In-Memory Pattern

```python
import pandas as pd

df = pd.read_excel(
    '/absolute/path/to/file.xlsx',
    sheet_name='Sheet1',
    dtype={'id': int, 'amount': float}  # explicit types prevent mixed-type issues
)
```

### dtype Optimization Pattern (medium files)

```python
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')

# Downcast numerics to reduce memory
for col in df.select_dtypes(include='int64').columns:
    df[col] = pd.to_numeric(df[col], downcast='integer')
for col in df.select_dtypes(include='float64').columns:
    df[col] = pd.to_numeric(df[col], downcast='float')

print(f"Memory after optimization: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
```

### Chunked Processing Pattern (large files)

```python
import pandas as pd

results = []
chunk_size = 10000

for chunk in pd.read_excel('/absolute/path/to/file.xlsx', chunksize=chunk_size):
    # process each chunk — example: aggregate
    results.append(chunk.groupby('Category')['Amount'].sum())

final = pd.concat(results).groupby(level=0).sum()
print(final.to_string())
```

---

## Script Execution Protocol

Always save scripts to a temp file before executing. This creates an audit trail and makes debugging possible.

```python
# Step 1: Write script to temp file
script = """
import pandas as pd
df = pd.read_excel('/path/to/file.xlsx', sheet_name='Data')
print(df.describe().to_string())
"""

with open('/tmp/excel_op.py', 'w') as f:
    f.write(script)
```

```bash
# Step 2: Execute via Bash tool
python /tmp/excel_op.py
```

**Why this matters:**
- The script path is reportable as evidence
- Errors reference line numbers in the saved file
- The script can be re-run for verification
- Users can inspect what was actually executed

---

## Statistical Analysis Patterns

### Descriptive Statistics

```python
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Sheet1')

# Full summary
print("=== DESCRIPTIVE STATS ===")
print(df.describe(include='all').to_string())

# Missing value analysis
print("\n=== MISSING VALUES ===")
missing = df.isnull().sum()
pct = (missing / len(df) * 100).round(2)
print(pd.DataFrame({'count': missing, 'pct': pct}).to_string())

# Correlation matrix (numeric columns only)
numeric = df.select_dtypes(include='number')
if numeric.shape[1] > 1:
    print("\n=== CORRELATIONS ===")
    print(numeric.corr().round(3).to_string())
```

### Grouping and Aggregation

```python
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Sales')

# Group by one column
summary = df.groupby('Region')['Revenue'].agg(['sum', 'mean', 'count', 'std'])
print(summary.to_string())

# Group by multiple columns
pivot = df.groupby(['Region', 'Product'])['Revenue'].sum().unstack(fill_value=0)
print(pivot.to_string())
```

---

## Visualization Patterns

Use `matplotlib.pyplot.close()` after every plot to prevent figure accumulation.

### Bar Chart

```python
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # non-interactive backend — required when no display is available
import matplotlib.pyplot as plt

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Summary')
agg = df.groupby('Category')['Value'].sum().sort_values(ascending=False)

fig, ax = plt.subplots(figsize=(10, 6))
agg.plot(kind='bar', ax=ax)
ax.set_title('Value by Category')
ax.set_xlabel('Category')
ax.set_ylabel('Value')
ax.tick_params(axis='x', rotation=45)
plt.tight_layout()
plt.savefig('/absolute/path/to/output/chart.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: /absolute/path/to/output/chart.png")
```

### Line Chart (time series)

```python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Monthly')
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

fig, ax = plt.subplots(figsize=(12, 5))
ax.plot(df['Date'], df['Value'], marker='o', linewidth=2)
ax.set_title('Value Over Time')
ax.set_xlabel('Date')
ax.set_ylabel('Value')
fig.autofmt_xdate()
plt.tight_layout()
plt.savefig('/absolute/path/to/output/trend.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: /absolute/path/to/output/trend.png")
```

### Heatmap (correlation matrix)

```python
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
corr = df.select_dtypes(include='number').corr()

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)
ax.set_title('Correlation Matrix')
plt.tight_layout()
plt.savefig('/absolute/path/to/output/heatmap.png', dpi=150, bbox_inches='tight')
plt.close()
print("Saved: /absolute/path/to/output/heatmap.png")
```

---

## Output Writing Patterns

### Write to New Excel File

```python
import pandas as pd

df = pd.read_excel('/absolute/path/to/input.xlsx', sheet_name='Data')
result = df[df['Status'] == 'Active']

# Write with openpyxl engine (xlsx format)
result.to_excel('/absolute/path/to/output.xlsx', index=False, engine='openpyxl')
print(f"Written: {len(result)} rows to /absolute/path/to/output.xlsx")
```

### Write Multiple Sheets

```python
import pandas as pd

summary = ...   # computed DataFrame
detail = ...    # computed DataFrame

with pd.ExcelWriter('/absolute/path/to/output.xlsx', engine='openpyxl') as writer:
    summary.to_excel(writer, sheet_name='Summary', index=False)
    detail.to_excel(writer, sheet_name='Detail', index=False)

print("Written: Summary + Detail sheets to /absolute/path/to/output.xlsx")
```

### Export to CSV

```python
df.to_csv('/absolute/path/to/output.csv', index=False, encoding='utf-8-sig')
print(f"Exported {len(df)} rows to /absolute/path/to/output.csv")
```

Use `utf-8-sig` encoding when the CSV will be opened in Excel — it prevents garbled characters.

---

## Anti-Patterns

### Assuming Sheet Name

```
BAD:  pd.read_excel(path)  # defaults to first sheet, may be wrong
GOOD: xl.sheet_names first → then pd.read_excel(path, sheet_name='ActualName')
```

### Operating Without Inspecting Types

```
BAD:  df['Price'].sum()  # fails if Price is stored as string with "$" characters
GOOD: inspect dtypes → clean column → then operate
```

### Writing Scripts Inline (No Temp File)

```
BAD:  Execute Python logic directly in reasoning — no audit trail
GOOD: Write to /tmp/excel_op.py, execute via Bash, report script path as evidence
```

### Using plt.show() in Non-Interactive Context

```
BAD:  plt.show()  # blocks or fails in headless environments
GOOD: matplotlib.use('Agg') at top + plt.savefig(...) + plt.close()
```

### Reporting Results Without Cell References

```
BAD:  "The total is 452,300"
GOOD: "Sheet 'Sales', column 'Revenue' (C2:C847), sum = 452,300"
```

---

## Validation Checklist

Before returning any Excel operation result:

- [ ] File path is absolute and confirmed to exist
- [ ] Sheet name used matches actual sheet name from inspection
- [ ] Column names in script match actual column names (case-sensitive)
- [ ] Script saved to temp file and path reported
- [ ] Execution completed without errors (checked stderr)
- [ ] Results include sheet name and column/row references
- [ ] Generated files (charts, CSVs) exist at reported paths
- [ ] Spot check: at least one result value manually verified

---

## Resources (Progressive Disclosure)

Load these assets for deeper guidance:

- **`assets/python-templates.md`** — Complete, copy-ready Python scripts for every common Excel operation: inspection, filtering, joining sheets, pivot tables, conditional formatting
- **`assets/error-handling.md`** — Diagnosing and recovering from every common failure: file not found, malformed file, password protection, missing dependencies, mixed types, memory errors
- **`assets/visualization-recipes.md`** — Full recipes for bar, line, scatter, heatmap, histogram, box plot, and multi-panel dashboards — all using Agg backend with correct sizing and save patterns
- **`assets/large-file-strategies.md`** — Chunked iteration, memory profiling, sheet-by-sheet streaming, delegation to gemini-brain, and progress reporting for files over 10 MB
