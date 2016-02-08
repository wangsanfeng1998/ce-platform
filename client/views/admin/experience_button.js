Template.experienceButton.events({
  'click .exp-btn': function(e) {
      e.preventDefault();
      Meteor.call('sendEmail',
            'shannonnachreiner2012@u.northwestern.edu',
            'Event is starting!',
            this.startEmailText, this._id);
      alert(`Sent ${this.name}`);
  },
    'click .end-btn': function(e) {
      e.preventDefault();
      let endEmailText = '<p>The experience has ended. Thanks for participating! Click <a href="http://localhost:3000/results/' + this._id + '">this link</a> to see the results.</p>';
      Meteor.call('sendEmail',
            'shannonnachreiner2012@u.northwestern.edu',
            'Your experience has ended.',
            endEmailText,
            this._id);
      alert(`Sent ${this.name}`);
  }
});
