
Result = Meteor.subscribe("result")

Tracker.autorun(function () {
  var result

  var command = { query: Session.get("command") }

  if (Result.findOne) {
    result = Result.findOne( command )    
  } else {
    result = undefined   
  }

  Session.set("result", result)
})

Session.set("type", "nodes")
Session.set("id", "0")
Session.set("nodes", "0")
Session.set("edges", "0")
Session.set("command", window.location.hash.substring(1) || "Neo4jDB")
Session.set("data", { nodes: [], edges: [], LUT: {} } )
Meteor.call("dump", dumpCallback)

function dumpCallback(error, data) {
  if (!error) {
    var LUT = {}
    var ids = { nodeId: false, edgeId: false }
    var id

    data.nodes.forEach(addToLUT, "nodes")
    data.edges.forEach(addToLUT, "edges")
    data.LUT = LUT
    Session.set("data", data)
    Session.set("id", Session.get("nodes"))

    function addToLUT(item, index, array) {
      id = item.id
      if (!ids[this]) {
        Session.set(this, id)
        ids[this] = id
      }
      LUT[id] = item
    }
  }
}

Template.inspector.helpers({
  elements: function () {
    var type = Session.get("type")
    var isEdge = type === "edges"
    var data = Session.get("data")[type]
    // [ { id: <>, name: <> }, { id: <>, type: <> } ]
    
    // As soon as the elements display is ready, show the selection
    setTimeout(function () {
      var select = $("select[name=elements]")
      var id = Session.get(type)
      select.val(id)
    }, 0)

    return data.map(function (item, index, array) {
      var display = ""
      
      if (isEdge) {
        display += item.type ? " :" + item.type : ""
        display += " (" + item.start + " - " + item.end + ")"
      } else {
        display += item.labels.length ? " :"+item.labels[0]+" " : ""
        display += item.name ? " " + item.name : ""
      }

      return {id: item.id, display: display}
    })
  }
, selected_element: function () {
    var element = Session.get("data").LUT[Session.get("id")]
    var value = element ? prettifyHTML(element) : ""

    return value
  }
})

Template.inspector.events({
  "change select[name=elementType]": function (event, template) {
    var type = event.currentTarget.value // "nodes" | "edges"
    var id = Session.get(type) // last id set for this type
    // var select = $("select[name=elements]")

    Session.set("type", type)
    Session.set("id", id)
  }
, "change select[name=elements]": function (event) {
    var id = parseInt(event.currentTarget.value, 10)
    var type = Session.get("type")
    Session.set("id", id)
    Session.set(type, id)
  }
})

Template.queries.helpers({
  queries: function () {
    return [
      { id: "Neo4jDB", query: "Neo4jDB" }
    , { id: "propertyKeys", query: "db.propertyKeys" }
    , { id: "labels", query: "db.labels" }
    , { id: "relationshipTypes", query: "db.relationshipTypes" }
    , { id: "version", query: "db.version" }
    , { id: "query", query: "db.query" }
    , { id: "queryOne", query: "db.queryOne" }
    , { id: "querySync", query: "db.querySync" }
    , { id: "queryAsync", query: "db.queryAsync", disabled: true }
    , { id: "graph", query: "db.graph" }
    , { id: "cypher", query: "db.cypher" }
    , { id: "batch", query: "db.batch", disabled: true }
    , { id: "transaction", query: "db.transaction", disabled: true }
    , { id: "nodes", query: "db.nodes", disabled: true }
    , { id: "relationship_create", query: "db.relationship.create", disabled: true }
    , { id: "relationship_get", query: "db.relationship.get", disabled: true }
    , { id: "constraint_create", query: "db.constraint.create", disabled: true }
    , { id: "constraint_get", query: "db.constraint.get", disabled: true }
    , { id: "constraint_drop", query: "db.constraint.drop", disabled: true }
    , { id: "index_create", query: "db.index.create", disabled: true }
    , { id: "index_get", query: "db.index.get", disabled: true }
    , { id: "index_drop", query: "db.index.drop", disabled: true }
    ]
  }
})

Template.queries.events({
  "click a": function (event) {
    var href = event.currentTarget.href
    var index = href.indexOf("#") + 1
    var query = href.substring(index)
    Session.set("command", query)
  }
})

Template.description.helpers({
  description: function () {
    return Session.get("command") + "-description"
  }
})

Template.command.helpers({
  "command": function () {
     return Session.get("command")
  }
})

Template.output.helpers({
  output: function () {  
    var output = ""

    var result = Session.get("result")
    if (result) {
      output = prettifyHTML(result.result)
    }

    return output
  }
})
