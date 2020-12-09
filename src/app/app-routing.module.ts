import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnitedStatesComponent } from './unitedstates/unitedstates.component';
import { CountiesComponent } from './counties/counties.component';

const routes: Routes = [
  { path: 'counties/:selectedState/:selectedMetric/:selectedDate/:userID', component: CountiesComponent },
  { path: 'unitedstates/:selectedMetric/:selectedDate/:userID', component: UnitedStatesComponent },
  { path: '', component: UnitedStatesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
