import { Component } from '@angular/core';
import {Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoginRoute : boolean = true;

  constructor( private route : ActivatedRoute ) {}

  ngOnInit() {
    this.route.url.subscribe( url => {
      console.log(url)
      this.isLoginRoute = url.toString().indexOf( "login" ) >= 0;
    })    
  }
}
