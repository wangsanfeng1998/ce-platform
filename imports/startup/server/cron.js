import {Meteor} from "meteor/meteor";
import { SyncedCron } from 'meteor/percolate:synced-cron';

SyncedCron.add({
  name: 'Send notifications to keep location tracking alive',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 2 minutes');
  },
  job: function() {

    let uids = Meteor.users.find().fetch().map(function(x){
      return x._id;
    });
    console.log("uids for cron", uids);

    Meteor.call('sendNotification', ['XEXvPa6kZ5obTkTnJ', 'Txf2fSHu5tXDLxvyD'], "Please open this notification to continue receiving experiences :)", "/")
  }

});

Meteor.startup(() => {
  SyncedCron.start();
});