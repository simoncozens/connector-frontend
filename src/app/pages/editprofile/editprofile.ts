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

}
