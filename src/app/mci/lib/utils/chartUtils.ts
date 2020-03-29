import { getClosestItem, isDefined } from '.';

export function getCurrentCharts(chartConfig, mouseXY) {
  const currentCharts = chartConfig.filter(eachConfig => {
    const top = eachConfig.origin[1];
    const bottom = top + eachConfig.height;
    return (mouseXY[1] > top && mouseXY[1] < bottom);
  }).map(config => config.id);

  return currentCharts;
}

export function getCurrentItem(xScale, xAccessor, mouseXY, plotData) {
  let xValue;
  let item;
  if (xScale.invert) {
    xValue = xScale.invert(mouseXY[0]);
    item = getClosestItem(plotData, xValue, xAccessor);
  } else {
    const d = xScale.range().map((d, idx) => ({ x: Math.abs(d - mouseXY[0]), idx })).reduce((a, b) => a.x < b.x ? a : b);
    item = isDefined(d) ? plotData[d.idx] : plotData[0];
    // console.log(d, item);
  }
  return item;
}
