export interface ChartCanvasOptions {
  className: string;
  zIndex?: number;
  height?: number;
  width?: number;
  margin?: { left: number, right: number, top: number, bottom: number };
  data?: any[];
  plotFull?: any[];
  xAccessor?: Function;
  xScale?: d3.ScaleTime<number, number>;
  xExtents?: any[] | Function;
  useCrossHairStyleCursor?: boolean;
  padding?: number | { left: number, right: number };
  flipXScale?: boolean;
  clamp?: string | boolean | Function;
  pointsPerPxThreshold?: number;
  minPointsPerPxThreshold?: number;
  displayXAccessor?: Function;
  postCalculator?: Function;
  mouseMoveEvent?: boolean;
  zoomEvent?: boolean;
  panEvent?: boolean;
  defaultFocus?: boolean;
  disableInteraction?: boolean;
  maintainPointsPerPixelOnResize?: boolean;
}

export function getCursorStyle(className: string) {
  const tooltipStyle = `
	.${className}-grabbing-cursor {
		pointer-events: all;
		cursor: -moz-grabbing;
		cursor: -webkit-grabbing;
		cursor: grabbing;
	}
	.${className}-crosshair-cursor {
		pointer-events: all;
		cursor: crosshair;
	}
	.${className}-tooltip-hover {
		pointer-events: all;
		cursor: pointer;
	}
	.${className}-avoid-interaction {
		pointer-events: none;
	}
	.${className}-enable-interaction {
		pointer-events: all;
	}
	.${className}-tooltip {
		pointer-events: all;
		cursor: pointer;
	}
	.${className}-default-cursor {
		cursor: default;
	}
	.${className}-move-cursor {
		cursor: move;
	}
	.${className}-pointer-cursor {
		cursor: pointer;
	}
	.${className}-ns-resize-cursor {
		cursor: ns-resize;
	}
	.${className}-ew-resize-cursor {
		cursor: ew-resize;
  }`;

  return tooltipStyle;
}
