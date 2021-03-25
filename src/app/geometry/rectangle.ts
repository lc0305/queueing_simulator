import { AbstractShape } from './shape';

export class Rectangle extends AbstractShape {

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    protected width: number,
    protected height: number,
    color?: undefined | null | string,
    lineWidth?: undefined | null | number,
    lineColor?: undefined | null | string,
  ) {
    super(ctx, x, y, color, lineWidth, lineColor);
  }

  public draw(): void {
    this.performAnimationStepIfNecessary();
    if (this.lineWidth && this.lineColor) {
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.strokeStyle = this.lineColor;
      this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    if (this.color) {
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  public collisionXRight(xRight: number): boolean {
    return xRight <= this.x + this.width;
  }

  public collisionXLeft(xLeft: number): boolean {
    return this.x <= xLeft;
  }

  public collisionYTop(yTop: number): boolean {
    return this.y <= yTop;
  }

  public collisionYBottom(yBottom: number): boolean {
    return yBottom <= this.y + this.height;
  }
}
