import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ViewChild } from '@angular/core';
import { UnitedStatesMapComponent } from '../unitedstates-map/unitedstates-map.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MetricSummaryComponent } from '../metric-summary/metric-summary.component';
import { DrillDownService } from "../shared/drilldown.services";
import { ValueAxisComponent } from '@progress/kendo-angular-charts';

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
  refreshInterval;
  public metric = "Total Cases";
  public userID;
  public currentTime;
  public directLine;
  public treatment;
  public task;
  public store;
  public componentAction = null;
  public componentMessage = null;
  public messengerID = null;
  
  constructor(
    private router: Router, 
    public route: ActivatedRoute,     
    private drillDownService: DrillDownService,
    ) {

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

        if (this.route.snapshot.params['task']) {
          this.task = this.route.snapshot.params['task'];
        }
        else{
          this.task = "0";
        }
      });
    });

  }

  async ngOnInit() {

    this.currentTime = new Date()

    try{
      this.messengerID = sessionStorage.getItem('conversationID')
    }
    catch (e) {
      this.drillDownService.post(this.userID, this.task, this.treatment, "CatchException", null, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 0);
   }

    if(this.messengerID != null){
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



this.store = window.WebChat.createStore(
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

if(this.treatment != 4 && this.treatment != 5){
  this.drillDownService.post(this.userID, this.task, this.treatment, "Webchat", null, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 0);

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
                        sendBoxHeight: 70,
                        bubbleMinHeight: 0,
                        bubbleMaxWidth: 600,
                    },
                    webSpeechPonyfillFactory: await createHybridPonyfillFactory(),
                    locale: 'en-US', 
                    store: this.store,
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
              console.log(sessionStorage.getItem('conversationID'));
            };},
    error => console.log(`Error posting activity ${error}`)
);

}
}

  ngOnDestroy() {
    this.currentTime = new Date(8640000000000000);
    this.directLine = null;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    window.removeEventListener("message", this.messageHandler.bind(this), false);
    this.store = null;
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

          break;
        case '3':
          //console.log("Treatment: " + this.treatment)
          document.getElementById("hallo").style.zIndex = '100';
          document.getElementById("infoButton").style.display = 'none';
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
      document.querySelectorAll('#botWin > div > div > div > div > button > svg')[0].setAttribute('style', 'padding-right: 20px');
    }, 1000);

  }

  public ngAfterViewInit(): void {

    this.router.navigate(['unitedstates/' + this.unitedStatesMap.metric + "/" + this.unitedStatesMap.date + "/" + this.unitedStatesMap.userID + "/" + this.unitedStatesMap.treatment + "/" + this.unitedStatesMap.task])

    if(this.treatment != 4 && this.treatment != 5){
    window.addEventListener('webchatincomingactivity', this.webChatHandler.bind(this));
    }
    window.addEventListener("message", this.messageHandler.bind(this), false);
    

    document.getElementById("overlay").addEventListener("click", function() {
      $(".popup-overlay, .popup-content").removeClass("active");
    });

    document.getElementById("content").addEventListener("click", function() {
      $(".popup-overlay, .popup-content").removeClass("active");
    });


  }

  public ngAfterContentInit() {
    this.initialize();
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
                    this.router.navigate(['unitedstates/' + this.unitedStatesMap.metric + "/" + this.unitedStatesMap.date + "/" + this.unitedStatesMap.userID + "/" + this.unitedStatesMap.treatment + "/" + this.unitedStatesMap.task]);
    this.unitedStatesMap.select(state[0].replace(" ", "_"))
  }

  public filterDashboard(values){
    console.log("filterUS")

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
                        //this.unitedStatesMap.value = value;
                        this.metricSummary.date = value;
                      }
                      if(key == "Data"){
                        flag = true;
                        this.unitedStatesMap.metric = value;
                        this.metricSummary.selectedMetric = value;
                      }
                    }
                    if(flag){
                      this.router.navigate(['unitedstates/' + this.unitedStatesMap.metric + "/" + this.unitedStatesMap.date + "/" + this.unitedStatesMap.userID + "/" + this.unitedStatesMap.treatment + "/" + this.unitedStatesMap.task]);
                      this.metricSummary.selectedState = this.unitedStatesMap.statesSelect;

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
    if(this.treatment == 0 || this.treatment == 1){
      $("#infoPic").attr("src", "../../assets/images/info.jpg");
    }
    else if(this.treatment ==4 || this.treatment == 5){
      $("#infoPic").attr("src", "../../assets/images/info_Mouse.jpg");
    }
    $(".popup-overlay, .popup-content").addClass("active");
    this.drillDownService.post(this.userID, this.task, this.treatment, "Help", null, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 0);
  }

  closeInfo() {
    $(".popup-overlay, .popup-content").removeClass("active");
    this.drillDownService.post(this.userID, this.task, this.treatment, "Close Help", null, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 0);

  }


  public webChatHandler (event){
    var sheight = document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollHeight;
    document.querySelectorAll("[class$=webchat__basic-transcript__scrollable]")[0].scrollTo({left: 0, top:sheight, behavior: 'auto'});
      if ((this.router.url.includes("unitedstates") || this.router.url == "/") && (new Date((<any>event).data.timestamp) >= this.currentTime)) {  //
        if((<any>event).data.type == 'event'){
          if((<any>event).data.timestamp != this.componentAction){  
            this.componentAction = (<any>event).data.timestamp;
          //display seed change by adding branch
          if ((<any>event).data.name == "Filter" && (<any>event).data.value != null) {
              this.drillDownService.post(this.userID, this.task, this.treatment, "Filter", (<any>event).data.value, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 1);

              //console.log((<any>event).data.value)
              this.filterDashboard((<any>event).data.value);
          }
          else if ((<any>event).data.name == "DrillDown" && (<any>event).data.value != null){
            this.drillDownService.post(this.userID, this.task, this.treatment, "Drilldown", {Target: (<any>event).data.value}, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 1);

            //console.log((<any>event).data.value)
            this.drillDown((<any>event).data.value);
          }
          else if((<any>event).data.name == "Help"){
            this.drillDownService.post(this.userID, this.task, this.treatment, "Help", [], {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 1);
          }
        }
      }
      else if((<any>event).data.type == 'message' && (<any>event).data.from.name != 'SpeechQuestionBot'){
        if((<any>event).data.channelData.clientTimestamp != this.componentMessage){ 
          this.componentMessage = (<any>event).data.channelData.clientTimestamp;
          if((<any>event).data.channelData.speech != null){
            console.log("speech");
            this.drillDownService.postSpeech(this.userID, this.task, this.treatment, 1, (<any>event).data.text, "State");
          }
          else{
            console.log("nospeech");
            this.drillDownService.postSpeech(this.userID, this.task, this.treatment, 0, (<any>event).data.text, "State");
          }
        }
      }
      }
  
}

  public messageHandler(event) {
        
    if ("https://iism-im-survey.iism.kit.edu" != event.origin)
      return;
    const { action, value } = event.data
    if((this.router.url.includes("unitedstates") || this.router.url == "/") && (action == 'end') && (new Date() >= this.currentTime)) {
      this.drillDownService.post(this.userID, this.task, this.treatment, "Task Ended", value, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 0);
    }
    else if ((this.router.url.includes("unitedstates") || this.router.url == "/") && (action == 'start') && (sessionStorage.getItem('taskNr') != value) && (new Date() >= this.currentTime)){
      this.reload(value)
    }
  }

  public reload(value){
    this.drillDownService.post(this.userID, this.task, this.treatment, "Task Started", value, {site: "UnitedStates", metric: this.unitedStatesMap.metric, date: this.unitedStatesMap.date, statesSelected: this.unitedStatesMap.statesSelect}, 0);
      this.unitedStatesMap.task = value
      sessionStorage.setItem('taskNr', value);

      this.router.navigate(['/unitedstates/Total Cases/2020-12-02/' + this.unitedStatesMap.userID  + '/' + this.unitedStatesMap.treatment + "/" + value]);


      this.unitedStatesMap.metric = "Total Cases"
      this.unitedStatesMap.date = "2020-12-02"
      this.unitedStatesMap.statesSelect = [];
      this.metricSummary.selectedState = [];
      this.metricSummary.selectedMetric = "Total Cases";
      this.metricSummary.date = "2020-12-02";
      this.unitedStatesMap.removeExistingMapFromParent();
      this.unitedStatesMap.updateMap()
      this.metricSummary.updateSummary();
  }
}

 
