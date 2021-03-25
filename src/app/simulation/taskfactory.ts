import { sleep, toColor } from '../common';
import { Task } from './task';

export interface WeightListEntry {
  size: number;
  weight: number;
}

export class WeightList {
  private readonly weightList = new Array<number>();
  constructor(weightList: WeightListEntry[]) {
    let overallPercentage = 0;
    for (const entry of weightList) {
      const weight = Math.round(100 * entry.weight);
      overallPercentage += weight;
      if (100 < overallPercentage) {
        throw new Error('Too much weight!');
      }
      for (let i = 0; i < weight; ++i) {
        this.weightList.push(entry.size);
      }
    }
    if (overallPercentage < 100) {
      throw new Error('Too little weight!');
    }
  }

  public get(index: number): number {
    return this.weightList[index];
  }

  public getRandom(): number {
    return this.weightList[Math.floor(Math.random() * 100)];
  }
}

export class TaskFactory {
  protected taskSizeWeightList: WeightList;
  protected arrivalRateWeightList: WeightList;

  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    protected x: number,
    protected y: number,
    arrivalRateWeightList: WeightListEntry[],
    taskSizeWeightList: WeightListEntry[],
  ) {
    this.taskSizeWeightList = new WeightList(taskSizeWeightList);
    this.arrivalRateWeightList = new WeightList(arrivalRateWeightList);
  }

  public createTask(): Task {
    const weight = this.taskSizeWeightList.getRandom();
    const task = new Task(this.ctx, this.x, this.y, weight, toColor(weight));
    return task;
  }

  public async wait(): Promise<void> {
    await sleep(this.arrivalRateWeightList.getRandom());
  }

  public createGenerator(): [AsyncGenerator<Task, void, unknown>, TaskGeneratorCancel]{
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
