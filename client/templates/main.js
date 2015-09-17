
Template.main.onRendered(function() {
  var container = this.find('#graph')

  Meteor.call('graph', graphCallback)

  function graphCallback(error, data) {
    if (!error) {
      // Data should be the string "Hello world"
      container.innerHTML = data
    }
  }
})