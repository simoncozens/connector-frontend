import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecommendedComponent } from './recommended';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RecommendedComponent,
  ],
  imports: [
    IonicPageModule.forChild(RecommendedComponent),
    PipesModule
  ],
})
export class RecommendedModule {}
