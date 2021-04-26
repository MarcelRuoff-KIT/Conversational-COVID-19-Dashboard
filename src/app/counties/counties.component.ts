import { Component, OnInit, AfterViewInit, OnDestroy, AfterContentInit, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CountiesMapComponent } from '../counties-map/counties-map.component';
import { MetricSummaryComponent } from '../metric-summary/metric-summary.component';
import * as $ from "jquery";
import { DrillDownService } from "../shared/drilldown.services";


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
  @ViewChild("botWindow", {static: true}) botWindowElement: ElementRef;

  refreshInterval;
  treatment;
  task;
  selectedState = "United States";
  metric = "Cases";
  scale = "Sqrrt";
  type = "Filled";
  tab = "Totals";
  date = "";
  userID;
  currentTime;  
  public componentAction = null;
  public componentMessage = null;
  public messengerID = null;

  private _routerSub = Subscription.EMPTY;

  constructor(public router: Router, private drillDownService: DrillDownService, public route: ActivatedRoute) { 

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

          if (this.route.snapshot.params['treatment']) {
            this.treatment = this.route.snapshot.params['treatment'];
          }
          else{
            this.treatment = "0";
          }

          if (this.route.snapshot.params['task']) {
            this.task = this.route.snapshot.params['task'];
          }
          else{
            this.task = "0";
          }


        });

      });
    });

  }

  async ngOnInit() {
    //console.log("Cookie: " + document.cookie)
    //console.log(this.getCookie("conversationID"))
    this.currentTime = new Date()
    try{
      this.messengerID = sessionStorage.getItem('conversationID')
    }
    catch (e) {
      this.drillDownService.post(this.userID, this.task, this.treatment, "CatchException", null, {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);
    }

    if(this.messengerID != null){
      //console.log(new Date())
      var conversationID = sessionStorage.getItem('conversationID')
      var directLine = window.WebChat.createDirectLine({
        secret: "Ye6XyojNens.RBOseW23O3THiyjuLJXpafIUmLzAS70KJRv2pono0_A",
        conversationId: conversationID,
        webSocket: false
    });
  }
  else{
    var directLine = window.WebChat.createDirectLine({
      secret: "Ye6XyojNens.RBOseW23O3THiyjuLJXpafIUmLzAS70KJRv2pono0_A",
      webSocket: false
      });
    }

    async function createHybridPonyfillFactory() {
      const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({ credentials: {
        region: 'eastus',
        subscriptionKey: '08c0fdef029e44a8a2893676f6f1035c'
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

if(this.treatment != 4 && this.treatment != 5){

  this.drillDownService.post(this.userID, this.task, this.treatment, "Webchat", null, {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);

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
          directLine: directLine,
          styleOptions: {
                        botAvatarBackgroundColor: 'rgba(0, 0, 0)',
                        hideUploadButton: true,
                        bubbleBackground: 'rgba(0, 0, 255, .1)',
                        bubbleFromUserBackground: 'rgba(0, 255, 0, .1)',
                        sendBoxButtonColor: 'rgba(255,153, 0, 1)',
                        sendBoxButtonColorOnFocus: 'rgba(255,153, 0, 1)',
                        sendBoxButtonColorOnHover: 'rgba(255,153, 0, 1)',
                        hideScrollToEndButton: true,
                        bubbleMinHeight: 0,
                        bubbleMaxWidth: 600,
                    },
                    webSpeechPonyfillFactory: await createHybridPonyfillFactory(),
                    locale: 'en-US', 
                    store,
                    overrideLocalizedStrings: {
                      TEXT_INPUT_PLACEHOLDER: 'Click on the microphone and speak OR type ...'
                    }

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
          
          id => {if(sessionStorage.getItem('conversationID') == null) {
                    sessionStorage.setItem('conversationID', directLine.conversationId);
                }
        },
          error => console.log(`Error posting activity ${error}`)
      );
}
  
  }

  ngOnDestroy() {
    this.currentTime = new Date(8640000000000000);
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    window.removeEventListener("message", this.messageHandler.bind(this), false);


  }

  initialize() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {

      
    switch(this.treatment) {
      case '0':
        //console.log("Treatment: " + this.treatment)
        break;
      case '1':
        //console.log("Treatment: " + this.treatment)
        break;
      case '2':
        //console.log("Treatment: " + this.treatment)
        document.getElementById("hallo").style.zIndex = '100';
        document.getElementById("infoButton").style.display = 'none';
        document.getElementById("backButton").style.display = 'none';
        break;
      case '3':
        //console.log("Treatment: " + this.treatment)
        document.getElementById("hallo").style.zIndex = '100';
        document.getElementById("infoButton").style.display = 'none';
        document.getElementById("backButton").style.display = 'none';
        break;
      case '4':
        //console.log("Treatment: " + this.treatment)
        document.getElementById("botWin").style.display = 'none';
        break;
      case '5':
        //console.log("Treatment: " + this.treatment)
        document.getElementById("botWin").style.display = 'none';
        break;
    }
    
    document.querySelectorAll('#botWin > div > div > div > div > button > svg')[0].setAttribute('height', '65');
    document.querySelectorAll('#botWin > div > div > div > div > button > svg')[0].setAttribute('width', '65');
    //document.querySelectorAll('#botWin > div > div > div > div > button > svg')[0].setAttribute('style', 'padding-right: 20px');
    }, 1000);

  }

  public ngAfterViewInit(): void {

    if(this.treatment != 4 && this.treatment != 5){
      window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
      }
    window.addEventListener('message', this.messageHandler.bind(this));

    document.getElementById("overlay").addEventListener("click", function() {
      $(".popup-overlay, .popup-content").removeClass("active");
    });

    document.getElementById("content").addEventListener("click", function() {
      $(".popup-overlay, .popup-content").removeClass("active");
    });


    
  }





  ngAfterContentInit() {
    this.initialize();
  }

  navigateLeft() {
    this.drillDownService.post(this.userID, this.task, this.treatment, "Zoom Out", [], {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);

    this.router.navigateByUrl('/unitedstates' +  "/" + this.countiesMap.metric + "/" + this.countiesMap.date + '/' + this.countiesMap.userID  + '/' + this.countiesMap.treatment + "/" + this.countiesMap.task);
  }

  openInfo() {
    if(this.treatment == 0 || this.treatment == 1){
      $("#infoPic").attr("src", "../../assets/images/info.jpg");
    }
    else if(this.treatment ==4 || this.treatment == 5){
      $("#infoPic").attr("src", "../../assets/images/info_Mouse.jpg");
    }
    $(".popup-overlay, .popup-content").addClass("active");
    this.drillDownService.post(this.userID, this.task, this.treatment, "Help", null, {site: "UnitedStates", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);

  }

  closeInfo() {
    $(".popup-overlay, .popup-content").removeClass("active");
    this.drillDownService.post(this.userID, this.task, this.treatment, "Close Help", null, {site: "UnitedStates", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);

  }

  dateChanged(data) {
    //console.log("dateChangeCO")

    if (data.date) {
      this.metricSummary.date = data.date;
    }
    if(data.metric){
      this.metricSummary.selectedMetric = data.metric
    }
    this.metricSummary.updateSummary();
  }

  public filterDashboard(values) {
    this.drillDownService.post(this.userID, this.task, this.treatment, "Filter", values, {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 1);

    //console.log(this.router.url)
    var FilterValues = new Map();
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
                        this.countiesMap.selectedState = value[0];
                        this.metricSummary.selectedState = value;
                      }
                      if(key == "Datum"){
                        if(value.includes("XXXX")){
                          value = value.replace("XXXX", 2020)
                        }
                        this.countiesMap.date = value;
                        this.metricSummary.date = value;
                      }
                      if(key == "Data"){
                        this.countiesMap.metric = value;
                        this.metricSummary.selectedMetric = value;
                      }
                      this.countiesMap.removeExistingMapFromParent();
                      this.countiesMap.updateMap(false)
                      this.metricSummary.updateSummary();
                    }
    this.router.navigateByUrl("/counties/" + this.countiesMap.selectedState + "/" + this.countiesMap.metric + "/" + this.countiesMap.date + '/' + this.userID  + '/' + this.treatment + "/" + this.task);
  }


  public webChatHandler (event){
    var sheight = document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollHeight;
    document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollTo({left: 0, top:sheight, behavior: 'auto'});
      if (this.router.url.includes("counties") && (new Date((<any>event).data.timestamp) >= this.currentTime)) {  //
        if((<any>event).data.type == 'event'){
          if((<any>event).data.timestamp != this.componentAction){  
            this.componentAction = (<any>event).data.timestamp;
            //display seed change by adding branch
            if ((<any>event).data.name == "Filter" && (<any>event).data.value != null) {
                this.filterDashboard((<any>event).data.value);
            }
            else if ((<any>event).data.name == "DrillDown" && (<any>event).data.value != null){

              this.filterDashboard((<any>event).data.value);
          }
          else if((<any>event).data.name == "Overview"){
            this.navigateLeft()
          }
          else if((<any>event).data.name == "Help"){
            this.drillDownService.post(this.userID, this.task, this.treatment, "Help", [], {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 1);
          }
        }
      }
      else if((<any>event).data.type == 'message' && (<any>event).data.from.name != 'SpeechQuestionBot'){
        if((<any>event).data.channelData.clientTimestamp != this.componentMessage){ 
          this.componentMessage = (<any>event).data.channelData.clientTimestamp;
          if((<any>event).data.channelData.speech != null){
            console.log("speech");
            this.drillDownService.postSpeech(this.userID, this.task, this.treatment, 1, (<any>event).data.text, "Counties");
          }
          else{
            console.log("nospeech");
            this.drillDownService.postSpeech(this.userID, this.task, this.treatment, 0, (<any>event).data.text, "Counties");
          }
        }
      }
      }
  
}

public messageHandler(event) {
        
  console.log(event.origin)
  if ("https://iism-im-survey.iism.kit.edu" != event.origin)
    return;
  const { action, value } = event.data
  if((this.router.url.includes("counties")) && (action == 'end') && (new Date() >= this.currentTime)) {
    this.drillDownService.post(this.userID, this.task, this.treatment, "Task Ended", value, {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);
  }
  else if ((this.router.url.includes("counties")) && (action == 'start') && (sessionStorage.getItem('taskNr') != value) && (new Date() >= this.currentTime)){
    this.drillDownService.post(this.userID, this.task, this.treatment, "Task Started", value, {site: "Counties", metric: this.countiesMap.metric, date: this.countiesMap.date, statesSelected: this.countiesMap.selectedState}, 0);

    this.countiesMap.task = value
    sessionStorage.setItem('taskNr', value);
    this.router.navigate(['unitedstates/Total Cases/2020-12-02/' + this.countiesMap.userID + "/" + this.countiesMap.treatment + "/" + value])

    this.metricSummary.selectedState = [];
    this.metricSummary.selectedMetric = "Total Cases";
    this.metricSummary.date = "2020-12-02";

    this.metricSummary.updateSummary();
    
  }
}

  
}

