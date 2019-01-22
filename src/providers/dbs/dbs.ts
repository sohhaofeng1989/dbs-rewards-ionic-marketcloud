import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

import { IonicApp, Platform } from 'ionic-angular';

declare var dbsRewards: any;

/*
  Generated class for the BraintreeProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class DBSRewardsProvider {
 
  constructor(public http: Http,
              public platform: Platform) {
    console.log('Hello DBSRewardsProvider');
  }

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


  public retrieveDBSAuthorizationEndpoint2FA() : Observable<any> {
     
    return this.http.get('/dbs-authorization-endpoint?auth=2FA'
                        .concat('&isWeb=')
                        .concat(this.isWeb()? 'true' : 'false'));
  }

  public initiateDBSCustomerPaymentByPoints(rewardId, body) : Observable<any> {
    
    //Dummy Call to 2FA-Required API to retrieve 2FA Access Link
    return this.http.post('/dbs-customer/rewards/paymentByPoints'
                         .replace('${rewardId}', rewardId), body);
  }

  public retrieveCustomerDBSRewardsConversionRate(rewardId) : Observable<any> {
    
    return this.http.get('/dbs-customer/rewards/${rewardId}/conversionRates'
                         .replace('${rewardId}', rewardId));
  }

  public retrieveCustomerDBSRewardsBalance(rewardId) : Observable<any> {
    
    return this.http.get('/dbs-customer/rewards/${rewardId}/balanceCheck'
                         .replace('${rewardId}', rewardId));
  }

  public retrieveCustomerDBSRewardsScheme() : Observable<any> {
    
    return this.http.get('/dbs-customer/rewards');
  }

  public retrieveCustomerDBSProfile() : Observable<any> {
    return this.http.get('/dbs-customer/profile');
  }

  public retrieveDBSAuthorizationEndpoint() : Observable<any> {
    return this.http.get('/dbs-authorization-endpoint'
                         .concat('?isWeb=')
                         .concat(this.isWeb()? 'true' : 'false'));
  }

}
