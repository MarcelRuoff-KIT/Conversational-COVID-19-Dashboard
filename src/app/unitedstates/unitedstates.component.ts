import { Component, OnInit, OnDestroy, AfterContentInit, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { ViewChild } from '@angular/core';

import { UnitedStatesMapComponent } from '../unitedstates-map/unitedstates-map.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MetricSummaryComponent } from '../metric-summary/metric-summary.component';
import { MetricTableComponent } from '../metric-table/metric-table.component';

/**
 * Declares the WebChat property on the window object.
 */
declare global {
  interface Window {
      WebChat: any;
  }
}

window.WebChat = window.WebChat || {};

@Component({
  selector: 'app-unitedstates',
  templateUrl: './unitedstates.component.html',
  styleUrls: ['./unitedstates.component.scss']
})
export class UnitedStatesComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

  @ViewChild('unitedStatesMap', { static: true }) unitedStatesMap: UnitedStatesMapComponent;
  @ViewChild('metricSummary', { static: true }) metricSummary: MetricSummaryComponent;
  @ViewChild('metricTable', { static: true }) metricTable: MetricTableComponent;
  @ViewChild("botWindow") botWindowElement: ElementRef;

  private _routerSub = Subscription.EMPTY;
  public metric = "Total Cases";
  public icon = "place";
  constructor(private router: Router, public route: ActivatedRoute) {

    this._routerSub = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.route.params.subscribe(params => {
        if (this.route.snapshot.params['selectedMetric']) {
          this.metric = this.route.snapshot.params['selectedMetric'];
          switch (this.metric) {
            case "Daily Cases":
              this.icon = "place";
              break;
            case "Total Cases":
              this.icon = "place";
              break;
            case "Daily Deaths":
              this.icon = "warning";
              break;
            case "Total Deaths":
              this.icon = "warning";
              break;
          }
        }
      });
    });

  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public ngAfterViewInit(): void {

    console.log(document.cookie)
  if(document.cookie == "hallo"){
    var directLine = window.WebChat.createDirectLine({
      secret: "Ye6XyojNens.RBOseW23O3THiyjuLJXpafIUmLzAS70KJRv2pono0_A",
      conversationId: document.cookie,
      webSocket: false
  });
}
else{
  var directLine = window.WebChat.createDirectLine({
    secret: "Ye6XyojNens.RBOseW23O3THiyjuLJXpafIUmLzAS70KJRv2pono0_A",
    webSocket: false
});
}

  const webSpeechPonyfillFactory = window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
    credentials: {
        region: 'westus',
        subscriptionKey: '55240fa205624ece8a53255dcba36df2'
    }
});

const store = window.WebChat.createStore(
  {},
  ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          //connect outgoing event handler and hand over reported data
          const event = new Event('webchatoutgoingactivity');
          event.data = action.payload.activity;
          window.dispatchEvent(event);
      }
      else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const event = new Event('webchatincomingactivity');
          event.data = action.payload.activity;
          window.dispatchEvent(event);
      }
      return next(action);
  });


  window.WebChat.renderWebChat(
      {
          directLine: directLine,
          styleOptions: {
                        botAvatarImage: '/css/owl.jpg',
                        botAvatarBackgroundColor: 'rgba(0, 0, 0)',
                        hideUploadButton: true,
                        bubbleBackground: 'rgba(0, 0, 255, .1)',
                        bubbleFromUserBackground: 'rgba(0, 255, 0, .1)',
                        sendBoxButtonColor: 'rgba(255,153, 0, 1)',
                        hideScrollToEndButton: true,
                        bubbleMinHeight: 0,
                        userID: "USER_ID",
                    },
                    webSpeechPonyfillFactory,
                    locale: 'en-US', //en-US
                    store

      },
      this.botWindowElement.nativeElement
  );

  directLine
  .postActivity({
    from: { id: "USER_ID", name: "USER_NAME" },
    name: "requestWelcomeDialog",
    type: "event",
    value: "token"
})
.subscribe(
    
    id => {console.log(`Posted activity, assigned ID ${id}`); console.log(directLine.conversationId);},
    error => console.log(`Error posting activity ${error}`)
);

      window.addEventListener('webchatincomingactivity', ({ data }) => {
        if (data.type == 'event' && this.router.url.includes("unitedstates")) {
            console.log(data)

            //display seed change by adding branch
            if (data.name == "Filter") {
                console.log(data.value)
                this.filterDashboard(data.value)
            }
            else if (data.name == "DrillDown") {
              console.log(data.value)
              this.drillDown(data.value)
          }
        }
    });

  }
  ngAfterContentInit() {
  }

  navigateLeft() {
  }

  navigateRight() {
  }

  dateChanged(data) {

    if(data.statesSelected){
      this.metricSummary.selectedState = data.statesSelected;
    }

    if (data.date) {
      this.metricSummary.date = data.date;
      //this.metricTable.date = data.date;
    }
    this.metricSummary.updateSummary();
    //this.metricTable.updateSummary();


  }

  public drillDown(state){
    this.unitedStatesMap.select(state)
  }

  public filterDashboard(values){
    console.log(this.router.url)
    var FilterValues = new Map();
                    var PageFilter = new Map();
                    for (var i = 0; i < values.length; i += 2) {
                        if (values[i] == "Datum") {
                            FilterValues.set(values[i], values[i + 1])
                        }
                        else if (FilterValues.get(values[i]) == undefined) {
                            FilterValues.set(values[i], [values[i + 1]])
                        }
                        else {
                            FilterValues.set(values[i], [values[i + 1], ...FilterValues.get(values[i])]);
                        }

                    }
                    console.log(FilterValues)
                    for (var [key, value] of FilterValues.entries()) {
                      if(key == "States"){
                        this.unitedStatesMap.statesSelect = value;
                        this.metricSummary.selectedState = value;
                      }
                      if(key == "Datum"){
                        if(value.includes("XXXX")){
                          value = value.replace("XXXX", 2020)
                        }
                        this.unitedStatesMap.date = value;
                        this.metricSummary.date = value;
                        this.router.navigate(['unitedstates/' + this.metric + "/" + value ]);
                      }
                      this.unitedStatesMap.removeExistingMapFromParent();
                      this.unitedStatesMap.updateMap()
                      this.metricSummary.updateSummary();
                    }

  }
}

 
