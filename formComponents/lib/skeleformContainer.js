// CONTAINER
// it just renders an empty container div

Template.skeleformContainer.helpers(skeleformGeneralHelpers);

Template.skeleformContainer.onCreated(function() {
    setReplicaIndex(this);
});
