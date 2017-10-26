import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InboxComponent } from './inbox';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    InboxComponent,
  ],
  imports: [
    IonicPageModule.forChild(InboxComponent),
    MomentModule,
  ],
})
export class InboxModule {}
