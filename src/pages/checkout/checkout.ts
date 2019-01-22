import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ItemSliding, Events, Content, Range, ToastController } from 'ionic-angular';
import { DBSRewardsProvider } from '../../providers/dbs/dbs';
import { BraintreeProvider } from '../../providers/braintree/braintree';
import { ConfigurationService } from '../../providers/configuration-service';
import { MarketcloudService } from '../../providers/marketcloud-service';

import { UUID } from 'angular2-uuid'

import { AuthGuard } from '../../providers/auth-gaurd';


import { OrderCompleteModalPage } from '../order-complete-modal/order-complete-modal';

import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { Observable } from 'rxjs';

/**
 * Generated class for the CheckoutPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


/**
 * TODO: Implement an abstraction for toggling between DBS Rewards Client and BrainTreeClient
 *
 * 
 * 
 */

/*abstract class CheckoutProvider {
  abstract checkout() : void;
}

class DBSRewardsProviderWrapper  implements CheckoutProvider {
 
  public checkout() : void {
 
 
  }
 
}

class BrainTreeProviderWrapper  implements CheckoutProvider {
 
  public checkout() : void {
 
 
  }
 
}*/

@IonicPage()
@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html'
})

export class CheckoutPage {
  step : number;

  dbsPointRedemptionDetails: any

  firstTab : boolean;

  cart : any = {items : []};

  @Input('currentStep')
  currentStep : string;

  amountPerPoint: string;
  
  convertedAmount: string;

  remainingBalance: string;

  loadRangeSlider: boolean;

  pointsToRedeem: string;

  address : any;

  braintreeNonce : string;

  provider: string;

  dbsCustomerCardList: Array<any>;

  conversionMatrix: Array<any>;

  selectedCard: any;

  isAlertPresent: boolean;

  rewardCardBalanceRecieved = 0;

  @ViewChild(Content) content: Content;

  constructor(
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private dbsRewardsClient: DBSRewardsProvider,
    //private checkoutProvider: CheckoutProvider,
    //private braintreeClient: BraintreeProvider,
    public configuration: ConfigurationService,
    public alertCtrl  :AlertController,
    public marketcloud: MarketcloudService,
    private authgaurd: AuthGuard,
    private toastCtrl: ToastController,
    public events: Events) {

    this.isAlertPresent= false;
    this.loadRangeSlider= false;
    // Initial step counter
    
    this.step = 0;
    this.currentStep = "Address";

    

    // Available steps
    //"Address",
    //"Payment",
    //"Review"
    
    this.address = {
      full_name : "John Doe",
      country : " Italy",
      state : "Marche",
      city : "Ancona",
      postal_code : "123",
      email  :"john.doe@example.com",
      address1 : "Fake Street"
    };

    this.marketcloud.client.carts.getById(this.configuration.get('cart_id'))
    .then((response) => {
      this.cart = response.data;
    })
    .catch((error) =>{
      let alert = this.alertCtrl.create({
          title: 'Oops',
          subTitle: 'An error has occurred, unable to load order items.',
          buttons: ['Ok']
        });
        this.isAlertPresent= true;
        alert.present();
    });
   
   switch(navParams.get('provider')){

       default :
       case 'dbs' : 
           this.provider= 'dbs';
         break;
       case 'dbs-2fa' : 
           this.provider= 'dbs-2fa';
         break;
       case 'braintree' : 
           this.provider = 'braintree';
         break;
         

   }

   events.subscribe('rewardCardBalance:received', (count, targetCount, loading) => {
    // user and time are the same arguments passed in `events.publish(user, time)`
      if(count === targetCount)
        loading.dismiss();
   });
  }

  ionViewCanEnter() : Promise<boolean>{
    return this.authgaurd.createAuthCookie().toPromise();
  }

  ionViewDidLoad() {
    
    console.log('ionViewDidLoad CheckoutPage');

    switch(this.provider){

      default: 
      case 'dbs' :
        //DBS Rewards Flow
        let loading = this.loadingCtrl.create({
            content: "Loading Your DBS Rewards Card Details"
          });

        loading.present();

        this.dbsRewardsClient.retrieveCustomerDBSProfile()
        .subscribe((success) => {

            const profile= typeof(success['_body']) === 'string'? JSON.parse(success['_body']) : success['_body'];
            
            this.address= {
              full_name : profile['retailParty']['retailDemographic']['partyName']['fullName'],
              country : profile['retailParty']['retailDemographic']['residenceCountry'],
              state : profile['retailParty']['retailDemographic']['residenceCountry'],
              city : profile['retailParty']['retailDemographic']['residenceCountry'],
              postal_code : profile['retailParty']['contactDetl']['addressDetl'][0]['partyAddress']['localAddress']['postalCode'],
              //LOL
              email  : profile['retailParty']['contactDetl']['emailDetl'][0]['emailAddressDetl']['emailAddressType'],
              address1 : profile['retailParty']['contactDetl']['addressDetl'][0]['partyAddress']['localAddress']['addressLine1']
            }

        },(error) =>{



        });

        this.dbsRewardsClient.retrieveCustomerDBSRewardsScheme()
        .subscribe((success) => {

            const rewardsCardList= typeof(success['_body']) === 'string'? JSON.parse(success['_body']) : success['_body']; 
            
            rewardsCardList['cardRewardsAccounts'].forEach((rewardsCard) =>{

              rewardsCard['imgSrc']=  rewardsCard.cardDescription? rewardsCard.cardDescription.replace(/ /g, '-').concat('.png').toLowerCase() : null;
              
              const rewardCardId = rewardsCard['cardNumber'];

              this.dbsRewardsClient.retrieveCustomerDBSRewardsBalance(rewardCardId)
              .subscribe(
              (success)=>{
                
                const rewardBalanceObj= typeof(success['_body']) === 'string'? JSON.parse(success['_body']) : success['_body']; 
                rewardsCard.pointBalance = rewardBalanceObj[0]['currentPoints'];

                /*Broadcast that a card balance has been received*/
                this.events.publish('rewardCardBalance:received', 
                                    ++this.rewardCardBalanceRecieved, 
                                    rewardsCardList['cardRewardsAccounts'].length, 
                                    loading);
                
              },
              (error)=>{

                if(!this.isAlertPresent){

                    let alert = this.alertCtrl.create({
                      title: 'Oops',
                      subTitle: 'An error has occurred, unable to retrieve dbs rewards card point balance from DBS.',
                      buttons: ['Ok']
                    });

                  alert.present();
                }

              });


            });

            this.dbsCustomerCardList= rewardsCardList['cardRewardsAccounts'];
    
        },(error) =>{



        });
        
        break;

      case 'dbs-2fa' :
          this.currentStep = 'Review';
          this.getPointRedemptionDetails();

          let loadingPointRedemption = this.loadingCtrl.create({
            content: "Contacting DBS for your Rewards Card Point Redemption of $" + this.dbsPointRedemptionDetails.redeemAmount
          });

          loadingPointRedemption.present();

          this.dbsRewardsClient.initiateDBSCustomerPaymentByPoints(this.dbsPointRedemptionDetails.rewardId, this.dbsPointRedemptionDetails)
          .subscribe(
          (success)=>{
              
              loadingPointRedemption.dismiss();
              const redemptionResult= typeof(success['_body']) === 'string'? JSON.parse(success['_body']) : success['_body'];

              // The modal will show "Order complete"
              let myModal = this.modalCtrl.create(OrderCompleteModalPage, { result   : redemptionResult, 
                                                                            provider : 'dbs' });
              
              // Emptying the view stack
              this.navCtrl.popToRoot()
              .then( () => {
                myModal.present();
              })
              .catch( (error) => {
                console.log("An error has occurred while navigating back to the root view",error)
              })


          },
          (error)=>{

            console.log(error);

            if(!this.isAlertPresent){

                    let alert = this.alertCtrl.create({
                      title: 'Oops',
                      subTitle: 'An error has occurred, unable to redeem dbs rewards points balance while contacting DBS.',
                      buttons: ['Ok']
                    });

                  alert.present();
            }

          });

        break;      

      case 'braintree':
       /*
        var that : any = this;
      
        var braintreeIntegrationConfig : any = {
            id: "payment-form",
            hostedFields: {
              number: {
                selector: "#credit-card-number"
              },
              cvv: {
                selector: "#cvv"
              },
              expirationDate: {
                selector: "#expiration-date"
              },
              styles: {
                // Style all elements
                'input': {
                   'background-color':'red',
                  'font-size': '16px',
                  'color': '#3A3A3A',
                  'height':  '32px',
                  'border' : '1px solid #ccc',
                  
                },

                // Styling a specific field
                '.number': {
                  'background-color':'red',
                  'border' : '1px solid #ccc',
                  'height':  '32px'
                },

                // Styling element state
                ':focus': {
                  'color': 'blue'
                },
                '.valid': {
                  'color': 'green'
                },
                '.invalid': {
                  'color': 'red'
                }
              }
            },
            onPaymentMethodReceived : function(response) {
              // We received the nonce from Braintree
              // we store it into a class propertu
              that.braintreeNonce = response.nonce;
            }
          };

        this.marketcloud.client.payments.braintree.createClientToken()
        .then ( (response) => {
          // We got the Braintree Token from Marketcloud
          this.braintreeClient.braintreeClient.setup(response.data.clientToken, "custom", braintreeIntegrationConfig);
        })
        .catch( (error) => {
          alert("An error has occurred, payment gateway not available");
          console.log(error);
        })
    */
        break;
    };
    
  }


  validateAddress() {
    return true;
  }

  validatePayment() {
    return true;
  }

  showRewardsRedemptionPrompt(){
    let toast = this.toastCtrl.create({
        message: 'You have chosen to redeem ' 
                 + this.pointsToRedeem + 'points (' + this.conversionMatrix['currency'] + ' $ ' + this.convertedAmount + ') from ' 
                 + this.selectedCard['cardDescription'],
        duration: 1500,
        position: 'top'
      });

      toast.onDidDismiss(() => {
        console.log('Dismissed toast');
      });

      toast.present();
  }

  proceedToNextStep() {

    if (this.currentStep === "Address") {
      this.currentStep = "Payment";
      return;
    }

    if (this.currentStep === "Payment") {
      // We fetch the payment nonce from braintree

      // Lets get the submit button, its hidden for style purposes
      var btn : any = document.querySelector('input#submitButton');
      // trigger the click event
      btn.click();

      this.currentStep = "Review";

      this.showRewardsRedemptionPrompt();

      return;

    }

    if (this.currentStep === "Review") {

      // We validate the payment and the address

      //if validation returns true, then we create the order



    }

   

  }

  convertPoints(){

    if(!this.firstTab){
        this.firstTab= true;
        setTimeout(()=>{this.content.scrollToBottom(100)},100)        
    }

    this.convertedAmount= ((parseFloat(this.pointsToRedeem)
                           /parseFloat(this.conversionMatrix['pointsPerUnit']))
                           *parseFloat(this.conversionMatrix['units'])).toPrecision(2);

    this.amountPerPoint= (parseFloat(this.conversionMatrix['pointsPerUnit']) 
                        * parseFloat(this.conversionMatrix['units']))
                         .toPrecision(2);

    this.remainingBalance = (this.cart.total - parseFloat(this.convertedAmount) < 0 ?
                            0 : this.cart.total - parseFloat(this.convertedAmount))
                            .toPrecision(2);

  }

  selectCard(dbsCustomerCard, slidingItem:ItemSliding) {

    this.dbsRewardsClient.retrieveCustomerDBSRewardsConversionRate(dbsCustomerCard.cardNumber)
    .subscribe(
    (success)=>{

      this.conversionMatrix= typeof(success['_body']) === 'string'? JSON.parse(success['_body'])[0] : success['_body'][0];

    },
    (error)=>{

      if(!this.isAlertPresent){

          let alert = this.alertCtrl.create({
                title: 'Oops',
                subTitle: 'An error has occurred, unable to retrieve conversion rates from DBS.',
                buttons: ['Ok']
          });

          alert.present();
       }

    });

    //View Changes : Show a tick if not already selected. Otherwise, untick the card
    dbsCustomerCard.selected = dbsCustomerCard.selected? dbsCustomerCard.selected= false : true;
    
    this.dbsCustomerCardList.forEach((elem) => {
      elem.selected= (elem == dbsCustomerCard) && dbsCustomerCard.selected;
    });
    
    //Model changes
    if(dbsCustomerCard.selected){
      this.selectedCard = dbsCustomerCard;
      this.selectedCard.pointsToRedeem = 1;
    }

    this.loadRangeSlider = false;
       

    let interval = 500/(this.selectedCard.pointBalance);
    //View Changes : Scroll to bottom after 300ms of delay
    setTimeout(()=>{
       
       let buffer = this.selectedCard.pointBalance;

       this.selectedCard.pointBalance= 0;

       this.content.scrollToBottom(800);

       let timer = setInterval(()=>{
          this.selectedCard.pointBalance= this.selectedCard.pointBalance + 
                                          (buffer - this.selectedCard.pointBalance < 20 ? 
                                            buffer - this.selectedCard.pointBalance : 20 );
          if(this.selectedCard.pointBalance >= buffer){
            clearInterval(timer);
            this.loadRangeSlider = true;
            this.content.scrollToBottom(10);
          }
       },interval<10? 10 : interval);
    },300);



  }

  
  capturePointRedemptionDetails(){

    this.dbsPointRedemptionDetails = {

      'orderId'             : UUID.UUID(),
      'referenceId'         : UUID.UUID(),
      'redeemedPoints'      : this.pointsToRedeem,
      'redeemAmount'        : this.convertedAmount,
      'pointCoversionRate'  : this.amountPerPoint,
      'remainingBalanceToPay' : this.remainingBalance,
      'rewardId'      : this.selectedCard.cardNumber
    };

    this.configuration.set('point-redemption-details', this.dbsPointRedemptionDetails);
  }

  getPointRedemptionDetails(){
    this.dbsPointRedemptionDetails= this.configuration.get('point-redemption-details');
  }

  completeCheckoutVia2FA() {

    this.capturePointRedemptionDetails();

    this.dbsRewardsClient.retrieveDBSAuthorizationEndpoint2FA()
    .subscribe(
      (success)=>{

        let alert = this.alertCtrl.create({
          title: 'Redirection to External Domain',
          message: 'You are about to be redirected to an External Website for 2FA (dbs.com)',
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

                this.configuration.set('user-checkout-journey', 'auth-pending.dbs-rewards-2fa.redeem-rewards-points');

                //Note: Use below snippet for Mobile Testing <Opens in System Browser>
                //window.open(success.data, '_system');
                let twoFactorAuthenticationEndpoint = typeof(success['_body']) === 'string'? JSON.parse(success['_body'])['redirect-to'] : success['_body']['redirect-to'];
                window.open(twoFactorAuthenticationEndpoint, '_system');
              }
            }
          ]
        });
        alert.present();
      },
      (error)=>{

        let alert = this.alertCtrl.create({
           title: 'Something Happpened',
           subTitle: 'Unable to bring you to DBS 2FA Page!',
           buttons: ['Dismiss']
        });
        alert.present();

      });
  }

  completeCheckout() {
     
      if (true === this.validateAddress() && true === this.validatePayment()){

        let loading = this.loadingCtrl.create({
          content: "Completing checkout, please wait..."
        });

        loading.present();
        
        return this.marketcloud.client.orders.create({
          shipping_address : this.address,
          billing_address : this.address,
          cart_id : Number(this.configuration.get('cart_id'))
        })
        .then( (response) => {
          
          // Order was correctly created, we now handle the payment
          var nonce = this.braintreeNonce;
          // Making the transaction
          return this.marketcloud.client.payments.create({
            method : 'Braintree',
            nonce : nonce,
            order_id : response.data.id
          })
        })
        .then( (response) => {
            // Here you can move your user into the order complete view
            loading.dismiss();

            // The modal will show "Order complete"
            let myModal = this.modalCtrl.create(OrderCompleteModalPage);
            
            // Emptying the view stack
            this.navCtrl.popToRoot()
            .then( () => {
              myModal.present();
            })
            .catch( (error) => {
              console.log("An error has occurred while navigating back to the root view",error)
            })

         })
        .catch( (response) => {
          console.log("An error has occurred creating the order",response);
          loading.dismiss();
        })
      }
  }
}


