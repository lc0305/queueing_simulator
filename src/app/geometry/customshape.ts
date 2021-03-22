import { AbsoluteAnimationStep, AnimateConfig, AnimationStep, AnimationSteps, RelativeAnimationStep, Shape } from './shape';

export class CustomShape implements Shape {
  protected maxX = 0;
  protected minX = Number.MAX_SAFE_INTEGER;
  protected maxY = 0;
  protected minY = Number.MAX_SAFE_INTEGER;
  protected pointsX = new Array<number>();
  protected pointsY = new Array<number>();
  protected readonly animationSteps = new AnimationSteps();

  constructor(
    protected readonly ctx: CanvasRenderingContext2D,
    points: Array<[number, number]>,
    protected color?: undefined | null | string,
    protected lineWidth?: undefined | null | number,
    protected lineColor?: undefined | null | string,
  ) {
    if (points.length < 2) {
      throw new Error('Shape needs at least 2 points.');
    }

    for (const point of points) {
      const x = point[0];
      if (this.maxX < x) {
        this.maxX = x;
      }
      if (x < this.minX) {
        this.minX = x;
      }
      this.pointsX.push(x);

      const y = point[1];
      if (this.maxY < y) {
        this.maxY = y;
      }
      if (y < this.minY) {
        this.minY = y;
      }
      this.pointsY.push(y);
    }
  }

  public draw(): void {
    this.animationSteps.performAnimationStepIfNecessary();
    this.ctx.beginPath();
    this.ctx.moveTo(this.pointsX[0], this.pointsY[0]);
    const len = this.pointsY.length;
    for (let i = 1; i < len; ++i) {
      this.ctx.lineTo(this.pointsX[i], this.pointsY[i]);
    }
    if (this.lineWidth && this.lineColor) {
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.lineColor;
      this.ctx.stroke();
    }
    if (this.color) {
      const maxIndex = len - 1;
      if (this.pointsX[0] !== this.pointsX[maxIndex] || this.pointsY[0] !== this.pointsY[maxIndex]) {
        this.ctx.closePath();
      }
      this.ctx.fillStyle = this.color;
      this.ctx.fill();
    }
  }

  public addAnimation(animationStep: AnimationStep): void {
    animationStep.setContext(this);
    this.animationSteps.push(animationStep);
  }

  public collisionXRight(xRight: number): boolean {
    return xRight <= this.maxX;
  }

  public collisionXLeft(xLeft: number): boolean {
    return this.minX <= xLeft;
  }

  public collisionYTop(yTop: number): boolean {
    return this.minY <= yTop;
  }

  public collisionYBottom(yBottom: number): boolean {
    return yBottom <= this.maxY;
  }

  private moveMinMaxX(delta: number): void {
    this.minX += delta;
    this.maxX += delta;
  }

  private moveMinMaxY(delta: number): void {
    this.minY += delta;
    this.maxY += delta;
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
    return this.pointsX[0];
  }

  public getYPos(): number {
    return this.pointsY[0];
  }

  public setXPos(x: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new AbsoluteAnimationStep(this, x, -1, animate.relativeSpeed));
    } else {
      const deltaX = x - this.pointsX[0];
      this.pointsX = this.pointsX.map(valX => valX + deltaX);
      this.moveMinMaxX(deltaX);
    }
  }

  public setYPos(y: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new AbsoluteAnimationStep(this, -1, y, animate.relativeSpeed));
    } else {
      const deltaY = y - this.pointsY[0];
      this.pointsY = this.pointsY.map(valY => valY + deltaY);
      this.moveMinMaxY(deltaY);
    }
  }

  public getPos(): [number, number] {
    return [this.pointsX[0], this.pointsY[0]];
  }

  public setPos(x: number, y: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new AbsoluteAnimationStep(this, x, y, animate.relativeSpeed));
    } else {
      this.setXPos(x);
      this.setYPos(y);
    }
  }

  public move(xVal: number, yVal: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, xVal, yVal, animate.relativeSpeed));
    } else {
      this.setXPos(xVal);
      this.setYPos(yVal);
    }
  }

  public moveX(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, val, 0, animate.relativeSpeed));
    } else {
      this.pointsX = this.pointsX.map(valX => valX + val);
      this.moveMinMaxX(val);
    }
  }

  public moveRight(val: number, animate?: AnimateConfig): void {
    this.moveX(val, animate);
  }

  public moveLeft(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, -val, 0, animate.relativeSpeed));
    } else {
      this.pointsX = this.pointsX.map(valX => valX - val);
      this.moveMinMaxX(-val);
    }
  }

  public moveY(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, 0, val, animate.relativeSpeed));
    } else {
      this.pointsY = this.pointsY.map(valY => valY + val);
      this.moveMinMaxY(val);
    }
  }

  public moveDown(val: number, animate?: AnimateConfig): void {
    this.moveY(val, animate);
  }

  public moveUp(val: number, animate?: AnimateConfig): void {
    if (animate) {
      this.addAnimation(new RelativeAnimationStep(this, 0, -val, animate.relativeSpeed));
    } else {
      this.pointsY = this.pointsY.map(valY => valY - val);
      this.moveMinMaxY(-val);
    }
  }

}
