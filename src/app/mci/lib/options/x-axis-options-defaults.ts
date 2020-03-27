export const xAxisOptionsDefaults = {
  showTicks: true,
  showTickLabel: true,
  showDomain: true,
  className: 'react-stockcharts-x-axis',
  ticks: 10,
  outerTickSize: 0,
  fill: 'none',
  stroke: '#000000', // x axis stroke color
  strokeWidth: 1,
  opacity: 1, // x axis opacity
  domainClassName: 'react-stockcharts-axis-domain',
  innerTickSize: 5,
  tickPadding: 6,
  tickStroke: '#000000', // tick/grid stroke
  tickStrokeOpacity: 1,
  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  fontSize: 12,
  fontWeight: 400,
  xZoomHeight: 25,
  zoomEnabled: true,
  getMouseDelta: (startXY, mouseXY) => startXY[0] - mouseXY[0],
};
