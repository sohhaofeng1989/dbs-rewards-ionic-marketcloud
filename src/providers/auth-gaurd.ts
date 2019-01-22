import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { CanActivate, CanLoad } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { ApisService } from '../services';
import { Observable } from 'rxjs';

import { Platform } from  'ionic-angular'; 

@Injectable()
export class AuthGuard {

	private promise: Promise<boolean>;

    constructor(public http: Http,
    			public platform: Platform) { }

    private isNativeMobileDeviceIOS(){
	  return !((this.platform.is('core') || this.platform.is('mobileweb')) 
	         && this.platform.is('ios'));
	}

	private isNativeMobileDeviceAndroid(){
	  return !((this.platform.is('core') || this.platform.is('mobileweb')) 
	         && this.platform.is('android'));
	}

	private isWeb(){   
	  return this.platform.is('core') || this.platform.is('mobileweb');
	}

    public isAuthenticated():Observable<any>{
        return this.http.get('/sessionEval');
    }

    public createAuthCookie():Observable<any>{
        return this.http.post('/create-session', {});
    }

}
