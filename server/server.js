
Meteor.startup(function() {
  // Create the connection to the (remote) database. You may need to
  // edit the URL, username and password
  try {
    var db = new Neo4jDB(
      "http://localhost:7474"
    , { username: "neo4j"
      , password: "1234"
      }
    )
    // **** IF THE CONNECTION FAILED NO ERROR/EXCEPTION IS THROWN ****
    // **** THE FOLLOWING OUTPUT IS DISPLAYED IN THE TERMINAL BUT ****
    // **** THERE IS NO WAY OF INFORMING THE CLIENT OF THE ERROR. ****
    // Error sending request to Neo4j (GrapheneDB) server: Error: connect ECONNREFUSED
    // Error with connection to Neo4j. Please make sure your local Neo4j DB is started, if you use remote Neo4j DB make sure it is available. Ensure credentials for Neo4j DB is right.
    // Received response from http://localhost:7474: true
  } catch (error) {
    console.log("Neo4jDB connection error on startup", error)
  }

  var result = Result.remove({})
  console.log("Empty Result collection on startup", result)

  ;(function publications(){
    Meteor.publish("result", function () {
      var cursor = Result.find({})
      var result = cursor.fetch()
      //console.log("——Publish——")
      //console.log(JSON.stringify(result))
      return cursor
    })
  })()

  ;(function methods(db){
    Meteor.methods({
      dump: dump
    , Neo4jDB_test: Neo4jDB_test
    , getAll: getAll
    , getQuery: getQuery
    })

    function dump() {
      var query = 
      "MATCH (node) " +
      "OPTIONAL MATCH (node)-[edge]->() " +
      "RETURN DISTINCT node, edge " +
      "ORDER BY node.id, edge.id"

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
        return a.id - b.id
      }
    }

    function Neo4jDB_test(options) {
      try {
        var testDB = new Neo4jDB(
          options.url
        , { username: options.user
          , password: options.pass
          }
        )
      } catch (exception) {
        console.log("Neo4jDB_test", exception)
      }

      // Tell the client only about propeties that are not objects
      var safeProps = ["url", "domain", "_maxListeners", "base", "root", "https", "_ready", "defaultHeaders"]
      var result = {}
      // result.NOTE = "CONNECTION MAY HAVE FAILED. NO EXCEPTIONS ARE THROWN. CHECK THE TERMINAL FOR ERROR MESSAGES."
      safeProps.forEach(function (key, index, array) {
        result[key] = testDB[key]
      })
      result["___"] = "many other properties not shown"
      //console.log(result)
      
      // Share the most recent connection details with the client
      var selector = { query: "Neo4jDB" }
      var modifier = { query: "Neo4jDB", result: result }
      var options = {}
      var callback = function (error, data) {
        console.log("Neo4jDB_test result (", error, ")", data)
      }
      Result.upsert( selector, modifier, options, callback )

      // Provide data for the client callback
      var result = typeof testDB === "object"
                 ? "Connected to " + testDB.root
                 : "Connection error: see terminal for details"

      return result
    } 

    /** command may be: labels, propertyKeys, relationshipTypes */
    function getAll(command) {
      //console.log("getAll", command)

      try {
        var result = db[command]()
      } catch (exception) {
        console.log(command + "_test", exception)
      }

      //console.log(result)

      var selector = { query: command }
      var modifier = { query: command, result: result }
      //console.log(modifier)
      var options = {}
      var callback = function (error, data) {
        console.log(command + "_test result (", error, ")", data)
      }
      Result.upsert( selector, modifier, options, callback )

      // Provide data for the client callback
      var result = (result instanceof Array)
                 ? "array"
                 : typeof result

      return result
    }

    function getQuery(options) {
      var result 
      var command = options.command
      var object = options.object
      var postOp = options.postOp || false
      var parameters = options.parameters
      var source // db | db.<object>

      if (object) {
        source = db[object]
      } else {
        source = db
      }

      console.log(object)
      console.log(command)
      console.log(JSON.stringify(parameters))
      // {"cypher":"MATCH (n) \nWHERE id(n) = {id} \nRETURN n"}
      
      try {
        if (parameters instanceof Array) {
          //result = db.relationship.apply(db, parameters)
          result = source[command].apply(source, parameters)
         } else {
          result = source[command](parameters)
        }

        if (postOp) {
          result = result[postOp]()
        }

      } catch (exception) {
        console.log(command + " error:", JSON.stringify(exception))
        result = exception.toString()

        // Expected a parameter named id
        // code: Neo.ClientError.Statement.ParameterMissing

        // query [TypeError: Object.getOwnPropertyDescriptor called on non-object]
      }

      if (object) {
        // For feedback, include the object in the command string
        command = object + "." + command
      }
      console.log(command + " result:", result) // may be undefined

      // { _cursor: [ { n: [Object] } ],
      //   length: 1,
      //   _current: 0,
      //   hasNext: false,
      //   hasPrevious: false }
      
      // Share the most recent connection details with the client
      var selector = { query: command }
      var modifier = { query: command, result: result }
      var options = {}
      var callback = function (error, data) {
        console.log(command + " result callback (", error, ")", data)
        // ( null )
        // { numberAffected: 1, insertedId: 'ocnFE3CZQEoFesMKa' }
        // 
        // ( [RangeError: Maximum call stack size exceeded] )
        //  false
      }
      Result.upsert( selector, modifier, options, callback )

      // Provide data for the client callback
      var result = typeof result === "object"
                 ? command + " successful"
                 : command + " error: see terminal for details"

      return result
    }
  })(db)
})