import { EventType } from './event-type';
import { TSubscriber } from './subscriber';

export interface IAdriverBanners {
  remove(): void;
  subscribe(eventType: EventType, subscriber: TSubscriber): void;
  unsubscribe(eventType: EventType, subscriber: TSubscriber): void;
}
