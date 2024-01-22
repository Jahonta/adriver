import { RESOURCE_TYPES, TBannerConfig } from '../types';

export function validateBannerConfig(config: unknown): TBannerConfig {
  if (config && typeof config === 'object') {
    const bannerConfig = config as TBannerConfig;
    if (
      typeof bannerConfig.id === 'string' &&
      RESOURCE_TYPES.includes(bannerConfig.type) &&
      typeof bannerConfig.resource === 'string'
    ) {
      return bannerConfig;
    }
  }
  throw new Error('Invalid banner config');
}
