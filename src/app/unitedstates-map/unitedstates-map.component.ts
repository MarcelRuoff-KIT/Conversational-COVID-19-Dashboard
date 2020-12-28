import {
  Component,
  OnInit,
  ElementRef,
  ViewEncapsulation,
  ChangeDetectorRef,
  ViewChild,
  EventEmitter,
  Output,
  Input
} from "@angular/core";

import {
  Location
} from '@angular/common';
import {
  formatDate
} from '@angular/common';


import * as statesdata from "../data/states.json";
import coviddataV2 from "../data/timeseries covid states.json";
import coviddataV2deaths from "../data/time series covid death states.json";

import * as d3 from "d3";

import {
  Subscription
} from "rxjs";
import {
  Router,
  NavigationEnd,
  ActivatedRoute
} from "@angular/router";
import { filter } from "rxjs/operators";
import { DrillDownService } from "../shared/drilldown.services";
import { SliderComponent } from '@progress/kendo-angular-inputs';
//import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';


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
  public listItems: Array<string> = [
        'Gesamte Fälle', 'Gesamte Tote'
    ]; //'Total Cases', 'Total Deaths'

  centered;

  legendContainerSettings = {
    x: 0,
    y: this.height,
    width: 520,
    height: 75,
    roundX: 10,
    roundY: 10
  };

  legendBoxSettings = {
    width: 75,
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

  countriesBounds: any[] = [];

  zoom;
  active;

  legendLabels: any[] = [];

  numBars = 6;
  start = 1;
  end = 900000; //1300000

  statesSelect = [];

  treatment;
  metric = "Gesamte Fälle";
  date;
  dateMin = "2020-01-21";
  dateMax = "2020-12-02";
  userID;

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

          if (this.route.snapshot.params['userID']) {
            this.userID = this.route.snapshot.params['userID'];
          }
          else {
            this.userID = "0000000"
          }

          if (this.route.snapshot.params['treatment']) {
            this.treatment = this.route.snapshot.params['treatment'];
          }
          else{
            this.treatment = "0";
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

          // Go to homepage default
          if (this.router.url === "/") {
            this.location.go('unitedstates/' + this.metric + "/" + this.date + "/" + this.userID + "/" + this.treatment );
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
    //console.log(this.statesSelect)
    //console.log("update STates")
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

    var that = this;

    that.svg
      .append("rect")
      .attr("class", "background")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("click", function (d) {
        that.reset(d, that);
      });

    this.svg.call(this.zoom); // delete this line to disable free zooming

    that.g = this.svg.append("g");

    if(this.metric == "Gesamte Fälle") { //Total Cases
    that.covid = coviddataV2.states;
    that.end = 900000;
    }
    else if(this.metric == "Gesamte Tote"){ //Total Deaths
    that.covid = coviddataV2deaths.states;
    that.end = 20000;
  }

    // Slider values
    that.min = new Date(that.dateMin).getTime();
    var max = new Date(that.dateMax);
    max.setHours(23, 59, 59, 999);
    that.max = max.getTime();

    // default to end date
    if (!that.date) {
      that.date = that.dateMax;
      that.slider.value = that.value;
    }

    // Set date to max date if no data available
    if (that.date > that.dateMax) {
      that.date = that.dateMax;
      that.value = that.max;
      this.location.go('unitedstates/' + this.metric + "/" + that.date + "/" + that.userID + "/" + this.treatment);
    }
    
    
      that.states = statesdata.features;
    

    that.merged = that.join(that.covid, that.states, "State", "name", function (
      state,
      covid
    ) {
      var metric;
      metric = covid ? covid[that.date] : 0;

      return {
        name: state.properties.name,
        metric: metric,
        geometry: state.geometry,
        type: state.type,
        abbrev: state.properties.name
      };
    });

    // Sqrt Scale

    that.sqrtScale = d3.scaleSqrt().domain([1, that.end]).range([0, 1]);

    that.colorScaleSqrt = d3.scaleSequential(d =>
      d3.interpolateReds(that.sqrtScale(d))
    );

    
    that.legendLabels = [
      "<" + that.getMetrics(0.2),
      ">" + that.getMetrics(0.2),
      ">" + that.getMetrics(0.4),
      ">" + that.getMetrics(0.6),
      ">" + that.getMetrics(0.8),
      ">" + that.getMetrics(1)
    ];


    that.g
      .attr("class", "county")
      .selectAll("path")
      .data(that.merged)
      .enter()
      .append("path")
      .attr("d", that.path)
      .attr("id", function(d) { return d.name.replace(" ", "_") ; })
      .attr("class", "feature")
      .on("click", function (d) {
        that.clicked(d, that, this);
      })
      .attr("class", "county")
      .attr("stroke", "grey")
      .attr("stroke-width", 0.3)
      .attr("cursor", "pointer")
      .attr("fill", function (d) {
        var metric = d.metric;
        var metric = metric ? metric : 0;
        if(that.statesSelect.includes(d.abbrev)) {
            return "#ffa500"
        }
        else if (metric > 0) {
              return that.colorScaleSqrt(metric);
        } else {
          return "#f2f2f2";
        }
      })
      .on("mouseover", function (d) {
        that.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);

          that.tooltip
          .html(
            d.name // + "<br/><b>Total " + that.metric + ":</b> " + that.formatDecimal(d.metric)
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");

          that.changeDetectorRef.detectChanges();
      })
      .on("mouseout", function (d) {
        that.tooltip
          .transition()
          .duration(300)
          .style("opacity", 0);

          that.changeDetectorRef.detectChanges();
      });

    that.legendContainer = that.svg
      .append("rect")
      .attr("x", that.legendContainerSettings.x)
      .attr("y", that.legendContainerSettings.y)
      .attr("rx", that.legendContainerSettings.roundX)
      .attr("ry", that.legendContainerSettings.roundY)
      .attr("width", that.legendContainerSettings.width)
      .attr("height", that.legendContainerSettings.height)
      .attr("id", "legend-container");

    var legend = that.svg
      .selectAll("g.legend")
      .data(that.legendData)
      .enter()
      .append("g")
      .attr("class", "legend")

      legend
        .append("rect")
        .attr("x", function (d, i) {
          return (
            that.legendContainerSettings.x + that.legendBoxSettings.width * i + 20
          );
        })
        .attr("y", that.legendBoxSettings.y)
        .attr("width", that.legendBoxSettings.width)
        .attr("height", that.legendBoxSettings.height)
        .style("fill", function (d, i) {
              return that.colorScaleSqrt(that.sqrtScale.invert(d));
        })
        .style("opacity", 1);

      legend
        .append("text")
        .attr("x", function (d, i) {
          return (
            that.legendContainerSettings.x + that.legendBoxSettings.width * i + 30
          );
        })
        .attr("y", that.legendContainerSettings.y + 72)
        .style("font-size", 12)
        .text(function (d, i) {
          return that.legendLabels[i];
        });

    legend
      .append("text")
      .attr("x", that.legendContainerSettings.x + 13)
      .attr("y", that.legendContainerSettings.y + 14)
      .style("font-size", 14)
      .text("COVID-19 " + that.metric + " nach Bundesstaat "); //" by State "

  }

  getMetrics(rangeValue) {
        return this.formatDecimal(this.sqrtScale.invert(rangeValue));
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

    var stateParameters = this.drillDownService.countiesMapped.find(stateElement => stateElement.State === d.abbrev)

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
        d3.zoomIdentity.translate(stateParameters.x, stateParameters.y).scale(stateParameters.scale)
      )
      .on("end", p.drillDown(d.abbrev, p.metric, p.date)); // updated for d3 v4
      
  }

  select(state){
    d3.select('path#' + state).dispatch('click');
  }

  drillDown(state, metric, date) {

    var stateParameters = this.drillDownService.countiesMapped.find(stateElement => stateElement.State === state)

    //console.log(stateParameters)
    
    this.drillDownService.scale = stateParameters.scale;
    if (state == "Alaska" || state == "Hawaii") {
      this.drillDownService.x = stateParameters.x - 300;
      this.drillDownService.y = stateParameters.y - 50;
    } else {
      this.drillDownService.x = stateParameters.x;
      this.drillDownService.y = stateParameters.y;
    }
    
    this.router.navigateByUrl("/counties/" + state + "/" + metric + "/" + date + "/" + this.userID + "/" + this.treatment);
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
    //console.log(value)
    var data = { metric: this.metric, date: this.date, statesSelected: this.statesSelect}
    this.dateChanged.emit(data);
    this.removeExistingMapFromParent()
    this.updateMap();

  }


  valueChange(e) {
    this.date = formatDate(new Date(this.value), 'yyyy-MM-dd', 'en');
    var data = { metric: this.metric, date: this.date, statesSelected: this.statesSelect}
    this.location.go('unitedstates/' + this.metric + "/" + this.date + "/" + this.userID + "/" + this.treatment);
    this.drillDownService.date = this.date;
    this.dateChanged.emit(data);
    this.removeExistingMapFromParent();
    this.updateMap();
  }

  selectedMetricChange(value: any) {
    //console.log(value)
    this.metric = value
    var data = { metric: this.metric, date: this.date, statesSelected: this.statesSelect}
    this.dateChanged.emit(data);
    this.location.go('unitedstates/' + this.metric + "/" + this.date + "/" + this.userID + "/" + this.treatment);
    this.removeExistingMapFromParent()
    this.updateMap();
  }

  public tagMapper(tags: any[]): any[] {
    return tags.length < 3 ? tags : [tags];
}
}
