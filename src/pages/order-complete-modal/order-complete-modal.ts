import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App, ViewController } from 'ionic-angular';
import { AuthGuard } from '../../providers/auth-gaurd'
import { ProductsPage } from '../products/products';
import { ConfigurationService } from '../../providers/configuration-service'
/**
 * Generated class for the OrderCompleteModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-order-complete-modal',
  templateUrl: 'order-complete-modal.html'
})

export class OrderCompleteModalPage {

  private provider: any;
  private orderDisplayDetails: any;

  constructor(
    public appCtrl : App,
    public viewCtrl : ViewController,
    public navCtrl: NavController,
    public conf : ConfigurationService,
    public navParams: NavParams,
    private authgaurd: AuthGuard) {
  }


  ionViewCanEnter() : Promise<boolean>{
    return this.authgaurd.createAuthCookie().toPromise();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderCompleteModalPage');

    this.provider = this.navParams.get('provider');

    switch(this.provider){
      default   :
      case 'dbs'   :
         this.orderDisplayDetails = this.navParams.get('result');
         this.orderDisplayDetails = Object.assign(this.orderDisplayDetails, 
                                                  this.conf.get('point-redemption-details'));

        break;

      case 'braintree'  : 

         this.orderDisplayDetails = this.navParams.get('result');
         //TODO: Add implementatio for BrainTree

        break;
    }

  }

  returnHome() {
    this.viewCtrl.dismiss()
  }
}
