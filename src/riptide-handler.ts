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
import {
  MutableRefObject, RiptideFunction, RiptideSubscriber, RiptideSubscription,
} from './types';
import HooksMismatchError from './errors/hooks-mismatch';
import UnboundHookError from './errors/unbound-hook';

export interface Slot<K extends string, V> {
  key: K;
  value: V;
}

const HANDLER: MutableRefObject<RiptideHandler<any> | undefined> = {
  current: undefined,
};

export function getCurrentHandler<T>(): RiptideHandler<T> {
  if (!HANDLER.current) {
    throw new UnboundHookError();
  }
  return HANDLER.current as RiptideHandler<T>;
}

export default class RiptideHandler<T> implements RiptideSubscription {
  private subscriber: RiptideSubscriber<T>;

  private core: RiptideFunction<T>;

  constructor(core: RiptideFunction<T>, subscriber: RiptideSubscriber<T>) {
    this.core = core;
    this.subscriber = subscriber;
  }

  private cursor = 0;

  private slots: Slot<any, any>[] = [];

  resetCursor(): void {
    this.cursor = 0;
  }

  createSlot<K extends string, V>(key: K, value: () => V): Slot<K, V> {
    if (this.cursor < this.slots.length) {
      const current = this.slots[this.cursor];

      if (current.key !== key) {
        throw new HooksMismatchError(current.key, key);
      }

      this.cursor += 1;

      return current as Slot<K, V>;
    }

    const newSlot: Slot<K, V> = {
      key,
      value: value(),
    };

    this.slots[this.cursor] = newSlot;

    this.cursor += 1;

    return newSlot;
  }

  private alive = true;

  private updateScheduled = false;

  private running = false;

  private cleanups = new Set<() => void>();

  registerCleanup(cleanup: () => void): void {
    this.cleanups.add(cleanup);
  }

  unregisterCleanup(cleanup: () => void): void {
    this.cleanups.delete(cleanup);
  }

  private effects: (() => void)[] = [];

  resetEffects(): void {
    this.effects = [];
  }

  registerEffect(effect: () => void): void {
    if (this.running) {
      this.effects.push(effect);
    } else {
      effect();
    }
  }

  private deferEffects: (() => void)[] = [];

  resetDeferEffects(): void {
    this.deferEffects = [];
  }

  registerDeferEffect(effect: () => void): void {
    if (this.running) {
      this.deferEffects.push(effect);
    } else {
      effect();
    }
  }

  scheduleUpdate(): void {
    if (this.running) {
      this.updateScheduled = true;
    } else {
      this.run();
    }
  }

  private dispose(error: Error): void {
    try {
      if (this.subscriber.error) {
        this.subscriber.error(error);
      } else {
        throw error;
      }
    } finally {
      this.cancel();
    }
  }

  run(): void {
    if (this.alive) {
      this.updateScheduled = false;

      HANDLER.current = this;
      try {
        /**
         * Reset the handler
         */
        this.resetEffects();
        this.resetDeferEffects();
        this.resetCursor();

        /**
         * Run the core function and
         * emit the value returned
         */
        this.running = true;
        const result = this.core();

        let performCancel = false;
        /**
         * Run all deferred effects
         */
        for (let i = 0; i < this.deferEffects.length; i += 1) {
          this.deferEffects[i]();
        }

        switch (result?.type) {
          case 'complete':
            if (this.subscriber.complete) {
              this.subscriber.complete();
            }
            /**
             * No further updates shall be made.
             */
            this.updateScheduled = false;
            /**
             * Cancel after effects has been commited.
             */
            performCancel = true;
            break;
          case 'next':
            this.subscriber.next(result.value);
            break;
          default:
            break;
        }

        /**
         * Run all side effects
         */
        for (let i = 0; i < this.effects.length; i += 1) {
          this.effects[i]();
        }
        this.running = false;

        /**
         * Cancel the subscriber
         */
        if (performCancel) {
          this.cancel();
        }

        /**
         * If an update is scheduled, re-run
         */
        if (this.updateScheduled) {
          this.run();
        }
      } catch (error) {
        /**
         * Something went wrong, emit an error
         * and cancel the handler
         */
        this.dispose(error);
      }
      HANDLER.current = undefined;
    }
  }

  cancel(): void {
    if (this.alive) {
      try {
        this.cleanups.forEach((cleanup) => {
          cleanup();
        });
      } finally {
        this.alive = false;
      }
    }
  }
}
