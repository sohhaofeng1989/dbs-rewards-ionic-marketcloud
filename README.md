# DBS Sandbox Rewards API Demo with OAuth 2.0 (Checkout App) 

DBS Sandbox Rewards API + OAuth 2.0 integrated with a "serverless" shopping app built using Node, Ionic-Angular and Marketcloud.

## What is this?
This project is a demo for the DBS Sandbox Rewards API Customer Journey - OAuth 2.0, retrievePartyProfile, retrieveRewards, balanceCheck, pointRedemption. There is a server-side component for access token exchange along with [Marketcloud](https:/www.marketcloud.it) as backend.

Do kindly note that all interfaces to DBS is to its publicly-available sandbox environment. For more information, do kindly refer to the documentation on [DBS Developer's](https://www.dbs.com/developers/#/all-products)

## OAuth 2.0 Protocol

The diagram below is an abstract explanation of the typical client-app components involved in an OAuth handshake with DBS's developer sandbox.

![DBS-OAuth-Handshake](/resources/dbs-oauth-native-app-flow.png)

## Instructions

### Configuration
```
#You will need to specify the following parameters in the npm package file (At the very bottom of package.json)

  "config": {
    "port": "8100", 
    "host": "ericsohhaofeng.com",
    "allowed-origin": "ericsohhaofeng.com",
    "activate-stubbing" : "<<true case DBS Sandbox goes down on us without consent :). This activates stubbing >>", 
    "client-id": "<<Your App's Client ID>>",
    "client-secret": "<<Your App's Client Secret>>",
    "oauth-redirect-uri": "<<Your App's Redirect Uri>>",
    "corp_proxy": "http://<<Your Enterprise ID>>:<<Your Enterprise Password>>@<<Your Enterprise Proxy>>",
    "dbs-rewards-merchant-id": "<<Your App's Reward Merchant ID - Can be a dummy value for sandbox >>"
  }

#corp_proxy is only needed if you are sitting within a corporate wifi. (Example. DBS Network). If you're all comfy at home - just remove it.

```

### Installations

Kindly install [NodeJS](https:/www.marketcloud.it) - v8 or above

Git clone this repo and execute the following npm installations on your bash/command prompt

```
#You will need ionic and cordova
npm i -g ionic cordova

git clone https://github.com/sohhaofeng1989/dbs-rewards-ionic-marketcloud.git

cd dbs-rewards-ionic-marketcloud

npm install

npm run build
```

## Documentation
This project uses Marketcloud Javascript sdk, for any information about it check the [official documentation](http://www.marketcloud.it/documentation)

This project uses Ionic Framework for building Mobile Apps, for any information about it check the [official documentation](https://ionicframework.com/)


## Credits
- This project is a fork and extension of the Marketcloud/ionic-marketcloud repo
- [MarketCloud](http://www.marketcloud.it/documentation)
- [Ionic-Angular](https://ionicframework.com/)
- [DBS Developer's Sandbox available to public](https://www.dbs.com/developers)
