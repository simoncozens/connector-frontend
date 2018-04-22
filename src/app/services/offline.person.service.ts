import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { AppSettings } from '../app.settings';
import { PagedResults } from '../classes/pagedresults';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { PersonService } from './person.service';
import { Network } from '@ionic-native/network';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { HttpClient } from '@angular/common/http';

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

  constructor(public http: HttpClient,
    private network: Network,
    private platform: Platform,
    private uniqueDeviceID: UniqueDeviceID,
    private sqlite: SQLite) {
    super(http);
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.uniqueDeviceID.get().then((uuid)=> this.key = uuid+this.key)
        this.network.onConnect().subscribe(() => {
            setTimeout(() => this.miniSync(), 3000);
        })
      }
    })
  }

  setLastSynced(synctime: string) { localStorage.setItem('lastSynced', synctime); }
  getLastSynced() : string { return localStorage.getItem('lastSynced'); }

  openDb() :Promise<void|SQLiteObject> {
    return this.sqlite.create({
        name: "connector.db",
        key: this.key,
        location: "default"
      }).then((db: SQLiteObject) => {
        this.dbHandle = db;
        db.executeSql('create table if not exists profiles (id primary key, followed, last_viewed, name, jsonblob)', {})
        return db;
      }).then((db: SQLiteObject) => {
        db.executeSql('create table if not exists workqueue (url string, payload)', {})
        return db;
      },(e) => {
        console.log("SQL failure")
        console.log(e)
      })
  }

  updateUser(p: Person): Promise<any> {
    // There's a terrible inefficiency here in restringifying what we
    // just destringified. CPU time is cheap, programmer time is expensive...
    return this.dbHandle.executeSql("REPLACE INTO profiles (id, name,jsonblob, followed) VALUES (?,?,?,?)", [p.id, p.name, JSON.stringify(p), p.followed?1:0])
  }

  sendWorkQueueItem(url: string, payload: string): Promise<any> {
    if(payload.length >0) {
        return this.http.post(AppSettings.API_ENDPOINT +  url, JSON.parse(payload)).toPromise()
      } else {
        return this.http.get(AppSettings.API_ENDPOINT +  url).toPromise()
      }
  }

  emptyWorkQueue() : Promise<any> {
    return this.dbHandle.executeSql("DELETE FROM workqueue",[])
  }

  sendWorkQueue(): Promise<any> {
    return this.dbHandle.executeSql('SELECT url,payload FROM workqueue', []).then( (rs) => {
      console.log(rs);
      if (rs.rows.length < 1) { return Promise.resolve() }
      var cursor = Array.from(Array(rs.rows.length).keys())
      cursor.reduce((p : Promise<any>, i : number ) => {
          var row = rs.rows.item(i)
          return p.then(() => {
            this.sendWorkQueueItem(row.url, row.payload)
          })
        }, Promise.resolve())
    })
  }

  sendLastVisited(): Promise<any> {
    console.log("Send last")
    return this.dbHandle.executeSql('SELECT id,last_viewed FROM profiles ORDER BY last_viewed DESC LIMIT 10', [])
    .then( (rs) => {
      console.log("Last profiles visited:")
      console.log(rs)
      if (rs.rows.length < 1) { return Promise.resolve() }
      var cursor = Array.from(Array(rs.rows.length).keys())
      var ids = cursor.map((n) => rs.rows.item(n).id )
      // XXX I should probably return this promise?
      // But it makes the compiler go mental. I think this code is wrong.
      console.log("Sending to server")
      console.log(ids)
      this.http.put(this.updateVisitsUrl, { ids: ids }).toPromise()
    },(e) => { console.log("Oops in SQL"); console.log(e)})
  }

  // This should eventually move to a streaming-aware HTTP API,
  // but that can come later
  sync() : Promise<any> {
    var syncUrl = this.bulkUpdateUrl
    var lastSynced = this.getLastSynced()
    if (lastSynced) { syncUrl += "?since=" + lastSynced }
    return this.http.get(syncUrl)
      .toPromise()
      .then(response => response as Array<any>)
      .then(response => {
        // First one is a count, drop it
        response.shift()
        response.reduce((p : Promise<any>, person : Person ) => {
          return p.then(() => {
            console.log(person.id)
            this.updateUser(person)
          })
        }, Promise.resolve())
      }).then( () => {
        this.setLastSynced((new Date()).toISOString())
        this.miniSync()
      })
  }

  miniSync (): Promise<any> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    if (this.network.type == "none") { return Promise.resolve() }
    return this.sendWorkQueue().then( () => {
        console.log("Emptying work queue")
        this.emptyWorkQueue()
      }).then( () => {
        console.log("Sending last visited")
        this.sendLastVisited()
      })
  }

  visitPerson(id: string): Promise<any> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    return this.dbHandle.executeSql(
      'UPDATE profiles SET last_viewed = ? WHERE id = ?',
      [(new Date()).toISOString(), id]
    ).then( () => this.miniSync() )
  }

  _getPerson(id: string): Promise<Person> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    console.log(id)
    return this.dbHandle.executeSql('SELECT jsonblob,followed FROM profiles WHERE id = ?',
    [ id ]).then( (rs) => {
      console.log(rs);
      if (rs.rows.length < 1) { return Promise.reject("Person not found!") }
      let person = JSON.parse(rs.rows.item(0).jsonblob)
      if (rs.rows.item(0).followed) { person.followed = true; }
      return person
    })
  }

  getPerson(id: string): Promise<Person> {
    return this.visitPerson(id).then( () => { return this._getPerson(id) })
  }

  getPeople(page: number = 1, params = {}, clause="1=1") :Promise<PagedResults<Person>> {
    if (!this.dbHandle) { Promise.reject( new Error("No DB connection"))}
    var offset = (page-1) * this.per_page
    var placevalues: any[] = [ this.per_page, offset ]
    // This +clause thing is horrible and we need to be very careful about
    // where we generate the SQL.
    if (params["fts"]) {
      clause = "jsonblob LIKE ?"
      placevalues.unshift("%"+params["fts"]+"%"); // This isn't ideal, we should use FTS
    }
    var sql = 'SELECT id,name,followed,jsonblob FROM profiles WHERE '+clause + ' LIMIT ? OFFSET ?'
    console.log(sql, placevalues)
    return this.dbHandle.executeSql(sql, placevalues).then( (rs) => {
        console.log(rs);
        if (rs.rows.length < 1) {
          return {total_entries:0, entries:[],current_page:page};
        }
        var cursor = Array.from(Array(rs.rows.length).keys())
        //           0, 1, 2, .., rs.rows.length
        cursor.map((n) => console.log(rs.rows.item(n).id, rs.rows.item(n).name))
        var results:PagedResults<Person> = {
          current_page: page,
          total_entries: 0, // Do we ever even use this?
          entries: cursor.map((n) => {
            let p=  JSON.parse(rs.rows.item(n).jsonblob) as Person;
            if(rs.rows.item(n).followed) {p.followed=true;}
            return p;
          })
        }
        return results
      }, (e) => {
        console.log("Fail in getPeople"); console.log(e);
        // Return something for the sake of type strictness
        return { current_page: 0, total_entries: 0, entries: [] as Person[]}
      })
    // XXX Search
  }

  getFollows(page: number = 1) :Promise<PagedResults<Person>> {
    return this.getPeople(page, {}, "followed = 1")
  }

  getRecent(page: number = 1) :Promise<PagedResults<Person>> {
    return this.getPeople(page, {}, "1=1 ORDER BY last_viewed DESC")
    // Did you really name your son "Robert'); DROP TABLE Students;--"?
  }


  follow(id: string) {
    this.dbHandle.executeSql(
      "UPDATE profiles SET followed = 1 WHERE id = ?", [id])
    .then( () => {
      var url = '/people/' + id + '/follow'
      this.dbHandle.executeSql(
      "INSERT INTO workqueue (url, payload) VALUES (?,'')", [url])
    }).then( () => this.miniSync() )
  }

  unfollow(id: string) {
    this.dbHandle.executeSql(
      "UPDATE profiles SET followed = NULL WHERE id = ?", [id])
    .then( () => {
      var url = '/people/' + id + '/unfollow'
      this.dbHandle.executeSql(
      "INSERT INTO workqueue (url, payload) VALUES (?,'')", [url])
    }).then( () => this.miniSync() )
  }

  saveProfile(profileData): Promise<any> {
    // You can't do this offline
    throw new Error("Offline")
  }


  annotate(p: Person, content: string) {
    p.annotation = content;
    this.updateUser(p).then( () => {
      var url = '/people/' + p.id + '/annotate'
      var payload = JSON.stringify({"content": content})
      this.dbHandle.executeSql("INSERT INTO workqueue (url, payload) VALUES (?,?)", [url,payload])
    }).then( () => this.miniSync())
    // Add to workqueue
  }
}