import { Circle } from './circle';
import { CustomShape } from './customshape';
import { AnimateConfig, AnimationStep, AnimationSteps, Shape } from './shape';

const RADIUS = 20;
const MOVE_SPEED = 1;

const DIAMETER = RADIUS * 2;
const PADDING = RADIUS / 5;
const WIDTH = RADIUS * 3;

const XPOSQ = (x: number, qLen: number, qSize: number): number => x + (DIAMETER + PADDING) * (qSize - 1 - qLen) - RADIUS;
const YPOSQ = (y: number): number => y + (WIDTH / 2);

export class Queue implements Shape {

  protected readonly topBarrier: CustomShape;
  protected readonly bottomBarrier: CustomShape;
  protected queue = new Array<Circle>();
  protected readonly animationSteps = new AnimationSteps();
  protected color: string;

  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    protected x: number,
    protected y: number,
    protected size: number,
    color?: undefined | null | string,
  ) {
    if (size < 2) {
      throw new Error('Queue must have size greater or equal than 2.');
    }

    this.color = color || 'blue';

    const x2 = x + (DIAMETER + PADDING) * (size - 1);
    this.topBarrier = new CustomShape(
      this.ctx,
      [
        [x - DIAMETER, y],
        [x2 - DIAMETER, y],
      ],
      null,
      2,
      this.color,
    );

    const yBelow = y + WIDTH;
    this.bottomBarrier = new CustomShape(
      this.ctx,
      [
        [x, yBelow],
        [x2, yBelow],
      ],
      null,
      2,
      this.color,
    );
  }

  draw(): void {
    this.animationSteps.performAnimationStepIfNecessary();
    this.topBarrier.draw();
    this.bottomBarrier.draw();
    for (const circle of this.queue) {
      circle.draw();
    }
  }

  public addAnimation(animationStep: AnimationStep): void {
    animationStep.setContext(this);
    this.animationSteps.push(animationStep);
  }

  public push(circle: Circle): void {
    if (this.size <= this.queue.length) {
      return;
    }
    circle.setRadius(RADIUS);
    circle.setPos(XPOSQ(this.x, this.queue.length, this.size), YPOSQ(this.y), { relativeSpeed: MOVE_SPEED });
    this.queue.push(circle);
  }

  public pop(): null | Circle {
    const retCircle = this.queue.shift();
    if (!retCircle) {
      return null;
    }
    const moveRightVal = DIAMETER + PADDING;
    const animateConfig: AnimateConfig = { relativeSpeed: MOVE_SPEED };
    for (const circle of this.queue) {
      circle.moveRight(moveRightVal, animateConfig);
    }
    return retCircle;
  }

  collisionXRight(xRight: number): boolean {
    return this.bottomBarrier.collisionXRight(xRight);
  }

  collisionXLeft(xLeft: number): boolean {
    return this.topBarrier.collisionXLeft(xLeft);
  }

  collisionYTop(yTop: number): boolean {
    return this.topBarrier.collisionYTop(yTop);
  }

  collisionYBottom(yBottom: number): boolean {
    return this.bottomBarrier.collisionYBottom(yBottom);
  }

  getType(): string {
    return this.constructor.name;
  }

  setColor(color: string): void {
    this.color = color;
  }

  getColor(): string | null | undefined {
    return this.color;
  }

  getXPos(): number {
    return this.x;
  }

  getYPos(): number {
    return this.y;
  }

  setXPos(x: number, animate?: AnimateConfig): void {
    throw new Error('Method not implemented.');
  }

  setYPos(y: number, animate?: AnimateConfig): void {
    throw new Error('Method not implemented.');
  }

  getPos(): [number, number] {
    return [this.x, this.y];
  }

  setPos(x: number, y: number, animate?: AnimateConfig): void {
    //this.set
  }

  move(xVal: number, yVal: number, animate?: AnimateConfig): void {
    this.topBarrier.move(xVal, yVal, animate);
    this.bottomBarrier.move(xVal, yVal, animate);
    for (const elem of this.queue) {
      elem.move(xVal, yVal, animate);
    }
  }

  moveX(val: number, animate?: AnimateConfig): void {
    this.topBarrier.moveX(val, animate);
    this.bottomBarrier.moveX(val, animate);
    for (const elem of this.queue) {
      elem.moveX(val, animate);
    }
  }

  moveRight(val: number, animate?: AnimateConfig): void {
    this.topBarrier.moveRight(val, animate);
    this.bottomBarrier.moveRight(val, animate);
    for (const elem of this.queue) {
      elem.moveRight(val, animate);
    }
  }

  moveLeft(val: number, animate?: AnimateConfig): void {
    this.topBarrier.moveLeft(val, animate);
    this.bottomBarrier.moveLeft(val, animate);
    for (const elem of this.queue) {
      elem.moveLeft(val, animate);
    }
  }

  moveY(val: number, animate?: AnimateConfig): void {
    this.topBarrier.moveY(val, animate);
    this.bottomBarrier.moveY(val, animate);
    for (const elem of this.queue) {
      elem.moveY(val, animate);
    }
  }

  moveUp(val: number, animate?: AnimateConfig): void {
    this.topBarrier.moveUp(val, animate);
    this.bottomBarrier.moveUp(val, animate);
    for (const elem of this.queue) {
      elem.moveUp(val, animate);
    }
  }

  moveDown(val: number, animate?: AnimateConfig): void {
    this.topBarrier.moveDown(val, animate);
    this.bottomBarrier.moveDown(val, animate);
    for (const elem of this.queue) {
      elem.moveDown(val, animate);
    }
  }

}
