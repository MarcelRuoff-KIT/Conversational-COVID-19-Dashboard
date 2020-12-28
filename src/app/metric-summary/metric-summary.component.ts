import { Component, OnInit, ViewChild } from '@angular/core';
import * as d3 from "d3";
import coviddata from "../data/timeseries covid summary.json";
import coviddataDeaths from "../data/timeseries covid deaths summary.json";
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TabStripComponent } from '@progress/kendo-angular-layout';
 

@Component({
  selector: 'app-metric-summary',
  templateUrl: './metric-summary.component.html',
  styleUrls: ['./metric-summary.component.scss']
})
export class MetricSummaryComponent implements OnInit {

  @ViewChild('tab', { static: true }) tab: TabStripComponent;

  public baseUnit = 'days';

  covid: any[] = [];
 
  cases;
  deaths;
  daily_cases;
  daily_deaths;

  date ;
  selectedState;
  selectedMetric = "Total Cases";

  private _routerSub = Subscription.EMPTY;

  constructor(public router: Router,
    public route: ActivatedRoute,
 ) {

    this._routerSub = router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.route.params.subscribe(params => {
          if (this.route.snapshot.params['selectedState']) {
            this.selectedState = [this.route.snapshot.params['selectedState']];
          }
          else {
            this.selectedState = 'United States';
          }

          if (this.route.snapshot.params['selectedMetric']) {
            this.selectedMetric = this.route.snapshot.params['selectedMetric'];
          }
          
          if (this.route.snapshot.params['selectedDate']) {
            this.date = this.route.snapshot.params['selectedDate'];
          }
          else {
            this.date = "2020-12-02";
          }

        });
      });
  }

  ngOnInit(): void {
    this.updateSummary();
  }

  public updateSummary() {

    that = this;

    if(this.selectedMetric == "Total Cases") { //Total Cases
      that.covid = coviddata.states;
      }
      else if(this.selectedMetric == "Total Deaths"){ //Total Deaths
      that.covid = coviddataDeaths.states;
    }

    if (this.selectedState == 'United States' || (Array.isArray(this.selectedState) && this.selectedState.length === 0)) {
      this.covid = this.covid.filter(function (d) {
        return (new Date(d.date) <= new Date(that.date))
      });
    }
    else {
      this.covid = this.covid.filter(function (d) {
        return (that.selectedState.includes(d.state) && new Date(d.date) <= new Date(that.date))
      });
    }
    
   
    var that = this;

    var dateMax = d3.max(that.covid, function (d: any) {
      return d.date
    });

    // default to end date
    if (!that.date) {
      that.date = dateMax;
    }

    var covidSelected = this.covid.filter(function (d) {
      return d.date === that.date
    });

    this.cases = d3.sum(covidSelected, function (d: any) {
      return d.cases;
    });

    this.covid.forEach((element) => {
      element.dateTime = new Date(element.date);
    });
  }

}
