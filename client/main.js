import '/imports/startup/client';

//TODO: what's all this? Do we need to add availabliity?
if (Meteor.isDevelopment) {
  Schema = require('../imports/api/schema.js').Schema;
  Experiences = require('../imports/api/OCEManager/OCEs/experiences.js').Experiences;
  Images = require('../imports/api/ImageUpload/images.js').Images;
  Incidents = require('../imports/api/OCEManager/OCEs/experiences.js').Incidents;
  Locations = require('../imports/api/UserMonitor/locations/locations.js').Locations;
  Detectors = require('../imports/api/UserMonitor/detectors/detectors.js').Detectors;
  TextEntries = require('../imports/api/text-entries/text-entries.js').TextEntries;
  Submissions = require('../imports/api/OCEManager/currentNeeds.js').Submissions;
}
