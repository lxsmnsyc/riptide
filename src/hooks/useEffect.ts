/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2020
 */

import { getCurrentHandler } from '../core/handler';
import listNotEqual from '../utils/list-not-equal';

export type EffectCleanup = (() => void) | undefined;
export type Effect = () => (void | EffectCleanup);

type EffectInitialSlot = 'EFFECT_INITIAL';
type EffectDependencySlot = 'EFFECT_DEPENDENCY';
type EffectCleanupSlot = 'EFFECT_CLEANUP';

export default function useEffect<D extends any[]>(effect: Effect, dependencies: D): void {
  const handler = getCurrentHandler();

  const initial = handler.createSlot<EffectInitialSlot, boolean>(
    'EFFECT_INITIAL',
    () => true,
  );

  const deps = handler.createSlot<EffectDependencySlot, D>(
    'EFFECT_DEPENDENCY',
    () => dependencies,
  );

  const cleanup = handler.createSlot<EffectCleanupSlot, EffectCleanup>(
    'EFFECT_CLEANUP',
    () => undefined,
  );

  handler.registerEffect(() => {
    if (initial.value || listNotEqual(deps.value, dependencies)) {
      initial.value = false;

      deps.value = dependencies;

      if (cleanup.value) {
        handler.unregisterCleanup(cleanup.value);
        cleanup.value();
        cleanup.value = undefined;
      }

      const result = effect();

      if (result) {
        cleanup.value = result;
        handler.registerCleanup(result);
      }
    }
  });
}
