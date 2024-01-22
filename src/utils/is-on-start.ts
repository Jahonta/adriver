const START_DURATION = 1500;

export function isOnStart(renderTime: Date, currentTime: Date) {
  return currentTime.getTime() - renderTime.getTime() < START_DURATION;
}
