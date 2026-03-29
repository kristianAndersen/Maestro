# Python Templates — Excel Operations

Complete, copy-ready scripts for common Excel operations. All paths must be replaced with absolute paths before execution. Save each script to `/tmp/excel_op.py` (or a descriptive name) and execute via Bash tool.

---

## Template 1: Full File Inspection

Use this before any operation on an unknown file.

```python
import pandas as pd
import os
import sys

path = '/absolute/path/to/file.xlsx'

if not os.path.exists(path):
    print(f"ERROR: File not found: {path}", file=sys.stderr)
    sys.exit(1)

size_mb = os.path.getsize(path) / 1024**2
print(f"File: {path}")
print(f"Size: {size_mb:.2f} MB")

xl = pd.ExcelFile(path)
print(f"Sheets ({len(xl.sheet_names)}): {xl.sheet_names}")

for name in xl.sheet_names:
    df = xl.parse(name)
    print(f"\n=== Sheet: '{name}' ===")
    print(f"  Dimensions: {df.shape[0]} rows x {df.shape[1]} cols")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Dtypes:")
    for col, dtype in df.dtypes.items():
        null_count = df[col].isnull().sum()
        print(f"    {col}: {dtype}  (nulls: {null_count})")
    print(f"  Preview (3 rows):")
    print(df.head(3).to_string())
```

---

## Template 2: Statistical Summary

Full descriptive statistics for all numeric columns plus null analysis.

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
sheet = 'Sheet1'  # replace with actual sheet name from inspection

df = pd.read_excel(path, sheet_name=sheet)

print(f"=== STATISTICAL SUMMARY ===")
print(f"Sheet: '{sheet}' | Rows: {df.shape[0]} | Cols: {df.shape[1]}")

# Numeric summary
numeric = df.select_dtypes(include='number')
if not numeric.empty:
    print(f"\n--- Numeric Columns ({len(numeric.columns)}) ---")
    desc = numeric.describe()
    desc.loc['cv'] = (desc.loc['std'] / desc.loc['mean']).round(3)  # coefficient of variation
    print(desc.to_string())
else:
    print("No numeric columns found.")

# Categorical summary
categorical = df.select_dtypes(include=['object', 'category'])
if not categorical.empty:
    print(f"\n--- Categorical Columns ({len(categorical.columns)}) ---")
    for col in categorical.columns:
        vc = df[col].value_counts()
        print(f"  {col}: {df[col].nunique()} unique values, top 5:")
        print(vc.head(5).to_string())

# Missing value report
missing = df.isnull().sum()
if missing.sum() > 0:
    pct = (missing / len(df) * 100).round(2)
    report = pd.DataFrame({'missing_count': missing, 'missing_pct': pct})
    report = report[report['missing_count'] > 0].sort_values('missing_count', ascending=False)
    print(f"\n--- Missing Values ---")
    print(report.to_string())
else:
    print("\nNo missing values.")
```

---

## Template 3: Row Filtering and Export

Filter rows by one or more conditions and export the result.

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
sheet = 'Data'        # replace with actual sheet name
output = '/absolute/path/to/output/filtered.xlsx'

df = pd.read_excel(path, sheet_name=sheet)
print(f"Loaded: {len(df)} rows from '{sheet}'")
print(f"Columns: {list(df.columns)}")

# --- Define filter conditions ---
# Single condition example:
# filtered = df[df['Status'] == 'Active']

# Multi-condition example:
# filtered = df[(df['Status'] == 'Active') & (df['Amount'] > 1000)]

# Range example:
# filtered = df[df['Date'].between('2024-01-01', '2024-12-31')]

# Text contains example:
# filtered = df[df['Name'].str.contains('Smith', na=False)]

# Replace this placeholder with actual conditions:
filtered = df  # no filter — remove this line when adding conditions

print(f"After filter: {len(filtered)} rows ({len(filtered)/len(df)*100:.1f}% of total)")

# Export
filtered.to_excel(output, index=False, engine='openpyxl')
print(f"Written to: {output}")

# Spot check
print(f"\nFirst 3 rows of output:")
print(filtered.head(3).to_string())
```

---

## Template 4: Multi-Sheet Join

Merge data from two sheets on a common key column.

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
sheet_a = 'Orders'    # replace with actual sheet name
sheet_b = 'Products'  # replace with actual sheet name
join_key = 'ProductID'  # replace with actual key column name
output = '/absolute/path/to/output/joined.xlsx'

df_a = pd.read_excel(path, sheet_name=sheet_a)
df_b = pd.read_excel(path, sheet_name=sheet_b)

print(f"Sheet '{sheet_a}': {df_a.shape}")
print(f"Sheet '{sheet_b}': {df_b.shape}")
print(f"Join key: '{join_key}'")

# Check key overlap before joining
keys_a = set(df_a[join_key].dropna())
keys_b = set(df_b[join_key].dropna())
overlap = keys_a & keys_b
print(f"Key overlap: {len(overlap)} matching values out of {len(keys_a)} in A, {len(keys_b)} in B")

if not overlap:
    print("WARNING: No matching keys — join will produce empty result", file=__import__('sys').stderr)

# Perform join (inner by default — use 'left', 'right', 'outer' as needed)
joined = df_a.merge(df_b, on=join_key, how='inner', suffixes=('_orders', '_products'))
print(f"\nJoined result: {joined.shape[0]} rows x {joined.shape[1]} cols")

joined.to_excel(output, index=False, engine='openpyxl')
print(f"Written to: {output}")
```

---

## Template 5: Pivot Table

Group and aggregate data into a pivot structure.

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
sheet = 'Sales'      # replace with actual sheet name
output = '/absolute/path/to/output/pivot.xlsx'

df = pd.read_excel(path, sheet_name=sheet)

# Replace these with actual column names from inspection
row_field = 'Region'
col_field = 'Product'
value_field = 'Revenue'
agg_func = 'sum'  # 'sum', 'mean', 'count', 'max', 'min'

pivot = df.pivot_table(
    values=value_field,
    index=row_field,
    columns=col_field,
    aggfunc=agg_func,
    fill_value=0,
    margins=True,    # adds row/col totals
    margins_name='Total'
)

print(f"Pivot table: {pivot.shape}")
print(pivot.to_string())

pivot.to_excel(output, engine='openpyxl')
print(f"Written to: {output}")
```

---

## Template 6: Column Calculation

Add computed columns based on existing data.

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
sheet = 'Data'
output = '/absolute/path/to/output/with_calculations.xlsx'

df = pd.read_excel(path, sheet_name=sheet)
print(f"Loaded: {df.shape} | Columns: {list(df.columns)}")

# Example calculations — replace with actual column names:

# Arithmetic
# df['Margin'] = df['Revenue'] - df['Cost']
# df['Margin_Pct'] = (df['Margin'] / df['Revenue'] * 100).round(2)

# Conditional column
# df['Status'] = df['Score'].apply(lambda x: 'Pass' if x >= 60 else 'Fail')

# Date extraction
# df['Date'] = pd.to_datetime(df['Date'])
# df['Year'] = df['Date'].dt.year
# df['Month'] = df['Date'].dt.month
# df['Quarter'] = df['Date'].dt.quarter

# Rolling window
# df = df.sort_values('Date')
# df['Rolling_Avg_7d'] = df['Value'].rolling(window=7).mean().round(2)

print(f"\nNew columns: {list(df.columns)}")
print(f"Preview:\n{df.head(5).to_string()}")

df.to_excel(output, index=False, engine='openpyxl')
print(f"Written to: {output}")
```

---

## Template 7: Cross-Sheet Aggregation

Aggregate the same column across all sheets and combine into one summary.

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
value_col = 'Amount'    # replace with actual column name that exists in each sheet
output = '/absolute/path/to/output/summary.xlsx'

xl = pd.ExcelFile(path)
results = []

for sheet in xl.sheet_names:
    df = xl.parse(sheet)
    if value_col not in df.columns:
        print(f"  Skipping '{sheet}' — column '{value_col}' not found")
        continue
    summary = {
        'Sheet': sheet,
        'Rows': len(df),
        'Sum': df[value_col].sum(),
        'Mean': df[value_col].mean().round(2),
        'Min': df[value_col].min(),
        'Max': df[value_col].max(),
        'Nulls': df[value_col].isnull().sum()
    }
    results.append(summary)
    print(f"  Processed: '{sheet}'")

combined = pd.DataFrame(results)
print(f"\n=== CROSS-SHEET SUMMARY ===")
print(combined.to_string(index=False))

combined.to_excel(output, index=False, engine='openpyxl')
print(f"Written to: {output}")
```
