import { AbstractShape } from './shape';

export class Circle extends AbstractShape {

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    private radius: number,
    color?: undefined | null | string,
    lineWidth?: undefined | null | number,
    lineColor?: undefined | null | string,
  ) {
    super(ctx, x, y, color, lineWidth, lineColor);
  }

  public draw(): void {
    this.performAnimationStepIfNecessary();
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    if (this.lineWidth && this.lineColor) {
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.lineColor;
      this.ctx.stroke();
    }
    if (this.color) {
      this.ctx.fillStyle = this.color;
      this.ctx.fill();
    }
  }

  public getRadius(): number {
    return this.radius;
  }

  public setRadius(radius: number): void {
    this.radius = radius;
  }

  public collisionXRight(xRight: number): boolean {
    return xRight <= this.x + this.radius;
  }

  public collisionXLeft(xLeft: number): boolean {
    return this.x - this.radius <= xLeft;
  }

  public collisionYTop(yTop: number): boolean {
    return this.y - this.radius <= yTop;
  }

  public collisionYBottom(yBottom: number): boolean {
    return yBottom <= this.y + this.radius;
  }
}
