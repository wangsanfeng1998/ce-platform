import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { log, serverLog } from '../../api/logs.js';
import { LocationManager } from '../../api/locations/client/location-manager-client.js';

if (Meteor.isCordova) {
  Meteor.startup(() => {
    const bgGeo = window.BackgroundGeolocation;

    function success(location, taskId) {
      HTTP.post(`${ Meteor.absoluteUrl() }api/geolocation`, {
        data: {
          location: location.coords,
          userId: Meteor.userId()
        }
      }, (err, res) => {
        bgGeo.finish(taskId);
      });
    }

    function error(error) {
      console.log(error);
    }

    bgGeo.on('location', success, error);

    const options = {
      desiredAccuracy: 0,
      stationaryRadius: 50,
      distanceFilter: 10,
      debug: false,
      stopOnTerminate: false
    };

    bgGeo.configure(options, (state) => {
      bgGeo.start();
    });
  });
} else {
  Meteor.startup(() => {
    LocationManager.trackUpdates(Tracker, () => {}, () => {});
  });
}
