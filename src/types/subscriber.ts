import { TBannerConfig } from './banner-config';

export type TSubscriber = (id: TBannerConfig['id']) => void;
