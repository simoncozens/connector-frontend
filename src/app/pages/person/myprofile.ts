import { PersonComponent } from './person';
import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Person } from '../../classes/person';

@IonicPage({
  name: "myprofile",
  segment: "myprofile"
  })
@Component({
  selector: 'myprofile',
  templateUrl: './person.component.html'
})
export class MyProfileComponent extends PersonComponent {
  ngOnInit(): void {
    this.personService.getPerson(this.auth.myId())
        .then((person: Person) => {
          this.person = person
          this.isMe = true
          this.annotation = person.annotation
        })
        .catch((error) => console.log(error));
  }
}
