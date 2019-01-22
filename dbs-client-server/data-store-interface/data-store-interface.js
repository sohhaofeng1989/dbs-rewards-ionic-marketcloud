const { Interface, type } = require('implement-js');
const implementjs = require('implement-js');

implement= implementjs.default;

/*
CRUD Data store interface that needs to be implemented (Credits to the implement-js library - thanks mate!)
- Mongo, MariaDB, mySQL, noSQL, JVM, app memory, Redis, whatever
*/

const DataStore = Interface('DataStore')({
    /*
    	@retrieveSession -
    	inputs  - sessionId
    	outputs Promise/Observable Object with following subscription
    		    success 
    		    	{
	    		      resourceOwnerAccessToken (or null if none), 
	    			  resourceOwnerRefreshToken (or null if none),
	    			  state (for OAuth callback verification)
                      platform (A Boolean value - false for web application, true for native mobile applications. or null if unsure)
	    			}
	    		error
	    			{
					  message
		    		}
		Exceptions: ERR_ASSERTION for IO Exceptions
    */
    retrieveSession: type('function'),

    /*
    	@createSession -
    	inputs   - sessionId
    			 - sessionInfo 
    			  resourceOwnerAccessToken (or null if none), 
    			  resourceOwnerRefreshToken (or null if none),
    			  state (for OAuth callback verification)
                  platform (A Boolean value - false for web application, true for native mobile applications. or null if unsure)

    	outputs Promise/Observable Object with following subscription
    		    success   
    		    	{
	    		      result (boolean),
	    			}
	    		error
		    		{
	    		      message (for logging purposes, not found etc),						
	    			}
	    Exceptions: ERR_ASSERTION for IO Exceptions
    */
    createSession: type('function'),

    /*
    	@updateSession -
    	inputs  - sessionId
    			- sessionInfo
    			 resourceOwnerAccessToken (or null if none), 
    			 resourceOwnerRefreshToken (or null if none),
    			 state (for OAuth callback verification)
                 platform (A Boolean value - false for web application, true for native mobile applications. or null if unsure)


    	outputs Promise/Observable Object with following subscription
    		    success   
    		    	{
	    		      result (enum of UPDATED),
	    			}
	    		error
		    		{
	    		      message (for logging purposes, not found etc),						
	    			}
	    Exceptions: ERR_ASSERTION for IO Exceptions
    */
    updateSession: type('function'),

    /*
    	@deleteSession -
    	inputs  - sessionId

    	outputs Promise/Observable Object with following subscription
    		    success   
    		    	{
	    		      result (enum of DELETED),
	    			}
	    		error
		    		{
	    		      message (for logging purposes, not found etc),						
	    			}
	    Exceptions: ERR_ASSERTION for IO Exceptions
    */
    deleteSession: type('function')


}, { error: true });

module.exports = implement(DataStore)(require('./data-store-interface-impl'));
