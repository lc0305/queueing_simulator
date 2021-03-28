import { medianMinMax, randomExponential, randomNormalMinMax, randomPoisson } from '../common';

export interface RandomGenerator {
  getRandom(): number;
  getMean(): number;
}

export class NormalDistribution implements RandomGenerator {
  constructor(
    protected min: number,
    protected max: number,
    protected skew = 1,
  ) {
    if (min < 0) {
      throw new Error('Min must be greater than 0.');
    }
    if (max < min) {
      throw new Error('Max must be greater than min.');
    }
  }

  public getRandom(): number {
    return randomNormalMinMax(this.min, this.max, this.skew);
  }

  public getMean(): number {
    return medianMinMax(this.min, this.max);
  }
}

export class UniformDistribution implements RandomGenerator {
  constructor(
    protected min: number,
    protected max: number,
  ) {
    if (min < 0) {
      throw new Error('Min must be greater than 0.');
    }
    if (max < min) {
      throw new Error('Max must be greater than min.');
    }
  }

  public getRandom(): number {
    return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
  }

  public getMean(): number {
    return medianMinMax(this.min, this.max);
  }
}

export class PoissonDistribution implements RandomGenerator {
  protected poisson: () => number;

  constructor(protected lambda: number) {
    this.poisson = randomPoisson(lambda);
  }

  public getRandom(): number {
    return this.poisson();
  }

  public getMean(): number {
    return this.lambda;
  }
}

export class ExponentialDistribution implements RandomGenerator {

  constructor(protected mu: number) {
    if (mu <= 1) {
      throw new Error('Mu must be greater or equal than 1.');
    }
  }

  public getRandom(): number {
    return randomExponential(this.mu);
  }

  public getMean(): number {
    return this.mu;
  }
}

export interface WeightListEntry {
  size: number;
  weight: number;
}

export class WeightList implements RandomGenerator {
  private readonly weightList = new Array<number>();
  private mean = 0;

  constructor(weightList: WeightListEntry[]) {
    let overallPercentage = 0;
    for (const entry of weightList) {
      this.mean += entry.weight * entry.size;
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

  public getRandom(): number {
    return this.weightList[Math.floor(Math.random() * 100)];
  }

  public getMean(): number {
    return this.mean;
  }
}

export enum RandomGeneratorTypes {
  NormalDistribution = '1',
  UniformDistribution = '2',
  WeightList = '3',
  PoissonDistribution = '4',
  ExponentialDistribution = '5',
}
