const express= require('express');
const bodyParser= require('body-parser');
const helmet = require('helmet');
const crypto = require('crypto');

const uuidv4 = require('uuid/v4');
const url = require('url')

const commonUtils = require('./common-utils');
const dbsOauthClient= require('./dbs-oauth-client/token-endpoint-initiator');
const dbsRewardsApi = require('./dbs-rewards-client/api/rewards-api-initiator');
const dataStoreInterface = require('./data-store-interface/data-store-interface');

webController= express();

// parse application/x-www-form-urlencoded
webController.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
webController.use(bodyParser.json());

webController.use(helmet());

//Redirect-URI
webController.get('/dbs-oauth/callback', function(req, res, next){
	
	console.log('req receieved at callback uri /dbs-oauth/callback-- body:%s', JSON.stringify(req.body), JSON.stringify(req.headers));

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
	}

	var authCode= decodeURIComponent(req.query.code);
	var state = decodeURIComponent(req.query.state);

	console.log('receieved authCode and state %0 and %1', authCode, state);

	commonUtils.verifyState(req.session.id, state, dataStoreInterface)
	.then(
	(success)=>{

  var isNative = success.platform;

	dbsOauthClient.initiateAuthCodeAccessTokenExchange(authCode, 
													   global.properties['client-id'], 
													   global.properties['client-secret'])
	.then(
	(success)=>{

	dataStoreInterface.updateSession(req.session.id, {resourceOwnerAccessToken : success.access_token,
                        													  resourceOwnerRefreshToken: success.refresh_token,
                        													  state                    : crypto.createHash('sha256')
                        											  			   	                     .update(req.session.id)
                        											  			   	                     .digest('hex'),
                                                    platform                 : isNative}
                                  )
	.then(
	(success)=>{

    //support for deeplinking (native) - user's mobile browser back to Native App via custom-uri-scheme redirection
		switch(isNative){
         default:
         case false:
                console.log('redirecting customer via a client-side redirection - /');
                res.redirect('/');
            break;
         case true :
                console.log('redirecting customer via a custom-uri-scheme redirection - /');
                res.redirect(global.properties['custom-uri-scheme'] + '://');
            break;
    };
	},
	(error)=>{
		var err = new Error('forbidden');
   		next(err);
	});
	},
	(error) => {
		var err = new Error('forbidden');
	   	next(err);
	});
	},
	(error) => {
		var err = new Error('forbidden');
   		next(err);
	});
	
});

webController.get('/sessionEval', function(req, res, next){
	
	console.log('req receieved at /sessionEval');

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
	}else{
		res.status(200).send(true);
	}
});

webController.post('/create-session', function(req, res, next){
	
	console.log('req receieved at /create-session-- body:%s', JSON.stringify(req.body));

	if(req.session.id){
		
		dataStoreInterface.retrieveSession(req.session.id)
		.then(
		(success)=>{
			res.status(200).send(true);
		},
		(err)=>{
			req.session.id= uuidv4();
			dataStoreInterface.createSession(req.session.id, {'state'    : crypto.createHash('sha256')
																			                               .update(req.session.id)
																			                               .digest('hex'),
                                                        'platform' : !(decodeURIComponent(req.query['isWeb'] === 'true'))
                                                       })
			.then(
			(success) =>{
				console.log('Session ' + req.session.id + 'created and stored successfully');
			},
			(err)=>{
				console.log('Failed to store Session ' + req.session.id + 'created successfully');

			});

			res.status(201).send(true);
		});

	}else{
		req.session.id= uuidv4();
		dataStoreInterface.createSession(req.session.id, {'state'   : crypto.createHash('sha256')
                          																		    .update(req.session.id)
                          																		    .digest('hex'),
                                                      'platform' : !(decodeURIComponent(req.query['isWeb'] === 'true'))
                                                     })
		.then(
			(success) =>{
				console.log('Session ' + req.session.id + 'created and stored successfully');
			},
			(err)=>{
				console.log('Failed to store Session ' + req.session.id + 'created successfully');

		});

		res.status(201).send(true);
	}
});

webController.get('/health', function(req, res, next){
	res.end('all healthy mate!');
});

webController.get('/dbs-authorization-endpoint', function(req, res, next){
	
	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
   	}

   var dbsAuthEndpoint= '/api/sg/v1/oauth/authorize?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}&state=${state}'

   switch(req.query.auth){
      default:
      case '1FA':

         res.status(200).send({
            'redirect-to' : 'https://www.dbs.com/sandbox' + 
                         dbsAuthEndpoint
                         .replace('${clientId}', global.properties['client-id'])
                         .replace('${scope}', 'Read') //HHHMMMMMMMMMMMMMMMMMMMMMMMM
                         .replace('${state}', (crypto.createHash('sha256').update(req.session.id).digest('hex')))
                         .replace('${redirectUri}', encodeURIComponent(global.properties['oauth-redirect-uri']))

         });

         break;
      case '2FA':

         dataStoreInterface.retrieveSession(req.session.id)
         .then(
         (success) => {
            console.log('retrieved session', success);
            const resourceOwnerAccessToken= success.resourceOwnerAccessToken;

            if(!resourceOwnerAccessToken || resourceOwnerAccessToken.split('.').length !== 3){
               var err = new Error('internal');
               next(err);
            }

            const claims = JSON.parse(new Buffer(resourceOwnerAccessToken.split('.')[1], 'base64').toString("ascii"));
            const partyId= claims['sub'];
            const expiry= claims['exp'];

            //if(parseInt(exp) < Date.now())
            //Dummy call to a 2FA API to get a 2FA Link
            dbsRewardsApi.initiateRewardPointRedemption(global.properties['client-id'], 
                                                        resourceOwnerAccessToken, 
                                                        null, 
                                                        { stub : false, dummyInvocation: true })
            .then(
               (success) => {

                  res.status(200).send({
                     'redirect-to' : 'https://www.dbs.com/sandbox' + 
                                  dbsAuthEndpoint
                                  .replace('/oauth/', '/access/')
                                  .replace('${clientId}', global.properties['client-id'])
                                  .replace('${scope}', 'Read') //HHHMMMMMMMMMMMMMMMMMMMMMMMM
                                  .replace('${state}', crypto.createHash('sha256').update(req.session.id).digest('hex'))
                                  .replace('${redirectUri}', encodeURIComponent(global.properties['oauth-redirect-uri']))
                                  .concat('&' + url.parse(success['url']).query)

                  });

                  res.status(200).send(success);
               },
               (error) => {
                  var err = new Error('forbidden');
                  next(err);
               });

         },
         (error) => {

         });


         break;
   }
});

webController.get('/dbs-customer/profile', function(req, res, next){
	console.log('req receieved at /create-session-- body:%s', JSON.stringify(req.session));

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
   	}

   	dataStoreInterface.retrieveSession(req.session.id)
   	.then(
   	(success) => {
   		console.log('retrieved session',success);
   		const resourceOwnerAccessToken= success.resourceOwnerAccessToken;

   		if(!resourceOwnerAccessToken || resourceOwnerAccessToken.split('.').length !== 3){
   			var err = new Error('internal');
   			next(err);
   		}

   		const claims = JSON.parse(new Buffer(resourceOwnerAccessToken.split('.')[1], 'base64').toString("ascii"));
   		const partyId= claims['sub'];
   		const expiry= claims['exp'];

   		//if(parseInt(exp) < Date.now())

   		dbsRewardsApi.retrieveCustomerProfile(global.properties['client-id'], resourceOwnerAccessToken, partyId, { stub : process.env.activateStubbing })
   		.then(
   			(success) => {
   				res.status(200).send(success);
   			},
   			(error) => {
   				var err = new Error('internal');
   				next(err);
   			});

   	},
   	(error) => {

   	});
});

webController.get('/dbs-customer/rewards', function(req, res, next){

	console.log('req receieved at /create-session-- body:%s', JSON.stringify(req.session));

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
   	}

   	dataStoreInterface.retrieveSession(req.session.id)
   	.then(
   	(success) => {
   		console.log('retrieved session', success);
   		const resourceOwnerAccessToken= success.resourceOwnerAccessToken;

   		if(!resourceOwnerAccessToken || resourceOwnerAccessToken.split('.').length !== 3){
   			var err = new Error('internal');
   			next(err);
   		}

   		const claims = JSON.parse(new Buffer(resourceOwnerAccessToken.split('.')[1], 'base64').toString("ascii"));
   		const partyId= claims['sub'];
   		const expiry= claims['exp'];

   		//if(parseInt(exp) < Date.now())

   		dbsRewardsApi.retrieveCustomerRewards(global.properties['client-id'], resourceOwnerAccessToken, partyId, { stub : process.env.activateStubbing })
   		.then(
   			(success) => {
   				res.status(200).send(success);
   			},
   			(error) => {
   				var err = new Error('internal');
   				next(err);
   			});

   	},
   	(error) => {

   	});

});

webController.get('/dbs-customer/rewards/:rewardId/balanceCheck', function(req, res, next){

	console.log('req receieved at /dbs-customer/rewards/:rewardId/balanceCheck -- body:%s', JSON.stringify(req.session));

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
   	}

   	dataStoreInterface.retrieveSession(req.session.id)
   	.then(
   	(success) => {
   		console.log('retrieved session',success);
   		const resourceOwnerAccessToken= success.resourceOwnerAccessToken;

   		if(!resourceOwnerAccessToken || resourceOwnerAccessToken.split('.').length !== 3){
   			var err = new Error('internal');
   			next(err);
   		}

   		const claims = JSON.parse(new Buffer(resourceOwnerAccessToken.split('.')[1], 'base64').toString("ascii"));
   		const partyId= claims['sub'];
   		const expiry= claims['exp'];

   		//if(parseInt(exp) < Date.now())

   		dbsRewardsApi.retrieveCustomerRewardsBalance(global.properties['client-id'], resourceOwnerAccessToken, partyId, req.params.rewardId, { stub : process.env.activateStubbing })
   		.then(
   			(success) => {
   				res.status(200).send(success);
   			},
   			(error) => {
   				var err = new Error('internal');
   				next(err);
   			});

   	},
   	(error) => {

   	});

});

webController.get('/dbs-customer/rewards/:rewardId/conversionRates', function(req, res, next){

	console.log('req receieved at /dbs-customer/rewards/:rewardId/conversionRates -- body:%s', JSON.stringify(req.session));

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
   	}

   	dataStoreInterface.retrieveSession(req.session.id)
   	.then(
   	(success) => {
   		console.log('retrieved session',success);
   		const resourceOwnerAccessToken= success.resourceOwnerAccessToken;

   		if(!resourceOwnerAccessToken || resourceOwnerAccessToken.split('.').length !== 3){
   			var err = new Error('internal');
   			next(err);
   		}

   		const claims = JSON.parse(new Buffer(resourceOwnerAccessToken.split('.')[1], 'base64').toString("ascii"));
   		const partyId= claims['sub'];
   		const expiry= claims['exp'];

   		//if(parseInt(exp) < Date.now())

   		dbsRewardsApi.retrieveCustomerRewardsConversionRates(global.properties['client-id'], resourceOwnerAccessToken, req.params.rewardId, { stub : process.env.activateStubbing })
   		.then(
   			(success) => {
   				res.status(200).send(success);
   			},
   			(error) => {
   				var err = new Error('internal');
   				next(err);
   			});

   	},
   	(error) => {

   	});

});

webController.post('/dbs-customer/rewards/paymentByPoints', function(req, res, next){

	console.log('req receieved at /dbs-customer/rewards/paymentByPoints -- body:%s', JSON.stringify(req.body));

	if(!req.session.id){
		var err = new Error('invalid-session');
   		next(err);
   	}

   	dataStoreInterface.retrieveSession(req.session.id)
   	.then(
   	(success) => {
   		console.log('retrieved session',success);
   		const resourceOwnerAccessToken= success.resourceOwnerAccessToken;

   		if(!resourceOwnerAccessToken || resourceOwnerAccessToken.split('.').length !== 3){
   			var err = new Error('internal');
   			next(err);
   		}

   		const claims = JSON.parse(new Buffer(resourceOwnerAccessToken.split('.')[1], 'base64').toString("ascii"));
   		const partyId= claims['sub'];
   		const expiry= claims['exp'];

   		//if(parseInt(exp) < Date.now())

   		dbsRewardsApi.initiateRewardPointRedemption(global.properties['client-id'], resourceOwnerAccessToken, 
   													req.body.rewardId, 
   													{ stub 		  : 	process.env.activateStubbing,
   													  orderId     :   req.body.orderId,
                                            referenceId :   req.body.referenceId,
                                            rewardId 	  : 	req.body.rewardId,
                                            redeemAmount:   req.body.redeemAmount,
                                            grossAmount :   req.body.redeemAmount,
                                            partyId     :   partyId,
   													  merchantId  :   global.properties['dbs-rewards-merchant-id']
   													})
   		.then(
   			(success) => {
   				res.status(200).send(success);
   			},
   			(error) => {
   				var err = new Error('internal');
   				next(err);
   			});

   	},
   	(error) => {

   	});

});

/*Error-Handling Logic for webController*/

function logErrors (err) {
  console.error('ERROR STACK: ' + err.stack)
}


webController.use(function (err, req, res, next) {
	
	logErrors(err);

	switch(err.message){
		default:
		case 'internal': 
			res.status(500).send('Internal Server Error');
			break;
		case 'forbidden':
			res.status(200).send({
			'redirect-to' : '/something-happened'
			});
			break;
		case 'invalid-session':
			console.log('sending a prompt for relogin');
			res.status(401).send('relogin');
			break;
	}
});

module.exports= webController;