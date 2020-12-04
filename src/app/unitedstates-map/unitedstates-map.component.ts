import {
  Component,
  OnInit,
  ElementRef,
  ViewEncapsulation,
  Input,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
  ViewChild,
  EventEmitter,
  Output
} from "@angular/core";

import {
  Location
} from '@angular/common';
import {
  formatDate
} from '@angular/common';


import * as statesdata from "../data/states.json";
import * as coviddata from "../data/states-historical.json";
import coviddataV2 from "../data/timeseries covid states.json";
import * as d3 from "d3";

import {
  Subscription
} from "rxjs";
import {
  Router,
  NavigationEnd,
  ActivatedRoute
} from "@angular/router";
import {
  tap,
  catchError,
  finalize,
  filter,
  delay
} from "rxjs/operators";
import {
  DrillDownService
} from "../shared/drilldown.services";
import { SliderComponent } from '@progress/kendo-angular-inputs';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';


@Component({
  selector: "app-unitedstates-map",
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./unitedstates-map.component.html",
  styleUrls: ["./unitedstates-map.component.scss"]
})
export class UnitedStatesMapComponent implements OnInit {

  @ViewChild('slider', { static: true }) slider: SliderComponent;
  @Output() dateChanged = new EventEmitter<any>();

  hostElement; // Native element hosting the SVG container
  svg; // Top level SVG element
  g; // SVG Group element
  w = window;
  doc = document;
  el = this.doc.documentElement;
  body = this.doc.getElementsByTagName("body")[0];

  projection;
  path;
  that;

  width = 960;
  height = 500;


  public scaleButtons = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  public typeButtons = [{
    text: "Filled",
    selected: true
  },
  {
    text: "Bubble"
  }
  ];

  centered;

  legendContainerSettings = {
    x: 0,
    y: this.height,
    width: 420,
    height: 75,
    roundX: 10,
    roundY: 10
  };

  legendBoxSettings = {
    width: 50,
    height: 15,
    y: this.legendContainerSettings.y + 38
  };


  zoomSettings = {
    duration: 1000,
    ease: d3.easeCubicOut,
    zoomLevel: 5
  };

  formatDecimal = d3.format(",.0f");
  legendContainer;

  legendData = [0, 0.2, 0.4, 0.6, 0.8, 1];

  states: any[] = [];
  covid: any[] = [];
  merged: any[] = [];

  zoom;
  active;

  legendLabels: any[] = [];

  numBars = 6;
  start = 1;
  end = 1300000;

  statesSelect = [];
  scale = "Sqrrt";
  type = "Filled";
  metric = "Total Cases";
  date;
  dateMin = "2020-01-21";
  dateMax;
  tab = "Totals";

  linearScale;
  colorScaleLinear;
  expScale;
  colorScaleExp;
  logScale;
  colorScaleLog;
  sqrtScale;
  colorScaleSqrt;

  private _routerSub = Subscription.EMPTY;

  tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  /* slider */
  public tickPlacement: string = 'none';
  public value: number;
  public min: number;
  public max: number;
  public smallStep: number = 86400000;

  constructor(
    private elRef: ElementRef,
    public router: Router,
    public route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private drillDownService: DrillDownService,
    private location: Location
  ) {

    this.location = location;
    this.hostElement = this.elRef.nativeElement;

    this._routerSub = router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.route.params.subscribe(params => {

          if (this.route.snapshot.params['selectedType']) {
            var button = this.typeButtons.find(({
              text
            }) => text === this.type);
            button.selected = false;
            this.type = this.route.snapshot.params['selectedType'];
            var button = this.typeButtons.find(({
              text
            }) => text === this.type);
            button.selected = true;
          }

          
          if (this.route.snapshot.params['selectedScale']) {
            this.scale = this.route.snapshot.params['selectedScale'];
          }
          

          if (this.route.snapshot.params['selectedTab']) {
            this.tab = this.route.snapshot.params['selectedTab'];
          }

          if (this.route.snapshot.params['selectedMetric']) {
            this.metric = this.route.snapshot.params['selectedMetric'];
          }

          if (this.route.snapshot.params['selectedDate']) {
            this.date = this.route.snapshot.params['selectedDate'];
            var value = new Date(this.date);
            value.setHours(23, 59, 59, 999);
            this.value = value.getTime();
            this.slider.value = value.getTime();
          }
          else {
            this.date = formatDate(new Date().setDate(new Date().getDate() - 1), 'yyyy-MM-dd', 'en');
          }

          if (this.router.url.indexOf('/unitedstates') != -1 || this.router.url === "/") {
            this.removeExistingMapFromParent();
            this.updateMap();
          }

          // Go to homepage defulat
          if (this.router.url === "/") {
            this.location.go('unitedstates/' + this.type + '/' + this.scale + '/' + this.metric + "/" + this.date + "/" + this.tab);
          }


        });
      });
  }

  ngOnInit() {
 
  }

  public removeExistingMapFromParent() {
    // !!!!Caution!!!
    // Make sure not to do;
    //     d3.select('svg').remove();
    // That will clear all other SVG elements in the DOM
    d3.select(this.hostElement)
      .select("svg")
      .remove();
  }

  updateMap() {
    this.active = d3.select(null);

    this.projection = d3
      .geoAlbersUsa()
      .scale(1000)
      .translate([this.width / 2, this.height / 2]);

    this.zoom = d3
      .zoom()
      // no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
      // .translate([0, 0])
      // .scale(1)
      .scaleExtent([1, 8]);
    //.on("zoom", function (d) {
    //	that.zoomed(d, that);
    //});

    this.path = d3.geoPath().projection(this.projection);

    this.svg = d3
      .select(this.hostElement)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height + 75)
      .on("click", this.stopped, true);

    this.that = this;

    this.that.svg
      .append("rect")
      .attr("class", "background")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("click", function (d) {
        this.that.reset(d, this.that);
      });

    this.svg.call(this.zoom); // delete this line to disable free zooming

    this.that.g = this.svg.append("g");

    this.that.covid = coviddataV2.states;

    this.that.dateMax = "2020-12-02"


    // Slider values
    this.that.min = new Date(this.that.dateMin).getTime();
    var max = new Date(this.that.dateMax);
    max.setHours(23, 59, 59, 999);
    this.that.max = max.getTime();

    // default to end date
    if (!this.that.date) {
      this.that.date = this.that.dateMax;
      this.that.slider.value = this.that.value;
    }

    // Set date to max date if no data available
    if (this.that.date > this.that.dateMax) {
      this.that.date = this.that.dateMax;
      this.that.value = this.that.max;
      this.location.go('unitedstates/' + this.type + '/' + this.scale + '/' + this.metric + "/" + this.date + "/" + this.tab);
    }
    
    var dateMax = this.that.dateMax

    var covidMax = this.that.covid.filter(function (d) {
      return d.date === dateMax
    });

    this.that.start = 1;

    // Get data for all dates for daily

    /*
    switch (this.that.metric) {
      case "Daily Deaths":
        this.that.end = d3.max(this.that.covid, function (d: any) {
          return d.daily_deaths;
        })
        break;
      case "Daily Cases":
        this.that.end = d3.max(this.that.covid, function (d: any) {
          return d.daily_cases;
        })
        break;
      case "Total Cases":
        this.that.end = d3.max(covidMax, function (d: any) {
          return d.cases;
        })
        break;
      case "Total Deaths":
        this.that.end = d3.max(covidMax, function (d: any) {
          return d.deaths;
        })
        break;
    }
    */



    // Get current date
    var date = this.that.date
    /*this.that.covid = this.that.covid.filter(function (d) {
      return d.date === date
    });
    */

    this.that.states = statesdata.features;

    var currentMetric = this.that.metric;
    this.that.merged = this.that.join(this.that.covid, this.that.states, "State", "name", function (
      state,
      covid
    ) {
      var metric;
      switch (currentMetric) {
        case "Daily Cases":
          metric = covid ? covid.daily_cases : 0;
          break;
        case "Daily Deaths":
          metric = covid ? covid.daily_deaths : 0;
          break;
        case "Total Cases":
          metric = covid ? covid[date] : 0;
          break;
        case "Total Deaths":
          metric = covid ? covid.deaths : 0;
          break;
      }

      return {
        name: state.properties.name,
        metric: metric,
        geometry: state.geometry,
        type: state.type,
        abbrev: state.properties.name
      };
    });


    // Sort for bubble overlays
    this.that.merged = this.that.merged.sort((a, b) => a.metric > b.metric ? - 1 : (a.metric < b.metric ? 1 : 0));

    // Linear Scale
    switch (this.that.type) {
      case "Filled":
        this.that.linearScale = d3.scaleLinear()
          .domain([this.that.start, this.that.end])
          .range([0, 1]);
        break;
      case "Bubble":
        this.that.linearScale = d3.scaleLinear()
          .domain([this.that.start, this.that.end])
          .range([0, 30]);
        break;
    }

    this.that.colorScaleLinear = d3.scaleSequential(d =>
      d3.interpolateReds(this.that.linearScale(d))
    );

    // Exponential Scale
    switch (this.that.type) {
      case "Filled":
        this.that.expScale = d3
          .scalePow()
          .exponent(Math.E)
          .domain([this.that.start, this.that.end])
          .range([0, 1]);

        break;
      case "Bubble":
        this.that.expScale = d3
          .scalePow()
          .exponent(Math.E)
          .domain([this.that.start, this.that.end])
          .range([0, 30]);
        break;
    }

    this.that.colorScaleExp = d3.scaleSequential(d =>
      d3.interpolateReds(this.that.expScale(d))
    );

    // Log Scale
    switch (this.that.type) {
      case "Filled":
        this.that.logScale = d3.scaleLog().domain([this.that.start, this.that.end])
          .range([0, 1]);
        break;
      case "Bubble":
        this.that.logScale = d3.scaleLog().domain([this.that.start, this.that.end])
          .range([0, 30]);
        break;
    }

    this.that.colorScaleLog = d3.scaleSequential(d =>
      d3.interpolateReds(this.that.logScale(d))
    );

    // Sqrt Scale
    switch (this.that.type) {
      case "Filled":
        this.that.sqrtScale = d3.scaleSqrt().domain([this.that.start, this.that.end])
          .range([.1, 1]);
        break;
      case "Bubble":
        this.that.sqrtScale = d3.scaleSqrt().domain([this.that.start, this.that.end])
          .range([.1, 30]);
        break;
    }

    this.that.colorScaleSqrt = d3.scaleSequential(d =>
      d3.interpolateReds(this.that.sqrtScale(d))
    );

    switch (this.that.type) {
      case "Filled":
        this.that.legendLabels = [
          "<" + this.that.getMetrics(0),
          ">" + this.that.getMetrics(0),
          ">" + this.that.getMetrics(0.2),
          ">" + this.that.getMetrics(0.4),
          ">" + this.that.getMetrics(0.6),
          ">" + this.that.getMetrics(0.8)
        ];
        break;
      case "Bubble":
        this.that.legendLabels = [
          "<" + this.that.getMetrics(0 * 30),
          ">" + this.that.getMetrics(0 * 30),
          ">" + this.that.getMetrics(0.2 * 30),
          ">" + this.that.getMetrics(0.4 * 30),
          ">" + this.that.getMetrics(0.6 * 30),
          ">" + this.that.getMetrics(0.8 * 30)
        ];
        break;
    }

    var copy = this.that
    this.that.g
      .attr("class", "county")
      .selectAll("path")
      .data(copy.merged)
      .enter()
      .append("path")
      .attr("d", copy.path)
      .attr("id", function(d) { return d.name ; })
      .attr("class", "feature")
      .on("click", function (d) {
        copy.clicked(d, copy, this);
      })
      .attr("class", "county")
      .attr("stroke", "grey")
      .attr("stroke-width", 0.3)
      .attr("cursor", "pointer")
      .attr("fill", function (d) {
        var metric = d.metric;
        var metric = metric ? metric : 0;
        if(copy.statesSelect.includes(d.abbrev)) {
            return "#ffa500"
        }
        else if (copy.type == "Filled" && metric > 0) {
          switch (copy.scale) {
            case "Linear":
              return copy.colorScaleLinear(metric);
            case "Exponential":
              return copy.colorScaleExp(metric);
            case "Logarithmic":
              return copy.colorScaleLog(metric);
            case "Sqrrt":
              return copy.colorScaleSqrt(metric);
          }
        } else {
          return "#f2f2f2";
        }
      })
      .on("mouseover", function (d) {
        copy.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);

          copy.tooltip
          .html(
            d.name + "<br/><b>Total " + copy.metric + ":</b> " + copy.formatDecimal(d.metric)
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");

          copy.changeDetectorRef.detectChanges();
      })
      .on("mouseout", function (d) {
        copy.tooltip
          .transition()
          .duration(300)
          .style("opacity", 0);

          copy.changeDetectorRef.detectChanges();
      });

      /*
      this.that.g
        .attr("class", "bubble")
        .selectAll('circle')
        .data(this.that.merged)
        .enter().append("text")
        .attr("transform", function (d) {
          var t = this.that.path.centroid(d);
          if (t[0] > 0 && t[1] > 0) {
            console.log(t)
            return "translate(" + t[0] + "," + t[1] + ")";
          } else {
            return "";
          }
        })
        .style("text-anchor", "end")
        .text(function(d) { return d.name.substring(0,2); })
        .attr("fill","black")
        .attr("stroke","black");
*/

    this.that.legendContainer = this.that.svg
      .append("rect")
      .attr("x", this.that.legendContainerSettings.x)
      .attr("y", this.that.legendContainerSettings.y)
      .attr("rx", this.that.legendContainerSettings.roundX)
      .attr("ry", this.that.legendContainerSettings.roundY)
      .attr("width", this.that.legendContainerSettings.width)
      .attr("height", this.that.legendContainerSettings.height)
      .attr("id", "legend-container");

    var legend = this.that.svg
      .selectAll("g.legend")
      .data(this.that.legendData)
      .enter()
      .append("g")
      .attr("class", "legend")

    if (this.that.type == 'Filled') {
      legend
        .append("rect")
        .attr("x", function (d, i) {
          return (
            copy.legendContainerSettings.x + copy.legendBoxSettings.width * i + 20
          );
        })
        .attr("y", this.that.legendBoxSettings.y)
        .attr("width", this.that.legendBoxSettings.width)
        .attr("height", this.that.legendBoxSettings.height)
        .style("fill", function (d, i) {

              return copy.colorScaleLinear(copy.linearScale.invert(d));

        })
        .style("opacity", 1);

      legend
        .append("text")
        .attr("x", function (d, i) {
          return (
            copy.legendContainerSettings.x + copy.legendBoxSettings.width * i + 30
          );
        })
        .attr("y", this.that.legendContainerSettings.y + 72)
        .style("font-size", 12)
        .text(function (d, i) {
          return copy.legendLabels[i];
        });
    }

    legend
      .append("text")
      .attr("x", this.that.legendContainerSettings.x + 13)
      .attr("y", this.that.legendContainerSettings.y + 14)
      .style("font-size", 14)
      .style("font-weight", "bold")
      .text("COVID-19 " + this.that.metric + " by State (" + this.that.scale + ")");

  }

  getMetrics(rangeValue) {
    switch (this.scale) {
      case "Linear":
        return this.formatDecimal(this.linearScale.invert(rangeValue));
      case "Exponential":
        return this.formatDecimal(this.expScale.invert(rangeValue));
      case "Logarithmic":
        return this.formatDecimal(this.logScale.invert(rangeValue));
      case "Sqrrt":
        return this.formatDecimal(this.sqrtScale.invert(rangeValue));
    }

  }

  reset(d, p) {
    p.active.classed("active", false);
    p.active = d3.select(null);

    p.svg
      .transition()
      .duration(750)
      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      .call(p.zoom.transform, d3.zoomIdentity); // updated for d3 v4
  }

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  }

  getDate(value) {
    return new Date(value)
  }

  zoomed(d, p) {
    p.g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    p.g.attr("transform", d3.event.transform); // updated for d3 v4
  }

  clicked(d, p, e) {
    if (p.active.node() === e) return p.reset(d, p);
    //p.active.classed("active", false);
    p.active = d3.select(e).classed("active", true);


    var bounds = p.path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(
        1,
        Math.min(8, 0.9 / Math.max(dx / p.width, dy / p.height))
      ),
      translate = [p.width / 2 - scale * x, p.height / 2 - scale * y];

      console.log([translate, scale])

    // Clean up tool tips
    p.tooltip
      .transition()
      .duration(300)
      .style("opacity", 0);

    
    p.svg
      .transition()
      .duration(750)
      .call(
        p.zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      )
      .on("end", p.drillDown(translate[0], translate[1], scale, d.abbrev, p.type, p.scale, p.metric, p.date, p.tab)); // updated for d3 v4
      
  }

  drillDown(x, y, scale, state, type, mapScale, metric, date, tab) {
    this.drillDownService.scale = scale;
    if (state == "Alaska" || state == "Hawaii") {
      this.drillDownService.x = x - 300;
      this.drillDownService.y = y - 50;
    } else {
      this.drillDownService.x = x;
      this.drillDownService.y = y;
    }
    this.router.navigateByUrl("/counties/" + state + "/" + type + "/" + mapScale + "/" + metric + "/" + date + "/" + tab);
  }

  join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
      m = mainTable.length,
      lookupIndex = [],
      output = [];
    for (var i = 0; i < l; i++) {
      // loop through l items
      var row = lookupTable[i];
      lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) {
      // loop through m items
      var y = mainTable[j];
      var x = lookupIndex[y.properties[mainKey]]; // get corresponding row from lookupTable
      output.push(select(y, x)); // select only the columns you need
    }
    return output;
  }

  selectedScaleChange(value: any) {
    console.log(value)
    var data = {type : this.type, scale: this.scale, metric: this.metric, date: this.date, tab: this.tab, statesSelected: this.statesSelect}
    this.dateChanged.emit(data);
    this.removeExistingMapFromParent()
    this.updateMap();
    /* 
    this.scale = value;
    this.location.go('unitedstates/' + this.type + '/' + this.scale + '/' + this.metric + "/" + this.date + "/" + this.tab);
    this.drillDownService.date = this.date;
    ;
    */
  }

  selectedTypeChange(e, btn) {
    this.type = btn.text;
    this.location.go('unitedstates/' + this.type + '/' + this.scale + '/' + this.metric + "/" + this.date + "/" + this.tab);
    this.drillDownService.date = this.date;
    this.removeExistingMapFromParent();
    this.updateMap();
  }


  filterState(state) {
    d3.select('path#Florida').dispatch('click');
  }
  valueChange(e) {

    //this.value = e;

    this.date = formatDate(new Date(this.value), 'yyyy-MM-dd', 'en');
    var data = {type : this.type, scale: this.scale, metric: this.metric, date: this.date, tab: this.tab, statesSelected: this.statesSelect}
    this.location.go('unitedstates/' + this.type + '/' + this.scale + '/' + this.metric + "/" + this.date + "/" + this.tab);
    this.drillDownService.date = this.date;
    this.dateChanged.emit(data);
    this.removeExistingMapFromParent();
    this.updateMap();
  }



}
