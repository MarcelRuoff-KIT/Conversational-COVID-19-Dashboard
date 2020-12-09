import { Component, OnInit, AfterViewInit, OnDestroy, AfterContentInit, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CountiesMapComponent } from '../counties-map/counties-map.component';
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
  selector: 'app-counties',
  templateUrl: './counties.component.html',
  styleUrls: ['./counties.component.scss']
})
export class CountiesComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

  @ViewChild('countiesMap', { static: true }) countiesMap: CountiesMapComponent;
  @ViewChild('metricSummary', { static: true }) metricSummary: MetricSummaryComponent;
  @ViewChild('metricTable', { static: true }) metricTable: MetricTableComponent;
  @ViewChild("botWindow") botWindowElement: ElementRef;

  refreshInterval;
  selectedState = "United States";
  metric = "Cases";
  scale = "Sqrrt";
  type = "Filled";
  tab = "Totals";
  date = "";
  userID;


  private _routerSub = Subscription.EMPTY;

  constructor(public router: Router, public route: ActivatedRoute) { 

    this._routerSub = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.route.params.subscribe(params => {
        this.selectedState = this.route.snapshot.params['selectedState'];
        this.metricSummary.selectedState = this.selectedState;
        this.metricSummary.updateSummary();

        this.route.params.subscribe(params => {
          if (this.route.snapshot.params['selectedMetric']) {
            this.metric = this.route.snapshot.params['selectedMetric'];
          }

          if (this.route.snapshot.params['selectedDate']) {
            this.date = this.route.snapshot.params['selectedDate'];
          }

          if (this.route.snapshot.params['userID']) {
            this.userID = this.route.snapshot.params['userID'];
          }
          else
          {
            this.userID = "0000000"
          }

        });

      });
    });

  }

  ngOnInit() {
  
  }
  public filterDashboard(filter) {
    this.router.navigateByUrl("/counties/" + filter + "/" + this.countiesMap.metric + "/" + this.countiesMap.date + '/' + this.userID );
  }

  public ngAfterViewInit(): void {

    const directLine = window.WebChat.createDirectLine({
      secret: "Ye6XyojNens.RBOseW23O3THiyjuLJXpafIUmLzAS70KJRv2pono0_A",
      webSocket: false
  });

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
        if (data.type == 'event' && this.router.url.includes("counties")) {
            console.log(data)

            //display seed change by adding branch
            if (data.name == "Filter") {
                console.log(data.value)
                this.filterDashboard(data.value[1])
            }
            else if (data.name == "DrillDown") {
              console.log(data.value)
              this.filterDashboard(data.value)
          }
        }
    });

  }



  initialize() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {
      if (document.hasFocus()) {
      }
    }, 1000);

  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  ngAfterContentInit() {
    this.initialize();
  }

  navigateLeft() {
    this.router.navigate(['/unitedstates' +  "/" + this.countiesMap.metric + "/" + this.countiesMap.date + '/' + this.userID]);
  }

  navigateRight() {
    this.router.navigate(['/status']);
  }

  dateChanged(date) {
    if (date) {
      this.metricSummary.date = date;
      this.metricSummary.updateSummary();
      this.metricTable.date = date;
      this.metricTable.updateSummary();
    }
  }
}

