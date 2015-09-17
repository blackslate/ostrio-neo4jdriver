
Template.main.onCreated(function() {
  // Create objects which will be populated in main.onRendered
  this.nodesDS = []   // will become new vis.DataSet([])
  this.edgesDS = []   // will become new vis.DataSet([])
  this.Network = null // will become new vis.Network(...)
})

Template.main.onRendered(function() {
  var container     // reference to HTML <div id="graph">
    , data          // { nodes: <DataSet>, edges: <DataSet> }
    , fetchFunction // function fetchGraphData(), provided to 
                    // Template.main, to be called each time the
                    // template is rendered
    , options       // object to hold canvas display options

  // Get HTML <div> where canvas is to appear
  container = document.getElementById('graph')

  // Initialize the vis object
  this.nodesDS = new vis.DataSet([])
  this.edgesDS = new vis.DataSet([])
  data = {
    nodes: this.nodesDS,
    edges: this.edgesDS
  }
  options = {} // Provide canvas display options here
  this.Network = new vis.Network(container, data, options)
  
  // Call the server to get the data to display
  fetchFunction = (function(template) {
    // template will be the Blaze.Template instance for Template.main
    return function fetchGraphData() {
      Meteor.call('graph', graphCallback)

      function graphCallback(error, data) {
        // console.log(data)
        // { nodes: [
        //     { id:     <Neo4j id>
        //     , labels: <Neo4j labels>
        //     , label:  <Neo4j properties.name>
        //     , group:  <Neo4j labels[0]>
        //     , custom: <Neo4j properties.custom>
        //     , ...
        //     }
        //   , ...
        //   ]
        // , edges: [
        //     { id:     <Neo4j id>
        //     , from:   <Neo4j startNode>
        //     , to:     <Neo4j endNode>
        //     , type:   <Neo4j type>
        //     , label:  <Neo4j type
        //     , arrows: "to"
        //     , custom:  <Neo4j properties.custom>
        //     , ...
        //     }
        //   , ...
        //   ]
        // }
        
        var edge
          , ii
          , count
          , node
          , dataNodes
          , dataEdges

        if (error) {
          throw new Meteor.Error(error)

        } else {
          // Add the nodes and edges to the DataSets shared with the
          // vis.Network for this template.
          dataNodes = data.nodes
          for (ii=0, count=dataNodes.length; ii < count; ii += 1) {
            node = dataNodes[ii]
            template.nodesDS.add([node]);                
          }

          dataEdges = data.edges
          for (ii=0, count=dataEdges.length; ii < count; ii += 1) {
            edge = dataEdges[ii]
            template.edgesDS.add([edge]);          
          }
        }
      }
    }
  })(this)

  return fetchFunction()
})
