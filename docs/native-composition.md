# Native forms and headless composition

Import `@jasonshimmy/cer-material/native-controls.css` into the scope containing native controls. For a CER shadow component, use Vite's `?inline` and pass the string to `useStyle()`. A native `<button class="md-button" type="submit">` inside the owning form preserves native validation, Enter submission, submitter data and no-JavaScript behavior. Tonal and outlined variants use `data-variant`. Do not put the native submit button inside another custom element's shadow root.

`md-text-field`, `md-slider`, `md-checkbox` and `md-switch` are form-associated. Set `name` on their hosts to participate in `FormData`. They support standalone state and parent bindings (`:model` for text fields/sliders, `:model:checked` for checkboxes and `:model:selected` for switches), value restoration, reset, required validity where applicable and disabled fieldsets. Checkbox/switch values default to `on`; unchecked controls omit their entry. The host exposes `focus()`, `checkValidity()` and `reportValidity()`. External native labels activate the underlying control. Form association requires custom-element registration; use native inputs for no-JavaScript forms.

Other Material controls do not automatically participate in native forms. In particular, native radio mutual exclusion does not cross separate shadow roots: bind `md-radio` instances to shared state, or use native radios in one form scope.

For search results, colocate a native `input[role=combobox]` and `role=listbox` in the same DOM/shadow scope. Use stable IDs for `aria-controls` and `aria-activedescendant`, keep focus on the input, name the field, and synchronize `aria-expanded`. `useCombobox({ items, onSelect, onActive, onEscape })` manages keyboard selection; the caller renders results and fetches data. Call `reset()` when the result set changes to clear a stale active index. CER App's `useContentSearch()` remains the content search provider.

`md-search` also accepts `controlsElement` and `activeDescendantElement` for browsers supporting reflected ARIA element references. Those references must point into the input's permitted ancestor scope. Legacy `listboxId`/`activeDescendant` strings are retained; strings alone cannot cross shadow boundaries. Prefer the native colocated recipe for broad compatibility.

Call headless composables unconditionally at stable positions in a CER render. The caller owns ARIA relationships, visible status and announcements, loading/error behavior and focus.

`useCarousel(() => count)` supplies retained selected-index state, wraparound movement, arrow/Home/End keys and single-finger horizontal swipes. Render responsive pictures, captions, chapter links, live status and buttons in the caller. `md-carousel` remains the optional horizontal scrolling component for its existing use cases.

`cerMaterial()` contributes semantic JIT colors automatically. Explicit CER App `jitCss.customColors` values override the matching integration shades.

After `npm run validate`, run `npm run dev` and open `/test/native-forms.browser.html` on that Vite server. The browser fixture exercises the built text field, checkbox, switch and slider against native validity, submission, FormData, reset, disabled fieldsets, labels and restoration. Its status reports failures directly; a DOM emulator cannot verify this native browser contract.
