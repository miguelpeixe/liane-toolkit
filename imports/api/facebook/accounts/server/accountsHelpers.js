import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};
_fb = new Facebook(options);

const FacebookAccountsHelpers = {
  getUserAccounts({ userId }) {
    check(userId, String);

    logger.info("FacebookAccountsHelpers.getUserAccounts: called", { userId });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      return { error: "This user does not exists" };
    }
    if (!user.services.facebook) {
      return { error: "This user has not accessToken" };
    }

    const accessToken = user.services.facebook.accessToken;
    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api("me/", { fields: ["id", "accounts"] })
    );

    return { result: response.accounts.data };
  },
  exchangeFBToken({ token }) {
    check(token, String);
    const response = Promise.await(
      _fb.api(
        "oauth/access_token",
        Object.assign(
          {
            grant_type: "fb_exchange_token",
            fb_exchange_token: token
          },
          options
        )
      )
    );
    return { result: response.access_token };
  }
};

exports.FacebookAccountsHelpers = FacebookAccountsHelpers;
