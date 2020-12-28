import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ViewChild } from '@angular/core';
import { UnitedStatesMapComponent } from '../unitedstates-map/unitedstates-map.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MetricSummaryComponent } from '../metric-summary/metric-summary.component';

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
export class UnitedStatesComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {

  @ViewChild('unitedStatesMap', { static: true }) unitedStatesMap: UnitedStatesMapComponent;
  @ViewChild('metricSummary', { static: true }) metricSummary: MetricSummaryComponent;
  @ViewChild("botWindow", {static: true}) botWindowElement: ElementRef;

  private _routerSub = Subscription.EMPTY;
  public metric = "Total Cases";
  public userID;
  public currentTime;
  public directLine;
  public treatment;
  constructor(private router: Router, public route: ActivatedRoute) {

    this._routerSub = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.route.params.subscribe(params => {
        if (this.route.snapshot.params['selectedMetric']) {
          this.metric = this.route.snapshot.params['selectedMetric'];
        }

        if (this.route.snapshot.params['userID']) {
          this.userID = this.route.snapshot.params['userID'];
        }
        else{
          this.userID = "0000000";
        }

        if (this.route.snapshot.params['treatment']) {
          this.treatment = this.route.snapshot.params['treatment'];
        }
        else{
          this.treatment = "0";
        }
      });
    });

  }

  async ngOnInit() {
    //console.log(document.cookie)
    this.currentTime = new Date()
    if(document.cookie.includes("conversationID")){
      var conversationID = this.getCookie("conversationID")
      this.directLine = window.WebChat.createDirectLine({
        secret: "gRcPqKxRTUc.TC9nxY9t2jvUxfDA0x9Z7pm4hXsGUly5IT9GQNJ_npI",
        conversationId: conversationID,
        webSocket: false
    });
  }
  else{
    this.directLine = window.WebChat.createDirectLine({
      secret: "gRcPqKxRTUc.TC9nxY9t2jvUxfDA0x9Z7pm4hXsGUly5IT9GQNJ_npI",
      webSocket: false
      });
    }

    async function createHybridPonyfillFactory() {
      const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({ credentials: {
        region: 'westus',
        subscriptionKey: '55240fa205624ece8a53255dcba36df2'
    } });

      return (options) => {
          const speech = speechServicesPonyfillFactory(options);

          return {
              SpeechGrammarList: speech.SpeechGrammarList,
              SpeechRecognition: speech.SpeechRecognition,
              speechSynthesis: null, // speech.speechSynthesis,
              SpeechSynthesisUtterance: null, // speech.SpeechSynthesisUtterance
          };
      }
  };

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
          (<any>event).data = action.payload.activity;
          window.dispatchEvent(event);
      }
      else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const event = new Event('webchatincomingactivity');
          (<any>event).data = action.payload.activity;
          window.dispatchEvent(event);
      }
      return next(action);
  });


  window.WebChat.renderWebChat(
      {
          directLine: this.directLine,
          styleOptions: {
                        botAvatarBackgroundColor: 'rgba(0, 0, 0)',
                        hideUploadButton: true,
                        bubbleBackground: 'rgba(0, 0, 255, .1)',
                        bubbleFromUserBackground: 'rgba(0, 255, 0, .1)',
                        sendBoxButtonColor: 'rgba(255,153, 0, 1)',
                        hideScrollToEndButton: true,
                        bubbleMinHeight: 0,
                        bubbleMaxWidth: 600,
                    },
                    webSpeechPonyfillFactory: await createHybridPonyfillFactory(),
                    locale: 'en-US', //de-DE
                    store

      },
      this.botWindowElement.nativeElement
  );

  this.directLine
  .postActivity({
    from: { id: "USER_ID", name: "USER_NAME" },
    name: "requestWelcomeDialog",
    type: "event",
    value: "token"
})
.subscribe(
    id => {//console.log(`Posted activity, assigned ID ${id}`); 
            if(!document.cookie.includes("conversationID")) {
              document.cookie = "conversationID=" + this.directLine.conversationId + "; SameSite=None; Secure"
            };},
    error => console.log(`Error posting activity ${error}`)
);

}

  ngOnDestroy() {
    //console.log("Destroy")
    this.currentTime = new Date(8640000000000000);
    this.directLine = null;
  }

  public ngAfterViewInit(): void {
    this.router.navigate(['unitedstates/' + this.unitedStatesMap.metric + "/" + this.unitedStatesMap.date + "/" + this.unitedStatesMap.userID + "/" + this.unitedStatesMap.treatment])

    

    window.addEventListener('webchatincomingactivity', event => {
      var sheight = document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollHeight;
      document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollTo(0, sheight);
        if ((<any>event).data.type == 'event' && (this.router.url.includes("unitedstates") || this.router.url == "/") && (new Date((<any>event).data.timestamp) >= this.currentTime)) {  //
            //console.log((<any>event).data)

            //display seed change by adding branch
            if ((<any>event).data.name == "Filter") {
                //console.log((<any>event).data.value)
                this.filterDashboard((<any>event).data.value)
            }
            else if ((<any>event).data.name == "DrillDown") {
              //console.log((<any>event).data.value)
              this.drillDown((<any>event).data.value)
          }
        }
    });

    document.getElementById("overlay").addEventListener("click", function() {
      $(".popup-overlay, .popup-content").removeClass("active");
    });

    document.getElementById("content").addEventListener("click", function() {
      $(".popup-overlay, .popup-content").removeClass("active");
    });

  }

  public ngAfterContentInit() {
    switch(this.treatment) {
      case '0':
        //console.log("Treatment: " + this.treatment)
        break;
      case '1':
        //console.log("Treatment: " + this.treatment)
        document.getElementById("hallo").style.zIndex = '2';
        break;
      case '2':
        //console.log("Treatment: " + this.treatment)
        document.getElementById("botWin").style.display = 'none';
        break;
    }
  }

  dateChanged(data) {

    if(data.statesSelected){
      this.metricSummary.selectedState = data.statesSelected;
    }

    if (data.date) {
      this.metricSummary.date = data.date;
    }

    if (data.metric){
      this.metricSummary.selectedMetric = data.metric;
    }
    this.metricSummary.updateSummary();


  }

  public drillDown(values){
    var state;
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
                    //console.log(FilterValues)
                    for (var [key, value] of FilterValues.entries()) {
                      if(key == "States"){
                        state = value
                      }
                      if(key == "Datum"){
                        if(value.includes("XXXX")){
                          value = value.replace("XXXX", 2020)
                        }
                        this.unitedStatesMap.date = value;
                        this.metricSummary.date = value;
                      }
                      if(key == "Data"){
                        this.unitedStatesMap.metric = value;
                        this.metricSummary.selectedMetric = value;
                      }
                      this.unitedStatesMap.removeExistingMapFromParent();
                      this.unitedStatesMap.updateMap()
                      this.metricSummary.updateSummary();
                    }
                    this.router.navigate(['unitedstates/' + this.unitedStatesMap.metric + "/" + this.unitedStatesMap.date + "/" + this.unitedStatesMap.userID + "/" + this.unitedStatesMap.treatment]);
    this.unitedStatesMap.select(state[0].replace(" ", "_"))
  }

  public filterDashboard(values){
    //console.log(this.router.url)
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
                    //console.log(FilterValues)
                    var flag = false
                    for (var [key, value] of FilterValues.entries()) {
                      if(key == "Datum"){
                        flag = true
                        if(value.includes("XXXX")){
                          value = value.replace("XXXX", 2020)
                        }
                        this.unitedStatesMap.date = value;
                        this.metricSummary.date = value;
                      }
                      if(key == "Data"){
                        flag = true;
                        this.unitedStatesMap.metric = value;
                        this.metricSummary.selectedMetric = value;
                      }
                    }
                    if(flag){
                      this.router.navigate(['unitedstates/' + this.unitedStatesMap.metric + "/" + this.unitedStatesMap.date + "/" + this.unitedStatesMap.userID + "/" + this.unitedStatesMap.treatment]);
                    }
                    for (var [key, value] of FilterValues.entries()) {
                      if(key == "States"){
                        this.unitedStatesMap.statesSelect = value;
                        this.metricSummary.selectedState = value;
                      }
                    }
                    this.unitedStatesMap.removeExistingMapFromParent();
                    this.unitedStatesMap.updateMap()
                    this.metricSummary.updateSummary();
                    


  }

  openInfo() {
    $(".popup-overlay, .popup-content").addClass("active");
  }

  closeInfo() {
    $(".popup-overlay, .popup-content").removeClass("active");
  }

  public getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}

 
