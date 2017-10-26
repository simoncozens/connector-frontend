import { Component, OnInit, Input } from '@angular/core';
import { Message } from '../../classes/message';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { PagedResults } from '../../classes/pagedresults';
import {DomSanitizer} from '@angular/platform-browser';
import { NavParams, IonicPage } from 'ionic-angular';
import { Person } from '../../classes/person';
import { InterComponentMessageService } from '../../services/intercomponentmessage.service';

@IonicPage({
  name: "messages-with",
  segment: "messages-with/:id"
  })
@Component({
  selector: 'messages-with',
  templateUrl: './messages-with.component.html'
})
export class MessagesWithComponent implements OnInit {
  result: PagedResults<Message>;
  _page = 1;
  withId: string;
  newMessage: string;
  with: Person;
  me: Person;
  params = {};
  constructor(public messageService: MessageService,
    public navParams: NavParams,
    public auth: AuthService,
    public interComponentMessageService: InterComponentMessageService,
    private sanitizer:DomSanitizer) {
  }

  getMessages() {
      this.messageService.getThread(this.withId, this._page)
        .then(result => this.addMoreMessages(result))
        .catch((error) => console.log(error));
  }

  ngOnInit(): void {
    this.withId = this.navParams.get('id')
    this.getMessages()
    this.me = this.auth.loggedInUser()
  }

  @Input() set page(value: number) {
    this._page = value;
    this.getMessages();
  }
  get page() { return this._page; }

  addMoreMessages(result: PagedResults<Message>) {
    this.with = (<any>result).other // Thread stashes more stuff in the response
    if (!this.result) {
      this.result = result
    } else {
      // XXX Actually we need to put them at the start
      this.result.entries.push.apply(this.result.entries,result.entries)
    }
    console.log(this.result)
  }

  onScroll () {
    this.page = this.page + 1;
  }
  sanitize(url:string){return this.sanitizer.bypassSecurityTrustUrl(url); }

  sendMessage() {
    this.messageService.sendMessage(this.withId, this.newMessage)
    .then(response => {
      var r = response.json();
      if (r.ok) {
        // Clear the box
        this.newMessage = ""
        // Add message to list
        this.result.entries.unshift(r.message)
      } else {
        // XXX Did not send
      }
    }).catch(response => {
      // XXX Did not send
    })
  }

  toMe(message) {
    return message.sender_id.$oid == this.withId
  }

  markRead(message) {
    if(! (this.toMe(message) && message.status == "Unread")) { return; }
    this.messageService.readMessage(message.id).then(response => {
      console.log(response.json())
      message.status = response.status // Should be read. Might not be...
      this.interComponentMessageService.sendMessage('navbar','check read');
    }
    ).catch(response => {
      // XXX Did not send
    })
  }
}
