import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyProfileComponent } from './myprofile';
import { MomentModule } from 'angular2-moment';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    MyProfileComponent,
  ],
  imports: [
    IonicPageModule.forChild(MyProfileComponent),
    TranslateModule,
    MomentModule,
    PipesModule
  ],
})
export class MyProfileModule {}
