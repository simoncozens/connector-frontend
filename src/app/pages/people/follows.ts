import { Component, OnInit, Input } from '@angular/core';

import { PeopleComponent } from './people';

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
