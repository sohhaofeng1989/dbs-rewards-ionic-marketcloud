const { Observable, Subject, ReplaySubject, from, of, range } = require('rxjs');

const dataStore = require('./data-store-connector');

const assert = require('assert');

module.exports= {
	retrieveSession : (sessionId) => {

		assert(sessionId && sessionId.length > 0);
		
		return new Promise((resolve, reject) => {

			const dataToReturn= dataStore.get(sessionId)
				
			if(dataToReturn)
				resolve({ resourceOwnerAccessToken : dataToReturn['resourceOwnerAccessToken'], 
	    			  	  resourceOwnerRefreshToken: dataToReturn['resourceOwnerRefreshToken'],
	    			  	  state					   : dataToReturn['state'],
	    			  	  platform				   : dataToReturn['platform']
	    			    });
			else
				reject({
					message : "SessionNotFound"
				});
		});
	},
	createSession : (sessionId, sessionInfo) => {

		assert(sessionId && sessionId.length > 0);
		assert(sessionInfo.resourceOwnerAccessToken ||
			   sessionInfo.state);

		return new Promise((resolve, reject) => {

			success = dataStore.set( sessionId,
				{
					resourceOwnerAccessToken 	: sessionInfo['resourceOwnerAccessToken'],
					resourceOwnerRefreshToken 	: sessionInfo['resourceOwnerRefreshToken'],
					state 						: sessionInfo['state'],
					platform				   	: sessionInfo['platform']
				}
			)? resolve({result : true}) : reject({result : 'DataStoreIOError'});
		});

	},
	updateSession : (sessionId, sessionInfo) => {

		assert(sessionId && sessionId.length > 0);
		assert(sessionInfo && Object.keys(sessionInfo));

		return new Promise((resolve, reject) => {

			const dataToReturn= dataStore.set( sessionId,
				{
					resourceOwnerAccessToken 	: sessionInfo['resourceOwnerAccessToken'],
					resourceOwnerRefreshToken 	: sessionInfo['resourceOwnerRefreshToken'],
					state 						: sessionInfo['state'],
					platform				   	: sessionInfo['platform']? sessionInfo['platform'] : null
				}
			)? resolve({result : true}) : reject({result : 'DataStoreIOError'});
		});

	},
	deleteSession : (sessionId) => {

		assert(sessionId && sessionId.length > 0);

		return new Promise((resolve, reject) => {

			const deletedKeys= dataStore.del( sessionId );
		 	const deleted= deletedKeys > 0 ? resolve({result : true}) 
		 								   : reject({result : 'DataStoreIOError'});
		});
	},
}