import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  public recommendedUrl = AppSettings.API_ENDPOINT + '/people/recommended';
  public registerUserUrl = AppSettings.API_ENDPOINT + '/people/new';

  constructor(public http: HttpClient) { }

  _getPeople(page: number = 1, params = {}, url = this.peopleListUrl) :Promise<PagedResults<Person>> {
    const myParams: any = Object.assign({'page': page}, params);
    return this.http
      .get(url,
        {
        params: myParams
        }
      )
      .toPromise()
      .then(response => response as PagedResults<Person>)
      .catch(this.handleError);
  }
  getPeople(page: number = 1, params = {}, url = this.peopleListUrl) {
    return this._getPeople(page,params,url);
  }

  getFollows(page: number = 1, params = {}) :Promise<PagedResults<Person>> {
    return this.getPeople(page, params, this.followUrl);
  }
  getRecent(page: number = 1, params = {}) :Promise<PagedResults<Person>> {
    return this.getPeople(page, params, this.recentUrl);
  }
  getRecommended(page: number = 1, params = {}) :Promise<PagedResults<Person>> {
    return this.getPeople(page, params, this.recommendedUrl);
  }

  getPerson(id: string): Promise<Person> {
    return this.http
      .get(this.personUrl + id)
      .toPromise()
      .then(response => response as Person)
  }

  follow(id: string) {
    return this.http.get(this.personUrl + id + '/follow')
      .toPromise().then( response => {
         var r = response;
         if (r["ok"]) { return true; }
         throw new Error()
      })
  }

  unfollow(id: string) {
    return this.http.get(this.personUrl + id + '/unfollow')
      .toPromise().then( response => {
         var r = response;
         if (r["ok"]) { return true; }
         throw new Error()
      })
  }

  addToNetwork(id: string) {
    return this.http.get(this.personUrl + id + '/add_to_network')
      .toPromise().then( response => {
         var r = response;
         if (r["ok"]) { return true; }
         throw new Error()
      })
  }

  saveProfile(profileData) {
    return this.http
      .put(this.personUrl, {person: profileData })
      .toPromise()
  }

  registerUser(profileData) {
    return this.http
      .post(this.registerUserUrl, {person: profileData })
      .toPromise()
  }

  annotate(p: Person, content: string) {
    this.http.post(this.personUrl + p.id + '/annotate', { params: { content: content }})
      .toPromise()
      .then(response => response as Person)
      .catch(this.handleError);
  }

  // Implement a method to handle errors if any
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
