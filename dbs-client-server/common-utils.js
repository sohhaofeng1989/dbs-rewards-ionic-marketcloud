const crypto = require('crypto');

module.exports.verifyState= (sessionId, stateToVerify, dataStoreInterface) => {
	
	return new Promise((resolve, reject) =>{

		dataStoreInterface.retrieveSession(sessionId)
		.then(
		(success) => {
			/*
				2-steps to verifying state -
				part 1) - comparing hashed session cookie vs provided state
				part 2) - comparing cached state vs provided state
			*/

			console.log(success);

			console.log('verifying state part 1) - comparing hashed session cookie vs provided state : ' 
						+ crypto.createHash('sha256').update(sessionId).digest('hex')
						+ ' --- vs --- ' + stateToVerify);

			console.log('verifying state part 2) - comparing cached state vs provided state : ' 
						+ success.state 
						+ ' --- vs --- ' + stateToVerify);

			var result= crypto.createHash('sha256').update(sessionId).digest('hex') === stateToVerify 
					    && success.state === stateToVerify;


			console.log('state verification successsful?' + result? ' Yes!' : 'No');

			if(result)
				resolve(success);
			else
				reject('SessionNotFound');
		}, 
		(err) => {
			console.log('SessionNotFound');
			reject('SessionNotFound');

		});

	});
};

module.exports.isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  };