import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/*
  Generated class for the ConfigurationService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ConfigurationService {

  // Declared as any for the sake of simplicity
  // we will dive more into Typescript later
  data:any = {};

  constructor() {
    
    this.data= window.localStorage['fancy-shop']? JSON.parse(window.localStorage['fancy-shop']) : {};
    
    Object.keys(this.data).forEach((key) => {
      this.data[key]= typeof(this.data[key]) === 'string' && this._isJsonString(this.data[key])? 
                      JSON.parse(this.data[key]) : this.data[key];
    });

  }

  _isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  set(key,value) {
  	this.data[key] = value;
    window.localStorage['fancy-shop']= JSON.stringify(this.data);
  }

  get(key) {
  	return this._isJsonString(this.data[key])? JSON.parse(this.data[key]) : this.data[key];
  }



}
