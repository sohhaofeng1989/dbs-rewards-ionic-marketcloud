import { Component } from '@angular/core';
import { NavController, NavParams,AlertController, Platform  } from 'ionic-angular';
import { MarketcloudService } from '../../providers/marketcloud-service'; 
import { ConfigurationService } from '../../providers/configuration-service';
import { AuthGuard } from '../../providers/auth-gaurd';
import { DBSRewardsProvider } from '../../providers/dbs/dbs';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import {CheckoutPage} from '../checkout/checkout';
/*
  Generated class for the Cart page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html'
})
export class CartPage {
  cart:any = { items:[]};
  constructor(	
          public navCtrl: NavController,
  				public navParams: NavParams,
  				public alertCtrl: AlertController,
  				public configuration: ConfigurationService,
  				public marketcloud: MarketcloudService,
          public authgaurd: AuthGuard,
          public dbsRewardsProvider: DBSRewardsProvider,
          public platform: Platform ) {

  }

  ionViewCanEnter() : Promise<boolean>{
    return this.authgaurd.createAuthCookie().toPromise();
  }

  ionViewDidLoad() {

    this.marketcloud.client.carts.getById(this.configuration.get('cart_id'))
    .then((response) => {
    	this.cart = response.data;
    })
    .catch((error) =>{

      //Remove this for Production
      this.cart = this.configuration.get('user-chosen')['products'];
      
      if(typeof(this.cart) == 'undefined' || (this.cart && this.cart.length === 0)){
      	let alert = this.alertCtrl.create({
            title: 'Oops',
            subTitle: 'An error has occurred, unable to load the cart.',
            buttons: ['Ok']
          });

          alert.present();
      }
    })

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

  private updateQuantity(index,amount){
  	let promise:any;
  	if (this.cart.items[index].quantity + amount > 0) {
  		promise = this.marketcloud.client.carts.update(
  			this.configuration.get('cart_id'),
	  			[{
	  				product_id 	: this.cart.items[index].product_id,
	  				quantity 	: this.cart.items[index].quantity + amount,
	  				variant_id  : this.cart.items[index].variant_id || 0
	  	}])
  	} else if (this.cart.items[index].quantity + amount === 0) {
  		promise = this.marketcloud.client.carts.remove(
  			this.configuration.get('cart_id'),
	  			[{
	  				product_id 	: this.cart.items[index].product_id,
	  				variant_id  : this.cart.items[index].variant_id || 0
	  		}])
  	} else {

  		return;
  	}
  	promise
  	.then((response) => {
  		this.cart = response.data;
  	})
  	.catch((error) => {
  		
  		let alert = this.alertCtrl.create({
          title: 'Oops',
          subTitle: 'An error has occurred, cart not updated',
          buttons: ['Ok']
        });

        alert.present();
  	})
  }

  increaseQuantity(index) {
  	return this.updateQuantity(index,1);
  }

  decreaseQuantity(index) {
  	return this.updateQuantity(index,-1);
  }

  getCartTotal() {
  	if (this.cart.items.length === 0)
  		return 0;

  	return this.cart.items.map((item) => {
  		if (item.price_discount)
  			return item.quantity*item.price_discount;
  		else
  			return item.quantity*item.price;
  	}).reduce((a,b) => {
  		return a+b;
  	});
  }

  initiateDBSCheckout(){
     this.dbsRewardsProvider.retrieveDBSAuthorizationEndpoint()
     .subscribe(
     (success)=>{

      this.configuration.set('user-checkout-journey', 'auth-pending.dbs-rewards.retrieve-cards-balance');

      let alert = this.alertCtrl.create({
        title: 'Redirection to External Domain',
        message: 'You are about to be redirected to an External Website (dbs.com)',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Confirm',
            handler: () => {
              console.log('Confirmed clicked');
              //Note: Use below snippet for Mobile Testing <Opens in System Browser>
              //window.open(success.data, '_system');
              let dbsAuthEndpoint = (typeof(success['_body']) === 'string')? JSON.parse(success['_body'])['redirect-to'] : success['_body']['redirect-to'];
              if(!this.isWeb())
                window.open(dbsAuthEndpoint, '_system');
              else
                window.open(dbsAuthEndpoint, '_system');
            }
          }
        ]
      });
      alert.present();
     },
     (err) =>{
      let alert = this.alertCtrl.create({
         title: 'Something Happpened',
         subTitle: 'Unable to bring you to DBS Internet Banking Login Page!',
         buttons: ['Dismiss']
      });
      alert.present();
     }
     );
     //this.navCtrl.push(CheckoutPage);
  }

  proceedToCheckout() {
    // Showing single product details
    this.navCtrl.push(CheckoutPage, { provider : 'braintree' });
  }

}
