import {
  IAdriverBanners,
  TAdriverBannersConfig,
  EventType,
  TSubscriber,
} from '../types';
import { BannerEvent } from './banner-event';
import { Banner } from './banner';

export class AdriverBanners implements IAdriverBanners {
  private mainUrl: TAdriverBannersConfig['mainUrl'];
  private banners: TAdriverBannersConfig['banners'];

  private bannerEntities: Banner[] = [];

  private subscribers: Record<EventType, Set<TSubscriber>> = {
    [EventType.Init]: new Set(),
    [EventType.SeenOnStart]: new Set(),
    [EventType.Watched]: new Set(),
    [EventType.Click]: new Set(),
    [EventType.Error]: new Set(),
  };

  constructor(config: TAdriverBannersConfig) {
    this.mainUrl = config.mainUrl;
    this.banners = config.banners;

    this.init();
  }

  private init() {
    this.banners.forEach((banner) => {
      const bannerEntity = new Banner(banner, this.dispatchEvent.bind(this));
      this.bannerEntities.push(bannerEntity);
    });
  }

  remove() {
    this.bannerEntities.forEach((banner) => {
      banner.remove();
    });
  }

  subscribe(eventType: EventType, subscriber: TSubscriber) {
    this.subscribers[eventType].add(subscriber);
  }

  unsubscribe(eventType: EventType, subscriber: TSubscriber) {
    this.subscribers[eventType].delete(subscriber);
  }

  private dispatchEvent(bannerEntity: Banner, eventType: EventType) {
    let bannerEvent = new BannerEvent(this.mainUrl, eventType, bannerEntity);

    bannerEvent.emit().then((actualEventType: EventType) => {
      this.subscribers[actualEventType].forEach((subscriber) => {
        subscriber(bannerEntity.id);
      });
    });
  }
}
