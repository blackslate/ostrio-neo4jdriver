
Template.main.onRendered(function() {
  var container = this.find('#graph')

  Meteor.call('graph', graphCallback)

  function graphCallback(error, data) {
    if (!error) {
      // data should be an object with the format
      // { nodes: <array of nodes>, edges: <array of edges> }
      var nodesDS = new vis.DataSet(data.nodes)
      var edgesDS = new vis.DataSet(data.edges)
      var visData = { nodes: nodesDS, edges: edgesDS }               
      var options = {}

      new vis.Network(container, visData, options)
    }
  }
})
