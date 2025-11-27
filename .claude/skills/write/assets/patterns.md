# Write Skill: Patterns

Concrete examples of modification patterns, refactoring patterns, creation patterns, and common code change scenarios with solutions.

---

## Table of Contents

1. [Modification Patterns](#modification-patterns)
2. [Refactoring Patterns](#refactoring-patterns)
3. [Creation Patterns](#creation-patterns)
4. [Common Scenarios](#common-scenarios)

---

## Modification Patterns

### Pattern: Add Function to Module

```python
# 1. Read existing module
# cat module.py

# 2. Identify insertion point (end of file or after related function)

# 3. Use Edit to add function
# old_string: (existing content at end)
# new_string: (existing content + new function)

# Example:
"""
Old string:
    return result

New string:
    return result

def new_function(param):
    \"\"\"New function description.\"\"\"
    # Implementation
    return value
"""

# 4. Verify
# python -m py_compile module.py
# pytest tests/test_module.py
```

### Pattern: Modify Function Logic

```python
# 1. Read and locate function
# cat -n module.py | grep -A 20 "def target_function"

# 2. Use Edit with complete function replacement
# old_string: (entire old function, exactly as written)
# new_string: (entire new function with modifications)

# 3. Verify
# pytest tests/test_module.py::test_target_function
```

### Pattern: Add Import

```python
# 1. Read imports section
# head -20 module.py

# 2. Use Edit to add import in correct location
# old_string: (existing imports)
# new_string: (existing imports + new import)

# Keep organization:
# - Standard library imports first
# - Third-party imports second
# - Local imports last
# - Alphabetically within each group
```

### Pattern: Update Configuration Value

```yaml
# 1. Read current config
# cat config.yaml

# 2. Use Edit for specific key
# old_string:
#   timeout: 30
# new_string:
#   timeout: 60

# 3. Validate
# yq eval '.' config.yaml
```

### Pattern: Add Class Method

```python
# 1. Read class definition
# grep -A 50 "class MyClass" module.py

# 2. Use Edit to add method
# old_string: (last method in class)
# new_string: (last method + new method)

# Preserve indentation!
```

---

## Refactoring Patterns

### Pattern: Extract Function

**Before:**
```python
def complex_function(data):
    # Validation (10 lines)
    if not data:
        raise ValueError()
    # ... more validation

    # Processing (20 lines)
    result = []
    for item in data:
        # ... complex logic

    return result
```

**After:**
```python
def complex_function(data):
    validated = _validate_data(data)
    result = _process_items(validated)
    return result

def _validate_data(data):
    if not data:
        raise ValueError()
    # ... more validation
    return data

def _process_items(data):
    result = []
    for item in data:
        # ... complex logic
    return result
```

**Steps:**
1. Write tests for original function
2. Extract validation to new function
3. Extract processing to new function
4. Update original to call extracted functions
5. Verify tests still pass

### Pattern: Rename for Clarity

```python
# 1. Identify unclear name
# def proc(d):  # Unclear

# 2. Find all usages
# grep -rn "proc(" .

# 3. Rename in definition
# Edit module.py:
#   old: def proc(d):
#   new: def process_data(data):

# 4. Rename all call sites
# Edit each file that calls it
```

### Pattern: Remove Duplication

**Before:**
```python
def process_user(user):
    if not user:
        return None
    if not user.email:
        return None
    return validate(user)

def process_admin(admin):
    if not admin:
        return None
    if not admin.email:
        return None
    return validate(admin)
```

**After:**
```python
def _validate_entity(entity):
    if not entity or not entity.email:
        return None
    return validate(entity)

def process_user(user):
    return _validate_entity(user)

def process_admin(admin):
    return _validate_entity(admin)
```

### Pattern: Introduce Parameter Object

**Before:**
```python
def create_user(name, email, age, address, phone):
    # Too many parameters
    pass
```

**After:**
```python
class UserData:
    def __init__(self, name, email, age, address, phone):
        self.name = name
        self.email = email
        self.age = age
        self.address = address
        self.phone = phone

def create_user(user_data: UserData):
    # Single parameter
    pass
```

---

## Creation Patterns

### Pattern: New Module from Scratch

```python
#!/bin/bash
# Create new Python module

# 1. Create file with Write tool
"""
# new_module.py
\"\"\"Module description.

This module provides...
\"\"\"

# Standard library imports
import os
from typing import Dict, List

# Third-party imports
import requests

# Local imports
from .utils import helper


def main_function(param):
    \"\"\"Main function description.

    Args:
        param: Description

    Returns:
        Description
    \"\"\"
    pass


if __name__ == '__main__':
    main_function()
"""

# 2. Create test file
"""
# tests/test_new_module.py
import pytest
from new_module import main_function


def test_main_function():
    result = main_function(input)
    assert result == expected
"""

# 3. Verify
# python -m py_compile new_module.py
# pytest tests/test_new_module.py
```

### Pattern: New Class

```python
# Template for new class
"""
class NewClass:
    \"\"\"Class description.

    Attributes:
        attribute: Description
    \"\"\"

    def __init__(self, param):
        \"\"\"Initialize NewClass.

        Args:
            param: Description
        \"\"\"
        self.attribute = param

    def method(self, arg):
        \"\"\"Method description.

        Args:
            arg: Description

        Returns:
            Description
        \"\"\"
        pass

    def __str__(self):
        return f"NewClass({self.attribute})"

    def __repr__(self):
        return f"NewClass(attribute={self.attribute!r})"
"""
```

### Pattern: New Configuration File

```yaml
# config.yaml template
app:
  name: application-name
  version: 1.0.0
  debug: false

database:
  host: localhost
  port: 5432
  name: dbname

logging:
  level: INFO
  file: app.log
```

---

## Common Scenarios

### Common Code Enhancements

```python
# Add error handling
try:
    result = transform(data)
except ValueError as e:
    logger.error(f"Error: {e}")
    raise

# Add logging
logger.info(f"Starting operation")
result = process(data)
logger.info(f"Completed")

# Add validation
if not email or '@' not in email:
    raise ValueError("Invalid email")

# Add caching
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_operation(param):
    return result

# Add type hints
from typing import List

def process(data: List[int]) -> List[int]:
    return [x * 2 for x in data]

# Deprecate function
import warnings

def old_function(param):
    warnings.warn("Use new_function", DeprecationWarning)
    return new_function(param)
```

---

## Quick Patterns Reference

### By Language

**Python:**
- Add function: After last function in module
- Add class: After imports, before functions
- Add method: Inside class, preserve indentation
- Add import: Top of file, organized by type

**JavaScript:**
- Add function: End of file or in appropriate section
- Add export: With function definition or at end
- Add import: Top of file

**Go:**
- Add function: After package/imports
- Add method: After type definition
- Add import: In import block

### By Operation

| Operation | Tool | Verification |
|-----------|------|--------------|
| Add function | Edit | Syntax + tests |
| Modify logic | Edit | Tests |
| Add file | Write | Syntax |
| Update config | Edit | Validate format |
| Refactor | Edit (incremental) | All tests |
| Fix bug | Edit | Specific test |

### Safety Checklist

```
Before modification:
  ☐ Read file completely
  ☐ Understand context
  ☐ Check tests exist
  ☐ Note current behavior

During modification:
  ☐ Use Edit for existing, Write for new
  ☐ Preserve formatting
  ☐ Make minimal change
  ☐ Keep single responsibility

After modification:
  ☐ Syntax check
  ☐ Run affected tests
  ☐ Verify behavior
  ☐ Check for side effects
```
