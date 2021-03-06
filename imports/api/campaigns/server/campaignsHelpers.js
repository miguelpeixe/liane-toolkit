import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { AudienceCategoriesHelpers } from "/imports/api/audienceCategories/server/audienceCategoriesHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";

const CampaignsHelpers = {
  addAccountToCampaign({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    logger.info("CampaignsHelpers.addAccountToCampaign: called", {
      campaignId,
      account
    });

    const token = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token
    });

    const updateObj = {
      facebookId: account.id,
      accessToken: token.result
    };

    Campaigns.update(
      { _id: campaignId },
      { $addToSet: { accounts: updateObj } }
    );

    const upsertObj = {
      $set: {
        name: account.name,
        category: account.category
      }
    };

    FacebookAccounts.upsert({ facebookId: account.id }, upsertObj);
    JobsHelpers.addJob({
      jobType: "entries.fetchByAccount",
      jobData: {
        facebookId: account.id,
        accessToken: token.result,
        campaignId: campaignId
      }
    });
    AudienceCategoriesHelpers.fetchAudienceCategoriesByAccount({
      facebookAccountId: account.id
    });
    return;
  }
};

exports.CampaignsHelpers = CampaignsHelpers;
