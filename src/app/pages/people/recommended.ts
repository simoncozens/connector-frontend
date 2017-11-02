import { Component, OnInit, Input } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';

import { PeopleComponent } from './people';

@IonicPage({
  name: "recommended",
  segment: "recommended"
  })
@Component({
  selector : 'recommended',
  templateUrl: './people.component.html'
})
export class RecommendedComponent extends PeopleComponent {
  getPeople() {
    return this.personService.getRecommended(this._page)
        .then(result => this.addMorePeople(result),
          error => this.dammit(error));
  }
}
