import { Component, OnInit, Input } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';

import { PeopleComponent } from './people';

@IonicPage({
  name: "follows",
  segment: "follows"
  })
@Component({
  selector : 'follows',
  templateUrl: './people.component.html'
})
export class FollowsComponent extends PeopleComponent {
  getPeople() {
    return this.personService.getFollows(this._page)
        .then(result => this.addMorePeople(result),
          error => this.dammit(error));
  }
}
