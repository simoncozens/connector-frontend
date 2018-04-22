import { Component, Input } from '@angular/core';
import { Person } from '../../classes/person';
import { IonicPage, Platform } from 'ionic-angular';
import { OfflinePersonService } from '../../services/offline.person.service';
import { PersonService } from '../../services/person.service';
import { AuthService } from '../../services/auth.service';
import { PagedResults } from '../../classes/pagedresults';
// import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { NavController, NavParams, AlertController } from 'ionic-angular';

@IonicPage({
  name: "people",
  segment: "people"
  })
@Component({
  selector: 'people',
  templateUrl: './people.component.html'
})
export class PeopleComponent {
  result: PagedResults<Person>;
  _page = 1;
  params = {};
  constructor(
    public personService: PersonService,
    public ops: OfflinePersonService,
    public platform: Platform,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public auth: AuthService, public navParams: NavParams
    ) {
    if (this.platform.is('cordova')) {
      this.personService = this.ops;
    }
  }

  ionViewCanEnter() {
    return this.auth.loggedIn()
  }

  getPeople() {

    return this.personService.getRecommended(this._page, this.params)
        .then(result => this.addMorePeople(result),
          error => this.dammit(error));
  }

  ionViewWillEnter(): void {
    // this.route.params.subscribe(params => {
      this.result = null
      this.params = this.navParams.get("params")
      // console.log(this.params)
      // this.params = params
      this.page = 1
    // })
  }

  doSearch(ev: any) {
    // Reset items back to all of the items
    let val = ev.target.value;
    console.log(val)
    if ( val.length > 0 && val.length <4) {
      return; // Not yet
    }
    this.result = null
    if (val.length == 0) {
      this.params = {}
    } else {
      this.params = { fts: val }
    }
    this.page = 1
  }

  @Input() set page(value: number) {
    this._page = value;
    this.getPeople();
  }
  get page() { return this._page; }

  addMorePeople(result: PagedResults<Person>) {
    if (!this.result) {
      this.result = result
    } else {
      this.result.entries.push.apply(this.result.entries,result.entries)
    }
  }

  onScroll (infiniteScroll) {
    this._page = this._page + 1;
    this.getPeople().then( () => { infiniteScroll.complete() })
  }

  gotoPerson(person) {
    this.navCtrl.push("person", {
      id: person.id,
    })
  }

  dammit(e) {
    console.log(e);
    const alert = this.alertCtrl.create({
      title: 'Something went wrong',
      subTitle: 'Error' + JSON.stringify(e),
      buttons: ['Dismiss']
    });
    alert.present();
  }
}