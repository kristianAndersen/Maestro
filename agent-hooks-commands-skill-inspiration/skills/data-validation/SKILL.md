---
name: data-validation
description: Data validation orchestrator with domain expertise in data quality, integrity, schema compliance, statistical analysis, and anomaly detection. Validates datasets and provides quality assurance recommendations.
type: skill
tier: 2
model: sonnet
version: 1.0.0
allowed-tools: []
delegates-to: [read-file, parse-csv, parse-json, check-schema, detect-anomalies, calculate-statistics, validate-types]
---

# Data Validation Skill (Tier 2 Orchestrator)

**Type**: Tier 2 - Orchestrator with Domain Expertise
**Role**: Data analytics and quality assurance specialist that orchestrates data validation
**Methodology**: Tactical 4-D

---

## Purpose

Validates datasets for quality, integrity, schema compliance, data types, missing values, outliers, and statistical consistency. Provides actionable recommendations to improve data quality.

**Key Principle**: This skill brings data analytics and quality assurance domain expertise to orchestrate micro-skills for comprehensive data validation.

---

## Integration with Maestro

### Receives from Maestro (Strategic Direction)

**Product**: What to validate
```typescript
{
  goal: "Validate customer dataset before analysis",
  scope: "data/customers.csv",
  focus: ["completeness", "consistency", "accuracy"]
}
```

**Process**: How to approach it
```typescript
{
  methodology: "Multi-stage validation with schema enforcement",
  constraints: ["Must preserve original data", "Flag issues, don't auto-correct"],
  standards: ["Data quality framework", "Business rules"]
}
```

**Performance**: What defines success
```typescript
{
  deliverable: "Validation report with data quality score",
  criteria: ["All quality dimensions checked", "Issues categorized by severity"],
  timeline: "Complete validation within 2 minutes"
}
```

### Returns to Maestro

```typescript
{
  success: true,
  validation: {
    summary: "8,542 records validated. 98.3% data quality score.",
    quality_dimensions: {
      completeness: 99.1,
      consistency: 97.8,
      accuracy: 98.0,
      validity: 98.9
    },
    issues: [...],
    recommendations: [...]
  },
  metadata: {
    records_validated: 8542,
    fields_checked: 23,
    duration_ms: 5420
  }
}
```

---

## Tactical 4-D Implementation

### 1. DELEGATION (Tactical) - Micro-Skill Selection

Based on validation scope, select and sequence micro-skills:

**Standard Validation Chain**:
```typescript
1. read-file → Load dataset file
2. parse-csv/parse-json → Parse into structured data
3. check-schema → Verify structure matches expected schema
4. validate-types → Check data types for each field
5. detect-anomalies → Find outliers and inconsistencies
6. calculate-statistics → Compute quality metrics
7. format-output → Generate validation report
```

**Completeness Check Chain**:
```typescript
1. read-file → Load dataset
2. parse-csv/parse-json → Parse data
3. check-missing-values → Identify null/empty fields
4. calculate-completeness → Percentage complete per field
5. detect-patterns → Find systematic missing data
6. format-output → Completeness report
```

**Consistency Check Chain**:
```typescript
1. read-file → Load dataset
2. parse-csv/parse-json → Parse data
3. check-referential-integrity → Verify foreign keys
4. detect-duplicates → Find duplicate records
5. validate-ranges → Check values within expected ranges
6. detect-conflicts → Find contradictory data
7. format-output → Consistency report
```

### 2. DESCRIPTION (Tactical) - Micro-Skill Direction

Provide clear parameters to each micro-skill:

**check-schema micro-skill**:
```typescript
{
  operation: "check-schema",
  parameters: {
    data: [...records],
    schema: {
      customer_id: { type: "integer", required: true, unique: true },
      email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
      age: { type: "integer", required: false, min: 0, max: 120 },
      created_at: { type: "datetime", required: true }
    },
    strict: false // Allow extra fields
  },
  purpose: "Verify dataset structure matches expected schema",
  expected_output: {
    type: "object",
    valid: "boolean",
    violations: ["array of schema violations"]
  }
}
```

**detect-anomalies micro-skill**:
```typescript
{
  operation: "detect-anomalies",
  parameters: {
    data: [...records],
    fields: ["age", "transaction_amount", "login_count"],
    method: "iqr", // or "zscore", "isolation-forest"
    threshold: 3.0,
    return_indices: true
  },
  purpose: "Identify statistical outliers",
  expected_output: {
    type: "object",
    anomalies: [
      {
        field: "string",
        record_index: "number",
        value: "any",
        expected_range: "string",
        severity: "high|medium|low"
      }
    ]
  }
}
```

**validate-types micro-skill**:
```typescript
{
  operation: "validate-types",
  parameters: {
    data: [...records],
    type_definitions: {
      customer_id: "integer",
      email: "email",
      phone: "phone",
      postal_code: "zipcode",
      date_of_birth: "date"
    },
    coerce: false // Don't auto-convert, report violations
  },
  purpose: "Check data types for each field",
  expected_output: {
    type: "object",
    valid_count: "number",
    violations: ["array of type mismatches"]
  }
}
```

### 3. DISCERNMENT (Tactical) - Output Evaluation

Evaluate each micro-skill output before proceeding:

**parse-csv/parse-json output**:
```typescript
✓ Data parsed successfully (no syntax errors)
✓ Record count > 0
✓ All rows have same field count (CSV)
✗ If parse errors → Return error details, attempt recovery (skip malformed rows)
```

**check-schema output**:
```typescript
✓ Schema validation completed
✓ Violations documented with specific records
✗ If >50% violations → Major schema mismatch, escalate
✓ If <10% violations → Minor issues, proceed with validation
```

**detect-anomalies output**:
```typescript
✓ Anomalies detected and categorized
✓ Severity levels assigned correctly
✓ Expected ranges provided for context
✗ If >20% records flagged as anomalies → Review detection threshold
```

**calculate-statistics output**:
```typescript
✓ Statistics computed for all fields
✓ Percentages between 0-100
✓ Counts match dataset size
✗ If impossible values → Re-validate calculations
```

### 4. DILIGENCE (Tactical) - Error Recovery & Re-Planning

**5-Level Error Recovery System**:

**Level 1: Retry with Backoff**
- File locked or unavailable → Retry read-file
- Parser timeout on large file → Retry with streaming
- Temporary network issue (remote data) → Exponential backoff

**Level 2: Parameter Adjustment**
- Dataset too large (>1M rows) → Validate in batches of 100k
- Too many anomalies detected → Adjust threshold, re-run
- Schema mismatch → Relax strict mode, identify issues

**Level 3: Alternative Approach**
- CSV parsing fails → Try alternative delimiter (tab, semicolon)
- Schema validation unavailable → Manual field-by-field checks
- Statistical anomaly detection fails → Use simple range checks

**Level 4: Partial Success**
- 9,500/10,000 records validated, 500 parse errors → Return partial validation
- Schema check passed, anomaly detection failed → Return structure validation only
- Type validation succeeded, consistency check incomplete → Return available results

**Level 5: Escalate to Maestro**
- All parsing attempts fail (corrupted file)
- Dataset format completely unknown
- Validation requirements contradict data reality
- Business rules conflict with data patterns

**Error Recovery Examples**:

```typescript
// Level 1: Retry
if (error.code === "EBUSY") {
  await retry(read_file, { attempts: 3, delay: 100 });
}

// Level 2: Adjust Parameters
if (records.length > 1000000) {
  // Validate in batches
  const batches = chunk(records, 100000);
  for (const batch of batches) {
    await validate_batch(batch);
  }
}

// Level 3: Alternative Approach
try {
  const data = await parse_csv(file, { delimiter: ',' });
} catch (error) {
  // Try alternative delimiters
  const data = await parse_csv(file, { delimiter: '\t' });
}

// Level 4: Partial Success
const results = {
  success: true,
  records_validated: 9500,
  records_failed: 500,
  disclaimer: "500 records had parse errors (malformed rows)",
  quality_score: calculate_quality(validated_records),
  issues: [...issues_from_validated_records]
};

// Level 5: Escalate
if (completely_unknown_format) {
  return {
    success: false,
    escalate: true,
    reason: "Dataset format not recognized (not CSV, JSON, or Excel)",
    suggestion: "Specify file format or provide schema documentation"
  };
}
```

---

## Domain Expertise Application

### Data Quality Dimensions

**Completeness** (Missing Data):
- Field completeness: % non-null values per field
- Record completeness: % complete records
- Required field violations
- Systematic missing patterns (all Sundays missing)

**Consistency** (Contradictions):
- Referential integrity (foreign keys valid)
- Cross-field consistency (end_date > start_date)
- Duplicate detection (exact or fuzzy)
- Format consistency (dates in same format)

**Accuracy** (Correctness):
- Range validation (age 0-120, not -5 or 200)
- Format validation (email, phone, postal code)
- Business rule compliance
- Statistical plausibility

**Validity** (Schema Compliance):
- Data type correctness (integer, string, date)
- Required fields present
- Allowed values (enum validation)
- Structure integrity

**Uniqueness** (No Duplicates):
- Primary key uniqueness
- Composite key uniqueness
- Fuzzy duplicate detection (similar records)

**Timeliness** (Currency):
- Record age within acceptable range
- Update frequency appropriate
- Stale data detection

### Statistical Validation

**Descriptive Statistics**:
- Mean, median, mode
- Standard deviation
- Min, max, quartiles
- Distribution shape

**Anomaly Detection Methods**:
- **IQR Method**: Values outside Q1 - 1.5×IQR to Q3 + 1.5×IQR
- **Z-Score**: Values with |z| > 3
- **Isolation Forest**: ML-based outlier detection
- **Domain Rules**: Business-specific thresholds

**Example Statistical Validation**:
```typescript
// Field: transaction_amount
// Statistics: mean=$127.50, std=$45.20, max=$950
// Anomaly detected: $12,500 (z-score: 273.9)
// Finding: {
//   field: "transaction_amount",
//   value: 12500,
//   expected_range: "$37.10 - $217.90 (99.7% confidence)",
//   severity: "high",
//   recommendation: "Verify transaction or flag as fraudulent"
// }
```

### Business Rule Validation

**Domain-Specific Rules**:
- Customer age ≥ 18 for account opening
- Order total = sum(line_items)
- Shipping date ≥ order date
- Email domain not in blacklist

**Referential Integrity**:
- Customer IDs in orders table exist in customers table
- Product IDs valid
- Foreign key constraints satisfied

---

## Communication with Maestro

**Transparency Notes** (brief, factual):
- "Validating 8,542 customer records..."
- "Data quality score: 98.3%"
- "Completed validation in 5.4s"

**Progress Updates** (for large datasets):
- "Validated 50,000/200,000 records..."
- "Detected 42 anomalies so far..."

**Completion Report**:
```typescript
{
  summary: "8,542 records validated. 98.3% data quality score.",
  quality_dimensions: {
    completeness: 99.1,  // 1% missing values
    consistency: 97.8,   // 2.2% duplicates or conflicts
    accuracy: 98.0,      // 2% range/format violations
    validity: 98.9,      // 1.1% type mismatches
    uniqueness: 99.7     // 0.3% duplicates
  },
  issues: [
    {
      severity: "high",
      dimension: "accuracy",
      field: "age",
      count: 12,
      description: "12 records with age > 120",
      sample_records: [4201, 5892, 7103],
      recommendation: "Verify data entry or correct birth dates"
    },
    {
      severity: "medium",
      dimension: "completeness",
      field: "phone",
      count: 87,
      description: "87 records missing phone number (1.02%)",
      recommendation: "Request phone numbers or mark as optional field"
    }
  ],
  recommendations: [
    "Enforce age validation at data entry (<120)",
    "Add email uniqueness constraint (found 23 duplicates)",
    "Review transaction amounts >$1000 (18 anomalies detected)"
  ],
  metadata: {
    records_validated: 8542,
    fields_checked: 23,
    anomalies_detected: 42,
    duplicates_found: 19,
    duration_ms: 5420
  }
}
```

---

## Example Workflows

### Example 1: Customer Data Validation

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Validate customer dataset before CRM import",
  scope: "data/customers.csv",
  focus: ["completeness", "consistency", "accuracy"],
  standards: ["CRM schema v2.1", "Business rules"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select standard validation chain
2. **DESCRIPTION**: Configure schema check with CRM schema
3. Read file: `read-file({ file_path: "data/customers.csv" })`
   - **DISCERNMENT**: File loaded, 15.2MB ✓
4. Parse CSV: `parse-csv({ data, headers: true })`
   - **DISCERNMENT**: 8,542 records parsed ✓
5. Check schema: Verify against CRM schema
   - **DISCERNMENT**: 98% compliance, 2% violations (missing fields)
6. Validate types: Check email, phone, date formats
   - **DISCERNMENT**: 87 invalid emails, 12 invalid dates
7. Detect anomalies: Find outliers in age, transaction_amount
   - **DISCERNMENT**: 42 statistical anomalies
8. Return validation report with quality score

### Example 2: Transaction Data Integrity

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Verify transaction data integrity",
  scope: "data/transactions/*.json",
  focus: ["consistency", "referential-integrity"],
  standards: ["Financial data standards"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select consistency check chain
2. Read files: Load all transaction JSON files
3. Parse JSON: Structure into records
4. Check referential integrity: Verify customer_id, product_id exist
   - **DILIGENCE Level 3**: 15 customer IDs not found → Flag as orphaned
5. Validate ranges: Order total = sum(line items)
   - **DISCERNMENT**: 8 transactions have total mismatch
6. Detect duplicates: Find duplicate transaction IDs
   - **DISCERNMENT**: 3 duplicate IDs found
7. Return consistency report

### Example 3: Large Dataset Validation (Error Recovery)

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Validate user activity logs",
  scope: "logs/activity_2024.csv",
  focus: ["completeness", "validity"]
}
```

**Skill's Tactical Execution**:
1. Read file: Large file (500MB, 5M records)
   - **DILIGENCE Level 2**: File too large → Switch to batch processing
2. Parse CSV in batches: 100k records per batch
3. For each batch:
   - Check schema
   - Validate types
   - Calculate statistics
   - **DISCERNMENT**: Batch 3 has 2,000 parse errors (malformed rows)
   - **DILIGENCE Level 4**: Skip malformed rows, continue
4. Aggregate results from all batches
5. Return partial validation report (4.998M of 5M records)

---

## Best Practices

### DO
- Apply data quality and analytics domain knowledge
- Categorize issues by severity (high, medium, low)
- Provide specific record indices for investigation
- Calculate quality scores for each dimension
- Handle large datasets with batch processing
- Return partial results rather than failing completely

### DON'T
- Don't modify original data during validation
- Don't assume schema without explicit definition
- Don't fail entire validation if subset has errors
- Don't report every single issue (summarize patterns)
- Don't auto-correct without Maestro approval

---

## Integration Notes

### Called by Maestro

Maestro queries registry with natural language:
- "Validate customer dataset"
- "Check data quality before import"
- "Verify transaction data integrity"

Registry matches this skill based on capabilities: `data-validation`, `quality-assurance`, `schema-checking`

### Delegates to Micro-Skills

- **read-file**: Load dataset file
- **parse-csv**: Parse CSV data
- **parse-json**: Parse JSON data
- **check-schema**: Verify structure compliance
- **validate-types**: Check data type correctness
- **detect-anomalies**: Find statistical outliers
- **calculate-statistics**: Compute quality metrics
- **detect-duplicates**: Find duplicate records
- **format-output**: Structure validation report

---

## Success Criteria

- ✓ All quality dimensions assessed (completeness, consistency, accuracy, validity, uniqueness)
- ✓ Issues categorized by severity with specific examples
- ✓ Quality scores computed for each dimension
- ✓ Recommendations are actionable and prioritized
- ✓ Handles large datasets without memory issues
- ✓ Validation completes in reasonable time (<2min per 100k records)

---

**Skill Status**: Tier 2 Orchestrator with Data Analytics Expertise
**Methodology**: Tactical 4-D (Delegation, Description, Discernment, Diligence)
**Model**: Sonnet (domain expertise required)
**Domain**: Data Analytics / Quality Assurance
