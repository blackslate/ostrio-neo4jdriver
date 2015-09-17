
Meteor.startup(function() {
  // Create the connection to the (remote) database. You may need to
  // edit the URL, username and password
  var db = new Neo4jDB(
    'http://localhost:7474'
  , { username: 'neo4j'
    , password: '1234'
    }
  )

  Meteor.methods({
    graph: function() {
      var graph
        , row
        , edge
        , startId
        , endId
        , nodes
        , nodeNames
        , output

      // Make a synchronous call to the Neo4j database
      graph = db.graph(
        'MATCH ()-[r]-() ' +
        'RETURN DISTINCT r'
      ).fetch()

      console.log("graph:", JSON.stringify(graph))
      // Array with a format like:
      // [ { "relationships" : [
      //       { "id":"287"
      //       , "type":"LINK"
      //       , "startNode":"158"
      //       , "endNode":"159"
      //       , "properties":{}
      //       }
      //     ]
      //   , "nodes": [
      //       { "id":"158"
      //       , "labels":[]
      //       , "properties":{"name":"Hello"}
      //       }
      //     , { "id":"159"
      //       , "labels":[]
      //       , "properties":{"name":"World"}
      //       }
      //     ]
      // } ]
      
      // Get the first row of the graph and find the start and end
      // of the first relationship
      row = graph[0]

      edge = row.relationships[0]
      startId = edge.startNode || edge.start
      endId = edge.endNode || edge.endNode

      // Get the names of all the nodes in this row
      nodes = row.nodes
      nodeNames = {}
      for (var ii = 0, node; node = nodes[ii]; ii += 1 ) {
        nodeNames[node.id] = node.properties.name
      }

      // Create a string from the names of the start and end nodes
      output = nodeNames[startId] + " " + nodeNames[endId]

      return output
    }
  })
})