import { Component, ElementRef, OnInit,  NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { trigger, transition, query, style, animate } from '@angular/animations';
import { slideInAnimation } from './animation';
import { DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { RouterOutlet } from '@angular/router';
import { formatDate } from '@angular/common';
import { Location } from '@angular/common';
import { Subscription } from "rxjs";
import {
  tap,
  catchError,
  finalize,
  filter,
  delay
} from "rxjs/operators";


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideInAnimation
  ]
})
export class AppComponent implements OnInit {
  public selected;
  public expanded = true;
  public isAuthorized = true;
  public componentReference;
  hostElement; // Native element hosting the SVG container


  scale = "Sqrrt";
  type = "Filled";
  metric = "Total Cases";
  dateMin = "2020-01-21";
  dateMax;
  tab = "Totals";

  public typeButtons = [{
    text: "Filled",
    selected: true
  },
  {
    text: "Bubble"
  }
  ];

  private _routerSub = Subscription.EMPTY;

  @ViewChild('drawer') drawer;
  @ViewChild('navmenu') navmenu;

  

  date = formatDate(new Date().setDate(new Date().getDate() - 1), 'yyyy-MM-dd', 'en');

  public items: Array<any> = [
    { text: 'Cases', icon: 'place', path: '/unitedstates/Filled/Sqrrt/Total Cases/' + this.date  + '/Totals' },
    { text: 'Daily Cases', icon: 'place', path: '/unitedstates/Filled/Sqrrt/Daily Cases/' + this.date + '/Daily' },
    { text: 'Deaths', icon: 'warning', path: '/unitedstates/Filled/Sqrrt/Total Deaths/' + this.date + '/Totals'},
    { text: 'Daily Deaths', icon: 'warning', path: '/unitedstates/Filled/Sqrrt/Daily Deaths/' + this.date + '/Daily' },
    { text: 'About', icon: 'contact_mail', path: '/about' },

  ];

  public onSelect(ev: DrawerSelectEvent): void {
    this.selected = ev.item.text;
  }

  public switchExpanded(): void {
    this.drawer.toggle();
  }

  constructor(
    private elRef: ElementRef,
    private router: Router,
    private ngZone: NgZone,
    public route: ActivatedRoute,
    private location: Location
    ) 
    { 
      this.location = location;
    this.hostElement = this.elRef.nativeElement;

    this._routerSub = router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.route.params.subscribe(params => {

          if (this.route.snapshot.params['selectedType']) {
            this.type = this.route.snapshot.params['selectedType'];
          }

          if (this.route.snapshot.params['selectedScale']) {
            this.scale = this.route.snapshot.params['selectedScale'];
          }

          if (this.route.snapshot.params['selectedMetric']) {
            this.metric = this.route.snapshot.params['selectedMetric'];
          }

          if (this.route.snapshot.params['selectedDate']) {
            this.date = this.route.snapshot.params['selectedDate'];
          }

          if (this.route.snapshot.params['selectedTab']) {
            this.tab = this.route.snapshot.params['selectedTab'];
          }

          // Go to homepage defulat
          if (this.router.url === "/") {
            this.location.go('unitedstates/' + this.type + '/' + this.scale + '/' + this.metric + "/" + this.date + "/" + this.tab);
          }


        });
      });
    }

  public ngOnInit(): void {
    
  }



  public getRouterOutletState(outlet) {
    return true;
  }

  navigate(path) {
    this.ngZone.run(() => {
      this.router.navigate([path]);
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  onActivate(componentReference) {
    console.log(componentReference)
    this.componentReference = componentReference;

    //Below will subscribe to the searchItem emitter
    //componentReference.loginEvent.subscribe((data) => {
    //  // Will receive the data from child here
    //  //this.login();
    //  this.navmenu.login();
    //});
  }


}
