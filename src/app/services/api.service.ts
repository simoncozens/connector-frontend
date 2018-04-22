import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class APIService {
  constructor(public http: HttpClient) { }

  apiCall(url: string,
          method: string = "GET",
          params = {}): Promise<any> {
    if (method == "GET") {
      return this.http
        .get(url, {params: params } )
        .toPromise()
    } else {
      return this.http
        .post(url, {params: params } )
        .toPromise()
    }
  }

}