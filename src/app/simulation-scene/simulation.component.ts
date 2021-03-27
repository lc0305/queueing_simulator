import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { insertSorted, medianMinMax, numberOr, round, saveCSV, stdevMinMax, toCSV } from '../common';
import { Shape } from '../geometry';
import { Processor, TaskFactory, TaskQueue, TaskGeneratorCancel, WeightListEntry, WeightList, RandomGeneratorTypes, UniformDistribution, NormalDistribution, RandomGenerator } from '../simulation';

class Results {
  incomingTasks?: undefined | null | number;
  throughput?: undefined | null | number;
  mean?: undefined | null | number;
  median?: undefined | null | number;
  p90?: undefined | null | number;
  p95?: undefined | null | number;
  p99?: undefined | null | number;
  p999?: undefined | null | number;
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
  private taskGenCancel?: undefined | null | TaskGeneratorCancel;
  private durations = new Array<number>();
  private overallDuration = 0;
  private overallTasks = 0;
  private simulationStart = 0;

  public model = {
    arrivalRateRandomGeneratorType: RandomGeneratorTypes.WeightList,
    arrivalRateRandomMin: 100,
    arrivalRateRandomMax: 2000,
    taskSizeRandomGeneratorType: RandomGeneratorTypes.WeightList,
    taskSizeRandomMin: 200,
    taskSizeRandomMax: 2100,
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
    try {
      this.stopSimulation();
      this.createScene();
      this.intervalHandle = setInterval(this.drawFrame, this.interval) as unknown as number;
      this.pushTasks();
      this.startProcessors();
      this.simulationStart = new Date().getTime();
    } catch (err) {
      alert(err.message);
    }
  }

  public stopSimulation(): void {
    if (this.taskGenCancel) {
      this.taskGenCancel.cancel();
      this.taskGenCancel = null;
    }
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private createScene(): void {
    if (this.model.processorCount < this.model.queueCount) {
      throw new Error('Processors must be greater than queues.');
    }
    this.cleanScene();

    let taskSizeRandGen: RandomGenerator;
    switch (this.model.taskSizeRandomGeneratorType) {
      case RandomGeneratorTypes.NormalDistribution:
        taskSizeRandGen = new NormalDistribution(this.model.taskSizeRandomMin, this.model.taskSizeRandomMax);
        break;
      case RandomGeneratorTypes.UniformDistribution:
        taskSizeRandGen = new UniformDistribution(this.model.taskSizeRandomMin, this.model.taskSizeRandomMax);
        break;
      default:
        taskSizeRandGen = new WeightList(this.parseWeightList(this.model.taskWeightList));
        break;
    }

    let arrivalRateRandGen: RandomGenerator;
    switch (this.model.arrivalRateRandomGeneratorType) {
      case RandomGeneratorTypes.NormalDistribution:
        arrivalRateRandGen = new NormalDistribution(this.model.arrivalRateRandomMin, this.model.arrivalRateRandomMax);
        break;
      case RandomGeneratorTypes.UniformDistribution:
        arrivalRateRandGen = new UniformDistribution(this.model.arrivalRateRandomMin, this.model.arrivalRateRandomMax);
        break;
      default:
        arrivalRateRandGen = new WeightList(this.parseWeightList(this.model.arrivalWeightList));
        break;
    }

    this.taskFactory = new TaskFactory(this.ctx, 20, this.simulationCanvas.nativeElement.height,
      taskSizeRandGen,
      arrivalRateRandGen,
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
    this.overallTasks = 0;
  }

  public saveCSV(): void {
    const csvStr = toCSV(
      Object.keys(this.results),
      [Object.values(this.results).map(value => numberOr(value, NaN))],
    );
    saveCSV('queueing_export_' + new Date().getTime().toString(), csvStr);
  }

  public numberOr(value: any, or: string): number | string {
    return numberOr<string>(value, or);
  }

  public stdevMinMax(min: number, max: number): number {
    return Math.round(stdevMinMax(min, max));
  }

  public medianMinMax(min: number, max: number): number {
    return Math.round(medianMinMax(min, max));
  }

  private parseWeightList(input: string): WeightListEntry[] {
    const list = JSON.parse(`[${input}]`) as Array<[number, number]>;
    return list.map(([weight, size]) => ({ weight, size }));
  }

  private async pushTasks(): Promise<void> {
    const [taskGenerator, taskGenCancel] = this.taskFactory.createGenerator();
    this.taskGenCancel = taskGenCancel;
    for await (const task of taskGenerator) {
      const qIndex = this.overallTasks++ % this.taskQueues.length;
      task.setXPos((this.simulationCanvas.nativeElement.width / this.model.queueCount) * qIndex);
      task.setCompletionCallback(completedTask => this.updateResults(completedTask.getDelayTime()));
      this.taskQueues[qIndex].push(task);
      this.results.incomingTasks = round(this.overallTasks / ((new Date().getTime() - this.simulationStart) / 1000), 3);
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
    this.results.mean = round(Math.round(this.overallDuration / len) / 1000, 3);
    this.results.throughput = round(len / ((new Date().getTime() - this.simulationStart) / 1000), 3);
    if (len < 2) {
      return;
    }
    this.results.median = round(this.durations[percIndex(len, 2)] / 1000, 3);
    if (len < 10) {
      return;
    }
    this.results.p90 = round(this.durations[percIndex(len, 10)] / 1000, 3);
    if (len < 20) {
      return;
    }
    this.results.p95 = round(this.durations[percIndex(len, 20)] / 1000, 3);
    if (len < 100) {
      return;
    }
    this.results.p99 = round(this.durations[percIndex(len, 100)] / 1000, 3);
    if (len < 1000) {
      return;
    }
    this.results.p999 = round(this.durations[percIndex(len, 1000)] / 1000, 3);
  }

  public slider(val: number | null): void {
    this.interval = Math.round(1000 / (val || 1));
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
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
