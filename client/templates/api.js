// inspector
// queries
// description
// command
// output

// elements
// element
// selected_element

Session.set("type", "nodes")
Session.set("id", "0")
Session.set("nodes", "0")
Session.set("edges", "0")
Session.set("query", window.location.hash.substring(1) || "Neo4jDB")
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

Template.inspector.onRendered(function () {
  // var selected_element = this.find("div.show")

})

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
    , { id: "labels", query: "db.labels" }
    , { id: "relationshipTypes", query: "db.relationshipTypes" }
    , { id: "query", query: "db.query" }
    , { id: "queryOne", query: "db.queryOne" }
    , { id: "querySync", query: "db.querySync" }
    , { id: "queryAsync", query: "db.queryAsync" }
    , { id: "graph", query: "db.graph" }
    , { id: "cypher", query: "db.cypher" }
    , { id: "batch", query: "db.batch" }
    ]
  }
})

Template.queries.events({
  "click a": function (event) {
    var href = event.currentTarget.href
    var index = href.indexOf("#") + 1
    var query = href.substring(index)
    Session.set("query", query)
  }
})

Template.description.helpers({
  description: function () {
    return Session.get("query") + "-description"
  }
})

Template.command.helpers({
  "command": function () {
     return Session.get("query")
  }
})

// PUT THIS IN A PACKAGE //

function prettifyHTML(input, padding) {
  if (typeof padding !== "string") {
    padding = ""
  }

  switch (true) {
    case (typeof input === "number"):
      return input + '<br />'
    case (typeof input === "string"):
      return '"' + input + '"<br />'
    case (input instanceof Array):
      return prettifyArray(input, padding)
    case (typeof input === "object"):
      return prettifyObject(input, padding)
  }

  function prettifyArray(input, padding) {
    //return "Arrays not yet treated<br />"
    var output = input.reduce(function (string, item){
      var value = prettifyHTML(item, padding + "&nbsp;&nbsp;")
      return string + padding + ", " + value
    }, "")

    var offset = output.indexOf(",") + 1
    output = "[<br /> " + padding + output.substring(offset) + padding + "]<br />"

    return output
  }

  function prettifyObject(input, padding) {
    var keys = Object.keys(input)
    var keyLength = keys.reduce(function (max, key) {
      var length = key.length
      if (max < length) {
        return length
      }
      return max
    }, 0)

    var output = keys.reduce(function (string, key) {
      var value = prettifyHTML(input[key], padding + "&nbsp;&nbsp;")
      var keyDelta = keyLength - key.length
      var keyPadding = ""

      while (keyDelta--) {
        keyPadding += "&nbsp;"
      }
      return string + padding + ", " + key + ": " + keyPadding + value
    }, "")

    var offset = output.indexOf(",") + 1
    output = "{<br /> " + padding + output.substring(offset) + padding + "}<br />"
    
    return output
  }
}

