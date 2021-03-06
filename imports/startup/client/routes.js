import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import AppContainer from "/imports/ui/containers/app/AppContainer.jsx";
import AccountsContainer from "/imports/ui/containers/accounts/AccountsContainer.jsx";

import AuthPageSignIn from "/imports/ui/pages/accounts/AuthPageSignIn.jsx";
import AuthPageJoin from "/imports/ui/pages/accounts/AuthPageJoin.jsx";
import AuthPageRecoveryPassword from "/imports/ui/pages/accounts/AuthPageRecoveryPassword.jsx";
import AuthPageResetPassword from "/imports/ui/pages/accounts/AuthPageResetPassword.jsx";

import DashboardPageContainer from "/imports/ui/containers/app/DashboardPageContainer.jsx";
import AddCampaignPageContainer from "/imports/ui/containers/campaigns/AddCampaignPageContainer.jsx";
import AddContextsPageContainer from "/imports/ui/containers/contexts/AddContextsPageContainer.jsx";
import AddAudienceCategoriesPageContainer from "/imports/ui/containers/audiences/AddAudienceCategoriesPageContainer.jsx";
import CampaignsPageContainer from "/imports/ui/containers/campaigns/CampaignsPageContainer.jsx";

import JobsPage from "/imports/ui/pages/jobs/JobsPage.jsx";

import NotFoundPage from "../../ui/pages/NotFoundPage.jsx";

const APP_NAME = Meteor.settings.public.appName;

const _addTitle = function(title) {
  DocHead.setTitle(title);
};

const trackRouteEntry = () => {
  Meteor.setTimeout(() => {
    const userId = Meteor.userId();
    if (userId) {
      // Woopra.track({ userId });
      console.log("trackRouteEntry");
    }
  }, 3000);
};

FlowRouter.notFound = {
  name: "App.notFound",
  action: function() {
    _addTitle(`${APP_NAME} | Page not found`);
    return mount(NotFoundPage);
  }
};

FlowRouter.route("/signin", {
  name: "Accounts.signin",
  action: function() {
    _addTitle(`${APP_NAME} | Sign In`);
    return mount(AccountsContainer, { content: <AuthPageSignIn /> });
  }
});

FlowRouter.route("/join", {
  name: "Accounts.join",
  action: function(params) {
    _addTitle(`${APP_NAME} | Join`);
    return mount(AccountsContainer, { content: <AuthPageJoin /> });
  }
});

FlowRouter.route("/forgot-password", {
  name: "Accounts.forgotPassword",
  action: function(params) {
    _addTitle(`${APP_NAME} | Recovery Password`);
    return mount(AccountsContainer, { content: <AuthPageRecoveryPassword /> });
  }
});
FlowRouter.route("/reset-password/:token", {
  name: "Accounts.resetPassword",
  action: function(params) {
    _addTitle(`${APP_NAME} | Reset Password`);
    return mount(AccountsContainer, { content: <AuthPageResetPassword /> });
  }
});

FlowRouter.route("/verify-email/:token", {
  name: "Accounts.verifyEmail",
  action: function(params) {
    Accounts.verifyEmail(params.token, error => {
      if (error) {
        Bert.alert(error.reason, "danger");
      } else {
        FlowRouter.go("App.home");
        Bert.alert("Email verified! Thanks!", "success");
      }
    });
  }
});

// admin routes
const appRoutes = FlowRouter.group({
  name: "app",
  // prefix: "/admin",
  triggersEnter: [trackRouteEntry]
});

appRoutes.route("/", {
  name: "App.dashboard",
  action: function() {
    _addTitle(`${APP_NAME} | Dashboard`);
    return mount(AppContainer, {
      content: { component: DashboardPageContainer }
    });
  }
});

appRoutes.route("/add-campaign", {
  name: "App.addCampaign",
  action: function() {
    _addTitle(`${APP_NAME} | Add Campaign`);
    return mount(AppContainer, {
      content: { component: AddCampaignPageContainer }
    });
  }
});
appRoutes.route("/campaign/:_id", {
  name: "App.campaignDetail",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsPageContainer,
        props: { campaignId: params._id }
      }
    });
  }
});
appRoutes.route("/campaign/:_id/account/:facebookId", {
  name: "App.campaignDetail.account",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsPageContainer,
        props: { campaignId: params._id, facebookId: params.facebookId }
      }
    });
  }
});

appRoutes.route("/add-context", {
  name: "App.addContext",
  action: function() {
    _addTitle(`${APP_NAME} | Add Context`);
    return mount(AppContainer, {
      content: { component: AddContextsPageContainer }
    });
  }
});

appRoutes.route("/add-audience-category", {
  name: "App.addAudienceCategory",
  action: function() {
    _addTitle(`${APP_NAME} | Add Audience Category`);
    return mount(AppContainer, {
      content: { component: AddAudienceCategoriesPageContainer }
    });
  }
});
