import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
import { AppSettings } from '../app.settings';
import { PagedResults } from '../classes/pagedresults';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import 'rxjs/add/operator/toPromise';

import { Person } from '../classes/person';

@Injectable()
export class OfflinePersonService {
  // Define the routes we are going to interact with
  private peopleListUrl = AppSettings.API_ENDPOINT + '/offline/people';
  private dbHandle :SQLiteObject;

  // XXX Don't actually use this. At the very least it needs to be merged
  // with a unique device ID.
  private key = "7326A638-3BB5-4E2C-B85F-B2DB4B4AFEF1"

  constructor(public authHttp: AuthHttp,
    private sqlite: SQLite) { }

  setLastSynced(synctime: string) { localStorage.setItem('lastSynced', synctime); }
  getLastSynced() : string { return localStorage.getItem('lastSynced'); }

  openDb() :Promise<SQLiteObject> {
    return this.sqlite.create({
        name: "connector.db",
        //key: this.key,
        location: "default"
      }).then((db: SQLiteObject) => {
        this.dbHandle = db;
        db.executeSql('create table if not exists profiles (id primary key, following, last_viewed, name, jsonblob)', {})
        return db;
      }).then((db: SQLiteObject) => {
        db.executeSql('create table if not exists workqueue (url string)', {})
        return db;
      })
  }

  updateUser(p: Person): Promise<any> {
    // There's a terrible inefficiency here in restringifying what we
    // just destringified. CPU time is cheap, programmer time is expensive...
    return this.dbHandle.executeSql("REPLACE INTO profiles (id, name,jsonblob) VALUES (?,?,?)", [p.id, p.name, JSON.stringify(p)])
  }

  // This should eventually move to a streaming-aware HTTP API,
  // but that can come later
  sync() : Promise<any> {
    var syncUrl = this.peopleListUrl
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

  getPerson(id: string): Promise<Person> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    return this.visitPerson(id).then( () => {
      return this.dbHandle.executeSql('SELECT jsonblob FROM profiles WHERE id = ?',
      [ id ]).then( (rs) => {
        console.log(rs);
        if (rs.rows.length < 1) { throw new Error("Person not found!") }
        return JSON.parse(rs.rows.item(0).jsonblob)
      })
    })
  }

}
