Template.layout.onRendered(function() {
  function addTransform(location) {
    return location;
  }
  function changeLocation(loc, updated) {
    console.log(updated);
  }
  LocationManager.trackUpdates(this, addTransform, changeLocation);
});