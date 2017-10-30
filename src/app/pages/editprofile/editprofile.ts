import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PersonService } from '../../services/person.service';
import { Person, Affiliation, FieldPermissions } from '../../classes/person';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IonicPage, Platform, ToastController, AlertController } from 'ionic-angular';

@IonicPage({
  name: "editprofile",
  segment: "editprofile"
  })
@Component({
  selector: 'login',
  templateUrl: './editprofile.component.html'
})
export class EditProfileComponent implements OnInit {
    public profileForm: FormGroup;

  person: Person;  public alerts: any = [];
  dirty: boolean;

  constructor(public personService: PersonService,
    private _fb: FormBuilder, private auth: AuthService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
    this.person = this.auth.loggedInUser();
    this.dirty = false;
  }
  ngOnInit() {
    const controls = {
          intro_bio: this.person.intro_bio,
          preferred_contact: this.person.preferred_contact,
          affiliations: this._fb.array(
            this.person.affiliations.map(a => this.initAffiliation(a))
          )
    };
    this.profileForm = this._fb.group(controls);
  }

  initAffiliation(a: Affiliation = <Affiliation>{}) {
    return this._fb.group({
        organisation: [a.organisation],
        position: [a.position],
        website: [a.website]
    });
  }

  getAffiliations(profileForm): FormArray {
    return profileForm.get('affiliations').controls;
  }

  save() {
    let value = this.profileForm.getRawValue()
    value.field_permissions = this.person.field_permissions
    this.personService.saveProfile(value).then(
      response => {
        this.person = Object.assign(this.person, value);
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

  showPrefContactRadio() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Preferred method of contact');

    for (var n of ["email", "skype", "whatsapp"]) {
      alert.addInput({
        type: 'radio', label: n, value: n, checked: this.person.preferred_contact == n
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.person.preferred_contact = data
        if (data != this.person.preferred_contact) { this.dirty = true }
      }
    });
    alert.present();
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
