import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfileComponent } from './editprofile';

@NgModule({
  declarations: [
    EditProfileComponent,
  ],
  imports: [
    IonicPageModule.forChild(EditProfileComponent),
  ],
})
export class EditProfileModule {}
