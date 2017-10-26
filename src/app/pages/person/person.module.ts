import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PersonComponent } from './person';
import { MomentModule } from 'angular2-moment';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PersonComponent,
  ],
  imports: [
    IonicPageModule.forChild(PersonComponent),
    TranslateModule,
    MomentModule,
  ],
})
export class PersonModule {}
