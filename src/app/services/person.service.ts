import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
import { AppSettings } from '../app.settings';
import { PagedResults } from '../classes/pagedresults';

import 'rxjs/add/operator/toPromise';

import { Person } from '../classes/person';

@Injectable()
export class PersonService {
  // Define the routes we are going to interact with
  private peopleListUrl = AppSettings.API_ENDPOINT + '/people.json';
  private personUrl = AppSettings.API_ENDPOINT + '/people/';
  private followUrl = AppSettings.API_ENDPOINT + '/people/following';
  private recentUrl = AppSettings.API_ENDPOINT + '/people/recent';

  constructor(public authHttp: AuthHttp) { }

  getPeople(page: number = 1, params = {}, url = this.peopleListUrl) :Promise<PagedResults<Person>> {
    const myParams: any = Object.assign({'page': page}, params);
    return this.authHttp
      .get(url,
        {method: 'GET',
        params: myParams
        }
      )
      .toPromise()
      .then(response => response.json() as PagedResults<Person>)
      .catch(this.handleError);
  }

  getFollows(page: number = 1) :Promise<PagedResults<Person>> {
    return this.getPeople(page, {}, this.followUrl);
  }
  getRecent(page: number = 1) :Promise<PagedResults<Person>> {
    return this.getPeople(page, {}, this.recentUrl);
  }

  getPerson(id: string): Promise<Person> {
    return this.authHttp
      .get(this.personUrl + id)
      .toPromise()
      .then(response => response.json() as Person)
  }

  follow(id: string) {
    this.authHttp.get(this.personUrl + id + '/follow')
      .toPromise().then( response => {
         var r = response.json()
         if (r["ok"]) { return true; }
         throw new Error(r)
      })
  }

  unfollow(id: string) {
    this.authHttp.get(this.personUrl + id + '/unfollow')
      .toPromise().then( response => {
         var r = response.json()
         if (r["ok"]) { return true; }
         throw new Error(r)
      })
  }

  saveProfile(profileData) {
    return this.authHttp
      .put(this.personUrl, profileData)
      .toPromise()
  }

  annotate(p: Person, content: string) {
    this.authHttp.post(this.personUrl + p.id + '/annotate', { content: content})
      .toPromise()
      .then(response => response.json() as Person)
      .catch(this.handleError);
  }

  // Implement a method to handle errors if any
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
