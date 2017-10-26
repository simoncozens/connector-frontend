import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecentComponent } from './recent';

@NgModule({
  declarations: [
    RecentComponent,
  ],
  imports: [
    IonicPageModule.forChild(RecentComponent),
  ],
})
export class RecentModule {}
