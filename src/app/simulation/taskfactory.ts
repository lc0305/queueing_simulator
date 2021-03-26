import { sleep, toColor } from '../common';
import { RandomGenerator } from './randomdistributions';
import { Task } from './task';

export class TaskFactory {
  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    protected x: number,
    protected y: number,
    protected taskSize: RandomGenerator,
    protected arrivalRate: RandomGenerator,
  ) { }

  public createTask(): Task {
    const weight = this.taskSize.getRandom();
    const task = new Task(this.ctx, this.x, this.y, weight, toColor(weight));
    return task;
  }

  public async wait(): Promise<void> {
    await sleep(this.arrivalRate.getRandom());
  }

  public createGenerator(): [AsyncGenerator<Task, void, unknown>, TaskGeneratorCancel] {
    const taskCancel = new TaskGeneratorCancel();
    return [TaskGenerator(this, taskCancel), taskCancel];
  }
}

export async function* TaskGenerator(factory: TaskFactory, taskCancel: TaskGeneratorCancel): AsyncGenerator<Task, void, unknown> {
  while (!taskCancel.isCancel()) {
    yield factory.createTask();
    await factory.wait();
  }
}

export class TaskGeneratorCancel {
  private cancelGen = false;

  public cancel(): void {
    this.cancelGen = true;
  }

  public isCancel(): boolean {
    return this.cancelGen;
  }
}
