import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../user-service.service';

declare var thisHelper : AdminComponent;
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private http: HttpClient, private router : Router, private userService : UserServiceService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(){
    globalThis.thisHelper = this;
    console.log(this.userService.getUserId());
    this.http.get(`/api/v1/users`).subscribe(usersResponse => {
      var usersList = Object.values(usersResponse);
      var usersLists = usersList[0];
      var users = usersLists[0];
      while(document.getElementById('users-table').firstChild.nextSibling){
        document.getElementById('users-table').removeChild(document.getElementById('users-table').firstChild.nextSibling);
      }
      users.forEach(user => {
        var table = jQuery('#users-table');
        var tr = document.createElement('tr');
        tr.setAttribute('id', user._id);

        var tdEmail =  document.createElement('td');
        var tdRole = document.createElement('td');
        var tdStatus = document.createElement('td');
        var tdRemoveButton = document.createElement('td');
        var tdButton = document.createElement('td');

        tdEmail.setAttribute('id', user._id);
        tdRole.setAttribute('id', user._id);
        tdStatus.setAttribute('id', user._id);
        
        var email = document.createTextNode(user.email);
        var role = document.createTextNode(user.permissions);
        var status = document.createTextNode(user.enabled);
        if(user.enabled == false){
          var removeButton = document.createElement('button');
          var removeButtonTxt = document.createTextNode('Add');
          removeButton.setAttribute('type','submit');
          removeButton.addEventListener('click', this.addUser ,false)
          removeButton.setAttribute('class','btn');
          removeButton.setAttribute('id', user._id);
        }else{
          var removeButton = document.createElement('button');
          var removeButtonTxt = document.createTextNode('Remove');
          removeButton.setAttribute('type','submit');
          removeButton.addEventListener('click', this.removeUser ,false)
          removeButton.setAttribute('class','btn btn-primary btn-sm');
          removeButton.setAttribute('id', user._id);
        }

        if(user.permissions == 'admin'){
          var button = document.createElement('button');
          var buttonTxt = document.createTextNode('Demote');
          button.setAttribute('type','submit');
          button.addEventListener('click', this.demoteUser ,false)
          button.setAttribute('class','btn btn-primary btn-sm');
          button.setAttribute('id', user._id);

          tdButton.appendChild(button);
          button.appendChild(buttonTxt);
        }else{
          var button = document.createElement('button');
          var buttonTxt = document.createTextNode("Promote");
          button.setAttribute('type','submit');
          button.addEventListener('click', this.promoteUser ,false)
          button.setAttribute('class','btn btn-primary btn-sm');
          button.setAttribute('id', user._id);
          tdButton.appendChild(button);
          button.appendChild(buttonTxt);
          
        }
        tdEmail.appendChild(email);
        tdRole.appendChild(role);
        tdStatus.appendChild(status);
        tdRemoveButton.appendChild(removeButton);
        removeButton.appendChild(removeButtonTxt);
        
        tr.append(tdEmail);
        tr.append(tdRole);
        tr.append(tdStatus);
        tr.append(button);
        tr.append(tdRemoveButton);

        table.append(tr);
      });
    });
  }

  removeUser(event){
    var id = event.target.id;
    var property = 'enabled';
    var body = {property : false}
    globalThis.thisHelper.http.put(`/api/v1/users/${id}/properties/${property}`, body).subscribe(usersResponse => {
      globalThis.thisHelper.getUsers();
    });
  }

  addUser(event){
    var id = event.target.id;
    var property = 'enabled';
    var body = {property : true}
    globalThis.thisHelper.http.put(`/api/v1/users/${id}/properties/${property}`, body).subscribe(usersResponse => {
      if(globalThis.thisHelper.userService.getUserId() == id){
        globalThis.thisHelper.router.navigateByUrl('api/v1');
      }
    });
  }

  demoteUser(event){
    var id = event.target.id;
    var property = 'permissions';
    var body = {property : 'user'}
    globalThis.thisHelper.http.put(`/api/v1/users/${id}/properties/${property}`, body).subscribe(usersResponse => {
      globalThis.thisHelper.getUsers();
    });
  }

  promoteUser(event){
    var id = event.target.id;
    var property = 'permissions';
    var body = {property : 'admin'}
    globalThis.thisHelper.http.put(`/api/v1/users/${id}/properties/${property}`, body).subscribe(usersResponse => {
      globalThis.thisHelper.getUsers();
    });
  }
  
  homeButton(){
    globalThis.thisHelper.router.navigateByUrl('/home');
  }
}
