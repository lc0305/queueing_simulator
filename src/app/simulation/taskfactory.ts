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

  public createTask(taskCancel?: undefined | null | TaskGeneratorCancel): Task {
    const weight = this.taskSize.getRandom();
    const task = new Task(this.ctx, this.x, this.y, weight, toColor(weight), taskCancel);
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
  await sleep(0); // do not yield immediately - push back to callback queue
  while (!taskCancel.isCancel()) {
    yield factory.createTask(taskCancel);
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
