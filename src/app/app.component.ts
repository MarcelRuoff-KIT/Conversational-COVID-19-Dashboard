import { Component, ElementRef, OnInit,  NgZone, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterOutlet } from '@angular/router';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public componentReference;
  hostElement; // Native element hosting the SVG container
  
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private ngZone: NgZone,
    public route: ActivatedRoute,
    ) 
    { 

    this.hostElement = this.elRef.nativeElement;
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
    this.componentReference = componentReference;
  }


}
