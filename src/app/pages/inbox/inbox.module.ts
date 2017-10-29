import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InboxComponent } from './inbox';
import { MomentModule } from 'angular2-moment';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    InboxComponent,
  ],
  imports: [
    IonicPageModule.forChild(InboxComponent),
    MomentModule,
    PipesModule
  ],
})
export class InboxModule {}
