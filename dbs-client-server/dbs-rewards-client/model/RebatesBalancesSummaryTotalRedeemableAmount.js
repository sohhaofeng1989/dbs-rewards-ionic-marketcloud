/**
 * Rewards APIs
 * # Overview Rewards APIs provide functionalities to retrieve rewards balances, redeemed rewards and rebates including historical information. Rewards Identifier can either be Programme or Card account number. These APIs also provides functionalities to view Rewards Catalogue items and redeem Rewards as miles, Vouchers, Cashback for your earned Rewards points.  # Version History Version | Release date | Change Log --------|--------------|---------------------- 1.0      | October, 2017   | Base version of API 1.0      | July, 2018   | Added new API **Retrieve Rewards Summary**. Added new fields **grossAmount** and **merchantId** to **Pay merchant using Rewards points** and **Pay merchant using daily$** API.  Added new field **uuid** for all APIs.  # Authentication <!-- ReDoc-Inject: <security-definitions> -->  # Pagination Pagination is not available on this API.  # Frequently Asked Question Q1: How to get list of Active Rewards account?  Ans: Get list of Active rewards account using **_/parties/{partyId}/rewards** with path parameters PartyId  Q2:  How to return rewards rebate transaction history?  Ans: Get rewards rebate transaction history for a given rewards identifier using **_/rewards/{rewardsId}/rebatesTransactions** with path parameters rewardsId. Note: Start date and End Date is mandatory.  Q3: How to redeem Rewards as Miles, Vouchers, or Cashback?  Ans: Get the redemption of Rewards to get Miles or Loyalty points, Vouchers or Cashback using **_/rewards/milesConversion/rewards/vouchersRedemption** , **_/rewards/rebatesCashback**  Q4: How to invoke partial redemption for Rewards?  Ans: Enter the total amount of the transaction in the grossAmount field and the amount to be redeemed via rewards in the redeemAmount field when calling the **_/rewards/{rewardsId}/paymentByPoints** or **_/rewards/{rewardsId}/paymentByRebates**.  # Known Issues This API has no pending issues at the moment. Want to report a new issue? please help us **here**  # Throttling (Rate Limits) We throttle our APIs by default to ensure maximum performance for all developers.  
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.3.1
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.RewardsApIs) {
      root.RewardsApIs = {};
    }
    root.RewardsApIs.RebatesBalancesSummaryTotalRedeemableAmount = factory(root.RewardsApIs.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The RebatesBalancesSummaryTotalRedeemableAmount model module.
   * @module model/RebatesBalancesSummaryTotalRedeemableAmount
   * @version 1.0
   */

  /**
   * Constructs a new <code>RebatesBalancesSummaryTotalRedeemableAmount</code>.
   * Total cash value amount equivalent that can be redeemed for Rebates scheme. This will be populated if query amount is not present or exceeds the balance.
   * @alias module:model/RebatesBalancesSummaryTotalRedeemableAmount
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>RebatesBalancesSummaryTotalRedeemableAmount</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/RebatesBalancesSummaryTotalRedeemableAmount} obj Optional instance to populate.
   * @return {module:model/RebatesBalancesSummaryTotalRedeemableAmount} The populated <code>RebatesBalancesSummaryTotalRedeemableAmount</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('amount')) {
        obj['amount'] = ApiClient.convertToType(data['amount'], 'Number');
      }
      if (data.hasOwnProperty('currency')) {
        obj['currency'] = ApiClient.convertToType(data['currency'], 'String');
      }
    }
    return obj;
  }

  /**
   * Amount
   * @member {Number} amount
   */
  exports.prototype['amount'] = undefined;
  /**
   * Currency type. ISO 4217 3-character currency code
   * @member {String} currency
   */
  exports.prototype['currency'] = undefined;



  return exports;
}));


