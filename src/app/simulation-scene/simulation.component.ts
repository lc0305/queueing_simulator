import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { insertSorted } from '../common';
import { Shape } from '../geometry';
import { Processor, TaskFactory } from '../simulation';
import { TaskGeneratorCancel, WeightListEntry } from '../simulation/taskfactory';
import { TaskQueue } from '../simulation/taskqueue';

class Results {
  mean = 0;
  median = 0;
  p90 = 0;
  p95 = 0;
  p99 = 0;
  p999 = 0;
  throughput = 0;
}

const percIndex = (len: number, magnitude: number): number => Math.round((len / magnitude) * (magnitude - 1));

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss']
})
export class SimulationComponent implements OnInit {

  @ViewChild('simulation', { static: true }) simulationCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private shapes = new Array<Shape>();
  private taskFactory!: TaskFactory;
  private intervalHandle: number | null = null;
  private interval = Math.round(1000 / 240);
  private taskQueues = new Array<TaskQueue>();
  private processors = new Array<Processor>();
  private taskGenCancel?: undefined | TaskGeneratorCancel;
  protected durations = new Array<number>();
  protected overallDuration = 0;
  protected simulationStart = 0;

  public arrivalWeightList = new FormControl('');
  public model = {
    arrivalWeightList: '[0.4, 750], [0.2, 1000], [0.3, 500], [0.1, 2000]',
    taskWeightList: '[0.4, 3000], [0.2, 5000], [0.3, 4000], [0.05, 10000], [0.05, 20000]',
    batchSize: '1',
    processorCount: 1,
    queueSize: 10,
    queueCount: 1,
  };
  public results = new Results();

  constructor(private readonly ngZone: NgZone) { }

  public ngOnInit(): void {
    console.log(percIndex(2, 2));
    if (!this.simulationCanvas) {
      throw new Error('Canvas is not initialized.');
    }
    this.ctx = this.simulationCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    if (!this.ctx) {
      throw new Error('Context is not initialized.');
    }
    this.ngZone.runOutsideAngular(() => this.drawFrame());
  }

  private startSimulation(): void {
    if (this.taskGenCancel) {
      this.taskGenCancel.cancel();
    }
    this.createScene();
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
    }
    this.intervalHandle = setInterval(this.drawFrame, this.interval) as unknown as number;
    this.pushTasks();
    this.startProcessors();
    this.simulationStart = new Date().getTime();
  }

  private createScene(): void {
    if (this.model.processorCount < this.model.queueCount) {
      throw new Error('Processors must be greater than queues.');
    }
    this.cleanScene();
    this.taskFactory = new TaskFactory(this.ctx, 20, this.simulationCanvas.nativeElement.height,
      this.parseWeightList(this.model.arrivalWeightList),
      this.parseWeightList(this.model.taskWeightList),
    );
    const stepP = this.simulationCanvas.nativeElement.width / this.model.processorCount;
    for (let i = 0; i < this.model.processorCount; ++i) {
      const proc = new Processor(
        this.ctx,
        stepP * i + (stepP / 2 - 25),
        50,
        50,
        50,
        Number(this.model.batchSize),
      );
      this.processors.push(proc);
      this.shapes.push(proc);
    }
    const stepQ = this.simulationCanvas.nativeElement.width / this.model.queueCount;
    for (let i = 0; i < this.model.queueCount; ++i) {
      const tq = new TaskQueue(
        this.ctx,
        stepQ * i + (stepQ / 2 - (this.model.queueSize * 40) / 2),
        350,
        this.model.queueSize,
      );
      this.taskQueues.push(tq);
      this.shapes.push(tq);
    }
  }

  private cleanScene(): void {
    this.shapes = new Array<Shape>();
    this.processors = new Array<Processor>();
    this.taskQueues = new Array<TaskQueue>();
    this.durations = new Array<number>();
    this.results = new Results();
    this.overallDuration = 0;
  }

  private parseWeightList(input: string): WeightListEntry[] {
    const list = JSON.parse(`[${input}]`) as Array<[number, number]>;
    return list.map(([weight, size]) => ({weight, size}));
  }

  private async pushTasks(): Promise<void> {
    const [taskGenerator, taskGenCancel] = this.taskFactory.createGenerator();
    this.taskGenCancel = taskGenCancel;
    let i = 0;
    for await (const task of taskGenerator) {
      const qIndex = i++ % this.taskQueues.length;
      task.setXPos((this.simulationCanvas.nativeElement.width / this.model.queueCount) * qIndex);
      task.setCompletionCallback(completedTask => this.updateResults(completedTask.getWaitTime()));
      this.taskQueues[qIndex].push(task);
    }
  }

  private startProcessors(): void {
    const procPerQueue = Math.round(this.processors.length / this.taskQueues.length);
    let i = 0;
    for (const queue of this.taskQueues) {
      const maxIter = i + procPerQueue;
      for (; (i < maxIter) && (i < this.processors.length); ++i) {
        this.processors[i].work(queue);
      }
    }
  }

  private updateResults(time: number): void {
    insertSorted(this.durations, time);
    this.overallDuration += time;
    const len = this.durations.length;
    this.results.mean = Math.round(this.overallDuration / len);
    this.results.throughput = Math.round((len / ((new Date().getTime() - this.simulationStart) / 1000)) * 100) / 100;
    if (len < 2) {
      return;
    }
    this.results.median = this.durations[percIndex(len, 2)];
    if (len < 10) {
      return;
    }
    this.results.p90 = this.durations[percIndex(len, 10)];
    if (len < 20) {
      return;
    }
    this.results.p95 = this.durations[percIndex(len, 20)];
    if (len < 100) {
      return;
    }
    this.results.p99 = this.durations[percIndex(len, 100)];
    if (len < 1000) {
      return;
    }
    this.results.p999 = this.durations[percIndex(len, 1000)];
  }

  public slider(val: number | null): void {
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.interval = Math.round(1000 / (val || 1));
      this.intervalHandle = setInterval(this.drawFrame, this.interval) as unknown as number;
    }
  }

  private drawFrame = (): void => {
    this.ctx.clearRect(0, 0, this.simulationCanvas.nativeElement.width, this.simulationCanvas.nativeElement.height);
    for (const shape of this.shapes) {
      shape.draw();
    }
  }

  public settingsChanged(): void {
    this.startSimulation();
  }

}
