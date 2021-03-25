// tslint:disable: no-conditional-assignment
import { TmplAstElement } from '@angular/compiler';
import { Rectangle } from '../geometry/rectangle';
import { Task } from './task';
import { TaskQueue } from './taskqueue';

const MOVE_SPEED = 2;

export class Processor extends Rectangle {
  protected localQueue = new Array<Task>();
  protected currentTask: Task | undefined;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    protected batchSize: number,
    //protected queue: Queue,
    //color?: undefined | null | string,
    //lineWidth?: undefined | null | number,
    //lineColor?: undefined | null | string,
  ) {
    super(ctx, x, y, width, height, 'grey', 1, 'black');
  }

  public async work(taskQueue: TaskQueue): Promise<void> {
    while (true) {
      if (0 < this.batchSize) {
        let task: Task | null = null;
        let i = 0;

        while ((++i <= this.batchSize) && (task = taskQueue.pop())) {
          task.setPos(this.x + (this.width / 2), this.y + this.height, { relativeSpeed: MOVE_SPEED });
          this.localQueue.push(task);
        }
      } else {
        let task: Task | null = null;

        while (task = taskQueue.pop()) {
          task.setPos(this.x + (this.width / 2), this.y + this.height, { relativeSpeed: MOVE_SPEED });
          this.localQueue.push(task);
        }
      }

      this.currentTask = this.localQueue.pop();
      if (!this.currentTask) {
        taskQueue.registerWakeup(this);
        break;
      }
      await this.currentTask.run();
      while (this.currentTask = this.localQueue.pop()) {
        await this.currentTask.run();
      }
    }
  }

  public draw(): void {
    super.draw();
    if (this.currentTask) {
      this.currentTask.draw();
    }
    for (const task of this.localQueue) {
      task.draw();
    }
  }
}
