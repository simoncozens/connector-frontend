import { Component, OnInit, Input } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';

import { PeopleComponent } from './people';

@IonicPage({
  name: "recent",
  segment: "recent"
  })
@Component({
  selector : 'recent',
  templateUrl: './people.component.html'
})
export class RecentComponent extends PeopleComponent {
  getPeople() {
    return this.personService.getRecent(this._page)
        .then(result => this.addMorePeople(result),
          error => this.dammit(error));
  }
}
