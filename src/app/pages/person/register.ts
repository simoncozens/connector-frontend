import { PersonComponent } from './person';
import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Person } from '../../classes/person';

@IonicPage({
  name: "register",
  segment: "register"
  })
@Component({
  selector: 'register',
  templateUrl: './person.component.html'
})
export class RegisterComponent extends PersonComponent {
  ngOnInit(): void {
    this.person = {} as Person;
    this.person.roles = [];
    this.person.events = [];
    this.person.experience = [];
    this.person.regions = [];
    this.person.affiliations = [];
    this.isMe = false;
    this.editing = true;
    this.admin = this.auth.adminUser();
  }
  sendSave(toSave) :Promise<any>{
    return this.personService.registerUser(toSave)
  }
}
