import { Injectable } from '@angular/core';
import { Playlist } from './models/playlist.model';

@Injectable()
export class UserServiceService {
  user : any;
  id : string;
  csrf : string = '';
  playlist : Playlist;
  token : string;

  constructor() { }

  setUser( user : any, fun : Function ) : void {
    this.id = user['_id'];
    this.user = user;
    fun();
  }

  setToken( csrf : string ) : void {
    console.log(csrf);
    this.csrf = csrf;
  }

  getUser( ) : any {
    return this.user;
  }

  getUserId( ) : string {
    return this.id;
  }

  getToken( ) : string {
    return this.csrf;
  }

  setPlaylist(playlist : Playlist ) : void {
    this.playlist = playlist; 
  }

  getPlaylist( ) : Playlist {
    return this.playlist;
  }

  setUserToken( token : string) : void {
    this.token = token;
  }

  getUserToken( ) : string {
    return this.token;
  }
}

