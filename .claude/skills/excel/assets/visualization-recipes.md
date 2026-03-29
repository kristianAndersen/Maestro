# Visualization Recipes — Excel Data

Complete, ready-to-run chart recipes using matplotlib and seaborn with the Agg backend. Every recipe follows the same structure: load data, build figure, save, close. Replace all paths and column names with values from your inspection output.

**Universal rule:** Always set `matplotlib.use('Agg')` before importing `pyplot`. Always call `plt.close()` after saving. Always use absolute paths for output files.

---

## Recipe 1: Bar Chart (Category Comparison)

Best for: comparing values across discrete categories (regions, products, teams).

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
# Replace 'Category' and 'Value' with actual column names
agg = df.groupby('Category')['Value'].sum().sort_values(ascending=False)

fig, ax = plt.subplots(figsize=(10, 6))
bars = ax.bar(range(len(agg)), agg.values, color='steelblue', edgecolor='white', linewidth=0.5)
ax.set_xticks(range(len(agg)))
ax.set_xticklabels(agg.index, rotation=45, ha='right')
ax.set_title('Value by Category', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('Category')
ax.set_ylabel('Value')
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:,.0f}'))

# Add value labels on bars
for bar, val in zip(bars, agg.values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(agg.values)*0.01,
            f'{val:,.0f}', ha='center', va='bottom', fontsize=8)

plt.tight_layout()
output = '/absolute/path/to/output/bar_chart.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Recipe 2: Horizontal Bar Chart (Long Labels)

Best for: category names that are long and would overlap on a vertical chart.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
agg = df.groupby('Category')['Value'].sum().sort_values()  # ascending for horizontal

fig, ax = plt.subplots(figsize=(10, max(4, len(agg) * 0.4)))
bars = ax.barh(range(len(agg)), agg.values, color='steelblue')
ax.set_yticks(range(len(agg)))
ax.set_yticklabels(agg.index)
ax.set_title('Value by Category', fontsize=14, fontweight='bold')
ax.set_xlabel('Value')
ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:,.0f}'))

plt.tight_layout()
output = '/absolute/path/to/output/bar_horizontal.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Recipe 3: Line Chart (Time Series)

Best for: trends over time — dates must be parseable.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Monthly')
df['Date'] = pd.to_datetime(df['Date'])  # replace 'Date' with actual date column name
df = df.sort_values('Date')

fig, ax = plt.subplots(figsize=(12, 5))
ax.plot(df['Date'], df['Value'], marker='o', linewidth=2, markersize=5, color='steelblue')
ax.fill_between(df['Date'], df['Value'], alpha=0.1, color='steelblue')
ax.set_title('Value Over Time', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('Date')
ax.set_ylabel('Value')
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:,.0f}'))
fig.autofmt_xdate()
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
output = '/absolute/path/to/output/time_series.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Recipe 4: Multi-Line Chart (Multiple Series)

Best for: comparing trends of multiple groups over time.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Monthly')
df['Date'] = pd.to_datetime(df['Date'])

# Replace with actual column names: group column and value column
pivot = df.pivot_table(index='Date', columns='Region', values='Revenue', aggfunc='sum')
pivot = pivot.sort_index()

fig, ax = plt.subplots(figsize=(12, 6))
for col in pivot.columns:
    ax.plot(pivot.index, pivot[col], marker='o', linewidth=2, markersize=4, label=str(col))

ax.set_title('Revenue by Region Over Time', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('Date')
ax.set_ylabel('Revenue')
ax.legend(title='Region', bbox_to_anchor=(1.02, 1), loc='upper left')
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:,.0f}'))
fig.autofmt_xdate()
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
output = '/absolute/path/to/output/multi_line.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Recipe 5: Scatter Plot (Relationship Between Two Variables)

Best for: identifying correlations, clusters, or outliers between two numeric columns.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')

# Replace 'X_col' and 'Y_col' with actual column names
x_col = 'Cost'
y_col = 'Revenue'

# Remove nulls for clean plotting
plot_df = df[[x_col, y_col]].dropna()

fig, ax = plt.subplots(figsize=(8, 6))
ax.scatter(plot_df[x_col], plot_df[y_col], alpha=0.6, color='steelblue', s=30)

# Add trend line
if len(plot_df) > 1:
    z = np.polyfit(plot_df[x_col], plot_df[y_col], 1)
    p = np.poly1d(z)
    x_range = np.linspace(plot_df[x_col].min(), plot_df[x_col].max(), 100)
    ax.plot(x_range, p(x_range), 'r--', alpha=0.8, label='Trend')
    correlation = plot_df[x_col].corr(plot_df[y_col])
    ax.legend()
    print(f"Correlation ({x_col} vs {y_col}): {correlation:.3f}")

ax.set_title(f'{y_col} vs {x_col}', fontsize=14, fontweight='bold')
ax.set_xlabel(x_col)
ax.set_ylabel(y_col)

plt.tight_layout()
output = '/absolute/path/to/output/scatter.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Recipe 6: Histogram (Distribution)

Best for: understanding the distribution of a single numeric column.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
col = 'Amount'  # replace with actual column name
data = df[col].dropna()

fig, ax = plt.subplots(figsize=(10, 5))
n, bins, patches = ax.hist(data, bins=30, color='steelblue', edgecolor='white', linewidth=0.5)

# Add vertical lines for mean and median
ax.axvline(data.mean(), color='red', linestyle='--', linewidth=1.5, label=f'Mean: {data.mean():,.1f}')
ax.axvline(data.median(), color='orange', linestyle='--', linewidth=1.5, label=f'Median: {data.median():,.1f}')

ax.set_title(f'Distribution of {col}', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel(col)
ax.set_ylabel('Frequency')
ax.legend()

plt.tight_layout()
output = '/absolute/path/to/output/histogram.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
print(f"Stats: mean={data.mean():,.2f}, median={data.median():,.2f}, std={data.std():,.2f}")
```

---

## Recipe 7: Box Plot (Distribution by Group)

Best for: comparing spread and outliers across multiple groups.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
# Replace 'Group' and 'Value' with actual column names
group_col = 'Region'
value_col = 'Sales'

groups = [df[df[group_col] == g][value_col].dropna() for g in df[group_col].unique()]
labels = list(df[group_col].unique())

fig, ax = plt.subplots(figsize=(10, 6))
bp = ax.boxplot(groups, labels=labels, patch_artist=True)

# Color the boxes
colors = plt.cm.Set2(range(len(labels)))
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)

ax.set_title(f'{value_col} Distribution by {group_col}', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel(group_col)
ax.set_ylabel(value_col)
ax.tick_params(axis='x', rotation=30)
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
output = '/absolute/path/to/output/boxplot.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Recipe 8: Correlation Heatmap

Best for: showing relationships across all numeric columns at once.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Data')
numeric = df.select_dtypes(include='number')

if numeric.shape[1] < 2:
    print("Need at least 2 numeric columns for correlation heatmap")
else:
    corr = numeric.corr()

    fig, ax = plt.subplots(figsize=(max(6, len(corr)*0.8), max(5, len(corr)*0.7)))
    sns.heatmap(
        corr,
        annot=True,
        fmt='.2f',
        cmap='coolwarm',
        center=0,
        vmin=-1,
        vmax=1,
        square=True,
        linewidths=0.5,
        ax=ax
    )
    ax.set_title('Correlation Matrix', fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()

    output = '/absolute/path/to/output/heatmap.png'
    plt.savefig(output, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {output}")
    print(f"Columns included: {list(numeric.columns)}")
```

---

## Recipe 9: Multi-Panel Dashboard

Best for: showing multiple perspectives of the same data in a single output image.

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_excel('/absolute/path/to/file.xlsx', sheet_name='Sales')
# Adjust column names to match your actual data
category_col = 'Region'
value_col = 'Revenue'
date_col = 'Date'
df[date_col] = pd.to_datetime(df[date_col])

fig = plt.figure(figsize=(16, 10))
fig.suptitle('Sales Dashboard', fontsize=16, fontweight='bold', y=0.98)

# Panel 1: Bar chart — total by category
ax1 = fig.add_subplot(2, 2, 1)
by_cat = df.groupby(category_col)[value_col].sum().sort_values(ascending=False)
ax1.bar(range(len(by_cat)), by_cat.values, color='steelblue')
ax1.set_xticks(range(len(by_cat)))
ax1.set_xticklabels(by_cat.index, rotation=45, ha='right', fontsize=8)
ax1.set_title(f'{value_col} by {category_col}')
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:,.0f}'))

# Panel 2: Line chart — trend over time
ax2 = fig.add_subplot(2, 2, 2)
by_date = df.groupby(date_col)[value_col].sum()
ax2.plot(by_date.index, by_date.values, color='steelblue', linewidth=2)
ax2.set_title(f'{value_col} Trend')
fig.autofmt_xdate()
ax2.grid(axis='y', alpha=0.3)

# Panel 3: Distribution histogram
ax3 = fig.add_subplot(2, 2, 3)
data = df[value_col].dropna()
ax3.hist(data, bins=25, color='steelblue', edgecolor='white', linewidth=0.5)
ax3.axvline(data.mean(), color='red', linestyle='--', label=f'Mean: {data.mean():,.0f}')
ax3.set_title(f'{value_col} Distribution')
ax3.legend(fontsize=8)

# Panel 4: Top 10 table summary
ax4 = fig.add_subplot(2, 2, 4)
ax4.axis('off')
top10 = by_cat.head(10).reset_index()
top10.columns = [category_col, value_col]
top10[value_col] = top10[value_col].apply(lambda x: f'{x:,.0f}')
table = ax4.table(
    cellText=top10.values,
    colLabels=top10.columns,
    loc='center',
    cellLoc='left'
)
table.auto_set_font_size(False)
table.set_fontsize(8)
table.scale(1, 1.3)
ax4.set_title(f'Top {len(top10)} {category_col}s', pad=20)

plt.tight_layout()
output = '/absolute/path/to/output/dashboard.png'
plt.savefig(output, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {output}")
```

---

## Output Quality Notes

**DPI guidance:**
- `dpi=72`: Screen viewing only, smaller file
- `dpi=150`: Good balance — recommended default
- `dpi=300`: Print-quality — use for reports, larger file size

**Size guidance:** `figsize=(width, height)` in inches. At 150 DPI, a (10, 6) figure produces a 1500x900 pixel image.

**File format:** `.png` for charts with discrete colors. `.pdf` for scalable vector output when the user needs to embed in documents.

**After saving, always verify:**

```python
import os
output = '/absolute/path/to/output/chart.png'
if os.path.exists(output):
    size_kb = os.path.getsize(output) / 1024
    print(f"Verified: {output} ({size_kb:.1f} KB)")
else:
    print(f"ERROR: File not created at {output}")
```
