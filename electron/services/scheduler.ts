import cron from 'node-cron'

export class Scheduler {
  private task: cron.ScheduledTask | null = null
  private hour: number
  private minute: number
  private callback: () => void

  constructor(hour: number, minute: number, callback: () => void) {
    this.hour = hour
    this.minute = minute
    this.callback = callback
  }

  start() {
    this.stop()
    const expression = `${this.minute} ${this.hour} * * *`
    this.task = cron.schedule(expression, () => {
      console.log(`[Scheduler] Fetching news at ${this.hour}:${String(this.minute).padStart(2, '0')}`)
      this.callback()
    })
    console.log(`[Scheduler] Scheduled for ${this.hour}:${String(this.minute).padStart(2, '0')} daily`)
  }

  stop() {
    if (this.task) {
      this.task.stop()
      this.task = null
    }
  }
}
