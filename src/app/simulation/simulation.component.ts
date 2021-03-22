import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Shape, Circle, Rectangle, CustomShape, Queue } from '../geometry';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss']
})
export class SimulationComponent implements OnInit {

  @ViewChild('simulation', { static: true }) simulationCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private readonly shapes = new Array<Shape>();
  private intervalHandle: number | null = null;
  private interval = 1000 / 60;
  private collision = 0;
  private queue!: Queue;

  constructor(private readonly ngZone: NgZone) { }

  public ngOnInit(): void {
    if (!this.simulationCanvas) throw new Error('Canvas is not initialized.');
    this.ctx = this.simulationCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    if (!this.ctx) throw new Error('Context is not initialized.');
    this.ngZone.runOutsideAngular(() => this.drawFrame());
    this.shapes.push(new Circle(this.ctx, 400, 500, 40, 'red'));
    this.shapes.push(new Rectangle(this.ctx, 20, 400, 40, 50, 'blue'));
    this.shapes.push(new CustomShape(this.ctx, [
      [200, 50],
      [150, 200],
      [250, 200],
      [300, 50],
    ], 'coral'));
    const q = new Queue(this.ctx, 400, 200, 10);
    q.push(new Circle(this.ctx, 300, 300, 40, 'red'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'green'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'orange'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'pink'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'yellow'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'red'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'green'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'orange'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'pink'));
    q.push(new Circle(this.ctx, 300, 300, 40, 'yellow'));
    this.queue = q;
    this.shapes.push(q);
    this.intervalHandle = setInterval(this.intervalTest, this.interval) as unknown as number;
  }

  public stopStartInterval(): void {
    this.queue.move(40, 40, { relativeSpeed: 1 });
    this.queue.pop();
    /*if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    } else {
      this.intervalHandle = setInterval(this.intervalTest, this.interval) as unknown as number;
    }*/
  }

  public slider(val: number | null): void {
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.interval = 1000 / (val || 1);
      console.log(this.interval);
      this.intervalHandle = setInterval(this.intervalTest, this.interval) as unknown as number;
    }
  }

  private intervalTest = (): void => {
    /*const parallel = this.shapes[1];
    switch (this.collision) {
      case 0:
        parallel.moveRight(2);
        if (parallel.collisionXRight(this.simulationCanvas.nativeElement.width)) this.collision = 1;
        break;
      case 1:
        parallel.moveLeft(2);
        if (parallel.collisionXLeft(0)) this.collision = 2;
        break;
      case 2:
        parallel.moveUp(2);
        if (parallel.collisionYTop(0)) this.collision = 3;
        break;
      case 3:
        parallel.moveDown(2);
        if (parallel.collisionYBottom(this.simulationCanvas.nativeElement.height)) this.collision = 0;
        break;
    }*/
    this.drawFrame();
  }

  private drawFrame(): void {
    this.ctx.clearRect(0, 0, this.simulationCanvas.nativeElement.width, this.simulationCanvas.nativeElement.height);
    for (const shape of this.shapes) {
      shape.draw();
    }
  }

}
