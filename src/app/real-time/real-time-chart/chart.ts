import * as d3 from 'd3';

export class Chart {

  private maxSeconds = 300;
  private pixelsPerSecond = 10;
  private svgWidth = 700;
  private svgHeight: 300;
  private margin = {
    top: 20,
    bottom: 20,
    left: 50,
    right: 30,
    topNav: 10,
    bottomNav: 20
  };
  private dimension = {
    chartTitle: 20,
    xAxis: 20,
    yAxis: 20,
    xTitle: 20,
    yTitle: 20,
    navChart: 70
  };
  private barWidth = 3;
  private maxY = 100;
  private minY = 0;
  private drawXAxis = true;
  private drawYAxis = true;
  private drawNavChart = true;
  private barId = 0;

  private _datum;
  private _initialData;
  private _data;
  private _border;

  private _chartTitle;
  private _yTitle;
  private _xTitle;

  draw(s) {
    const selection = s;
    if (selection === undefined) {
      console.error('selection is undefined');
      return;
    }

    // process titles
    const chartTitle = this._chartTitle || '';
    const xTitle = this._xTitle || '';
    const yTitle = this._yTitle || '';

    // compute component dimensions
    const chartTitleDim = chartTitle === '' ? 0 : this.dimension.chartTitle;
    const xTitleDim = xTitle === '' ? 0 : this.dimension.xTitle;
    const yTitleDim = yTitle === '' ? 0 : this.dimension.yTitle;
    const xAxisDim = !this.drawXAxis ? 0 : this.dimension.xAxis;
    const yAxisDim = !this.drawYAxis ? 0 : this.dimension.yAxis;
    const navChartDim = !this.drawNavChart ? 0 : this.dimension.navChart;

    // compute chart dimension and offset
    const marginTop = this.margin.top + chartTitleDim;
    const height = this.svgHeight - marginTop - this.margin.bottom - chartTitleDim - xTitleDim - xAxisDim - navChartDim + 30;
    const heightNav = navChartDim - this.margin.topNav - this.margin.bottomNav;
    const marginTopNav = this.svgHeight - this.margin.bottom - heightNav - this.margin.topNav;
    const width = this.svgWidth - this.margin.left - this.margin.right;
    const widthNav = width;

    // append the svg
    const svg = selection.append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .style('border', (d) => {
        if (this._border) {
          return '1px solid lightgray';
        } else {
          return null;
        }
      });

    // create main group and translate
    const main = svg.append('g')
      .attr('transform', 'translate (' + this.margin.left + ',' + marginTop + ')');

    // define clip-path
    main.append('defs').append('clipPath')
      .attr('id', 'myClip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    // create chart background
    main.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#f5f5f5');

    // note that two groups are created here, the latter assigned to barG;
    // the former will contain a clip path to constrain objects to the chart area;
    // no equivalent clip path is created for the nav chart as the data itself
    // is clipped to the full time domain
    const barG = main.append('g')
      .attr('class', 'barGroup')
      .attr('transform', 'translate(0, 0)')
      .attr('clip-path', 'url(#myClip')
      .append('g');

    // add group for x axis
    const xAxisG = main.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')');

    // add group for y axis
    const yAxisG = main.append('g')
      .attr('class', 'y axis');

    // in x axis group, add x axis title
    xAxisG.append('text')
      .attr('class', 'title')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('dy', '.71em')
      .text((d) => {
        const text = xTitle === undefined ? '' : xTitle;
        return text;
      });

    // in y axis group, add y axis title
    yAxisG.append('text')
      .attr('class', 'title')
      .attr('transform', 'rotate(-90)')
      .attr('x', - height / 2)
      .attr('y', -35)
      .attr('dy', '.71em')
      .text((d) => {
        const text = yTitle === undefined ? '' : yTitle;
        return text;
      });

    // in main group, add chart title
    main.append('text')
      .attr('class', 'chartTitle')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('dy', '.71em')
      .text((d) => {
        const text = chartTitle === undefined ? '' : chartTitle;
        return text;
      });

    // define main chart scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().domain([this.minY, this.maxY]).range([height, 0]);

    // define main chart axis
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // add nav chart
    const nav = svg.append('g')
        .attr('transform', 'translate (' + this.margin.left + ',' + marginTopNav + ')');

    // add nav background
    nav.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', heightNav)
        .style('fill', '#F5F5F5')
        .style('shape-rendering', 'crispEdges')
        .attr('transform', 'translate(0, 0)');

    // add group to hold line and area paths
    const navG = nav.append('g')
        .attr('class', 'nav');

    // add group to hold nav x axis
    const xAxisGNav = nav.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + heightNav + ')');

    // define nav scales
    const xNav = d3.scaleTime().range([0, widthNav]);
    const yNav = d3.scaleLinear().domain([this.minY, this.maxY]).range([heightNav, 0]);

    // define nav axis
    const xAxisNav = d3.axisBottom(xNav);

    // define function that will draw the nav area chart
    const navArea = d3.area()
        .x((d: any) => xNav(d.time))
        .y1((d: any) => yNav(d.value))
        .y0(heightNav);

    // define function that will draw the nav line chart
    const navLine = d3.line()
        .x((d: any) => xNav(d.time))
        .y((d: any) => yNav(d.value));

    // compute initial time domains...
    const ts = new Date().getTime();

    // first, the full time domain
    const endTime = new Date(ts);
    const startTime = new Date(endTime.getTime() - this.maxSeconds * 1000);
    const interval = endTime.getTime() - startTime.getTime();

    // then the viewport time domain (what's visible in the main chart
    // and the viewport in the nav chart)
    const endTimeViewport = new Date(ts);
    const startTimeViewport = new Date(endTime.getTime() - width / this.pixelsPerSecond * 1000);
    const intervalViewport = endTimeViewport.getTime() - startTimeViewport.getTime();
    const offsetViewport = startTimeViewport.getTime() - startTime.getTime();

    // set the scale domains for main and nav charts
    x.domain([startTimeViewport, endTimeViewport]);
    xNav.domain([startTime, endTime]);

    // update axis with modified scale
    xAxis.scale(x)(xAxisG);
    yAxis.scale(y)(yAxisG);
    xAxisNav.scale(xNav)(xAxisGNav);

    // create brush (moveable, changable rectangle that determines
    // the time domain of main chart)
    // const viewport = d3.brushX().
    //     .x(xNav)
    //     .extent([startTimeViewport, endTimeViewport])
    //     .on('brush', function () {
    //       // get the current time extent of viewport
    //       var extent = viewport.extent();

    //       startTimeViewport = extent[0];
    //       endTimeViewport = extent[1];
    //       intervalViewport = endTimeViewport.getTime() - startTimeViewport.getTime();
    //       offsetViewport = startTimeViewport.getTime() - startTime.getTime();

    //       // handle invisible viewport
    //       if (intervalViewport == 0) {
    //         intervalViewport = maxSeconds * 1000;
    //         offsetViewport = 0;
    //       }

    //       // update the x domain of the main chart
    //       x.domain(viewport.empty() ? xNav.domain() : extent);

    //       // update the x axis of the main chart
    //       xAxis.scale(x)(xAxisG);

    //       // update display
    //       refresh();
    //     });

    // // create group and assign to brush
    // var viewportG = nav.append('g')
    //     .attr('class', 'viewport')
    //     .call(viewport)
    //     .selectAll('rect')
    //     .attr('height', heightNav);


    // // initial invocation
    // data = initialData || [];

    // // update display
    // refresh();
  }

}
