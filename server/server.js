Meteor.startup(function() {
  // Create the connection to the (remote) database. You may need to
  // edit the URL, username and password
  var db = new Neo4jDB(
    "http://localhost:7474"
  , { username: "neo4j"
    , password: "1234"
    }
  )

  Meteor.methods({
    dump: dump
  })

  function dump() {
    var query = 
    "MATCH (node) " +
    "OPTIONAL MATCH (node)-[edge]->() " +
    "RETURN DISTINCT node, edge"

    var dump = db.query(query).fetch()
    //console.log(dump.length, dump)
    // [ { node: object, edge: object } ]
  
    var ids = [] // assumes node and edge ids are mutually unique
    var edges = []
    var nodes = []
    var result = {
      edges: edges
    , nodes: nodes
    }

    dump.forEach(function (value, index, array) {
      addToSet(value.node, nodes)
      addToSet(value.edge, edges)

      function addToSet(item, collection) {
        if (item) {
          var id = item.id
          if (ids.indexOf(id) < 0) {
            collection.push(item)
            ids.push(id)          
          }
        }
      }
    })

    edges.sort(numerically)
    nodes.sort(numerically)

    return result

    function numerically(a, b) {
      return b - a
    }
  }
})