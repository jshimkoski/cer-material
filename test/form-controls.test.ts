// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import '../src/components/md-text-field';
import '../src/components/md-checkbox';
const tick = () => new Promise((done) => setTimeout(done, 0));
let setValue: ReturnType<typeof vi.fn>;
beforeEach(() => {
  setValue = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'attachInternals', { configurable: true, value: vi.fn(() => ({ setFormValue: setValue, setValidity: vi.fn(), checkValidity: () => true, reportValidity: () => true } as unknown as ElementInternals)) });
});
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); delete (HTMLElement.prototype as any).attachInternals; });
it('retains typed standalone values, submits them and resets to the initial value', async () => {
  const host = document.createElement('md-text-field'); host.setAttribute('name', 'email'); document.body.append(host); await tick();
  const input = host.shadowRoot!.querySelector('input')!;
  input.value = 'person@example.com'; input.dispatchEvent(new Event('input', { bubbles: true, composed: true })); await tick();
  expect(input.value).toBe('person@example.com'); expect(setValue).toHaveBeenLastCalledWith('person@example.com', 'person@example.com');
  (host as any).formResetCallback(); await tick(); expect(input.value).toBe(''); expect(setValue).toHaveBeenLastCalledWith('', '');
});
it('external label activation toggles a standalone checkbox and disabled hosts omit values', async () => {
  const host = document.createElement('md-checkbox'); document.body.append(host); await tick();
  host.click(); await tick(); expect(host.shadowRoot!.querySelector('input')!.checked).toBe(true); expect(setValue).toHaveBeenLastCalledWith('on', 'true');
  (host as any).formDisabledCallback(true); await tick(); expect(host.shadowRoot!.querySelector('input')!.disabled).toBe(true); expect(setValue).toHaveBeenLastCalledWith(null, 'true');
});
