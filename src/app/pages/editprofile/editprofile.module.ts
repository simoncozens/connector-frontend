import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfileComponent } from './editprofile';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    EditProfileComponent,
  ],
  imports: [
    IonicPageModule.forChild(EditProfileComponent),
    PipesModule
  ],
})
export class EditProfileModule {}
