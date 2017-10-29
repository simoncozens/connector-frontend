import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FollowsComponent } from './follows';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    FollowsComponent,
  ],
  imports: [
    IonicPageModule.forChild(FollowsComponent),
    PipesModule
  ],
})
export class FollowsModule {}
