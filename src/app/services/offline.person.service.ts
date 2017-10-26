import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
import { AppSettings } from '../app.settings';
import { PagedResults } from '../classes/pagedresults';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { PersonService } from './person.service';

import 'rxjs/add/operator/toPromise';

import { Person } from '../classes/person';

@Injectable()
export class OfflinePersonService extends PersonService {
  // Define the routes we are going to interact with
  private bulkUpdateUrl = AppSettings.API_ENDPOINT + '/offline/people';
  private updateVisitsUrl = AppSettings.API_ENDPOINT + '/offline/update_visits';

  private dbHandle :SQLiteObject;

  private per_page = 10;
  // XXX Don't actually use this. At the very least it needs to be merged
  // with a unique device ID.
  private key = "7326A638-3BB5-4E2C-B85F-B2DB4B4AFEF1"

  constructor(public authHttp: AuthHttp,
    private sqlite: SQLite) { super(authHttp); }

  setLastSynced(synctime: string) { localStorage.setItem('lastSynced', synctime); }
  getLastSynced() : string { return localStorage.getItem('lastSynced'); }

  openDb() :Promise<SQLiteObject> {
    return this.sqlite.create({
        name: "connector.db",
        //key: this.key,
        location: "default"
      }).then((db: SQLiteObject) => {
        this.dbHandle = db;
        db.executeSql('create table if not exists profiles (id primary key, followed, last_viewed, name, jsonblob)', {})
        return db;
      }).then((db: SQLiteObject) => {
        db.executeSql('create table if not exists workqueue (url string, payload)', {})
        return db;
      })
  }

  updateUser(p: Person): Promise<any> {
    // There's a terrible inefficiency here in restringifying what we
    // just destringified. CPU time is cheap, programmer time is expensive...
    return this.dbHandle.executeSql("REPLACE INTO profiles (id, name,jsonblob, followed) VALUES (?,?,?)", [p.id, p.name, JSON.stringify(p), p.followed])
  }

  sendWorkQueueItem(url: string, payload: string): Promise<any> {
    // Payload is currently unused. If we start doing more clever stuff,
    // fix this.
    return this.authHttp.get(AppSettings.API_ENDPOINT + url)
          .toPromise()
  }

  emptyWorkQueue() : Promise<any> {
    return this.dbHandle.executeSql("DELETE FROM workqueue",[])
  }

  sendWorkQueue(): Promise<any> {
    return this.dbHandle.executeSql('SELECT url,payload FROM workqueue', []).then( (rs) => {
      console.log(rs);
      if (rs.rows.length < 1) { return Promise.resolve() }
      var cursor = Array.from(Array(rs.rows.length-1).keys())
      cursor.reduce((p : Promise<any>, i : number ) => {
          var row = rs.rows.item(i)
          return p.then(() => {
            this.sendWorkQueueItem(row.url, row.payload)
          })
        }, Promise.resolve())
    })
  }

  sendLastVisited(): Promise<any> {
    return this.dbHandle.executeSql('SELECT id,last_viewed FROM profiles ORDER BY last_viewed DESC LIMIT 10', [])
    .then( (rs) => {
      if (rs.rows.length < 1) { return Promise.resolve() }
      var cursor = Array.from(Array(rs.rows.length-1).keys())
      var visits = cursor.map((n) => ({ id: rs.rows.item(n).id, last_viewed: rs.rows.item(n).last_viewed}) )
      // XXX I should probably return this promise?
      // But it makes the compiler go mental. I think this code is wrong.
      this.authHttp.put(this.updateVisitsUrl, visits).toPromise()
    })
  }

  // This should eventually move to a streaming-aware HTTP API,
  // but that can come later
  sync() : Promise<any> {
    var syncUrl = this.bulkUpdateUrl
    var lastSynced = this.getLastSynced()
    if (lastSynced) { syncUrl += "?since=" + lastSynced }
    return this.authHttp.get(syncUrl)
      .toPromise()
      .then(response => response.json())
      .then(response => {
        // First one is a count, drop it
        response.shift()
        response.reduce((p : Promise<any>, person : Person ) => {
          return p.then(() => {
            this.updateUser(person)
          })
        }, Promise.resolve())
      }).then( () => {
        this.setLastSynced((new Date()).toISOString())
        this.sendWorkQueue()
      }).then( () => {
        this.emptyWorkQueue()
      }).then( () => {
        this.sendLastVisited()
      })
    // XXX Next, dump the contents of the workqueue to the server and delete everything
    // Also send back the six last visited people
  }

  visitPerson(id: string): Promise<any> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    return this.dbHandle.executeSql(
      'UPDATE profiles SET last_viewed = ? WHERE id = ?',
      [(new Date()).toISOString(), id]
    )
  }

  _getPerson(id: string): Promise<Person> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    return this.dbHandle.executeSql('SELECT jsonblob FROM profiles WHERE id = ?',
    [ id ]).then( (rs) => {
      console.log(rs);
      if (rs.rows.length < 1) { throw new Error("Person not found!") }
      return JSON.parse(rs.rows.item(0).jsonblob)
    })
  }

  getPerson(id: string): Promise<Person> {
    return this.visitPerson(id).then( () => { return this._getPerson(id) })
  }

  getPeople(page: number = 1, params = {}, clause="1=1") :Promise<PagedResults<Person>> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    var offset = (page-1) * this.per_page
    // This +clause thing is horrible and we need to be very careful about
    // where we generate the SQL.
    var sql = 'SELECT jsonblob FROM profiles WHERE '+clause + ' LIMIT ? OFFSET ?'
    console.log(sql)
    return this.dbHandle.executeSql(sql,
      [ this.per_page, offset ]).then( (rs) => {
        console.log(rs);
        if (rs.rows.length < 1) { throw new Error("Person not found!") }
        var cursor = Array.from(Array(rs.rows.length-1).keys())
        //           0, 1, 2, .., rs.rows.length-1
        var results:PagedResults<Person> = {
          current_page: page,
          total_entries: 0, // Do we ever even use this?
          entries: cursor.map((n) => JSON.parse(rs.rows.item(n).jsonblob) as Person)
        }
        return results
      })
    // XXX Search
  }

  getFollows(page: number = 1) :Promise<PagedResults<Person>> {
    return this.getPeople(page, {}, "followed is not null")
  }

  getRecent(page: number = 1) :Promise<PagedResults<Person>> {
    return this.getPeople(page, {}, "1=1 ORDER BY last_viewed DESC")
    // Did you really name your son "Robert'); DROP TABLE Students;--"?
  }


  follow(id: string) {
    this.dbHandle.executeSql(
      "UPDATE profiles SET followed = 1 WHERE id = ?", [id])
    .then( () => {
      var url = id + '/follow'
      this.dbHandle.executeSql(
      "INSERT INTO workqueue (url, payload) VALUES (?,'')", [url])
    })
  }

  unfollow(id: string) {
    this.dbHandle.executeSql(
      "UPDATE profiles SET followed = NULL WHERE id = ?", [id])
    .then( () => {
      var url = id + '/unfollow'
      this.dbHandle.executeSql(
      "INSERT INTO workqueue (url, payload) VALUES (?,'')", [url])
    })
  }

  saveProfile(profileData): Promise<any> {
    // You can't do this offline
    throw new Error("Offline")
  }


  annotate(id: string, content: string) {
    // Alter locally
    // Add to workqueue
  }
}