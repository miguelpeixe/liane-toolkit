const { Jobs } = require("/imports/api/jobs/jobs.js");

Meteor.methods({
  "jobs.clearCompletedJobs"() {
    logger.debug("jobs.cleanCompletedJobs: called");
    const jobsToRemoveIds = _.pluck(
      Jobs.find({ status: "completed" }, { _id: 1 }).fetch(),
      "_id"
    );
    return Jobs.removeJobs(jobsToRemoveIds);
  },

  "jobs.clearCompletedIdleJobs"() {
    logger.debug("jobs.clearCompletedIdleJobs: called");
    const thirty_mins_ago = new Date(
      moment()
        .subtract(30, "minutes")
        .valueOf()
    );
    const jobsToClear = Jobs.find(
      {
        status: "completed",
        updated: {
          $lt: thirty_mins_ago
        }
      },
      { fields: { _id: 1 } }
    ).fetch();
    console.log("jobsToClear", jobsToClear);
    const jobsToClearIds = _.pluck(jobsToClear, "_id");
    console.log("jobsToClearIds", jobsToClearIds);
    return Jobs.removeJobs(jobsToClearIds);
  },

  "jobs.repairIdleJobs"() {
    logger.info("jobs.repairIdleJobs: called");
    const thirty_mins_ago = moment()
      .subtract(30, "minutes")
      .toDate();

    const jobsTypesToRestart = [
      "serviceAccounts.updateData",
      "conversions.update",
      "conversions.calculate",
      "serviceAccounts.setup"
    ];

    const jobsToRestart = Jobs.find(
      {
        status: "running",
        updated: {
          $lt: thirty_mins_ago
        },
        type: {
          $in: jobsTypesToRestart
        }
      },
      {
        fields: {
          _id: 1
        }
      }
    ).fetch();

    const jobsToRestartIds = _.pluck(jobsToRestart, "_id");

    if (jobsToRestartIds.length) {
      logger.info("Jobs.cleanIdleJobs: restarting this jobs", {
        jobsToRestart: jobsToRestartIds.length
      });
    }
    Jobs.cancelJobs(jobsToRestartIds); // need to cancel before restart
    Jobs.restartJobs(jobsToRestartIds);

    const jobsToRemove = Jobs.find(
      {
        status: "running",
        updated: {
          $lt: thirty_mins_ago
        },
        type: {
          $nin: jobsTypesToRestart
        }
      },
      {
        fields: {
          _id: 1
        }
      }
    ).fetch();

    const jobsToRemoveIds = _.pluck(jobsToRemove, "_id");

    if (jobsToRemoveIds.length) {
      logger.info("Jobs.cleanIdleJobs: removing this jobs", {
        jobsToRemoveIds: jobsToRemoveIds.length
      });
    }
    Jobs.cancelJobs(jobsToRemoveIds); // need to cancel before remove
    Jobs.removeJobs(jobsToRemoveIds);

    return logger.info("jobs.repairIdleJobs: finished");
  },

  "jobs.restartIdleJobs"() {
    logger.info("jobs.restartIdleJobs: called");
    const jobsTypesToRestart = [
      "serviceAccounts.instagram.triggers",
      "serviceAccounts.twitter.triggers",
      "serviceAccounts.twitter.dislikes"
    ];

    const jobsToRestart = Jobs.find(
      {
        status: "running",
        type: {
          $in: jobsTypesToRestart
        },
        updated: {
          $lt: moment()
            .subtract(20, "minutes")
            .toDate()
        }
      },
      { fields: { _id: 1 } }
    ).fetch();

    const jobsToRestartIds = _.pluck(jobsToRestart, "_id");
    // logger.warn "jobs.restartIdleJobs: found idle jobs to remove", numJobs:jobsToRestartIds?.length

    const jobsToRestartData = _.pluck(jobsToRestart, "data");
    logger.warn("jobs.restartIdleJobs: jobs data", {
      numJobs: jobsToRestartData != null ? jobsToRestartData.length : undefined,
      data: jobsToRestartData
    });

    Jobs.cancelJobs(jobsToRestartIds);
    return Jobs.removeJobs(jobsToRestartIds);
  },

  "jobs.removeCancelledJobs"() {
    logger.debug("jobs.removeCancelledJobs: called");
    const jobsToRemoveIds = _.pluck(
      Jobs.find({ status: "cancelled" }, { _id: 1 }).fetch(),
      "_id"
    );
    return Jobs.removeJobs(jobsToRemoveIds);
  },

  "jobs.cancelJobs"({ jobIds }) {
    check(jobIds, [String]);
    logger.debug("jobs.cancelJob called", { jobIds });

    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin"])) {
      Jobs.cancelJobs(jobIds);
    } else {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return true;
  },

  "jobs.restartJobs"({ jobIds }) {
    check(jobIds, [String]);
    logger.debug("jobs.restartJob called", { jobIds });

    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin"])) {
      Jobs.restartJobs(jobIds);
    } else {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return true;
  },

  "jobs.rerunJob"({ jobId }) {
    check(jobIds, [String]);
    logger.debug("jobs.rerunJob called", { jobId });

    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin"])) {
      const job = Jobs.getJob(jobId);
      if (job) {
        job.rerun({ wait: 15000 });
      }
    } else {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return true;
  },

  "jobs.pauseJobs"({ jobIds }) {
    check(jobIds, [String]);
    logger.debug("jobs.pauseJob called", { jobIds });

    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin"])) {
      Jobs.pauseJobs(jobIds);
    } else {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return true;
  },

  "jobs.resumeJobs"({ jobIds }) {
    check(jobIds, [String]);
    logger.debug("jobs.resumeJob called", { jobIds });

    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin"])) {
      Jobs.resumeJobs(jobIds);
    } else {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return true;
  },

  "jobs.removeJobs"({ jobIds }) {
    check(jobIds, [String]);
    logger.debug("jobs.removeJob called", { jobIds });

    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin"])) {
      Jobs.removeJobs(jobIds);
    } else {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return true;
  }
});
