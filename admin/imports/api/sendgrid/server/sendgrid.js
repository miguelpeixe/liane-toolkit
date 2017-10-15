/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const sendgrid = require("sendgrid")(Meteor.settings.email.sendgrid.apiKey);

const _emailTypesToTemplate = {
  verifyEmail: "validate_email_address",
  resetPassword: "reset_password",
  activationHelp: "basic_html",
  subscriptionProcessed: "order_confirmation",
  subscriptionPastDue: "basic_html",
  subscriptionPastDueCancelled: "basic_html",
  "aboutToExpire-trial": "about_to_expire",
  "aboutToExpire-subscription": "about_to_expire",
  actionsRequired: "basic_html",
  support: "basic_html",
  staff: "basic_html",
  serviceAccountsGrantAccess: "basic_html"
};

const _templates = {
  validate_email_address: "d238cf14-ca06-4aee-ad16-e4fade613b6c",
  reset_password: "8c31d755-d389-4e5a-a02a-b568972db470",
  about_to_expire: "5bac3128-386c-4bed-b418-87ced4a733b4",
  order_confirmation: "1936a6d3-67fa-4d7c-b147-f75d7a5506a1",
  basic_html: "1cb10f49-3edb-4fc8-b139-e1dd8b3db53e"
};

const Sendgrid = {
  send({ emailParams, emailType, dataContext, extraParams }) {
    check(emailParams, Object);
    check(emailType, String);
    check(dataContext, Match.Maybe(Object));
    check(extraParams, Match.Maybe(Object));

    logger.debug("Sendgrid.send: called", {
      emailParams,
      emailType,
      dataContext,
      extraParams
    });

    const request = sendgrid.emptyRequest();

    let receivers = [];

    if (_.isArray(emailParams.to)) {
      _.each(emailParams.to, function(email) {
        const to = { email };
        return receivers.push(to);
      });
    }

    if (_.isString(emailParams.to)) {
      receivers = [{ email: emailParams.to }];
    }

    let { subject } = emailParams;
    if (Meteor.settings.public.deployMode !== "production") {
      subject = `[${Meteor.settings.public.deployMode}] ${subject}`;
    }

    request.body = {
      from: {
        email: `<no-reply@${Meteor.settings.public.domain}>`,
        name: Meteor.settings.public.appName
      },
      content: [
        {
          type: "text/html",
          value: emailParams.html || "empty"
        }
      ],
      template_id: _templates[_emailTypesToTemplate[emailType]],
      personalizations: [
        {
          headers: {
            "X-Accept-Language": "en",
            "X-Mailer": Meteor.settings.public.appName
          },
          subject,
          to: receivers,
          substitutions: dataContext,
          custom_args: extraParams
        }
      ]
    };

    request.method = "POST";
    request.path = "/v3/mail/send";

    const response = Async.runSync(done => {
      logger.debug("before calling sendgrid.send");
      return sendgrid.API(request, (error, response) => done(error, response));
    });

    return response;
  }
};

exports.Sendgrid = Sendgrid;