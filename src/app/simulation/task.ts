import { sleep } from '../common';
import { Circle } from '../geometry';
import { TaskGeneratorCancel } from './taskfactory';

export class Task extends Circle {
  protected readonly delayStart: number;
  protected delayStop: undefined | number;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    protected durationInMs: number,
    color: string,
    protected taskCancel?: undefined | null | TaskGeneratorCancel,
    protected completionCb?: undefined | null | ((task: Task) => void),
  ) {
    super(ctx, x, y, 20, color, 1, 'black');
    this.delayStart = new Date().getTime();
  }

  public setCompletionCallback(completionCb: undefined | null | ((task: Task) => void)): void {
    this.completionCb = completionCb;
  }

  public getDelayTime(): number {
    return (typeof this.delayStop === 'number') ? this.delayStop - this.delayStart : new Date().getTime() - this.delayStart;
  }

  public async run(): Promise<void> {
    this.delayStop = new Date().getTime();
    await sleep(this.durationInMs);
    if (this.completionCb && (!this.taskCancel || !this.taskCancel.isCancel())) {
      this.completionCb(this);
    }
  }
}
