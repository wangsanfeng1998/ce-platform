import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Experiences } from './experiences.js';
import { Schema } from '../../schema.js';
import { getUnfinishedNeedNames } from '../progressorHelper';
import { matchAffordancesWithDetector } from "../../UserMonitor/detectors/methods";


import {Incidents} from './experiences';
import {Assignments, Availability} from '../../OpportunisticCoordinator/databaseHelpers';
import {Submissions} from '../../OCEManager/currentNeeds';


/**
 * Loops through all unmet needs and returns all needs a user matches with.
 *
 * @param uid {string} uid of user to find matches for
 * @param affordances {object} dictionary of user's affordacnes
 * @returns {{}}
 */
export const findMatchesForUser = (uid, affordances) => {
  let matches = {};
  let unfinishedNeeds = getUnfinishedNeedNames();

  //console.log('unfinishedNeeds', unfinishedNeeds);

  // unfinishedNeeds = {iid : [needName] }
  _.forEach(unfinishedNeeds, (needNames, iid) => {
    _.forEach(needNames, (needName) => {
      let doesMatchPredicate = doesUserMatchNeed(uid, affordances, iid, needName);

      if (doesMatchPredicate) {
        if (matches[iid]) {
          let currNeeds = matches[iid];
          currNeeds.push(needName);
          matches[iid] = currNeeds;
        } else {
          matches[iid] = [needName];
        }
      }
    });
  });
  return matches;
};

// TODO: ryan do this plz.
/**
 * Checks if a user matches a need.
 * Match determined using AA/Affinder to check what affordances a user has and determine if it matches the need.
 *
 * @param uid {string} uid of user
 * @param affordances {object} dictionary of user's affordances
 * @param iid {string} iid of incident to determine matching
 * @param needName {string} name of need to determine match for
 * @returns {boolean} whether user matches need queried for
 */
export const doesUserMatchNeed = (uid, affordances, iid, needName) => {
  //console.log("iid in doesuser match need", iid)
  let detectorId = getNeedFromIncidentId(iid, needName).situation.detector;
  let matchP = matchAffordancesWithDetector(affordances, detectorId);
  return matchP;
};

// TODO: Clean this up if possible
export const updateUserExperiences = new ValidatedMethod({
  name: 'experiences.updateUser',
  validate: new SimpleSchema({
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ userId }) {
    let user = Meteor.users.findOne(userId);
    let exps = Experiences.find().fetch().filter((doc) => {
      let match = true;

      doc.requirements.forEach((req) => {
        if (!user.profile.qualifications[req]) {
          match = false;
        }
      });

      return match;
    }).map((doc) => {
      return doc._id;
    });

    Meteor.users.update(userId, { $set: { 'profile.experiences': exps } });

    let subs = user.profile.subscriptions;
    subs = subs.filter((sub) => {
      return _.contains(exps, sub);
    });

    Meteor.users.update(userId, { $set: { 'profile.subscriptions': subs } });
  }
});

export const removeExperience = new ValidatedMethod({
  name: 'experiences.remove',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ experienceId }) {
    Experiences.remove(experienceId);
  }
});

export const createExperience = new ValidatedMethod({
  name: 'api.createExperience',
  validate: new SimpleSchema({
    name: {
      type: String
    },
    description: {
      type: String,
      label: 'Experience description',
      optional: true
    },
    image: {
      type: String,
      label: 'Experience image url',
      optional: true
    },
    participateTemplate: {
      type: String
    },
    resultsTemplate: {
      type: String
    },
    notificationText: {
      type: String
    },
    contributionGroups: {
      type: [Schema.ContributionTypes]
    },
    callbackPair: {
      type: [Schema.CallbackPair]
    },
  }).validator(),
  run({
        name, description, image, participateTemplate, resultsTemplate, contributionGroups,
        notificationStrategy, notificationText, callbackPair
      }) {
    //console.log('validated');

    const experience = {
      name: name,
      description: description,
      image: image,
      participateTemplate: participateTemplate,
      resultsTemplate: resultsTemplate,
      contributionGroups: contributionGroups,
      notificationStrategy: notificationStrategy,
      notificationText: notificationText,
      callbackPair: callbackPair
    };

    let id = Experiences.insert(experience, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
             }
    });

       return id;
  }
});




Meteor.methods({
  createAndstartIncident(eid) {
    let experience = Experiences.findOne(eid);
    startRunningIncident(createIncidentFromExperience(experience));
  }
});

export const addContribution = (iid, contribution) =>{
  Incidents.update({
    _id: iid,
  }, {
    $push: {contributionTypes: contribution}
  });
  addEmptySubmissionsForNeed(iid, Incidents.findOne(iid).eid, contribution);

  Availability.update({
    _id: iid
  },{
    $push: {needUserMaps: {needName: contribution.needName, uids: []}}
  });

  Assignments.update({
    _id: iid
  },{
    $push: {needUserMaps: {needName: contribution.needName, uids: []}}
  });
};

export const addEmptySubmissionsForNeed = (iid, eid, need) => {
  let i = 0;
  while (i < need.numberNeeded) {
    i++;

    Submissions.insert({
      eid: eid,
      iid: iid,
      needName: need.needName,
    }, (err, docs) => {
      if (err) {
        console.log('upload error,', err);
      } else {
      }
    });


  }
};

export const startRunningIncident = (incident) => {
  let needUserMaps = [];

  _.forEach(incident.contributionTypes, (need) => {
    needUserMaps.push({needName: need.needName, uids: []});
    addEmptySubmissionsForNeed(incident._id, incident.eid, need);

  });

  Availability.insert({
    _id: incident._id,
    needUserMaps: needUserMaps
  });

  Assignments.insert({
    _id: incident._id,
    needUserMaps: needUserMaps
  });
};


/**
 * Given an experience object, creates an incident
 * @param experience {object} of the created incident
 */
export const createIncidentFromExperience = (experience) => {
  let incident = {
    eid: experience._id,
    callbacks: experience.callbacks,
    contributionTypes: experience.contributionTypes,
  };

  Incidents.insert(incident, (err) => {
    if (err) {
      console.log('error,', err);
    } else {
    }
  });


  return incident;
};

/**
 * Finds the need dictionary in an incident given the need's name
 *
 * @param iid {string} incident id we are looking up a need in
 * @param needName {string} name of the need we are looking up
 */
export const getNeedFromIncidentId = (iid, needName) => {
  let incident = Incidents.findOne(iid);


  let output = undefined;

  _.forEach(incident.contributionTypes, (need) => {
    if (need.needName === needName) {
      output = need;
      return false;
    }

    // check if found
    if (typeof output === 'undefined') {
      return false;
    }
  });

  return output;
};