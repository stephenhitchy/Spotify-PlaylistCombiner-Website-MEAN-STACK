import { Component, OnInit, Input,Injectable, ElementRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Inject }  from '@angular/core';
import { DOCUMENT } from '@angular/common'; 
import { Router } from "@angular/router";
import { NgForm } from '@angular/forms';
import { Playlist } from '../models/playlist.model';
import { UserServiceService } from '../user-service.service';
import * as jquery from 'jquery';
declare var thisHelper : HomeComponent;
declare var jQuery: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Input() things : any;
  search : string;
  constructor(@Inject(DOCUMENT) document: Document, private http: HttpClient, private router : Router,  private userService : UserServiceService) {
    
   }

  ngOnInit(): void {
    this.getAuth();
    this.mainPageView();
  }

  AUTHORIZE: string = 'https://accounts.spotify.com/authorize';
  TOKEN: string = 'https://accounts.spotify.com/api/token';
  client_id: string = '603bc873db7c41cbad07a26c65e6b97c';
  client_secret: string = '3c4b89a92a15464686e82c39781fedd9';
  redirect_uri: string = 'http://localhost:4200/api/v1/cb';
  access_token : string = '';
  PLAYLISTS : string = "https://api.spotify.com/v1/playlists/5wUFgVW5aOr6ay5PJbK23P?si=aa0f019b338e41c6";
  TOPSONGS : string = "https://api.spotify.com/v1/me/top/tracks";
  SPOTIFYID : string = "https://api.spotify.com/v1/me";
  playlist_type : string = 'personal-playlist';
  time_range : string = 'medium_term';
  playlist_name : string = 'default-name';
  helpArray : Array<Object> = [];

  getAuth(){
    var url = '/api/v1/code';
    this.http.get(url).subscribe(urlResponse => {
      var urlArr = Object.values(urlResponse);
      this.callAuthorizationApi(urlArr[0]);
      this.userService.setUser(urlArr[1], () => {
        this.displayPlaylists(this);
      });
      var prof = urlArr[1];
      var username = document.createTextNode(prof.email);
      var status = document.createTextNode(prof.permissions);
      document.getElementById('dropbtn').appendChild(username);
      document.getElementById('user-status').appendChild(status);
      if(prof.permissions == 'admin'){
        document.getElementById('user-status').setAttribute('href', '/admin')
      }else {
        document.getElementById('user-status').setAttribute('href', '/user')
      }
    });
  }
  createPlaylistView(){
    jQuery('#home-view').hide("slow");
    jQuery('#create-view').show("slow");
    jQuery('#single-playlist-view').hide('fast');
  }

  mainPageView(){
    jQuery('#home-view').show("slow");
    jQuery('#create-view').hide('slow');
    jQuery('#single-playlist-view').hide('slow');
    this.helpArray = [];
  }

  singlePlaylistView(){
    jQuery('#home-view').hide("slow");
    jQuery('#create-view').hide('slow');
    jQuery('#single-playlist-view').show('slow');
  }

  callAuthorizationApi(body : string) {
    globalThis.thisHelper = this;
    var thisHelper : HomeComponent = this;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", this.TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this.client_id + ":" + this.client_secret));
    xhr.send(body);
    xhr.onload = function() {
      if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        var data = JSON.parse(this.responseText);
        var importantData = {access_token : data.access_token, refresh_token: data.refresh_token}
        thisHelper.doStuffWithData(importantData);
      }
    else {
        alert(this.responseText);
    }
    }
  }
  
  doStuffWithData(data : object) {
    var valuesOfData = Object.values(data);
    this.access_token = valuesOfData[0];
    localStorage.setItem('code', valuesOfData[0]);
  }

  callApi(method : string, url : string, body : string, callback : Function, thisHelper : HomeComponent, length : number){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('code'));
    xhr.setRequestHeader('Accept', 'application/json');
    if(body){
      xhr.send(body);
    }else{
      xhr.send(null);
    }
    xhr.onload = function() {
      callback(JSON.parse(this.responseText), thisHelper, length);
    };
  }

  setPlaylistType(val : string){
    this.playlist_type = val;
  }

  setTimeRange(val : string){
    this.time_range = val;
  }

  createPlaylist(){
    this.mainPageView();
    this.playlist_name = (<HTMLInputElement>document.getElementById('playlist-name-field')).value;
    var length = (<HTMLInputElement>document.getElementById('playlist-length')).value || 25;
    var y: number = +length;
    if(this.playlist_type == 'personal-playlist') {
      this.callApi( "GET", this.TOPSONGS + '?time_range=' + this.time_range + '&limit=' + length + '&offset=0', '', this.handlePlaylistsResponse, this, y);
    }else {
      this.callApi( "GET", this.TOPSONGS + '?time_range=' + this.time_range + '&limit=49' + '&offset=0', '', this.firstGroupPlaylistResponse, this, y );
      this.callApi( "GET", this.TOPSONGS + '?time_range=' + this.time_range + '&limit=50' + '&offset=49', '', this.secondGroupPlaylistResponse, this, y );
    }
  }

  firstGroupPlaylistResponse(data : string, thisHelper : HomeComponent, length : number){
    var ourResponse = Object.values(data);
    var tracks = ourResponse[0];
    for(var i = 0; i < 49; i++) {
      thisHelper.helpArray.push(tracks[i]);
    }
  }

  secondGroupPlaylistResponse(data : string, thisHelper : HomeComponent, length : number){
    var ourResponse = Object.values(data);
    var tracks = ourResponse[0];
    var playlist = new Playlist;
    for(var i = 0; i < 50; i++) {
      thisHelper.helpArray.push(tracks[i]);
    }
    var code = Math.floor(1000 + Math.random() * 9000);
    playlist.name = thisHelper.playlist_name;
    playlist.tracks = thisHelper.helpArray;
    playlist.type = thisHelper.playlist_type;
    playlist.people.push(thisHelper.userService.getUserId());
    playlist.range = thisHelper.time_range;
    playlist.length = length;
    playlist.code = code;
    thisHelper.helpArray = [];
    thisHelper.http.post(`/api/v1/users/${thisHelper.userService.getUserId()}`, playlist).subscribe(response => {
      thisHelper.displayPlaylists(thisHelper);
    })
  }

  handlePlaylistsResponse(data : string, thisHelper : HomeComponent, length : number) {
    var ourResponse = Object.values(data);
    var tracks = ourResponse[0];
    for(var i = 0; i < length; i++) {
      thisHelper.helpArray.push(tracks[i]);
    }
    var code = Math.floor(1000 + Math.random() * 9000);
    var playlist = new Playlist;
    playlist.name = thisHelper.playlist_name;
    playlist.tracks = thisHelper.helpArray;
    playlist.type = thisHelper.playlist_type;
    playlist.people.push(thisHelper.userService.getUserId());
    playlist.range = thisHelper.time_range;
    playlist.length = length;
    playlist.code = code;
    thisHelper.helpArray = [];
    thisHelper.http.post(`/api/v1/users/${thisHelper.userService.getUserId()}`, playlist).subscribe(response => {
      thisHelper.displayPlaylists(thisHelper);
    })
  }

  displayPlaylists(thisHelper : HomeComponent){
    thisHelper.http.get(`/api/v1/users/${thisHelper.userService.getUserId()}`).subscribe(response => {
      while(document.getElementById('all-playlists').firstChild.nextSibling){
        document.getElementById('all-playlists').removeChild(document.getElementById('all-playlists').firstChild.nextSibling);
      }
      var allPlaylists = response['playlist'];
      allPlaylists.forEach(playlist => {
        var table = jQuery('#all-playlists');
        var tr = document.createElement('tr');
        tr.addEventListener('click', this.onClick);
        tr.setAttribute('id', playlist._id);

        var tdName =  document.createElement('td');
        var tdType = document.createElement('td');
        var tdRange = document.createElement('td');
        var tdLength = document.createElement('td');
        var tdCode = document.createElement('td');

        tdType.setAttribute('id', playlist._id);
        tdRange.setAttribute('id', playlist._id);
        tdName.setAttribute('id', playlist._id);
        tdLength.setAttribute('id', playlist._id);

        var name = document.createTextNode(playlist.name);
        var type = document.createTextNode(playlist.type);
        var range = document.createTextNode(playlist.range);
        var length = document.createTextNode(playlist.length);
        if(playlist.type == 'group-playlist'){
          var code = document.createTextNode(playlist.code);
        }else{
          var code = document.createTextNode('Private');
        }

        tdName.appendChild(name);
        tdType.appendChild(type);
        tdRange.appendChild(range);
        tdLength.appendChild(length);
        tdCode.appendChild(code);
        
        tr.append(tdName);
        tr.append(tdType);
        tr.append(tdRange);
        tr.append(tdLength);
        tr.append(tdCode);

        table.append(tr);
      });
    });
  }

  renderPlaylist(playlist : Playlist) {
    while(document.getElementById('songs-table').firstChild.nextSibling){
      document.getElementById('songs-table').removeChild(document.getElementById('songs-table').firstChild.nextSibling);
    }
    while(document.getElementById('current-playlist-holder').firstChild){
      document.getElementById('current-playlist-holder').removeChild(document.getElementById('current-playlist-holder').firstChild);
    }
    var playlistName = document.createTextNode(playlist['name'] + '');
    document.getElementById('current-playlist-holder').appendChild(playlistName);
    while(document.getElementById('code').firstChild){
      document.getElementById('code').removeChild(document.getElementById('code').firstChild);
    }
    if(playlist.type == 'group-playlist'){
      var code = document.createTextNode(playlist['code'] + '');
    }else{
      var code = document.createTextNode('Private');
    }
    document.getElementById('code').appendChild(code);
    var tracks = playlist['tracks'];
    for(var i = 0; i < playlist['length']; i++) {
        var curTrack = tracks[i];
        var table = jQuery('#songs-table');
        var tr = document.createElement('tr');

        var tdRank = document.createElement('td');
        var tdImg = document.createElement('td');
        var tdName =  document.createElement('td');
        var tdArtist = document.createElement('td');
        var tdPop = document.createElement('td');

        var rank = document.createTextNode(i + 1 + '');
        var name = document.createTextNode(curTrack['name']);
        var artistsList = curTrack['artists'];
        var artName = artistsList[0];
        var artist = document.createTextNode(artName['name']);
        var pop = document.createTextNode(curTrack['popularity']);

        var img = document.createElement('img');
        var alb = curTrack['album'];
        var imgsArr = alb['images'];
        var ourImg = imgsArr[0];

        img.setAttribute('src', ourImg['url']);
        img.setAttribute('width', '10%');
        img.setAttribute('class', 'album-cover');

        tdImg.appendChild(img);
        tdRank.appendChild(rank);
        tdName.appendChild(name);
        tdArtist.appendChild(artist);
        tdPop.appendChild(pop);

        tr.append(tdImg);
        tr.append(tdRank);
        tr.append(tdName);
        tr.append(tdArtist);
        tr.append(tdPop);

        table.append(tr);
    }
  }

  addToSpotify(){
    this.callApi("GET", this.SPOTIFYID , '', this.spotifyUserID, this, 0);
  }

  spotifyUserID(data : string, thisHelper : HomeComponent, length : number){
    var playlist = thisHelper.userService.getPlaylist();
    var body = {name : playlist.name};
    var x : string;
    x = data['id'];
    thisHelper.callApi("POST", 'https://api.spotify.com/v1/users/'+x+'/playlists' , JSON.stringify(body), thisHelper.makePlaylistOnSpotify, thisHelper, 0);
  }

  makePlaylistOnSpotify(data : string, thisHelper : HomeComponent, length : number){
    var playlistId = data['id'];
    var playlist = thisHelper.userService.getPlaylist();
    var tracks = playlist.tracks;
    var output = [];
    tracks.forEach(track => {
      output.push(track['uri']);
    })
    thisHelper.callApi("POST", 'https://api.spotify.com/v1/playlists/'+playlistId+'/tracks' , JSON.stringify(output), thisHelper.endOfMakingPlaylist, thisHelper, 0);
  }

  endOfMakingPlaylist(){
    console.log('done');
  }

  joinPlaylist(){
    var playlist = this.userService.getPlaylist();
    var playlistId = playlist['_id'];
    var peep = playlist['people'];
    peep.push(this.userService.getUserId());
    var body = { newUserId : this.userService.getUserId(), ourPeople :  peep }
    this.http.put(`/api/v1/users/${playlistId}`, body).subscribe(result => {
      this.helperFunction();
    });
  }

  helperFunction(){
    this.http.get(`/api/v1/playlists/${this.search}`).subscribe(response => { 
      var ourResponse = Object.values(response);
      var playlistList = ourResponse[0];
      var playlist = playlistList[0];
      var y = playlist['length'];
      var i = 0;
      var newTrackList = [];
      var tracks = playlist.tracks;
      while(i < y) {
        newTrackList.push(tracks[i]);
        newTrackList.push(this.helpArray[i]);
        i++;
      }
      this.helpArray = [];
      var playlistId = playlist['_id'];
      var body = {tracks : newTrackList};
      this.http.put(`/api/v1/users/${playlistId}/tracks`, body).subscribe(result => {
        this.displayPlaylists(this);
        this.mainPageView();
      });
    });
  }
  getPlaylist(pid : string){
    this.http.get(`/api/v1/users/${this.userService.getUserId()}`).subscribe(response => { 
      var ourResponse = Object.values(response);
      var x = 0;
      var playlistList = ourResponse[0];
      while(playlistList[x]){
        var playlist = playlistList[x];
        if(playlist['_id'] == pid){
          this.userService.setPlaylist(playlist);
          this.renderPlaylist(playlist);
        }
        x++;
      }
    });
  }

  findAPlaylist(){
    this.callApi( "GET", this.TOPSONGS + '?time_range=' + this.time_range + '&limit=49' + '&offset=0', '', this.firstGroupPlaylistResponse, this, 50 );
    this.http.get(`/api/v1/playlists/${this.search}`).subscribe(response => { 
      var ourResponse = Object.values(response);
      var x = 0;
      var playlistList = ourResponse[0];
      while(playlistList[x]){
        var playlist = playlistList[x];
        if(playlist['code'] == this.search){
          this.singlePlaylistView();
          this.userService.setPlaylist(playlist);
          this.renderPlaylist(playlist);
        }
        x++;
      }
    });
  }

  onClick(event){
    var pid = event.target.id;
    globalThis.thisHelper.getPlaylist(pid);
    globalThis.thisHelper.singlePlaylistView();
  }

  logout(){
    this.http.post(`/logout`, {'log': 'out'}).subscribe(x => {
      console.log('logged out');
      localStorage.clear();
      this.router.navigateByUrl('/login');
      this.userService.setUser('', () => {
        console.log('logged out');
      });
    });
  }
}
