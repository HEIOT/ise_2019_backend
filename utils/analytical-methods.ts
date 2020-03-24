import { ISensorValueSimple, ISpike } from "../typings/typings";

export function getAvg(values: ISensorValueSimple[]): number {
  return (
    values.reduce((sum: number, y: ISensorValueSimple) => sum + y.value, 0) /
    values.length
  );
}

export function getStd(values: ISensorValueSimple[], avg: number): number {
  return Math.sqrt(
    values
      .map((y: ISensorValueSimple) => Math.pow(y.value - avg, 2))
      .reduce((a, b) => a + b) /
      (values.length - 1)
  );
}

export function getSpikes(
  values: ISensorValueSimple[],
  lag: number,
  threshold: number,
  influence: number,
  id: string,
  attr: string
): ISpike[] {
  let filteredY: ISensorValueSimple[] = values.slice(0, lag);
  let currentAvg: number = getAvg(filteredY);
  let currentStd: number = getStd(filteredY, currentAvg);
  const spikes: ISpike[] = [];
  for (let i = lag; i < values.length; i += 1) {
    if (Math.abs(values[i].value - currentAvg) > threshold * currentStd) {
      // spike detected

      spikes.push({
        id,
        timestamp: values[i].timestamp,
        attribute: attr,
        value: values[i].value,
        moving_average: currentAvg
      });

      // reduce influence of spike
      const reducedSpikeValue =
        influence * values[i].value + (1 - influence) * values[i - 1].value;
      filteredY = [
        ...filteredY.slice(1),
        { value: reducedSpikeValue, timestamp: values[i].timestamp }
      ];
    } else {
      // no spike detected
      filteredY = [...filteredY.slice(1), values[i]];
    }
    // adjust current avg and std
    currentAvg = getAvg(filteredY);
    currentStd = getStd(filteredY, currentAvg);
  }
  return spikes;
}
