import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesWithComponent } from './messages-with';
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    MessagesWithComponent,
  ],
  imports: [
    IonicPageModule.forChild(MessagesWithComponent),
    MomentModule,
  ],
})
export class MessagesWithModule {}
