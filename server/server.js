
Meteor.startup(function() {
  // Create the connection to the (remote) database. You may need to
  // edit the URL, username and password
  var db = new Neo4jDB(
    'http://neo4jdriver.sb05.stations.graphenedb.com:24789'
  , { username: 'neo4jdriver'
    , password: 'blK3AdrAPti3UdIE18gc'
    }
  )

  // Ensure that the database has some usable content
  db.query(
    "MERGE (hello {name:'Hello'})-[link:LINK]->(world {name:'World'})"
  )

  return Meteor.methods({
    graph: function() {
      // The call to the database is made synchronously, by not
      // providing a callback. This means that we can treat the
      // result immediately and return the treated data to the client
      // caller via its callback.

      var graph     // result from synchronous call to db.graph()
        , visGraph  // output return via callback to the client
                    // format: { nodes: [...], edges: [...]}
        , nodes     // reference to visGraph.nodes
        , edges     // reference to visGraph.edges
        , nodeIds   // used to track which nodes have been treated
        , edgeIds   // used to track which edges have been treated
        , rowCount  // number of rows in graph
        , itemCount // number of node or edge items in current row
        , row       // current row from graph
        , ii        // iterator for rows
        , jj        // iterator for nodes and edges in current row
        , id        // id of the current node or edge
        , items     // array of node or edge items in current row
        , neo4jItem // object: node or edge currently being treated
        , visjsItem // object: neo4j data converted to visjs format

      // Get the graph data from the database in Neo4j format
      graph = db.graph(
        'MATCH ()-[r]-() ' +
        'RETURN DISTINCT r'
      ).fetch()

      // console.log("graph:", JSON.stringify(graph))
      // Array with a format like:
      // [ ...
      // , { "relationships": [
      //       { "id":"266"
      //       , "type":"LIKES"
      //       , "startNode":"132"
      //       , "endNode":"133"
      //       , "properties":{}
      //       }
      //     ]
      //   , "nodes": [
      //       { "id":"131"
      //       , "labels":["Person"]
      //       , "properties":{"name":"Amy"}
      //       }
      //     , { "id":"132"
      //       , "labels":["Person"]
      //       , "properties":{"name":"Bob"}
      //       }
      //     , { "id":"133"
      //       ,"labels":["Person"]
      //       ,"properties":{"name":"Cal"}
      //       }
      //     ]
      //   }
      // , ...]
      // NOTES:
      // 1. There may be more than 2 nodes in the "nodes" section,
      //    but each relationship in the "relationships" section links
      //    only the given startNode and endNode.
      // 2. The same relationship may appear multiple times, sometimes
      //    indentically, sometimes with a different set of nodes. We
      //    must filter out duplicates.

      // Convert to visjs format:
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

     nodes = []
      edges = []
      visGraph = {
        nodes: nodes,
        edges: edges
      }
      // helper arrays to hold ids of treated items
      nodeIds = []
      edgeIds = []

      for (ii = 0, rowCount = graph.length; ii < rowCount; ii += 1) {
        row = graph[ii]

        items = row.nodes
        itemCount = items.length         
        for (jj = 0; jj < itemCount; jj += 1) {
          neo4jItem = items[jj]
          id = neo4jItem.id
          if (nodeIds.indexOf(id) < 0) {
            // This node has not been treated yet. Remember it.
            visjsItem = {
              id: id
            , labels: neo4jItem.labels
            , label: neo4jItem.properties.name
            , group: neo4jItem.labels[0]
            }
            visjsItem = _.extend(visjsItem, neo4jItem.properties)
            nodes.push(visjsItem)
            nodeIds.push(id) // Don't treat it again
          }
        }

        items = row.relationships
        itemCount = items.length          
        for (jj = 0; jj < itemCount; jj += 1) {
          neo4jItem = items[jj]
          id = neo4jItem.id
          if (edgeIds.indexOf(id) < 0) {
            // This edge has not been treated yet. Remember it.
            visjsItem = {
              id: id
            , from: neo4jItem.startNode || neo4jItem.start
            , to: neo4jItem.endNode || neo4jItem.end
            , type: neo4jItem.type
            , label: neo4jItem.type
            , arrows: 'to'
            }
            visjsItem = _.extend(visjsItem, neo4jItem.properties)
            edges.push(visjsItem)
            edgeIds.push(id) // Don't treat it again
          }
        }
      }

      return visGraph
    }
  })
})
