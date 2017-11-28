import { Component, OnInit, Input } from '@angular/core';
import { Person } from '../../classes/person';
import { Platform } from 'ionic-angular';
import { PersonService } from '../../services/person.service';
import { OfflinePersonService } from '../../services/offline.person.service';
import { NavParams, IonicPage } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';

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
  constructor(private personService: PersonService,
    public navParams: NavParams,
    public ops: OfflinePersonService,
    private contacts: Contacts,
    public platform: Platform,
    private network: Network
  ) {
    if (this.platform.is('cordova')) {
      this.personService = this.ops;
    }
  }
  ngOnInit(): void {
    this.personService.getPerson(this.navParams.get('id'))
        .then((person: Person) => {
          this.person = person
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
}
