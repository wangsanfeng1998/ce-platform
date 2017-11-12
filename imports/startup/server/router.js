import { Router } from 'meteor/iron:router';

import { updateUserLocationAndAffordances } from '../../api/locations/methods.js';
import { log } from '../../api/logs.js';


Router.onBeforeAction(Iron.Router.bodyParser.urlencoded( {extended : false} ));

Router.route('/api/geolocation', { where: 'server' })
  .get(function() {
    this.response.end('ok');
  })

  .post(function() {
    const userId = this.request.body.userId;
    const location = this.request.body.location;
    const activity = this.request.body.activity;

    updateUserLocationAndAffordances.call({
      uid: userId,
      lat: location.coords.latitude,
      lng: location.coords.longitude
    });
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end('ok');
  })
  .put(function() {
    this.response.writeHead(200, {'Content-Type': 'application/json'});
    this.response.end('ok');
  });
