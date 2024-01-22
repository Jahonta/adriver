export const RESOURCE_TYPES = ['img', 'iframe'] as const;
export const UNKNOWN_TYPE = 'unknown';

export type TResourceType = (typeof RESOURCE_TYPES)[number];
