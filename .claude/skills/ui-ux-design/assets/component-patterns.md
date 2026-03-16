# Component CSS Patterns — Deep Reference

Ready-to-use, accessible CSS component patterns built with design tokens. All use custom properties from the semantic token layer.

---

## Button — Complete

```css
/* Base button — all variants inherit from this */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: inherit;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--transition-fast),
              border-color var(--transition-fast),
              color var(--transition-fast),
              box-shadow var(--transition-fast);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Primary */
.btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-text);
}
.btn--primary:hover  { background: var(--color-primary-hover); }
.btn--primary:active { background: var(--color-primary-active); }

/* Secondary / Ghost */
.btn--ghost {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border-strong);
}
.btn--ghost:hover  { background: var(--color-bg-muted); }
.btn--ghost:active { background: var(--color-bg-subtle); }

/* Danger */
.btn--danger {
  background: var(--color-error);
  color: #ffffff;
}
.btn--danger:hover  { background: #b91c1c; }  /* red-700 */
.btn--danger:active { background: #991b1b; }  /* red-800 */

/* Size variants */
.btn--sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
}

.btn--lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-lg);
}

/* Icon button */
.btn--icon {
  padding: var(--space-2);
  aspect-ratio: 1;
  border-radius: var(--radius-md);
}
```

---

## Form Field — Accessible

```css
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  line-height: 1.4;
}

.field__label--required::after {
  content: " *";
  color: var(--color-error);
}

.field__input {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
  width: 100%;
  line-height: var(--line-height-normal);
}

.field__input::placeholder {
  color: var(--color-text-tertiary);
}

.field__input:focus-visible {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-border-focus) 20%, transparent);
}

.field__input[aria-invalid="true"],
.field__input:invalid:not(:focus):not(:placeholder-shown) {
  border-color: var(--color-error);
}

.field__input:disabled {
  background: var(--color-bg-muted);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.field__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.field__error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Textarea */
.field__textarea {
  resize: vertical;
  min-height: 96px;
}

/* Select */
.field__select {
  padding-inline-end: var(--space-8);  /* room for arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  cursor: pointer;
}
```

---

## Card — Composable

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}

/* Interactive card variant */
.card--interactive {
  cursor: pointer;
}

.card--interactive:hover {
  box-shadow: var(--shadow-md);
}

.card--interactive:focus-within {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Elevated variant */
.card--elevated {
  border: none;
  box-shadow: var(--shadow-md);
}

.card--elevated:hover {
  box-shadow: var(--shadow-lg);
}

/* Card sections */
.card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card__body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--color-text);
}

.card__description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.card__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
```

---

## Alert — Status Messages

```css
.alert {
  --alert-color: var(--color-info);
  --alert-bg: var(--color-info-subtle);

  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5, var(--space-4));
  border-radius: var(--radius-md);
  border-left: 4px solid var(--alert-color);
  background: var(--alert-bg);
  color: var(--color-text);
}

.alert--success {
  --alert-color: var(--color-success);
  --alert-bg: var(--color-success-subtle);
}

.alert--warning {
  --alert-color: var(--color-warning);
  --alert-bg: var(--color-warning-subtle);
}

.alert--error {
  --alert-color: var(--color-error);
  --alert-bg: var(--color-error-subtle);
}

.alert__icon {
  color: var(--alert-color);
  flex-shrink: 0;
  margin-block-start: 0.125rem;
}

.alert__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.alert__title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.alert__message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}
```

---

## Badge / Tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.125rem var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  border-radius: var(--radius-full);
  white-space: nowrap;

  /* Default: neutral */
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.badge--primary {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.badge--success {
  background: var(--color-success-subtle);
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
}

.badge--warning {
  background: var(--color-warning-subtle);
  color: var(--color-warning);
  border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
}

.badge--error {
  background: var(--color-error-subtle);
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
}
```

---

## Navigation — Header

```css
.nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.nav__brand {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-text);
  text-decoration: none;
  margin-inline-end: var(--space-8);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
}

.nav__link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.nav__link:hover {
  background: var(--color-bg-muted);
  color: var(--color-text);
}

.nav__link[aria-current="page"] {
  background: var(--color-bg-muted);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}
```

---

## Modal / Dialog

```css
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  padding: var(--space-6);
}

/* Dialog */
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: min(560px, 100%);
  max-height: min(640px, 90dvh);
  display: flex;
  flex-direction: column;
  z-index: var(--z-modal);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-4);
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.modal__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```
