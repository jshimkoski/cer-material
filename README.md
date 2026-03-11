# @jasonshimmy/cer-material

Material Design 3 web components built on [`@jasonshimmy/custom-elements-runtime`](https://github.com/jshimkoski/custom-elements).

All components are standard custom elements — framework-agnostic and usable in plain HTML, React, Vue, Angular, Svelte, or any other environment.

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

### Selective imports

Import only the components you need for finer-grained bundle control:

```ts
import '@jasonshimmy/cer-material/theme';
import '@jasonshimmy/custom-elements-runtime/css/reset.css';

import '@jasonshimmy/cer-material/dist/components/md-button.js';
import '@jasonshimmy/cer-material/dist/components/md-text-field.js';
```

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

**Events:** `nav` — leading icon clicked; `action` `(detail: { icon: string })` — a trailing icon was clicked.

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
| `value` | `string` | `''` | Badge text; empty renders a small dot |
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
  :open="${isOpen}"
  headline="Options"
  variant="modal"
  @close="${() => isOpen = false}"
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

**Events:** `select` `(detail: { id: string })` — a card was clicked.

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

**Events:** `change` `(detail: { checked: boolean })` — state changed.

```html
<md-checkbox
  label="Accept terms"
  :checked="${accepted}"
  @change="${e => accepted = e.detail.checked}"
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
<md-chip variant="filter" label="Unread" :selected="${filterUnread}" @click="${toggleFilter}"></md-chip>
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

**Events:** `change` `(detail: { iso: string })` — date selected; `close`.

```html
<md-date-picker
  label="Start date"
  :value="${startDate}"
  min="2024-01-01"
  :open="${pickerOpen}"
  @change="${e => startDate = e.detail.iso}"
  @close="${() => pickerOpen = false}"
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
<md-dialog :open="${dialogOpen}" headline="Delete item?" @close="${() => dialogOpen = false}">
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

**Events:** `click`; `change` `(detail: { selected: boolean })` — toggle state changed.

```html
<md-icon-button icon="favorite_border" selected-icon="favorite" toggle @change="${handleFav}"></md-icon-button>
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

**Events:** `select` `(detail: { id: string })` — item chosen; `close`.

```html
<md-menu
  :bind="${{ items: [
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'dup', label: 'Duplicate', icon: 'content_copy' },
    { id: 'del', label: 'Delete', icon: 'delete', divider: true },
  ] }}"
  @select="${handleMenuSelect}"
>
  <md-icon-button slot="trigger" icon="more_vert"></md-icon-button>
</md-menu>
```

---

### `<md-navigation-bar>`

MD3 bottom navigation bar for mobile with active pill indicator, filled icon for the active item, and badge support.

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ id: string; label: string; icon: string; badge?: string }[]` | `[]` | Destination definitions |
| `active` | `string` | `''` | `id` of the active destination |

**Events:** `change` `(detail: { id: string })` — destination selected.

```html
<md-navigation-bar
  :active="${activeTab}"
  :bind="${{ items: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'profile', label: 'Profile', icon: 'person', badge: '2' },
  ] }}"
  @change="${e => activeTab = e.detail.id}"
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

**Events:** `close`; `change` `(detail: { id: string })` — item selected.

```html
<md-navigation-drawer
  variant="modal"
  headline="Mail"
  :open="${drawerOpen}"
  :active="${currentRoute}"
  :bind="${{ items: navItems }}"
  @change="${e => navigate(e.detail.id)}"
  @close="${() => drawerOpen = false}"
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

**Events:** `change` `(detail: { id: string })`; `fab-click`; `menu-click`.

```html
<md-navigation-rail
  :active="${activeRoute}"
  menu-icon
  :bind="${{ items: [
    { id: 'inbox', label: 'Inbox', icon: 'inbox' },
    { id: 'sent', label: 'Sent', icon: 'send' },
  ] }}"
  @change="${e => navigate(e.detail.id)}"
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

**Events:** `change` `(detail: { value: string })` — selected.

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

**Events:** `input` `(detail: { value: string })`; `clear`; `search` `(detail: { query: string })` — Enter key pressed.

```html
<md-search
  placeholder="Search contacts"
  :value="${query}"
  @input="${e => query = e.detail.value}"
  @search="${e => runSearch(e.detail.query)}"
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

**Events:** `change` `(detail: { id: string \| string[] })` — selection changed.

```html
<md-segmented-button
  :bind="${{ segments: [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ] }}"
  selected="week"
  @change="${e => view = e.detail.id}"
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
<md-side-sheet variant="modal" headline="Details" :open="${sheetOpen}" @close="${() => sheetOpen = false}">
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

**Events:** `change` `(detail: { value: number })` — value changed.

```html
<md-slider min="0" max="50" step="5" labeled :value="${vol}" @change="${e => vol = e.detail.value}"></md-slider>
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
  :open="${showSnack}"
  message="Item deleted"
  action-label="Undo"
  @action="${undoDelete}"
  @close="${() => showSnack = false}"
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

**Events:** `change` `(detail: { checked: boolean })` — toggled.

```html
<md-switch :selected="${darkMode}" icons @change="${e => darkMode = e.detail.checked}"></md-switch>
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

**Events:** `tab-change` `(detail: { id: string })` — active tab changed.

```html
<md-tabs
  variant="primary"
  :active-tab="${activeTab}"
  :bind="${{ tabs: [
    { id: 'flights', label: 'Flights', icon: 'flight' },
    { id: 'hotels', label: 'Hotels', icon: 'hotel' },
  ] }}"
  @tab-change="${e => activeTab = e.detail.id}"
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

**Events:** `change` `(detail: { value: string })` — value changed.

```html
<md-text-field
  variant="outlined"
  label="Email"
  type="email"
  leading-icon="mail"
  :value="${email}"
  :error="${!!emailError}"
  :error-text="${emailError}"
  @change="${e => email = e.detail.value}"
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

**Events:** `change` `(detail: { time: string })` — time selected; `close`.

```html
<md-time-picker
  :value="${meetingTime}"
  :open="${pickerOpen}"
  @change="${e => meetingTime = e.detail.time}"
  @close="${() => pickerOpen = false}"
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
