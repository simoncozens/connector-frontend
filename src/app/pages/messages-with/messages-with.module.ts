import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesWithComponent } from './messages-with';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    MessagesWithComponent,
  ],
  imports: [
    IonicPageModule.forChild(MessagesWithComponent),
    MomentModule,
    PipesModule
  ],
})
export class MessagesWithModule {}
