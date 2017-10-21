import { Component, OnInit, Input } from '@angular/core';
import { Person } from '../../classes/person';
import { Platform } from 'ionic-angular';
import { PersonService } from '../../services/person.service';
import { OfflinePersonService } from '../../services/offline.person.service';
import {DomSanitizer} from '@angular/platform-browser';
import { NavParams } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';

import 'rxjs/Rx';

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
    private network: Network,
    private sanitizer:DomSanitizer
  ) {
    if (this.platform.is('cordova')) {
      personService = ops;
    }
  }
  ngOnInit(): void {
    this.personService.getPerson(this.navParams.get('id'))
        .then((person: Person) => {
          this.person = person
          this.annotation = person.annotation && person.annotation.content
        })
        .catch((error) => console.log(error));
  }

  sanitize(url:string){return this.sanitizer.bypassSecurityTrustUrl(url); }

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
    this.personService.annotate(this.person.id, this.annotation)
  }

  addContact(): void {
    console.log("Add contact")
    if (this.platform.is('cordova')) {
      let contact: Contact = this.contacts.create();
      contact.name = new ContactName(null, 'Smith', 'John');
      contact.phoneNumbers = [new ContactField('mobile', '6471234567')];
      contact.save().then(
        () => console.log('Contact saved!', contact),
        (error: any) => console.error('Error saving contact.', error)
      );
    } else {
        var vcf = `BEGIN:VCARD
VERSION:3.0
N:Doe;John;;;
FN:John Doe
ORG:Example.com Inc.;
TITLE:Imaginary test person
EMAIL;type=INTERNET;type=WORK;type=pref:johnDoe@example.org
TEL;type=WORK;type=pref:+1 617 555 1212
TEL;type=WORK:+1 (617) 555-1234
TEL;type=CELL:+1 781 555 1212
TEL;type=HOME:+1 202 555 1212
item1.ADR;type=WORK:;;2 Enterprise Avenue;Worktown;NY;01111;USA
item1.X-ABADR:us
item2.ADR;type=HOME;type=pref:;;3 Acacia Avenue;Hoemtown;MA;02222;USA
item2.X-ABADR:us
NOTE:John Doe has a long and varied history\, being documented on more police files that anyone else. Reports of his death are alas numerous.
item3.URL;type=pref:http\://www.example/com/doe
item3.X-ABLabel:_$!<HomePage>!$_
item4.URL:http\://www.example.com/Joe/foaf.df
item4.X-ABLabel:FOAF
item5.X-ABRELATEDNAMES;type=pref:Jane Doe
item5.X-ABLabel:_$!<Friend>!$_
CATEGORIES:Work,Test group
X-ABUID:5AD380FD-B2DE-4261-BA99-DE1D1DB52FBE\:ABPerson
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
