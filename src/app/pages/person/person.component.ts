import { Component, OnInit, Input } from '@angular/core';
import { Person } from '../../classes/person';
import { Platform } from 'ionic-angular';
import { PersonService } from '../../services/person.service';
import { OfflinePersonService } from '../../services/offline.person.service';
import {DomSanitizer} from '@angular/platform-browser';
import { NavParams } from 'ionic-angular';

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
    public platform: Platform,
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
}
