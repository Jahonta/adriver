import {
  TBanner,
  TBannerConfig,
  EventType,
  TResourceType,
  UNKNOWN_TYPE,
} from '../types';
import { isOnStart, validateBannerConfig } from '../utils';

const VISIBILITY_TIME = 3000;
const VISIBILITY_TRESHOLD = 0.65;

export class Banner {
  public width: number = 0;
  public height: number = 0;
  public id: string = '';
  public type: TResourceType | typeof UNKNOWN_TYPE = UNKNOWN_TYPE;
  private slot: string | Element = '';
  private source: string = '';
  private resource: string = '';
  private dispatchEvent: (banner: Banner, eventType: EventType) => void =
    () => {};
  private observer: IntersectionObserver | null = null;
  private renderTime: Date | null = null;
  private visibilityTimer: ReturnType<typeof setTimeout> = 0;

  constructor(
    banner: TBanner,
    dispatchEvent: (banner: Banner, eventType: EventType) => void
  ) {
    this.slot = banner.slot;
    this.source = banner.source;
    this.width = banner.width;
    this.height = banner.height;
    this.dispatchEvent = dispatchEvent;

    this.init();
  }

  remove() {
    try {
      this.getParentElement().innerHTML = '';
      this.renderTime = null;
    } catch {
      throw new Error('Cannot remove banner!');
    }
  }

  private init() {
    try {
      this.requestBannerConfig(this.source).then((config: TBannerConfig) => {
        this.id = config.id;
        this.type = config.type;
        this.resource = config.resource;

        this.observer = new IntersectionObserver(this.handleIntersect, {
          threshold: VISIBILITY_TRESHOLD,
        });

        this.render();
        this.dispatchEvent(this, EventType.Init);
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Cannot init banner'
      );
    }
  }

  private getParentElement() {
    let parentElement: Element | null = null;
    if (typeof this.slot === 'string') {
      const elementFound = document.querySelector('#' + this.slot);
      parentElement = elementFound;
    } else {
      parentElement = this.slot;
    }

    if (!parentElement) {
      throw new Error('Slot is not found');
    }

    return parentElement;
  }

  private render() {
    if (this.type !== UNKNOWN_TYPE) {
      const element = document.createElement(this.type);
      element.src = this.resource;
      element.width = this.width;
      element.height = this.height;

      element.addEventListener('load', () => {
        this.renderTime = new Date();
      });

      element.addEventListener('click', () => {
        this.dispatchEvent(this, EventType.Click);
      });
      this.observer?.observe(element);

      this.getParentElement().append(element);
    } else {
      throw new Error('Cannot render unknown banner type');
    }
  }

  private requestBannerConfig(
    source: TBanner['source']
  ): Promise<TBannerConfig> {
    return fetch(source)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        throw new Error(`Request failed with status ${response.status}`);
      })
      .then(validateBannerConfig);
  }

  private handleIntersect(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.visibilityTimer = setTimeout(() => {
          this.dispatchEvent(this, EventType.Watched);
        }, VISIBILITY_TIME);
      } else {
        clearTimeout(this.visibilityTimer);
      }

      if (
        entry.isIntersecting &&
        this.renderTime &&
        isOnStart(this.renderTime, new Date())
      ) {
        this.dispatchEvent(this, EventType.SeenOnStart);
      }
    });
  }
}
