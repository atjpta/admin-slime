export enum CronJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum CronTriggerSource {
  SCHEDULER = 'scheduler',
  MANUAL = 'manual',
  RETRY = 'retry',
}
