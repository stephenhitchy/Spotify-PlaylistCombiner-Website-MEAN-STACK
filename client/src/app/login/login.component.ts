import { Component, OnInit, Input, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { UserServiceService } from '../user-service.service'; 
import { User } from '../models/user.model';
import { from, Observable } from 'rxjs';
import { Inject }  from '@angular/core';
import { DOCUMENT } from '@angular/common'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class LoginComponent implements OnInit {
  username : string = '';
  password : string = '';
  LOGIN_URL : string = "/login";
  
  constructor(private http : HttpClient, private router : Router, private userService : UserServiceService ) { }


  ngOnInit() {
    this.username = "";
    this.password = "";
    this.checkHistory();
   }
  
   login() {
    var credentials = { username : this.username, password : this.password };
    this.http.post<User>( this.LOGIN_URL, credentials, { observe : 'response'} ).subscribe(res => {
      this.userService.setUser(res.body, ()=> {
        console.log(res.body);
        localStorage.setItem('userInfo', this.username);
      });
    });
    this.requestAuthorization();
  }

  checkHistory(){
    console.log(localStorage.getItem('userInfo'));
    console.log('reached checkHistory');
    if(localStorage.getItem('userInfo')){
      this.router.navigateByUrl('home');
    }
  }

  AUTHORIZE: string = 'https://accounts.spotify.com/authorize';
  TOKEN: string = 'https://accounts.spotify.com/api/token';
  client_id: string = '603bc873db7c41cbad07a26c65e6b97c';
  client_secret: string = '3c4b89a92a15464686e82c39781fedd9';
  redirect_uri: string = 'http://138.49.185.203:3000/api/v1/cb';

  requestAuthorization(){
    let url = this.AUTHORIZE;
    url += "?client_id=" + this.client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(this.redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative user-top-read";
    window.location.href = url;
  }

}