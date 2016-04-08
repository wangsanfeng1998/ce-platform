Experiences = new Mongo.Collection('experiences');

Experiences.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Experience name'
  },
  author: {
    type: String,
    label: 'Author user id',
    // regEx: SimpleSchema.RegEx.Id // leaing out for test cases
  },
  description: {
    type: String,
    label: 'Experience description'
  },
  startText: {
    type: String,
    label: 'Experience starting email text'
  },
  modules: {
    type: [String],
    label: 'Integrated collective experience modules',
    allowedValues: CEModules
  },
  requirements: {
    type: [String],
    label: 'User characteristic requirements',
    allowedValues: CEQualifications
  },
  location: {
    type: String,
    label: 'Desired location of participants',
    optional: true,
    allowedValues: _.map(YelpCategories, category => category.alias)
  },
  activeIncident: {
    type: String,
    label: 'The current incident for this experience',
    optional: true
  }
}));
