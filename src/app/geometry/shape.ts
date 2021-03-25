export interface Shape {
  draw(): void;
  collisionXRight(xRight: number): boolean;
  collisionXLeft(xLeft: number): boolean;
  collisionYTop(yTop: number): boolean;
  collisionYBottom(yBottom: number): boolean;
  getType(): string;
  /*setColor(color: string): void ;
  getColor(): undefined | null | string;
  setLineWidth(lineWidth: number): void;
  getLineWidth(): undefined | null | number;
  setLineColor(lineColor: string): void ;
  getLineColor(): undefined | null | string;*/
  getXPos(): number;
  getYPos(): number;
  addAnimation(animationStep: AnimationStep): void;
  setXPos(x: number, animate?: AnimateConfig): void;
  setYPos(y: number, animate?: AnimateConfig): void;
  getPos(): [number, number];
  setPos(x: number, y: number, animate?: AnimateConfig): void;
  move(xVal: number, yVal: number, animate?: AnimateConfig): void;
  moveX(val: number, animate?: AnimateConfig): void;
  moveRight(val: number, animate?: AnimateConfig): void;
  moveLeft(val: number, animate?: AnimateConfig): void;
  moveY(val: number, animate?: AnimateConfig): void;
  moveUp(val: number, animate?: AnimateConfig): void;
  moveDown(val: number, animate?: AnimateConfig): void;
}

export interface AnimateConfig {
  relativeSpeed: number;
}

export enum AnimationResult {
  PENDING = 1,
  COMPLETE = 2,
}

export interface AnimationStep {
  apply(): AnimationResult;
  setContext(ctx: Shape | null): void;
  getContext(): Shape | null;
  getType(): string;
}

export abstract class AbstractAnimationStep implements AnimationStep {
  constructor(
    protected ctx: Shape | null,
    protected x: number,
    protected y: number,
    protected readonly speed: number,
  ) {
    if (speed <= 0) {
      throw new Error('Speed must be greater than 0.');
    }
  }

  abstract apply(): AnimationResult;

  public getType(): string {
    return this.constructor.name;
  }

  public setContext(ctx: Shape | null): void {
    this.ctx = ctx;
  }

  public getContext(): Shape | null {
    return this.ctx;
  }
}

export class AbsoluteAnimationStep extends AbstractAnimationStep {

  public apply(): AnimationResult {
    const resX = this.applyX();
    const resY = this.applyY();
    return (resX === AnimationResult.PENDING || resY === AnimationResult.PENDING) ? AnimationResult.PENDING : AnimationResult.COMPLETE;
  }

  private applyX(): AnimationResult {
    if (this.x < 0) {
      return AnimationResult.COMPLETE;
    }
    if (!this.ctx) {
      throw new Error('Context is not set.');
    }
    const deltaX = this.x - this.ctx.getXPos();
    if (deltaX === 0) {
      return AnimationResult.COMPLETE;
    } else if (0 < deltaX) {
      if (deltaX < this.speed) {
        this.ctx.moveX(deltaX);
        return AnimationResult.COMPLETE;
      }
      this.ctx.moveX(this.speed);
    } else {
      if (-(this.speed) < deltaX) {
        this.ctx.moveX(deltaX);
        return AnimationResult.COMPLETE;
      }
      this.ctx.moveLeft(this.speed);
    }
    return AnimationResult.PENDING;
  }

  private applyY(): AnimationResult {
    if (this.y < 0) {
      return AnimationResult.COMPLETE;
    }
    if (!this.ctx) {
      throw new Error('Context is not set.');
    }
    const deltaY = this.y - this.ctx.getYPos();
    if (deltaY === 0) {
      return AnimationResult.COMPLETE;
    } else if (0 < deltaY) {
      if (deltaY < this.speed) {
        this.ctx.moveY(deltaY);
        return AnimationResult.COMPLETE;
      }
      this.ctx.moveY(this.speed);
    } else {
      if (-(this.speed) < deltaY) {
        this.ctx.moveY(deltaY);
        return AnimationResult.COMPLETE;
      }
      this.ctx.moveUp(this.speed);
    }
    return AnimationResult.PENDING;
  }
}

export class RelativeAnimationStep extends AbstractAnimationStep {

  public apply(): AnimationResult {
    const resX = this.applyX();
    const resY = this.applyY();
    return (resX === AnimationResult.PENDING || resY === AnimationResult.PENDING) ? AnimationResult.PENDING : AnimationResult.COMPLETE;
  }

  private applyX(): AnimationResult {
    if (this.x === 0) {
      return AnimationResult.COMPLETE;
    }
    if (!this.ctx) {
      throw new Error('Context is not set.');
    }
    if (this.x < 0) {
      this.x += this.speed;
      if (0 < this.x) {
        this.ctx.moveX(this.x - this.speed);
        return AnimationResult.COMPLETE;
      }
      this.ctx.moveLeft(this.speed);
      if (this.x === 0) {
        return AnimationResult.COMPLETE;
      }
      return AnimationResult.PENDING;
    }
    this.x -= this.speed;
    if (this.x < 0) {
      this.ctx.moveX(this.x + this.speed);
      return AnimationResult.COMPLETE;
    }
    this.ctx.moveX(this.speed);
    if (this.x === 0) {
      return AnimationResult.COMPLETE;
    }
    return AnimationResult.PENDING;
  }

  private applyY(): AnimationResult {
    if (this.y === 0) {
      return AnimationResult.COMPLETE;
    }
    if (!this.ctx) {
      throw new Error('Context is not set.');
    }
    if (this.y < 0) {
      this.y += this.speed;
      if (0 < this.y) {
        this.ctx.moveY(this.y - this.speed);
        return AnimationResult.COMPLETE;
      }
      this.ctx.moveUp(this.speed);
      if (this.y === 0) {
        return AnimationResult.COMPLETE;
      }
      return AnimationResult.PENDING;
    }
    this.y -= this.speed;
    if (this.y < 0) {
      this.ctx.moveY(this.y + this.speed);
      return AnimationResult.COMPLETE;
    }
    this.ctx.moveY(this.speed);
    if (this.y === 0) {
      return AnimationResult.COMPLETE;
    }
    return AnimationResult.PENDING;
  }
}

export class AnimationSteps {
  protected readonly animationSteps = new Array<AnimationStep>();

  public performAnimationStepIfNecessary(): void {
    const animationStep = this.animationSteps[0];
    if (animationStep && animationStep.apply() === AnimationResult.COMPLETE) {
      this.animationSteps.shift();
    }
  }

  public push(animationStep: AnimationStep): void {
    this.animationSteps.push(animationStep);
  }
}

export abstract class AbstractShape implements Shape {
  protected readonly animationSteps = new AnimationSteps();

  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    protected x: number,
    protected y: number,
    protected color?: undefined | null | string,
    protected lineWidth?: undefined | null | number,
    protected lineColor?: undefined | null | string,
  ) {
    if (x < 0) {
      throw new Error(`x is ${x}. Must be greater or equal than 0.`);
    }
    if (y < 0) {
      throw new Error(`y is ${y}. Must be greater or equal than 0.`);
    }
  }

  abstract draw(): void;
  abstract collisionXRight(xRight: number): boolean;
  abstract collisionXLeft(xLeft: number): boolean;
  abstract collisionYTop(yTop: number): boolean;
  abstract collisionYBottom(yBottom: number): boolean;

  protected performAnimationStepIfNecessary(): void {
    this.animationSteps.performAnimationStepIfNecessary();
  }

  public setColor(color: string): void {
    this.color = color;
  }

  public getColor(): undefined | null | string {
    return this.color;
  }

  public setLineWidth(lineWidth: number): void {
    this.lineWidth = lineWidth;
  }

  public getLineWidth(): undefined | null | number {
    return this.lineWidth;
  }

  public setLineColor(lineColor: string): void {
    this.lineColor = lineColor;
  }

  public getLineColor(): undefined | null | string {
    return this.lineColor;
  }

  public getType(): string {
    return this.constructor.name;
  }

  public getXPos(): number {
    return this.x;
  }

  public getYPos(): number {
    return this.y;
  }

  public addAnimation(animationStep: AnimationStep): void {
    animationStep.setContext(this);
    this.animationSteps.push(animationStep);
  }

  public setXPos(x: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new AbsoluteAnimationStep(this, x, -1, animate.relativeSpeed));
    } else {
      this.x = x;
    }
  }

  public setYPos(y: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new AbsoluteAnimationStep(this, -1, y, animate.relativeSpeed));
    } else {
      this.y = y;
    }
  }

  public getPos(): [number, number] {
    return [this.x, this.y];
  }

  public setPos(x: number, y: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new AbsoluteAnimationStep(this, x, y, animate.relativeSpeed));
    } else {
      this.x = x;
      this.y = y;
    }
  }

  public move(xVal: number, yVal: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, xVal, yVal, animate.relativeSpeed));
    } else {
      this.x += xVal;
      this.y += yVal;
    }
  }

  public moveX(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, val, 0, animate.relativeSpeed));
    } else {
      this.x += val;
    }
  }

  public moveRight(val: number, animate?: AnimateConfig): void {
    this.moveX(val, animate);
  }

  public moveLeft(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, -val, 0, animate.relativeSpeed));
    } else {
      this.x -= val;
    }
  }

  public moveY(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, 0, val, animate.relativeSpeed));
    } else {
      this.y += val;
    }
  }

  public moveDown(val: number, animate?: AnimateConfig): void {
    this.moveY(val, animate);
  }

  public moveUp(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, 0, -val, animate.relativeSpeed));
    } else {
      this.y -= val;
    }
  }
}
