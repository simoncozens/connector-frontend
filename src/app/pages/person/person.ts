import { Component, OnInit } from '@angular/core';
import { Person, Affiliation, FieldPermissions } from '../../classes/person';
import { PersonService } from '../../services/person.service';
import { OfflinePersonService } from '../../services/offline.person.service';
import { NavController, NavParams, IonicPage, Platform, ToastController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

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
    public toastCtrl: ToastController,
    private camera: Camera
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

  public me():Person { return this.auth.loggedInUser() }

  public canAddToMyNetwork() :boolean {
    var network = this.me().catalyst;
    if (!network) { return false; }
    // Are they already in?
    if (this.person.experience && this.person.experience.indexOf(network) >-1) { return false; }
    return true;
  }

  public addToMyNetwork() {
    this.personService.addToNetwork(this.person.id).then(() => {
      var network = this.me().catalyst;
      if (!this.person.experience) { this.person.experience = [] }
      this.person.experience.push(network)
    }).catch( (e) => this.dammit(e));
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

  takePicture() {
    if (!this.editing) return;
    if (!this.platform.is('cordova')) return;
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      quality: 50,
      targetHeight: 200, // We'll square-crop it on the backend
      targetWidth: 200,
      correctOrientation: true,
      cameraDirection: this.camera.Direction.FRONT
    };
    this.camera.getPicture(options).then((imageData) => {
      imageData = "data:image/jpeg;base64,"+imageData;
      this.person.picture = imageData;
      return this.save(true)
    });
  }

  addContact(): void {
    console.log("Add contact")
    if (this.platform.is('cordova')) {
      let contact: Contact = this.personToContact(this.person)
      contact.save().then(
        () => console.log('Contact saved!', contact),
        (error: any) => console.error('Error saving contact.', error)
      );
    } else {
      var vcf = this.personToVcard(this.person);
        var blob = new Blob([vcf], {
          type: 'text/vcard'
        });
        console.log("I gotta blob!")
        var downloadUrl= window.URL.createObjectURL(blob);
        window.location.href = downloadUrl;
      }
  }

  private personToVcard(person: Person) {
    var vcf= `BEGIN:VCARD
VERSION:3.0
N:${person.name}
FN:${person.name}
ORG:${person.affiliations[0] && person.affiliations[0].organisation}
EMAIL;type=INTERNET;type=WORK;type=pref:${person.email}
TEL;type=pref:${person.phone}
`;

    if (person.skype_id) {
      vcf = vcf + `IMPP;TYPE=home;PREF=1:skype:${person.skype_id}\n`
    }
    if (person.facebook_id) {
      vcf = vcf+ `X-SOCIALPROFILE;type=facebook;x-displayname=${person.name}:https://www.facebook.com/profile.php?id=${person.facebook_id}\n`
    }

    if (person.twitter_id) {
      vcf = vcf+ `X-SOCIALPROFILE;type=twitter;x-displayname=${person.twitter_id}:https://www.twitter.com/${person.twitter_id}\n`
    }

    if (person.linkedin_id) {
      vcf = vcf+ `X-SOCIALPROFILE;type=linkedin;x-displayname=${person.linkedin_id}:https://www.linkedin.com/${person.linkedin_id}\n`
    }
    if (person.picture) {
      var pic = person.picture.replace(/^.*?image\/([^;]+).*?,/, "ENCODING=b;TYPE=$1:")
      vcf = vcf+ `PHOTO;${pic}\n`;
    }

    vcf = vcf+"END:VCARD\n"
    return vcf;
  }

  private personToContact(person: Person) {
    let contact: Contact = this.contacts.create();
    contact.displayName = person.name;
    contact.nickName = person.name;
    contact.name = new ContactName();
    contact.name.formatted = person.name;
    contact.emails = [new ContactField('home', person.email)];
    if (person.phone) {
      contact.phoneNumbers = [new ContactField('mobile', person.phone)];
    }
    contact.organizations = []
    for (var o of person.affiliations) {
      contact.organizations.push({ name: o.organisation, title: o.position })
    }
    contact.ims = []
    person.skype_id && contact.ims.push(new ContactField("skype", person.skype_id));
    person.twitter_id && contact.ims.push(new ContactField("twitter", person.twitter_id));
    person.facebook_id && contact.ims.push(new ContactField("facebook", person.facebook_id));
    contact.addresses =[
      {locality: person.city, country: person.country}
    ]
    return contact;
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

  save(sendPicture?) {
    var toSave = this.person
    if (!sendPicture) { // Save space and processing
      toSave = Object.assign({}, this.person);
      delete toSave["person"]
    }
    this.personService.saveProfile(toSave).then(
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
  
  dammit(e) {
    console.log(e);
    const alert = this.alertCtrl.create({
      title: 'Something went wrong',
      subTitle: 'Error' + JSON.stringify(e),
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
