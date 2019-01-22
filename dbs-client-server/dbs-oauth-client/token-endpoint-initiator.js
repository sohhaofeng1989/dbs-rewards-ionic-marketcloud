const request =  require('request');
const assert = require('assert');
const atob = require('atob');

const _initiateAuthCodeAccessTokenExchange = (authCode, clientId, clientSecret) =>{
		
	console.log('invoking dbs token endpoint');

	assert(authCode && clientId && clientSecret);

	const basicAuth = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64');

	const dbsTokenEndpoint = '/api/sg/v1/oauth/tokens';
	const dbsRefreshTokenEndpoint = '/api/sg/v1/access/refresh';

	const isProxy= process.env.HTTP_PROXY || 
				   (global.properties['corp_proxy'] && global.properties['corp_proxy'].length > 0);
	const proxy =  process.env.HTTP_PROXY || global.properties['corp_proxy'];		 

	var options = {
	  url: 'https://www.dbs.com/sandbox' + dbsTokenEndpoint,
	  method: 'POST',
	  headers: {
	    'Authorization': basicAuth,
	  },
	  form: {
	    'code' : authCode,
	    'redirect_uri' : global.properties['oauth-redirect-uri']
      }
	};
	
	if(isProxy)
		options['proxy']= proxy;

	console.log('invoking dbs token endpoint with following data - %0', options );

	return new Promise((resolve, reject) => {

		request(options, (error, response, body) => {
	      	
	      	if(!response && !error ){
	      		console.log('No response from HTTP Connection - Connection might not have been establish')
	      		reject({
		      		'error' :  '500',
		      		'message' : JSON.stringify({errorMsg: 'Internal Server Error'})
		      	});
	      	}
	      	else{
		      
			    if(response.statusCode >= 200){

			    	console.log('Handshake with DBS Access Token Endpoint - \n---\n' + 
		      	  			   response && response.headers && response.statusCode? response.statusCode 
		      	  			  									: (error) + '\n---\n', response.headers);

			        resolve({
			        			access_token : typeof(response.body) === 'string'? JSON.parse(response.body)['access_token'] : response.body['access_token'],
			        			refresh_token : typeof(response.body) === 'string'? JSON.parse(response.body)['refresh_token'] : response.body['refresh_token']
			        		});
			      } else {

			      	console.log('Failed Handshake with DBS Access Token Endpoint - \n---\n' + response.statusCode + '\n---\n'	, response.headers);
			      	reject({
			      		'error' :  response.statusCode,
			      		'message' : JSON.stringify(body)
			      	})
			      }
			  }
		})
	});
}

module.exports= {
	initiateAuthCodeAccessTokenExchange : _initiateAuthCodeAccessTokenExchange
}