import { Component, ViewChild, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PersonService } from '../../services/person.service';
import { Person, Affiliation, FieldPermissions } from '../../classes/person';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IonicPage, Platform, ToastController, AlertController } from 'ionic-angular';
import { picklists } from "../../picklists";

@IonicPage({
  name: "editprofile",
  segment: "editprofile"
  })
@Component({
  selector: 'login',
  templateUrl: './editprofile.component.html'
})
export class EditProfileComponent implements OnInit {
  person: Person;  public alerts: any = [];
  dirty: boolean;
  picklists = picklists;

  constructor(public personService: PersonService,
    private auth: AuthService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
    this.person = this.auth.loggedInUser();
    this.dirty = false;
  }
  ngOnInit() {
  }

  save() {
    this.personService.saveProfile(this.person).then(
      response => {
        this.auth.setLoggedInUser(this.person);
        const toast = this.toastCtrl.create({
            message: 'Saved successfully',
            duration: 3000,
            position: 'bottom'
          });
        toast.present();
        this.dirty=false;
      }
    ).catch(() => {
      const toast = this.toastCtrl.create({
          message: 'Something went wrong',
          duration: 3000,
          position: 'bottom'
        });
      toast.present();
    }

    )
  }

  showPermissions(field) {
    let alert = this.alertCtrl.create();
    alert.setTitle('Who can view this field?');
    let perms = (this.person.field_permissions || {})[field] || []
    for (var n of ["Lausanne Leaders", "YLG", "YLGen"]) {
      alert.addInput({
        type: 'checkbox', label: n, value: n, checked: perms.indexOf(n)>-1
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (!this.person.field_permissions) this.person.field_permissions = {} as FieldPermissions
        this.person.field_permissions[field] = data
        this.dirty = true
      }
    });
    alert.present();
  }
}
