import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FollowsComponent } from './follows';

@NgModule({
  declarations: [
    FollowsComponent,
  ],
  imports: [
    IonicPageModule.forChild(FollowsComponent),
  ],
})
export class FollowsModule {}
