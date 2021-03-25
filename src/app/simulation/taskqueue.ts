// tslint:disable: no-conditional-assignment
import { Queue } from '../geometry';
import { Processor } from './processor';
import { Task } from './task';

export class TaskQueue extends Queue<Task> {
  protected readonly wakeupProcessors = new Array<Processor>();

  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    protected x: number,
    protected y: number,
    protected size: number,
  ) {
    super(ctx, x, y, size, 'red');
  }

  public push(task: Task): void {
    super.push(task);
    const processor = this.wakeupProcessors.pop();
    if (processor) {
      processor.work(this);
    }
  }

  public registerWakeup(processor: Processor): void {
    this.wakeupProcessors.push(processor);
  }
}

