import { TAdriverBannersConfig, CustomType, EventType } from '../types';
import { fetchWithRetry, getRandom } from '../utils';
import { Banner } from './banner';

const MAX_RETRIES = 1;

const eventToCustomMap: Record<EventType, CustomType[]> = {
  [EventType.Init]: [
    CustomType.ScreenWidth,
    CustomType.ScreenHeight,
    CustomType.UserAgent,
    CustomType.CurrentUrl,
    CustomType.BannerId,
  ],
  [EventType.SeenOnStart]: [
    CustomType.BannerWidth,
    CustomType.BannerHeight,
    CustomType.BannerType,
    CustomType.BannerId,
  ],
  [EventType.Watched]: [
    CustomType.BannerWidth,
    CustomType.BannerHeight,
    CustomType.BannerType,
    CustomType.BannerId,
  ],
  [EventType.Click]: [
    CustomType.BannerWidth,
    CustomType.BannerHeight,
    CustomType.BannerType,
    CustomType.BannerId,
  ],
  [EventType.Error]: [
    CustomType.ScreenWidth,
    CustomType.ScreenHeight,
    CustomType.UserAgent,
    CustomType.CurrentUrl,
    CustomType.BannerWidth,
    CustomType.BannerHeight,
    CustomType.BannerType,
    CustomType.BannerId,
  ],
};

export class BannerEvent {
  private mainUrl: TAdriverBannersConfig['mainUrl'];
  private eventType: EventType;
  private screenWidth: number;
  private screenHeight: number;
  private userAgent: string;
  private currentUrl: string;
  private bannerEntity: Banner;

  constructor(
    mainUrl: TAdriverBannersConfig['mainUrl'],
    eventType: EventType,
    bannerEntity: Banner
  ) {
    this.mainUrl = mainUrl;
    this.eventType = eventType;
    this.bannerEntity = bannerEntity;
    this.screenWidth = window.screen.width;
    this.screenHeight = window.screen.height;
    this.userAgent = window.navigator.userAgent;
    this.currentUrl = window.location.href;
  }

  public emit(): Promise<EventType> {
    const url = new URL(this.mainUrl);
    try {
      return fetchWithRetry(this.setSearchParams(url), MAX_RETRIES).then(
        () => this.eventType
      );
    } catch {
      this.eventType = EventType.Error;
      return fetch(this.setSearchParams(url)).then(() => this.eventType);
    }
  }

  private setSearchParams(url: URL) {
    const customParams = eventToCustomMap[this.eventType]
      .map((custom) => {
        switch (custom) {
          case CustomType.ScreenWidth:
            return `${custom}=${this.screenWidth}`;
          case CustomType.ScreenHeight:
            return `${custom}=${this.screenHeight}`;
          case CustomType.UserAgent:
            return `${custom}=${this.userAgent}`;
          case CustomType.CurrentUrl:
            return `${custom}=${this.currentUrl}`;
          case CustomType.BannerId:
            return `${custom}=${this.bannerEntity.id}`;
          case CustomType.BannerWidth:
            return `${custom}=${this.bannerEntity.width}`;
          case CustomType.BannerHeight:
            return `${custom}=${this.bannerEntity.height}`;
          case CustomType.BannerType:
            return `${custom}=${this.bannerEntity.type}`;
          default:
            return '';
        }
      })
      .join(';');

    url.searchParams.set('type', this.eventType.toString());
    url.searchParams.set('custom', customParams);

    if (url.searchParams.has('rnd')) {
      url.searchParams.set('rnd', getRandom().toString());
    }

    return url;
  }
}
