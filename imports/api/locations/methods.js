import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Locations } from './locations.js';
import { Schema } from '../schema.js';

export const updateLocation = new ValidatedMethod({
  name: 'locations.updateUser',
  validate: Schema.Locations.validator(),
  run({ uid, lat, lng }) {
    const entry = Locations.findOne({ uid: uid });
    if (entry) {
      Locations.update(entry._id, { $set: {
        lat: lat,
        lng: lng
      }});
    } else {
      Locations.insert({ uid: uid, lat: lat, lng: lng });
    }
  }
});