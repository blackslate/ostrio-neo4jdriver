Meteor.startup(function() {
  // Create the connection to the (remote) database. You may need to
  // edit the URL, username and password
  var db = new Neo4jDB(
    "http://localhost:7474"
  , { username: "neo4j"
    , password: "1234"
    }
  )

  // Ensure that the database has some usable content
  db.query(
    "WITH TIMESTAMP() AS timestamp " +
    "MERGE (hello {name:'Hello'}) " +
    "ON CREATE " +
    "  SET hello.updatedAt = timestamp " +
    "MERGE (world {name:'World'}) " +
    "ON CREATE " +
    "  SET world.updatedAt = timestamp " +
    "MERGE hello-[link:LINK]->world " +
    "ON CREATE " +
    "  SET link.updatedAt = timestamp"
  )
 
  // On startup, we want all records from the database
  var timestamp = 0 // will be updated after each query

  Meteor.methods({
    graph: function(ignoreTimestamp) {
 
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

      var time= db.querySync(
        "RETURN TIMESTAMP() AS now"
      ).fetch()[0].now
      //console.log("Time in Neo4j database:", time)
      
      if (ignoreTimestamp) {
        timestamp = 0
      }

      // Get the graph data from the database in Neo4j format
      graph = db.graph(
        "WITH {timestamp} AS timestamp " +
        "MATCH (m), (n) " +
        "WHERE n.updatedAt >= timestamp " +
        "WITH m, n, timestamp " +
        "OPTIONAL MATCH (m)-[r]->() " +
        "WHERE r.updatedAt >= timestamp " +
        "RETURN DISTINCT n, r"
      , { timestamp: timestamp }
      ).fetch()
      // console.log(graph)

      timestamp = time

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
            , group: neo4jItem.labels[0] || ""
            }
            visjsItem = _.extend(visjsItem, neo4jItem.properties)
            delete visjsItem.name // duplicate of label
            nodes.push(visjsItem)
            nodeIds.push(id) // Don"t treat it again
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
            , arrows: "to"
            }
            visjsItem = _.extend(visjsItem, neo4jItem.properties)
            edges.push(visjsItem)
            edgeIds.push(id) // Don"t treat it again
          }
        }
      }

      return visGraph
    }
  })
})