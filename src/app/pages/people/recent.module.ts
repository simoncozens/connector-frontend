import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecentComponent } from './recent';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RecentComponent,
  ],
  imports: [
    IonicPageModule.forChild(RecentComponent),
    PipesModule
  ],
})
export class RecentModule {}
