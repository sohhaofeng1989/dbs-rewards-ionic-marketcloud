import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ProductsPage } from '../pages/products/products';
import { CheckoutPage } from '../pages/checkout/checkout';
import { CheckoutPageModule } from '../pages/checkout/checkout.module';

import { CategoriesPage } from '../pages/categories/categories';

import { OrderCompleteModalPage } from '../pages/order-complete-modal/order-complete-modal';
import { OrderCompleteModalPageModule } from '../pages/order-complete-modal/order-complete-modal.module';

import { ItemPage } from '../pages/item/item';
import { CartPage } from '../pages/cart/cart';

import { ConfigurationService } from '../providers/configuration-service';
import { IonicStorageModule } from '@ionic/storage'
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { BraintreeProvider } from '../providers/braintree/braintree';
import { DBSRewardsProvider } from '../providers/dbs/dbs';
import { AuthGuard } from '../providers/auth-gaurd'

@NgModule({
  declarations: [
    MyApp,
    ProductsPage,
    CategoriesPage,
    ItemPage,
    CartPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    CheckoutPageModule,
    OrderCompleteModalPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProductsPage,
    CategoriesPage,
    ItemPage,
    CartPage,
    CheckoutPage,
    OrderCompleteModalPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ConfigurationService, BraintreeProvider, DBSRewardsProvider, AuthGuard
  ]
})
export class AppModule {}
