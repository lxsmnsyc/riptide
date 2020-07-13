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
import { RiptidePublisher, RiptideSubscriber, RiptideSubscription } from './types';

export class RiptideProcessor<T> implements RiptidePublisher<T>, RiptideSubscriber<T> {
  private subscribers = new Set<RiptideSubscriber<T>>();

  private alive = true;

  next(value: T): void {
    if (this.alive) {
      this.subscribers.forEach((subscriber) => {
        subscriber.next(value);
      });
    }
  }

  error(value: Error): void {
    if (this.alive) {
      this.alive = false;
      this.subscribers.forEach((subscriber) => {
        if (subscriber.error) {
          subscriber.error(value);
        }
      });
    } else {
      throw value;
    }
  }

  complete(): void {
    if (this.alive) {
      this.alive = false;
      this.subscribers.forEach((subscriber) => {
        if (subscriber.complete) {
          subscriber.complete();
        }
      });
    }
  }

  subscribe(subscriber: RiptideSubscriber<T>): RiptideSubscription {
    const { subscribers } = this;
    subscribers.add(subscriber);

    return {
      cancel() {
        subscribers.delete(subscriber);
      },
    };
  }
}

export default function createRiptideProcessor<T>(): RiptideProcessor<T> {
  return new RiptideProcessor<T>();
}
