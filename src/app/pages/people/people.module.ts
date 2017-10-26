import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PeopleComponent } from './people';

@NgModule({
  declarations: [
    PeopleComponent,
  ],
  imports: [
    IonicPageModule.forChild(PeopleComponent),
  ],
})
export class PeopleModule {}
