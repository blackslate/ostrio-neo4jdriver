
Template.main.onRendered(function() {
  var container = this.find('#graph')
  var interval = 2000 // 2 seconds between each call to poll()
  var options = {}
  var network
    , nodesDS
    , edgesDS
    , visData
  
  if (!network) {
    // Initialize the vis.DataSets and the vis.Network objects
    nodesDS = new vis.DataSet()
    edgesDS = new vis.DataSet()
    visData = { nodes: nodesDS, edges: edgesDS }
    network = new vis.Network(container, visData, options)
  }

  function poll(ignoreTimestamp) {
    Meteor.call('graph', ignoreTimestamp, graphCallback)
    setTimeout(poll, interval)
  }

  function graphCallback(error, data) {
    if (!error) {
      // data should be an object with the format
      // { nodes: <array of nodes>, edges: <array of edges> }
      nodesDS.add(data.nodes)
      edgesDS.add(data.edges)
    }
  }

  poll(true)
})