const request =  require('request');
const assert = require('assert');
const atob = require('atob');
const fs = require('fs');

const commonUtils = require('../../common-utils')

const _rewardsApiInceptiveHandler = (reqOptions) => {

	return new Promise((resolve, reject) => {
		if(reqOptions.stub == 'true'){
			console.log('Sending back stubbed data instead as specified in npm config file..')
			resolve(reqOptions.correspondingStubbedDataRetrievalHandler());
		}
		else
			request(reqOptions, (error, response, body) => {
			      switch(response.statusCode){
			      	
			      	default:
			      	case 500:
				      	console.log('Failed Handshake with DBS endpoint - \n---\n' + response.statusCode + '\n---\n'	, response.headers);
				      	reject({
				      		'error' :  response.statusCode,
				      		'message' : JSON.stringify(response.body)
				      	});
						break;
			      	case 200:
			      	case 201:
			      		console.log('Handshake with DBS endpoint - \n---\n' + response.statusCode + '\n---\n', response.headers);
			        	
			        	let toResolve = (typeof(response.body) === 'string'? 
					        			(commonUtils.isJsonString(response.body)? JSON.parse(response.body) : false) 
					        			: response.body);
					    if(toResolve)
					    	resolve(toResolve);
					    else
					      	reject({
					      		'error' :  response.statusCode,
					      		'message' : JSON.stringify(response.body)
					      	});

			      		break;

			      	case 403:
			      		console.log('Handshake with DBS endpoint requires Customer 2FA Elevation - \n---\n' + response.statusCode + '\n---\n', response.headers);
			        	resolve(typeof(response.body) === 'string'? JSON.parse(response.body['Error']) : response.body['Error']);
			      		break;
			      }
			});
	});
}

const _retrieveCustomerProfileStubbed = () => {
	return JSON.parse(fs.readFileSync(global.appRoot + '/stubs/partyProfile.json', {encoding : 'utf8'}));
}

const _retrieveCustomerRewardsStubbed = () => {
	return JSON.parse(fs.readFileSync(global.appRoot + '/stubs/partyRewards.json', {encoding : 'utf8'}));
}

const _retrieveCustomerRewardsBalanceStubbed = () => {
	return JSON.parse(fs.readFileSync(global.appRoot + '/stubs/rewardsBalanceCheck.json', {encoding : 'utf8'}));
}

const _retrieveCustomerRewardsConversionRatesStubbed = () => {
	return JSON.parse(fs.readFileSync(global.appRoot + '/stubs/rewardsConversionRates.json', {encoding : 'utf8'}));
}

const _initiateRewardPointRedemptionStubbed = () => {
	return JSON.parse(fs.readFileSync(global.appRoot + '/stubs/pointRedemptionResponse.json', {encoding : 'utf8'}));
}

const _initiateRewardPointRedemption = (clientId, accessToken, rewardId, opts) => {

	assert(clientId && accessToken && (opts.dummyInvocation || rewardId));

	let paymentRequestGrossAmount = require('../index').PaymentRequestGrossAmount.constructFromObject(opts.grossAmount);
	let paymentRequestRedeemAmount = require('../index').PaymentRequestRedeemAmount.constructFromObject(opts.redeemAmount);

	let paymentByPointsRequest = require('../index').PaymentRequest.constructFromObject({
		'merchantId' : !opts.dummyInvocation? opts.merchantId : '',
		'referenceId' : !opts.dummyInvocation? opts.referenceId : '', 
		'orderId' : !opts.dummyInvocation? opts.orderId : '',
		'grossAmount' : !opts.dummyInvocation? paymentRequestGrossAmount : '',
		'redeemAmount' : !opts.dummyInvocation? paymentRequestRedeemAmount : '',
		'partyId' : !opts.dummyInvocation? opts.partyId : ''
	});
	
	const endpoint = '/api/sg/v1/rewards/${rewardId}/paymentByPoints'.replace('${rewardId}', encodeURIComponent(rewardId));

	console.log('invoking dbs /api/sg/v1/rewards/${rewardId}/paymentByPoints endpoint');


	const isProxy= process.env.HTTP_PROXY || 
				   (global.properties['corp_proxy'] && global.properties['corp_proxy'].length > 0);
	const proxy =  process.env.HTTP_PROXY || global.properties['corp_proxy'];		 

	var options = {
	  url: 'https://www.dbs.com/sandbox' + endpoint,
	  method: 'POST',
	  headers: {
	    'clientId': clientId,
	    'accessToken': accessToken,
	    'user-agent' : 'nodejs/request',
	    'accept'	 : 'application/json'
	  },
	  json: true,
	  body: paymentByPointsRequest,
	  stub: opts.stub,
	  correspondingStubbedDataRetrievalHandler: _initiateRewardPointRedemptionStubbed
	};
	
	if(isProxy)
		options['proxy']= proxy;

	console.log('invoking dbs rewards paymentByPoints endpoint with following data - %0', options);

	return _rewardsApiInceptiveHandler(options);
}

const _retrieveCustomerRewardsConversionRates = (clientId, accessToken, rewardId, opts) =>{		

	assert(clientId && accessToken && rewardId);

	const endpoint = '/api/sg/v1/rewards/${rewardId}/conversionRates'.replace('${rewardId}', encodeURIComponent(rewardId));

	console.log('invoking dbs /api/sg/v1/rewards/${rewardId}/conversionRates endpoint');


	const isProxy= process.env.HTTP_PROXY || 
				   (global.properties['corp_proxy'] && global.properties['corp_proxy'].length > 0);
	const proxy =  process.env.HTTP_PROXY || global.properties['corp_proxy'];		 

	var options = {
	  url: 'https://www.dbs.com/sandbox' + endpoint,
	  method: 'GET',
	  headers: {
	    'clientId': clientId,
	    'accessToken': accessToken,
	    'user-agent' : 'nodejs/request',
	    'accept'	 : 'application/json'
	  },
	  stub: opts.stub,
	  correspondingStubbedDataRetrievalHandler: _retrieveCustomerRewardsConversionRatesStubbed
	};
	
	if(isProxy)
		options['proxy']= proxy;

	console.log('invoking dbs retrieve rewards card Conversion Rate endpoint with following data - %0', options);

	return _rewardsApiInceptiveHandler(options);
}


const _retrieveCustomerProfile = (clientId, accessToken, partyId, opts) =>{		

	assert(clientId && accessToken && partyId);

	const endpoint = '/api/sg/v2/parties/${partyId}'.replace('${partyId}', encodeURIComponent(partyId));

	console.log('invoking dbs /parties/${partyId} endpoint');


	const isProxy= process.env.HTTP_PROXY || 
				   (global.properties['corp_proxy'] && global.properties['corp_proxy'].length > 0);
	const proxy =  process.env.HTTP_PROXY || global.properties['corp_proxy'];		 

	var options = {
	  url: 'https://www.dbs.com/sandbox' + endpoint,
	  method: 'GET',
	  headers: {
	    'clientId': clientId,
	    'accessToken': accessToken,
	    'user-agent' : 'nodejs/request',
	    'accept'	 : 'application/json'
	  },
	  stub: opts.stub,
	  correspondingStubbedDataRetrievalHandler: _retrieveCustomerProfileStubbed
	};
	
	if(isProxy)
		options['proxy']= proxy;

	console.log('invoking dbs retrieve customer profile endpoint with following data - %0', options);

	return _rewardsApiInceptiveHandler(options)
}

const _retrieveCustomerRewards = (clientId, accessToken, partyId, opts) =>{		

	assert(clientId && accessToken && partyId);

	//THIS IS A DUMMY VALUE -.-.
	const endpoint = '/api/sg/v1/parties/${partyId}/rewards'.replace('${partyId}', encodeURIComponent(partyId));

	console.log('invoking dbs /parties/${partyId}/rewards endpoint');


	const isProxy= process.env.HTTP_PROXY || 
				   (global.properties['corp_proxy'] && global.properties['corp_proxy'].length > 0);
	const proxy =  process.env.HTTP_PROXY || global.properties['corp_proxy'];		 

	var options = {
	  url: 'https://www.dbs.com/sandbox' + endpoint,
	  method: 'GET',
	  headers: {
	    'clientId': clientId,
	    'accessToken': accessToken,
	    'user-agent' : 'nodejs/request',
	    'accept'	 : 'application/json'
	  },
	  stub: opts.stub,
	  correspondingStubbedDataRetrievalHandler: _retrieveCustomerRewardsStubbed
	};
	
	if(isProxy)
		options['proxy']= proxy;

	console.log('invoking dbs retrieve customer reward cards endpoint with following data - %0', options);

	return _rewardsApiInceptiveHandler(options);
}

const _retrieveCustomerRewardsBalance = (clientId, accessToken, partyId, rewardId, opts) =>{		

	assert(clientId && accessToken && partyId);

	const endpoint = '/api/sg/v1/rewards/${rewardId}/balanceCheck'.replace('${rewardId}', encodeURIComponent(rewardId));

	console.log('/api/sg/v1/rewards/${rewardId}/balanceCheck endpoint');


	const isProxy= process.env.HTTP_PROXY || 
				   (global.properties['corp_proxy'] && global.properties['corp_proxy'].length > 0);
	const proxy =  process.env.HTTP_PROXY || global.properties['corp_proxy'];		 

	var options = {
	  url: 'https://www.dbs.com/sandbox' + endpoint,
	  method: 'GET',
	  headers: {
	    'clientId': clientId,
	    'accessToken': accessToken,
	    'user-agent' : 'nodejs/request',
	    'accept'	 : 'application/json'
	  },
	  stub: opts.stub,
	  correspondingStubbedDataRetrievalHandler: _retrieveCustomerRewardsBalanceStubbed
	};
	
	if(isProxy)
		options['proxy']= proxy;

	console.log('invoking dbs retrieve customer reward card balance endpoint with following data - %0', options);

	return _rewardsApiInceptiveHandler(options);
}

module.exports= {
	retrieveCustomerRewards : _retrieveCustomerRewards,
	retrieveCustomerProfile : _retrieveCustomerProfile,
	retrieveCustomerRewardsBalance : _retrieveCustomerRewardsBalance,
	retrieveCustomerRewardsConversionRates : _retrieveCustomerRewardsConversionRates,
	initiateRewardPointRedemption : _initiateRewardPointRedemption
}