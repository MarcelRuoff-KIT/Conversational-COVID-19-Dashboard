import { Component, OnInit, Input, ViewChild } from '@angular/core';
import * as d3 from "d3";
import * as statedata from "../data/states-historical.json";
import coviddata from "../data/timeseries covid summary.json";
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TabStripTabComponent, TabStripComponent } from '@progress/kendo-angular-layout';
 

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
  selectedTab = "Totals";

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
          
          if (this.route.snapshot.params['selectedDate']) {
            this.date = this.route.snapshot.params['selectedDate'];
          }

          if (this.route.snapshot.params['selectedTab']) {
            this.selectedTab = this.route.snapshot.params['selectedTab'];
            switch (this.selectedTab) {
              case "Totals":
                this.tab.selectTab(0);
                break;
              case "Daily":
                this.tab.selectTab(1);
                break;
            }
          }

        });
      });
  }

  ngOnInit(): void {
    this.updateSummary();
  }

  public updateSummary() {

    that = this;

    if (this.selectedState == 'United States' || (Array.isArray(this.selectedState) && this.selectedState.length === 0)) {
      this.covid = coviddata.states;
      this.covid = this.covid.filter(function (d) {
        return (new Date(d.date) <= new Date(that.date))
      });
    }
    else {
      this.covid = coviddata.states;
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
