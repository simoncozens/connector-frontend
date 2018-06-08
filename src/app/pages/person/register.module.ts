import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterComponent } from './register';
import { MomentModule } from 'angular2-moment';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RegisterComponent,
  ],
  imports: [
    IonicPageModule.forChild(RegisterComponent),
    TranslateModule,
    MomentModule,
    PipesModule
  ],
})
export class RegisterModule {}
