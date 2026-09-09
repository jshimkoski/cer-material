// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { useScrollLock } from '../src/composables/useScrollLock';

describe('useScrollLock()', () => {
  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('does not let one owner release another owner lock', () => {
    const first = useScrollLock();
    const second = useScrollLock();

    first.lock();
    second.lock();
    first.unlock();
    first.unlock();

    expect(document.body.style.overflow).toBe('hidden');
    second.unlock();
    expect(document.body.style.overflow).toBe('');
  });

  it('is idempotent when the same owner locks repeatedly', () => {
    const owner = useScrollLock();
    owner.lock();
    owner.lock();
    owner.unlock();

    expect(document.body.style.overflow).toBe('');
  });
});
