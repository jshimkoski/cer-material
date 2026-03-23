# @jasonshimmy/cer-material

Material Design 3 web components built on [`@jasonshimmy/custom-elements-runtime`](https://github.com/jshimkoski/custom-elements).

All components are standard custom elements — framework-agnostic and usable in plain HTML, React, Vue, Angular, Svelte, or any other environment.

For live demos and usage examples, see [https://cer-material.netlify.app/](https://cer-material.netlify.app/).

Learn more about the author at [jasonshimmy.com](https://jasonshimmy.com) and check out the [changelog](./CHANGELOG.md) for recent updates.

---

## Installation

```bash
npm install @jasonshimmy/cer-material @jasonshimmy/custom-elements-runtime
```

`@jasonshimmy/custom-elements-runtime` is a **peer dependency** and must be installed alongside this package.

### Font setup

Components use Material Symbols and Roboto. Add both to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap" rel="stylesheet" />
```

---

## CDN / No build tool

A self-contained IIFE bundle (runtime included) is available for use without a bundler — ideal for CodePen, JSFiddle, plain HTML files, or any environment where you just want a `<script>` tag.

Add the fonts and a single script to your HTML `<head>`:

```html
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&display=swap" rel="stylesheet" />

<!-- cer-material (runtime included) -->
<script src="https://cdn.jsdelivr.net/npm/@jasonshimmy/cer-material/dist/cer-material.iife.js"></script>
```

All components are registered automatically once the script loads — no `import` needed:

```html
<md-button variant="filled" label="Save"></md-button>
<md-text-field label="Email" type="email"></md-text-field>
```

> **Note:** The IIFE bundle includes the runtime (~78 kB gzip). If you are also using `@jasonshimmy/custom-elements-runtime` directly in the same page, be aware the runtime will be loaded twice.

---

## Setup in [CER App Framework](https://github.com/jshimkoski/vite-plugin-cer-app)

Install dependencies:

```bash
npm install typeface-roboto material-symbols @jasonshimmy/cer-material
```

Create a plugin in your CER App Framework project:

```ts
// plugins/cer-material.ts
import 'typeface-roboto';
import 'material-symbols/outlined.css';
import '@jasonshimmy/cer-material';

export default {};
```

---

## Quick start

```ts
// Registers all components and applies the MD3 design token theme
import '@jasonshimmy/cer-material';
```

Then use any component tag directly in your HTML or templates:

```html
<md-button variant="filled" label="Save"></md-button>
<md-text-field label="Email" type="email"></md-text-field>
```

### Theme only

If you need the MD3 CSS custom properties without registering components:

```ts
import '@jasonshimmy/cer-material/theme';
```

Or call it lazily:

```ts
import { applyTheme } from '@jasonshimmy/cer-material/theme';
applyTheme();
```

---

## Two-way bindings (`:model`)

All stateful components emit `update:*` events enabling concise two-way data binding with `:model` — no need to manually pair a `:prop` setter with a `@event` handler.

| Syntax | Syncs | Components |
|---|---|---|
| `:model="${ref}"` | `value` | `md-text-field`, `md-slider`, `md-search`, `md-date-picker`, `md-time-picker` |
| `:model:checked="${ref}"` | `checked` | `md-checkbox` |
| `:model:selected="${ref}"` | `selected` | `md-switch`, `md-chip` (filter), `md-icon-button` (toggle), `md-segmented-button` |
| `:model:activeTab="${ref}"` | active tab id | `md-tabs` |
| `:model:active="${ref}"` | active item id | `md-navigation-bar`, `md-navigation-rail`, `md-navigation-drawer` |
| `:model:open="${ref}"` | open / visible | `md-dialog`, `md-menu`, `md-snackbar`, `md-bottom-sheet`, `md-side-sheet`, `md-fab-menu`, `md-navigation-drawer`, `md-date-picker`, `md-time-picker` |

All original `change`, `close`, `tab-change`, and other events still fire for backward compatibility — `:model` is additive.

```ts
// Verbose (still works)
<md-text-field :value="${email}" @change="${e => email = e.detail}"></md-text-field>

// Concise with :model
<md-text-field :model="${email}"></md-text-field>
```

> **Radio groups**: `:model:checked` writes the radio's `value` string to the ref when selected, but does not derive the `checked` boolean. Use `:checked="${selected === radio.value}"` for the display state alongside `@change` for radio groups.

---

## Design tokens

The theme is injected as `document.adoptedStyleSheets` and exposes every MD3 system token as a CSS custom property. Override them on `:root` to customise the palette:

```css
:root {
  --md-sys-color-primary: #0057b8;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #d6e4ff;
}
```

Dark mode is handled automatically via `@media (prefers-color-scheme: dark)`.

**Available token groups:**

| Group | Example properties |
|---|---|
| Primary | `--md-sys-color-primary`, `--md-sys-color-on-primary`, `--md-sys-color-primary-container` |
| Secondary | `--md-sys-color-secondary`, `--md-sys-color-secondary-container` |
| Tertiary | `--md-sys-color-tertiary`, `--md-sys-color-tertiary-container` |
| Error | `--md-sys-color-error`, `--md-sys-color-error-container` |
| Surface | `--md-sys-color-surface`, `--md-sys-color-surface-variant`, `--md-sys-color-surface-container` |
| Outline | `--md-sys-color-outline`, `--md-sys-color-outline-variant` |
| Elevation | `--md-sys-elevation-1` … `--md-sys-elevation-4` |
| Typography | `--md-sys-typescale-font` |
| Shape | `--md-sys-shape-corner-none` … `--md-sys-shape-corner-full` |

---

## Components

### `<md-app-bar>`

MD3 top app bar with four layout variants, a leading navigation icon, title area, and trailing action icons.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'small' \| 'medium' \| 'large' \| 'center'` | `'small'` | Layout and title size |
| `title` | `string` | `''` | Title text |
| `leading-icon` | `string` | `'menu'` | Material Symbol for the leading nav button |
| `trailing-icons` | `string[]` | `[]` | Array of Material Symbol names for trailing action buttons |
| `scrolled` | `boolean` | `false` | Applies elevated/tinted scroll state |

**Slots:** `title` — custom title content; `trailing` — completely custom trailing area.

**Events:** `nav` — leading icon clicked; `action` `(detail: string)` — the clicked icon name.

```html
<md-app-bar
  variant="small"
  title="Inbox"
  leading-icon="menu"
  :bind="${{ trailingIcons: ['search', 'more_vert'] }}"
  @nav="${openDrawer}"
  @action="${handleAction}"
></md-app-bar>
```

---

### `<md-badge>`

Overlays a numeric label or a small dot indicator on top of slotted content.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| number` | `''` | Badge text; empty renders a small dot |
| `small` | `boolean` | `false` | Forces the small dot style regardless of `value` |

**Slots:** default — the element the badge attaches to.

```html
<md-badge value="3">
  <md-icon-button icon="notifications"></md-icon-button>
</md-badge>
```

---

### `<md-bottom-sheet>`

Slide-up bottom sheet with optional drag-to-dismiss, focus trap, and scroll lock.

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Shows/hides the sheet |
| `headline` | `string` | `''` | Sheet header text |
| `show-handle` | `boolean` | `true` | Renders the drag handle pill |
| `variant` | `'standard' \| 'modal'` | `'standard'` | `modal` adds a scrim overlay |

**Slots:** default — sheet body content.

**Events:** `close` — sheet dismissed.

```html
<md-bottom-sheet
  :model:open="${isOpen}"
  headline="Options"
  variant="modal"
>
  <p>Your content here</p>
</md-bottom-sheet>
```

---

### `<md-button>`

MD3 button in five style variants with optional leading icon.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'filled' \| 'outlined' \| 'text' \| 'elevated' \| 'tonal'` | `'filled'` | Visual style |
| `label` | `string` | `''` | Button text |
| `icon` | `string` | `''` | Leading Material Symbol name |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type |
| `disabled` | `boolean` | `false` | Disables the button |

```html
<md-button variant="filled" label="Save" icon="save"></md-button>
<md-button variant="outlined" label="Cancel"></md-button>
<md-button variant="text" label="Learn more"></md-button>
```

---

### `<md-button-group>`

Horizontally connected group of buttons sharing a unified variant style.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'filled' \| 'outlined' \| 'tonal' \| 'text' \| 'elevated'` | `'outlined'` | Shared style for all items |
| `disabled` | `boolean` | `false` | Disables all buttons |
| `items` | `{ id: string; label: string; icon?: string; disabled?: boolean }[]` | `[]` | Button definitions |

**Events:** `click` `(detail: { id: string; index: number })` — a button was clicked.

```html
<md-button-group
  variant="outlined"
  :bind="${{ items: [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ] }}"
  @click="${handleGroupClick}"
></md-button-group>
```

---

### `<md-card>`

MD3 card container that optionally becomes an interactive button with a ripple state layer.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'elevated' \| 'filled' \| 'outlined'` | `'elevated'` | Visual style |
| `clickable` | `boolean` | `false` | Makes the whole card an accessible button |

**Slots:** default — card content.

**Events:** `click` — emitted when `clickable` is `true`.

```html
<md-card variant="outlined" clickable @click="${openDetail}">
  <h3>Card Title</h3>
  <p>Supporting text goes here.</p>
</md-card>
```

---

### `<md-carousel>`

Horizontal snap-scroll carousel rendering image or color-placeholder cards with overlay text.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ id: string; headline?: string; supportingText?: string; image?: string; color?: string }[]` | `[]` | Carousel item data |
| `variant` | `'multi-browse' \| 'uncontained' \| 'full-screen'` | `'multi-browse'` | Layout density |

**Events:** `select` `(detail: string)` — the `id` of the clicked card.

```html
<md-carousel
  variant="multi-browse"
  :bind="${{ items: [
    { id: '1', headline: 'Mountains', image: '/img/mountains.jpg' },
    { id: '2', headline: 'Ocean', color: '#0077b6' },
  ] }}"
  @select="${handleSelect}"
></md-carousel>
```

---

### `<md-checkbox>`

MD3 checkbox with animated check/dash icon and an optional inline text label.

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | Checked state |
| `indeterminate` | `boolean` | `false` | Indeterminate (dash) state |
| `disabled` | `boolean` | `false` | Disables interaction |
| `label` | `string` | `''` | Inline label text |

**Events:** `change` `(detail: boolean)` — new checked state.

```html
<md-checkbox
  label="Accept terms"
  :model:checked="${accepted}"
></md-checkbox>
```

---

### `<md-chip>`

MD3 chip in four variants — assist, filter (toggle), input (removable), and suggestion.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'assist' \| 'filter' \| 'input' \| 'suggestion'` | `'assist'` | Chip type |
| `label` | `string` | `''` | Chip text |
| `icon` | `string` | `''` | Leading Material Symbol |
| `selected` | `boolean` | `false` | Active state (filter variant) |
| `disabled` | `boolean` | `false` | Disables interaction |

**Events:** `click`; `remove` — the × button was tapped (input variant only).

```html
<md-chip variant="filter" label="Unread" :model:selected="${filterUnread}"></md-chip>
<md-chip variant="input" label="jason@example.com" @remove="${removeChip}"></md-chip>
```

---

### `<md-date-picker>`

Full MD3 date picker with calendar grid, month/year navigation, optional date range, and min/max constraints.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'dialog' \| 'docked'` | `'dialog'` | Modal dialog or inline docked layout |
| `value` | `string` | `''` | Selected date (`YYYY-MM-DD`) |
| `range-start` | `string` | `''` | Range start date (`YYYY-MM-DD`) |
| `range-end` | `string` | `''` | Range end date (`YYYY-MM-DD`) |
| `min` | `string` | `''` | Minimum selectable date |
| `max` | `string` | `''` | Maximum selectable date |
| `open` | `boolean` | `false` | Controls visibility |
| `label` | `string` | `'Select date'` | Trigger field label |
| `aria-label` | `string` | `'Date picker'` | Accessible label |

**Events:** `change` `(detail: string)` — selected date in `YYYY-MM-DD` format; `close`.

```html
<md-date-picker
  label="Start date"
  :model="${startDate}"
  min="2024-01-01"
  :model:open="${pickerOpen}"
></md-date-picker>
```

---

### `<md-dialog>`

MD3 modal dialog with scale-in animation, optional icon/headline, scrollable body, and an actions slot.

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Shows/hides the dialog |
| `headline` | `string` | `''` | Dialog title |
| `icon` | `string` | `''` | Leading Material Symbol in the header |

**Slots:** default — scrollable body content; `actions` — action buttons row.

**Events:** `close` — dialog dismissed.

```html
<md-dialog :model:open="${dialogOpen}" headline="Delete item?">
  <p>This action cannot be undone.</p>
  <div slot="actions">
    <md-button variant="text" label="Cancel" @click="${() => dialogOpen = false}"></md-button>
    <md-button variant="filled" label="Delete" @click="${confirmDelete}"></md-button>
  </div>
</md-dialog>
```

---

### `<md-divider>`

Thin horizontal or vertical separator rule with inset variants for list and layout use.

| Prop | Type | Default | Description |
|---|---|---|---|
| `inset` | `boolean` | `false` | Insets both ends |
| `inset-start` | `boolean` | `false` | Insets the leading end only |
| `inset-end` | `boolean` | `false` | Insets the trailing end only |
| `vertical` | `boolean` | `false` | Renders as a vertical rule |

```html
<md-divider></md-divider>
<md-divider inset-start></md-divider>
<md-divider vertical></md-divider>
```

---

### `<md-fab>`

MD3 Floating Action Button in four color variants, four sizes, and an extended (icon + label) pill form.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'surface'` | `'primary'` | Background color role |
| `size` | `'small' \| 'regular' \| 'medium' \| 'large'` | `'regular'` | Button size |
| `icon` | `string` | `'add'` | Material Symbol |
| `label` | `string` | `''` | Non-empty value makes it an extended FAB |
| `lowered` | `boolean` | `false` | Reduces elevation |
| `aria-label` | `string` | `''` | Accessible label |

**Events:** `click`

```html
<md-fab icon="edit" variant="primary"></md-fab>
<md-fab icon="add" label="Compose" variant="secondary" size="regular"></md-fab>
```

---

### `<md-fab-menu>`

FAB speed dial that expands upward to reveal labeled action items. Only one instance can be open at a time.

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | `'add'` | Material Symbol for the collapsed state |
| `close-icon` | `string` | `'close'` | Material Symbol for the expanded state |
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | FAB color role |
| `open` | `boolean` | `false` | Expanded state |
| `items` | `{ id: string; icon: string; label: string; disabled?: boolean }[]` | `[]` | Action item definitions |
| `aria-label` | `string` | `'Speed dial'` | Accessible label |

**Events:** `open`; `close`; `select` `(detail: { id: string })` — an item was chosen.

```html
<md-fab-menu
  :model:open="${fabOpen}"
  :bind="${{ items: [
    { id: 'share', icon: 'share', label: 'Share' },
    { id: 'copy', icon: 'content_copy', label: 'Copy link' },
  ] }}"
  @select="${handleFabSelect}"
></md-fab-menu>
```

---

### `<md-icon-button>`

MD3 icon button with four style variants and optional toggle (pressed/selected) behaviour.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'standard' \| 'filled' \| 'tonal' \| 'outlined'` | `'standard'` | Visual style |
| `icon` | `string` | `'more_vert'` | Material Symbol |
| `selected` | `boolean` | `false` | Pressed/selected state (toggle mode) |
| `selected-icon` | `string` | `''` | Alternate symbol shown when selected |
| `toggle` | `boolean` | `false` | Enables toggle behaviour |
| `disabled` | `boolean` | `false` | Disables interaction |
| `aria-label` | `string` | `''` | Accessible label |

**Events:** `click`; `change` `(detail: boolean)` — new selected state (toggle mode).

```html
<md-icon-button icon="favorite_border" selected-icon="favorite" toggle :model:selected="${isFav}"></md-icon-button>
<md-icon-button icon="delete" variant="outlined" @click="${onDelete}"></md-icon-button>
```

---

### `<md-list>` / `<md-list-item>`

MD3 list container and individual list items with leading/trailing content, headlines, supporting text, and selected/disabled states.

#### `<md-list>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `role` | `string` | `'list'` | ARIA role |

**Slots:** default — `<md-list-item>` children.

#### `<md-list-item>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `headline` | `string` | `''` | Primary text |
| `supporting-text` | `string` | `''` | Secondary text |
| `leading-icon` | `string` | `''` | Leading Material Symbol |
| `trailing-icon` | `string` | `''` | Trailing Material Symbol |
| `trailing-supporting-text` | `string` | `''` | Trailing metadata text |
| `disabled` | `boolean` | `false` | Disables the item |
| `selected` | `boolean` | `false` | Highlights the item as active |
| `type` | `'text' \| 'link' \| 'checkbox' \| 'radio'` | `'text'` | Item interaction type |

**Slots:** `leading` — custom leading content; default — inline content after headline; `trailing` — custom trailing content.

**Events:** `click`

```html
<md-list>
  <md-list-item headline="Inbox" leading-icon="inbox" trailing-supporting-text="24"></md-list-item>
  <md-list-item headline="Sent" leading-icon="send" selected></md-list-item>
  <md-list-item headline="Trash" leading-icon="delete" disabled></md-list-item>
</md-list>
```

---

### `<md-loading-indicator>`

MD3 four-color indeterminate circular spinner.

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Spinner size |
| `aria-label` | `string` | `'Loading'` | Accessible announcement text |

```html
<md-loading-indicator size="large"></md-loading-indicator>
```

---

### `<md-menu>`

Contextual dropdown menu with four anchor positions, keyboard navigation, and divider support.

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Shows/hides the menu |
| `items` | `{ id: string; label: string; icon?: string; disabled?: boolean; divider?: boolean }[]` | `[]` | Menu item definitions |
| `anchor` | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | Popup position relative to the trigger |

**Slots:** `trigger` — the element that opens the menu.

**Events:** `select` `(detail: string)` — the `id` of the chosen item; `close`.

```html
<md-menu
  :model:open="${menuOpen}"
  :bind="${{ items: [
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'dup', label: 'Duplicate', icon: 'content_copy' },
    { id: 'del', label: 'Delete', icon: 'delete', divider: true },
  ] }}"
  @select="${handleMenuSelect}"
>
  <md-icon-button slot="trigger" icon="more_vert" @click="${() => menuOpen = !menuOpen}"></md-icon-button>
</md-menu>
```

---

### `<md-navigation-bar>`

MD3 bottom navigation bar for mobile with active pill indicator, filled icon for the active item, and badge support.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ id: string; label: string; icon: string; badge?: string }[]` | `[]` | Destination definitions |
| `active` | `string` | `''` | `id` of the active destination |

**Events:** `change` `(detail: string)` — the `id` of the selected destination.

```html
<md-navigation-bar
  :model:active="${activeTab}"
  :bind="${{ items: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'profile', label: 'Profile', icon: 'person', badge: '2' },
  ] }}"
></md-navigation-bar>
```

---

### `<md-navigation-drawer>`

MD3 navigation drawer in standard (in-layout, width-animated) or modal (slide-in overlay) form with section headers and dividers.

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Shows/hides the drawer |
| `headline` | `string` | `''` | Header text |
| `variant` | `'standard' \| 'modal'` | `'standard'` | `modal` adds a scrim |
| `items` | `{ id?: string; label?: string; icon?: string; section?: string; divider?: boolean; disabled?: boolean }[]` | `[]` | Navigation item definitions |
| `active` | `string` | `''` | `id` of the active item |

**Slots:** default — extra content below the item list.

**Events:** `close`; `change` `(detail: string)` — the `id` of the selected item.

```html
<md-navigation-drawer
  variant="modal"
  headline="Mail"
  :model:open="${drawerOpen}"
  :model:active="${currentRoute}"
  :bind="${{ items: navItems }}"
  @change="${e => navigate(e.detail)}"
></md-navigation-drawer>
```

---

### `<md-navigation-rail>`

MD3 vertical navigation rail for tablet/desktop with optional top FAB and hamburger menu icon.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ id: string; label: string; icon: string; badge?: string }[]` | `[]` | Destination definitions |
| `active` | `string` | `''` | `id` of the active destination |
| `fab` | `boolean` | `false` | Shows a FAB at the top |
| `fab-icon` | `string` | `'add'` | FAB Material Symbol |
| `menu-icon` | `boolean` | `false` | Shows a hamburger menu icon |

**Events:** `change` `(detail: string)` — the `id` of the selected destination; `fab-click`; `menu-click`.

```html
<md-navigation-rail
  :model:active="${activeRoute}"
  menu-icon
  :bind="${{ items: [
    { id: 'inbox', label: 'Inbox', icon: 'inbox' },
    { id: 'sent', label: 'Sent', icon: 'send' },
  ] }}"
  @change="${e => navigate(e.detail)}"
></md-navigation-rail>
```

---

### `<md-progress>`

MD3 progress indicator — linear (with buffer track) or circular — in determinate or indeterminate mode.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'linear' \| 'circular'` | `'linear'` | Indicator shape |
| `value` | `number` | `0` | Progress value (0–100) |
| `indeterminate` | `boolean` | `false` | Animated looping mode |
| `buffer` | `number` | `100` | Buffer track value 0–100 (linear only) |
| `aria-label` | `string` | `'Loading'` | Accessible label |

```html
<md-progress variant="linear" value="65"></md-progress>
<md-progress variant="circular" indeterminate></md-progress>
```

---

### `<md-radio>`

MD3 radio button with animated inner circle, `name`/`value` for grouping, and an optional inline label.

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | `false` | Selected state |
| `disabled` | `boolean` | `false` | Disables interaction |
| `name` | `string` | `''` | Radio group name |
| `value` | `string` | `''` | Form value |
| `label` | `string` | `''` | Inline label text |

**Events:** `change` `(detail: string)` — the `value` of the selected radio.

```html
<md-radio name="size" value="s" label="Small"></md-radio>
<md-radio name="size" value="m" label="Medium" checked></md-radio>
<md-radio name="size" value="l" label="Large"></md-radio>
```

---

### `<md-search>`

MD3 search bar with a leading icon, animated clear button, and optional avatar.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `''` | Current input value |
| `placeholder` | `string` | `'Search'` | Placeholder text |
| `leading-icon` | `string` | `'search'` | Material Symbol for the leading icon |
| `show-avatar` | `boolean` | `false` | Renders an avatar button on the trailing end |

**Events:** `clear`; `search` `(detail: string)` — the search query when Enter is pressed.

```html
<md-search
  placeholder="Search contacts"
  :model="${query}"
  @search="${e => runSearch(e.detail)}"
></md-search>
```

---

### `<md-segmented-button>`

MD3 segmented button group for single-select or multi-select toggle behaviour.

| Prop | Type | Default | Description |
|---|---|---|---|
| `segments` | `{ id: string; label?: string; icon?: string; disabled?: boolean }[]` | `[]` | Segment definitions |
| `selected` | `string \| string[]` | `''` | Selected segment `id` (or array for multi-select) |
| `multiselect` | `boolean` | `false` | Allows multiple selections |
| `aria-label` | `string` | `''` | Accessible group label |

**Events:** `change` `(detail: string | string[])` — selected segment `id` or array of `id`s (multiselect).

```html
<md-segmented-button
  :bind="${{ segments: [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ] }}"
  :model:selected="${view}"
></md-segmented-button>
```

---

### `<md-side-sheet>`

MD3 side sheet — standard (in-layout, right-side panel) or modal (slide-in from the right with scrim).

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Shows/hides the sheet |
| `headline` | `string` | `''` | Header title text |
| `variant` | `'standard' \| 'modal'` | `'standard'` | Layout mode |
| `divider` | `boolean` | `true` | Renders a left-edge border |

**Slots:** default — sheet body content.

**Events:** `close`; `back` — header back button clicked (modal variant).

```html
<md-side-sheet variant="modal" headline="Details" :model:open="${sheetOpen}">
  <p>Side panel content</p>
</md-side-sheet>
```

---

### `<md-slider>`

MD3 range slider with a custom-styled track, optional floating value label, and optional tick marks.

| Prop | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `value` | `number` | `50` | Current value |
| `step` | `number` | `1` | Step increment |
| `disabled` | `boolean` | `false` | Disables the slider |
| `labeled` | `boolean` | `false` | Shows a floating value bubble on drag |
| `ticks` | `boolean` | `false` | Renders tick marks at each step |
| `aria-label` | `string` | `''` | Accessible label |

```html
<md-slider min="0" max="50" step="5" labeled :model="${vol}"></md-slider>
```

---

### `<md-snackbar>`

MD3 snackbar that slides up from the bottom with an optional action button.

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | Shows/hides the snackbar |
| `message` | `string` | `''` | Message text |
| `action-label` | `string` | `''` | Label for the optional action button; empty hides it |

**Events:** `action` — action button clicked; `close` — dismiss button clicked.

```html
<md-snackbar
  :model:open="${showSnack}"
  message="Item deleted"
  action-label="Undo"
  @action="${undoDelete}"
></md-snackbar>
```

---

### `<md-split-button>`

MD3 split button combining a primary action and an arrow-toggle dropdown for secondary actions.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Action'` | Primary button label |
| `icon` | `string` | `''` | Leading Material Symbol on the primary button |
| `variant` | `'filled' \| 'outlined' \| 'tonal'` | `'filled'` | Visual style |
| `disabled` | `boolean` | `false` | Disables both sections |
| `items` | `{ id: string; label: string; icon?: string; disabled?: boolean }[]` | `[]` | Dropdown action definitions |

**Events:** `click` — primary button pressed; `select` `(detail: { id: string })` — dropdown item chosen.

```html
<md-split-button
  label="Save"
  icon="save"
  :bind="${{ items: [
    { id: 'save-draft', label: 'Save as draft' },
    { id: 'save-copy', label: 'Save a copy' },
  ] }}"
  @click="${save}"
  @select="${handleSplitSelect}"
></md-split-button>
```

---

### `<md-switch>`

MD3 toggle switch with animated thumb, state-layer ripple, and optional check/close thumb icons.

| Prop | Type | Default | Description |
|---|---|---|---|
| `selected` | `boolean` | `false` | On/off state |
| `disabled` | `boolean` | `false` | Disables interaction |
| `icons` | `boolean` | `false` | Renders a check icon when on and a close icon when off |

**Events:** `change` `(detail: boolean)` — new selected state.

```html
<md-switch :model:selected="${darkMode}" icons></md-switch>
```

---

### `<md-tabs>`

MD3 tabbed navigation with an active indicator bar, icon and badge support, keyboard navigation, and a single panel slot.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Tab style (`primary` has icons above labels; `secondary` is text-only) |
| `tabs` | `{ id: string; label: string; icon?: string; badge?: string }[]` | `[]` | Tab definitions |
| `active-tab` | `string` | `''` | `id` of the active tab |

**Slots:** default — the active tab panel content.

**Events:** `tab-change` `(detail: string)` — the `id` of the newly active tab.

```html
<md-tabs
  variant="primary"
  :model:activeTab="${activeTab}"
  :bind="${{ tabs: [
    { id: 'flights', label: 'Flights', icon: 'flight' },
    { id: 'hotels', label: 'Hotels', icon: 'hotel' },
  ] }}"
>
  <!-- render panel based on activeTab -->
</md-tabs>
```

---

### `<md-text-field>`

MD3 text field (filled or outlined) with animated floating label, leading/trailing icons, error state, and supporting text.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'filled' \| 'outlined'` | `'filled'` | Visual style |
| `label` | `string` | `'Label'` | Floating label text |
| `value` | `string` | `''` | Input value |
| `type` | `string` | `'text'` | Native input type |
| `placeholder` | `string` | `''` | Placeholder text (shown when no label floats) |
| `disabled` | `boolean` | `false` | Disables the field |
| `error` | `boolean` | `false` | Applies error styling |
| `error-text` | `string` | `''` | Error helper text beneath the field |
| `supporting-text` | `string` | `''` | Helper text beneath the field (non-error) |
| `leading-icon` | `string` | `''` | Leading Material Symbol |
| `trailing-icon` | `string` | `''` | Trailing Material Symbol |
| `required` | `boolean` | `false` | Marks the field as required |
| `readonly` | `boolean` | `false` | Makes the field read-only |

```html
<md-text-field
  variant="outlined"
  label="Email"
  type="email"
  leading-icon="mail"
  :model="${email}"
  :error="${!!emailError}"
  :error-text="${emailError}"
></md-text-field>
```

---

### `<md-time-picker>`

MD3 time picker modal with an interactive clock dial or keyboard input mode, AM/PM toggle, and 12/24-hour support.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'dial' \| 'input'` | `'dial'` | Clock dial or text input mode |
| `value` | `string` | `''` | Selected time (`HH:MM` 24-hour) |
| `open` | `boolean` | `false` | Controls visibility |
| `hour24` | `boolean` | `false` | Uses 24-hour format (no AM/PM) |
| `aria-label` | `string` | `'Time picker'` | Accessible label |

**Events:** `change` `(detail: string)` — selected time in `HH:MM` 24-hour format; `close`.

```html
<md-time-picker
  :model="${meetingTime}"
  :model:open="${pickerOpen}"
></md-time-picker>
```

---

### `<md-tooltip>`

MD3 tooltip shown on hover/focus — plain (small floating label) or rich (card with title, body, and optional action).

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `''` | Tooltip body text |
| `variant` | `'plain' \| 'rich'` | `'plain'` | Plain label or rich card |
| `title` | `string` | `''` | Rich tooltip title |
| `action` | `string` | `''` | Rich tooltip action button label |

**Slots:** default — the anchor element that triggers the tooltip.

**Events:** `action` — rich tooltip action button clicked.

```html
<!-- Plain tooltip -->
<md-tooltip text="Delete permanently">
  <md-icon-button icon="delete"></md-icon-button>
</md-tooltip>

<!-- Rich tooltip -->
<md-tooltip variant="rich" title="Formatting" text="Adjust text size, weight, and alignment." action="Learn more" @action="${openDocs}">
  <md-icon-button icon="format_size"></md-icon-button>
</md-tooltip>
```

---

## Composables

Advanced consumers can re-use the internal composable utilities directly. All are exported from `cer-material`:

| Export | Description |
|---|---|
| `useControlledValue(getProp)` | Syncs an internal reactive value to a prop, returning a `ReactiveState`. |
| `useEscapeKey(guard, onEscape)` | Registers a global Escape key listener with an active-guard callback. Cleans up automatically. |
| `createFocusReturn()` | Captures the current focus target and restores it when `.return()` is called. |
| `createFocusTrap()` | Traps keyboard focus within a DOM element; call `.activate(el)` and `.deactivate()`. |
| `useListKeyNav(options)` | Adds keyboard arrow-key navigation for a list of DOM items. |
| `useScrollLock()` | Returns `{ lock(), unlock() }` to prevent `<body>` scrolling while an overlay is open. |

---

## Browser support

All evergreen browsers supporting:
- [Custom Elements v1](https://caniuse.com/custom-elementsv1)
- [Shadow DOM v1](https://caniuse.com/shadowdomv1)
- [`CSSStyleSheet.replaceSync`](https://caniuse.com/mdn-api_cssstylesheet_replacesync) (for theme tokens)

---

## License

MIT
