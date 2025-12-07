/**
 * 时间管理器
 *
 * 负责：
 * 1. requestAnimationFrame 循环控制
 * 2. 自动停止（无行动时停止循环）
 *
 * 注：rAF 在页面不可见时会自动暂停，无需手动处理
 */
export class TimeManager {
  private animationFrameId: number | null = null
  private isRunning = false

  constructor(
    private updateCallback: (now: number) => void,
    private shouldStopCallback: () => boolean,
  ) {}

  /**
   * 启动循环
   */
  start(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.scheduleNextFrame()
  }

  /**
   * 停止循环
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 检查是否正在运行
   */
  getIsRunning(): boolean {
    return this.isRunning
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stop()
  }

  /**
   * 调度下一帧
   */
  private scheduleNextFrame(): void {
    if (!this.isRunning) {
      return
    }

    this.animationFrameId = requestAnimationFrame(this.tick)
  }

  /**
   * 帧回调
   */
  private tick = (now: number): void => {
    if (!this.isRunning) {
      return
    }

    // 执行更新回调
    this.updateCallback(now)

    // 检查是否应该停止
    if (this.shouldStopCallback()) {
      this.stop()
      return
    }

    // 调度下一帧
    this.scheduleNextFrame()
  }
}
