import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UnitedStatesComponent } from './unitedstates/unitedstates.component';
import { UnitedStatesMapComponent} from './unitedstates-map/unitedstates-map.component'
import { CountiesComponent } from './counties/counties.component';
import { CountiesMapComponent } from './counties-map/counties-map.component';
import { MetricSummaryComponent } from './metric-summary/metric-summary.component';
import { DrillDownService } from './shared/drilldown.services';

import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@progress/kendo-angular-layout';
//import { RippleModule } from '@progress/kendo-angular-ripple';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { ChartsModule } from '@progress/kendo-angular-charts';
//import 'hammerjs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
//import { GridModule } from '@progress/kendo-angular-grid';
declare var $: any;






@NgModule({
  declarations: [
    AppComponent,
    UnitedStatesComponent,
    UnitedStatesMapComponent,
    CountiesComponent,
    CountiesMapComponent,
    MetricSummaryComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ButtonsModule,
    LayoutModule,
    //RippleModule,
    InputsModule,
    LabelModule,
    ChartsModule,
    DropDownsModule,
    FormsModule,
    //GridModule 
  ],
  providers: [DrillDownService],
  bootstrap: [AppComponent]
})
export class AppModule { }
