import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var thisHelper : UserComponent;
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit(): void {
    this.start();
  }

  start(){
    globalThis.thisHelper = this;
  }

  homeButton(){
    globalThis.thisHelper.router.navigateByUrl('/home');
  }
}
