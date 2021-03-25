import { sleep } from '../common';
import { Circle } from '../geometry';

export class Task extends Circle {
  protected readonly waitStart = new Date().getTime();
  protected waitStop: undefined | number;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    protected durationInMs: number,
    color: string,
    protected completionCb?: undefined | null | ((task: Task) => void),
  ) {
    super(ctx, x, y, 20, color, 1, 'black');
  }

  public setCompletionCallback(completionCb: undefined | null | ((task: Task) => void)): void {
    this.completionCb = completionCb;
  }

  public getWaitTime(): number {
    return (this.waitStop) ? this.waitStop - this.waitStart : new Date().getTime() - this.waitStart;
  }

  public async run(): Promise<void> {
    this.waitStop = new Date().getTime();
    await sleep(this.durationInMs);
    if (this.completionCb) {
      this.completionCb(this);
    }
  }
}
