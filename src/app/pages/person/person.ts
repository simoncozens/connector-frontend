import { Component, OnInit } from '@angular/core';
import { Person, FieldPermissions } from '../../classes/person';
import { PersonService } from '../../services/person.service';
import { OfflinePersonService } from '../../services/offline.person.service';
import { NavController, NavParams, IonicPage, Platform, ToastController, AlertController } from 'ionic-angular';

import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';
import { AuthService } from '../../services/auth.service';
import { picklists } from "../../picklists";

import 'rxjs/Rx';

@IonicPage({
  name: "person",
  segment: "people/:id"
  })
@Component({
  selector: 'person',
  templateUrl: './person.component.html'
})
export class PersonComponent implements OnInit {
  person: Person;
  annotation: string;
  public id;
  public isMe = false;
  public editing = false;
  picklists = picklists;
  social_fields = [
    {name: "Skype", field: "skype_id"},
    {name: "LinkedIn", field: "linkedin_id"},
    {name: "Twitter", field: "twitter_id"},
    {name: "Facebook", field: "facebook_id"},
  ]

  constructor(public personService: PersonService,
    public navParams: NavParams,
    public navCtrl: NavController,
    public auth: AuthService,
    public ops: OfflinePersonService,
    private contacts: Contacts,
    public platform: Platform,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {
    if (this.platform.is('cordova')) {
      this.personService = this.ops;
    }
  }
  ngOnInit(): void {
    this.personService.getPerson(this.navParams.get('id'))
        .then((person: Person) => {
          this.person = person
          this.isMe = person.id == this.auth.myId()
          this.annotation = person.annotation
        })
        .catch((error) => console.log(error));
  }

  follow(): void {
    this.person.followed = true;
    this.personService.follow(this.person.id);
  }
  unfollow(): void {
    this.person.followed = false;
    this.personService.unfollow(this.person.id);
  }
  sendMessage(): void {
    // Needs rewrite for Ionic
    // this.router.navigate(['messages', {'sendTo': this.person.id }])
  }

  saveAnnotation(): void {
    this.personService.annotate(this.person, this.annotation)
  }

  editProfile() {
    this.navCtrl.push("editprofile")
  }

  addContact(): void {
    console.log("Add contact")
    if (this.platform.is('cordova')) {
      let contact: Contact = this.contacts.create();
      contact.displayName = this.person.name;
      contact.nickName = this.person.name;
      contact.name = new ContactName();
      contact.name.formatted = this.person.name;
      contact.emails = [new ContactField('home', this.person.email)];
      contact.save().then(
        () => console.log('Contact saved!', contact),
        (error: any) => console.error('Error saving contact.', error)
      );
    } else {
        var vcf = `BEGIN:VCARD
VERSION:3.0
N:${this.person.name}
FN:${this.person.name}
ORG:${this.person.affiliations[0] && this.person.affiliations[0].organisation}
EMAIL;type=INTERNET;type=WORK;type=pref:${this.person.email}
TEL;type=WORK;type=pref:+1 617 555 1212
TEL;type=WORK:+1 (617) 555-1234
TEL;type=CELL:+1 781 555 1212
TEL;type=HOME:+1 202 555 1212
item1.ADR;type=WORK:;;2 Enterprise Avenue;Worktown;NY;01111;USA
item1.X-ABADR:us
item2.ADR;type=HOME;type=pref:;;3 Acacia Avenue;Hoemtown;MA;02222;USA
item2.X-ABADR:us
item3.URL;type=pref:${this.person.affiliations[0] && this.person.affiliations[0].website}
item3.X-ABLabel:_$!<HomePage>!$_
END:VCARD`
        var blob = new Blob([vcf], {
          type: 'text/vcard'
        });
        console.log("I gotta blob!")
        var downloadUrl= window.URL.createObjectURL(blob);
        window.location.href = downloadUrl;
      }
  }

  /* Editing */
  private _dirty: boolean = false;
  public saveToast;
  public dirty(el?) {
    if (!this._dirty) {
      this.saveToast = this.toastCtrl.create({
          closeButtonText: "Save",
          showCloseButton: true
      })
      this.saveToast.onDidDismiss((data,role) => {
        if (role == "close") {
          this.save()
        }
      })
      this.saveToast.present().then( () => {
        if (el) { el.setFocus(); }
      })
    }
    this._dirty = true;
  }
  clean () {
    this._dirty = false;
    this.saveToast.dismiss({autoclose:true});
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
        this.clean();
        this.editing=false;
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

  killAffiliation(n) {
    this.person.affiliations.splice(n,1);
    this.dirty();
    if (this.person.affiliations.length == 0) {
      this.addAffiliation()
    }
  }

  addAffiliation() {
    this.person.affiliations.push({ organisation:"", position:"", website:"" })
    this.dirty();
  }

  showPermissions(field) { /* No! This should be a select! */
    let alert = this.alertCtrl.create();
    alert.setTitle('Who can view this field?');
    let perms = (this.person.field_permissions || {})[field] || []
    for (var n of ["Everyone", "People at my events", "My Issue Networks"]) {
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
        this.dirty()
      }
    });
    alert.present();
  }
}
