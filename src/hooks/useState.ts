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

import { getCurrentHandler } from '../riptide-handler';

type StateSupplier<T> = () => T
export type State<T> = T | StateSupplier<T>;

type SetStateSupplier<T> = (old: T) => T;
type SetStateAction<T> = T | SetStateSupplier<T>;
export type SetState<T> = (action: SetStateAction<T>) => void;

type StateSlot = 'STATE';
type SetStateSlot = 'SET_STATE';

function isStateSupplier<T>(state: State<T>): state is StateSupplier<T> {
  return typeof state === 'function';
}

function extractState<T>(state: State<T>) {
  if (isStateSupplier(state)) {
    return state();
  }
  return state;
}

function isSetStateSupplier<T>(setState: SetStateAction<T>): setState is SetStateSupplier<T> {
  return typeof setState === 'function';
}

function extractNewState<T>(oldState: T, setState: SetStateAction<T>): T {
  if (isSetStateSupplier(setState)) {
    return setState(oldState);
  }
  return setState;
}

export default function useState<T>(initialState: State<T>): [T, SetState<T>] {
  const handler = getCurrentHandler();

  const state = handler.createSlot<StateSlot, T>('STATE', () => extractState(initialState));
  const setState = handler.createSlot<SetStateSlot, SetState<T>>('SET_STATE', () => (action) => {
    handler.registerEffect(() => {
      const newState = extractNewState(state.value, action);

      if (!Object.is(newState, state.value)) {
        state.value = newState;

        handler.scheduleUpdate();
      }
    });
  });

  return [state.value, setState.value];
}
