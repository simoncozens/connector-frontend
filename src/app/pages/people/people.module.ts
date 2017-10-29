import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PeopleComponent } from './people';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    PeopleComponent,
  ],
  imports: [
    IonicPageModule.forChild(PeopleComponent),
    PipesModule
  ],
})
export class PeopleModule {}
