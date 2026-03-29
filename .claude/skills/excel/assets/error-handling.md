# Error Handling — Excel Operations

Diagnosis and recovery patterns for every common failure mode. Each section identifies the symptom, root cause, and the specific recovery action.

---

## Failure 1: File Not Found

**Symptom:** `FileNotFoundError: [Errno 2] No such file or directory: 'path/to/file.xlsx'`

**Causes:**
- Relative path provided when absolute path required
- File path copied with trailing whitespace
- File on a network share that is unmounted
- Typo in the path

**Recovery:**

```python
import os
import sys

path = '/absolute/path/to/file.xlsx'  # must be absolute

if not os.path.exists(path):
    # Search for the file by name to suggest correct path
    filename = os.path.basename(path)
    found = []
    search_root = '/Users'  # adjust search root as appropriate
    for root, dirs, files in os.walk(search_root):
        if filename in files:
            found.append(os.path.join(root, filename))
    if found:
        print(f"File not found at {path}")
        print(f"Possible locations:")
        for f in found[:5]:
            print(f"  {f}")
    else:
        print(f"File not found: {path}")
        print("Verify the path with the user.")
    sys.exit(1)
```

**Action:** Report the specific path that was tried. If the user-provided path was relative, explain that absolute paths are required and ask for confirmation.

---

## Failure 2: Malformed or Corrupted File

**Symptom:** `zipfile.BadZipFile`, `openpyxl.utils.exceptions.InvalidFileException`, or `xlrd.biffh.XLRDError`

**Causes:**
- File was partially saved or interrupted during write
- File is actually a CSV or HTML file renamed to .xlsx
- File has been corrupted in transit

**Recovery — try openpyxl directly as fallback:**

```python
import openpyxl
import sys

path = '/absolute/path/to/file.xlsx'

try:
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    print(f"openpyxl opened successfully: {wb.sheetnames}")
    for name in wb.sheetnames:
        ws = wb[name]
        print(f"Sheet '{name}': {ws.max_row} rows x {ws.max_column} cols")
except Exception as e:
    print(f"openpyxl also failed: {type(e).__name__}: {e}", file=sys.stderr)
    print("File may be genuinely corrupted. Suggest manual inspection.")
    sys.exit(1)
```

**Recovery — check if file is actually CSV or another format:**

```python
# Read first bytes to check actual format
with open(path, 'rb') as f:
    header = f.read(4)

# XLSX/ZIP magic bytes: 0x50 0x4B 0x03 0x04
if header[:4] == b'PK\x03\x04':
    print("File has correct ZIP/XLSX magic bytes — may be partially corrupted")
elif header[:3] == b'\xef\xbb\xbf' or header[0:1] in (b',', b'"', b'\t'):
    print("File appears to be a CSV despite .xlsx extension")
    import pandas as pd
    df = pd.read_csv(path)
    print(f"Read as CSV: {df.shape}")
else:
    print(f"Unknown file format. First 4 bytes: {header.hex()}")
```

**Action:** Report the specific error, which library was tried, and the file format diagnosis. Never proceed on a corrupted file — escalate to the user with findings.

---

## Failure 3: Password-Protected File

**Symptom:** `openpyxl.utils.exceptions.InvalidFileException: File is not a zip file` or specific encryption error from xlrd

**Detection:**

```python
import zipfile

path = '/absolute/path/to/file.xlsx'

try:
    with zipfile.ZipFile(path, 'r') as zf:
        namelist = zf.namelist()
        print(f"ZIP contents: {namelist[:5]}")
        # If encrypted, reading a file inside will raise BadZipFile or similar
        zf.read(namelist[0])
        print("File is not password-protected")
except zipfile.BadZipFile:
    print("File is password-protected or not a valid ZIP/XLSX")
except RuntimeError as e:
    if 'encrypted' in str(e).lower() or 'password' in str(e).lower():
        print("File is password-protected — cannot proceed without password")
    else:
        raise
```

**Action:** Report clearly that the file is password-protected. Do not attempt to bypass protection. Ask the user to provide an unprotected copy or the password.

---

## Failure 4: Missing Python Dependencies

**Symptom:** `ModuleNotFoundError: No module named 'pandas'` (or openpyxl, matplotlib, seaborn)

**Recovery — detect and report with install commands:**

```python
import importlib
import sys

required = {
    'pandas': 'pip install pandas',
    'openpyxl': 'pip install openpyxl',
    'matplotlib': 'pip install matplotlib',
    'seaborn': 'pip install seaborn',
    'xlrd': 'pip install xlrd',      # needed for .xls files
}

missing = []
for module, install_cmd in required.items():
    spec = importlib.util.find_spec(module)
    if spec is None:
        missing.append((module, install_cmd))

if missing:
    print("Missing dependencies:")
    for module, cmd in missing:
        print(f"  {module}: {cmd}")
    print("\nInstall all at once:")
    all_pkgs = ' '.join(m for m, _ in missing)
    print(f"  pip install {all_pkgs}")
    sys.exit(1)
else:
    print("All dependencies present")
```

**For .xls files specifically:** xlrd >= 2.0.0 only supports `.xls` format. Attempting to open `.xlsx` with xlrd will fail. Ensure openpyxl is used for `.xlsx`.

```python
import pandas as pd

path = '/absolute/path/to/file.xls'  # .xls format

# xlrd is required for .xls — if it's an .xls file, specify engine explicitly
df = pd.read_excel(path, engine='xlrd')
```

---

## Failure 5: Mixed Data Types in Columns

**Symptom:** Column shows as `object` dtype when you expect `int64` or `float64`. Operations like `.sum()` or `.mean()` raise `TypeError`.

**Cause:** Column contains a mix of numeric values and strings (e.g., "N/A", "$", "%", empty strings, or text notes in numeric columns).

**Diagnosis:**

```python
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
col = 'Amount'  # replace with actual column name

print(f"Column '{col}' dtype: {df[col].dtype}")
print(f"Sample values: {df[col].head(10).tolist()}")

# Find non-numeric values
non_numeric = df[df[col].apply(lambda x: not str(x).replace('.','').replace('-','').isdigit() if pd.notna(x) else False)][col]
print(f"\nNon-numeric values ({len(non_numeric)}):")
print(non_numeric.value_counts().head(10))
```

**Recovery — coerce to numeric with null substitution:**

```python
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')

# Coerce with errors='coerce' converts unparseable values to NaN
df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')

# Report what was coerced
null_count = df['Amount'].isnull().sum()
print(f"Coerced 'Amount' to numeric. Null values after coercion: {null_count}")
print(f"Sum: {df['Amount'].sum():,.2f}")
```

**Recovery — clean currency/percentage strings first:**

```python
# Strip currency symbols, commas, percent signs before numeric conversion
df['Amount'] = (
    df['Amount']
    .astype(str)
    .str.replace(r'[$,%\s]', '', regex=True)
    .replace('', float('nan'))
)
df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
```

**Action:** Always report how many values were coerced to null. Do not silently discard data. Provide the count and a sample of coerced values before proceeding.

---

## Failure 6: Memory Error on Large Files

**Symptom:** `MemoryError` or Python process killed by OS during `pd.read_excel()`

**Cause:** File is too large to fit in RAM at once.

**Recovery — chunked reading:**

```python
import pandas as pd

path = '/absolute/path/to/large_file.xlsx'
sheet = 'Data'
chunk_size = 5000

print(f"Reading in chunks of {chunk_size} rows...")
results = []
chunk_num = 0

# Note: pd.read_excel does not support chunksize directly for all engines.
# For very large files, read the full sheet in one go with usecols to limit columns,
# or delegate to gemini-brain.

# Limit columns if only a subset is needed:
needed_cols = ['Date', 'Region', 'Amount']  # replace with actual needed columns
df = pd.read_excel(path, sheet_name=sheet, usecols=needed_cols)
print(f"Loaded with column restriction: {df.shape}")
print(f"Memory: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
```

**Recovery — use openpyxl in read_only mode for row iteration:**

```python
import openpyxl

path = '/absolute/path/to/large_file.xlsx'
sheet = 'Data'

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb[sheet]

headers = None
rows_processed = 0
batch = []
batch_size = 1000
totals = {}

for row in ws.iter_rows(values_only=True):
    if headers is None:
        headers = list(row)
        continue

    record = dict(zip(headers, row))
    batch.append(record)
    rows_processed += 1

    if len(batch) >= batch_size:
        # Process batch here — example: sum a column
        for item in batch:
            val = item.get('Amount', 0)
            if isinstance(val, (int, float)):
                totals['Amount'] = totals.get('Amount', 0) + val
        batch = []
        print(f"  Processed {rows_processed} rows...")

# Process remaining batch
for item in batch:
    val = item.get('Amount', 0)
    if isinstance(val, (int, float)):
        totals['Amount'] = totals.get('Amount', 0) + val

wb.close()
print(f"\nTotal rows processed: {rows_processed}")
print(f"Totals: {totals}")
```

**When to delegate to gemini-brain:** If the file exceeds 50 MB or contains more than 2 million rows, stop processing locally and delegate to the gemini-brain agent with the file path. It is designed for bulk operations that exceed local context limits.

---

## Failure 7: Sheet Not Found

**Symptom:** `xlrd.biffh.XLRDError: No sheet named <'Sheet1'>` or `ValueError: Worksheet named 'Sheet1' not found`

**Cause:** Sheet name has extra spaces, different capitalization, or the user's description of the sheet name does not match the actual name.

**Recovery:**

```python
import pandas as pd

path = '/absolute/path/to/file.xlsx'
requested_sheet = 'Sheet1'  # what was requested or assumed

xl = pd.ExcelFile(path)
actual_sheets = xl.sheet_names

print(f"Available sheets: {actual_sheets}")

if requested_sheet in actual_sheets:
    print(f"Exact match found: '{requested_sheet}'")
else:
    # Try case-insensitive match
    matches = [s for s in actual_sheets if s.strip().lower() == requested_sheet.strip().lower()]
    if matches:
        print(f"Case-insensitive match: '{matches[0]}' — using this sheet")
        requested_sheet = matches[0]
    else:
        print(f"Sheet '{requested_sheet}' not found.")
        print(f"Available sheets: {actual_sheets}")
        print("Report to user with the actual sheet names.")
```

**Action:** Never silently fall back to the first sheet. Report the mismatch and ask the user to confirm which sheet to use.

---

## Failure 8: Visualization Backend Error

**Symptom:** `_tkinter.TclError: no display name and no $DISPLAY environment variable` or blank output file

**Cause:** `matplotlib` is trying to use an interactive backend (TkAgg, Qt5Agg) in a headless environment.

**Recovery — always set Agg backend before importing pyplot:**

```python
import matplotlib
matplotlib.use('Agg')   # must be called BEFORE importing pyplot
import matplotlib.pyplot as plt

# Verify backend
print(f"Backend: {matplotlib.get_backend()}")  # should print 'agg'
```

**If matplotlib was already imported without Agg:**

```python
import matplotlib
import matplotlib.pyplot as plt

# Switch backend after import (works in most cases)
plt.switch_backend('Agg')

# Proceed with plotting
fig, ax = plt.subplots()
# ... plot code ...
plt.savefig('/absolute/path/to/output.png', dpi=150, bbox_inches='tight')
plt.close()
```

**Action:** The `matplotlib.use('Agg')` call must appear at the top of every visualization script, before any `import matplotlib.pyplot` statement. Treat this as a mandatory pattern, not an optional one.
