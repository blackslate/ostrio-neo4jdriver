
var Trackers = new ReactiveVar(0)// To share with all templates in this script

/** Set up the `trackers` variable, which is shared with all the
 *  templates is this script. This stores the changes made to nodes
 *  and edges, and determines whether the next click on a node in the
 *  graph will select the start node or the end node for a new edge.
 *
 *  Each object in trackers has a modify() method, a `modified` and a
 *  `required` property. If modified === 0, the update and create
 *  buttons will be disabled. If `required` is not empty
 */
Template.graph.onCreated(function () {
  // this.network
  var self = this

  // <HARD-CODED values>
  var required = {
    node: { label: true, group: true, tracking: true }
  , edge: { type: true, tracking: true }
  }

  // TRACKERS
  this.deselectAll = function deselectAll() {
    Trackers.set({
      startNode: this.getEmptyTracker("node")
    , edge: null
    , endNode: null
    , selectEnd: false
    })
  }

  this.getEmptyTracker = function getEmptyTracker(type) {
    var requiredKeys = _.extend({}, required[type])
    var object = { custom: "" }

    switch (type) {
      case "node":
        object.label = ""
        object.group = ""
      break
      case "type":
        object.type = ""
      break
    }

    original = _.extend({}, object)

    tracker = getChangeTracker(object, original, requiredKeys)
    return tracker
  }
  // </HARD-CODED>
  
  this.getCloneTracker = function getCloneTracker(dataSet, itemId) {
    var item = dataSet.get(itemId)
    var clone = _.extend({}, item)
    
    tracker = getChangeTracker(clone, item, {})
    return tracker
  }

  function getChangeTracker(tracker, item, required) {
    tracker.required = required
    tracker.modified = 0

    tracker.modify = function (key, value) {
      var original = item[key]
      var modified = this[key] !== original
      var tracking = this.required.tracking

      if (value === original) {
        // Revert
        if (!original && original !== 0) {
          delete this[key] 

          if (tracking) {
            this.required[key] = true
          }
        } else {
          this[key] = original
        }

        if (modified) {
          // It's not modified any more
          this.modified -= 1
        }

      } else {
        // Use the new value
        this[key] = value

        if (!modified) {
          // Indicate that this value is no longer the original
          this.modified += 1        
        }

        if (tracking && (value || value === 0)) {
          this.required[key] = false
          console.log("Enabled: ", this.createEnabled())
        }
      }
    }

    tracker.createEnabled = function () {
      var enabled = false

      if (this.required.tracking) {
        var required = this.required
        var keys = Object.keys(required)
        var missing = keys.filter(function(key, index) {
          return (key !== "tracking" && required[key])
        })

        enabled = !missing.length
      }

      return enabled
    }

    tracker.updateEnabled = function () {
      var enabled = false

      if (this.id) { 
        enabled = !!this.modified
      }

      return enabled
    }

    tracker.deleteEnabled = function (type) {
      var enabled = false

      if (this.id !== undefined) {
        // This node exists already, so it can be deleted... if it
        // has no edges
        if (type === "node") {
          var edges = self.network.getConnectedEdges(this.id)
          enabled = !edges.length
        } else {
          enabled = true
        }
      }

      return enabled
    }
    return tracker
  }

  this.deselectAll()
})

Template.graph.onRendered(function () {
  var container = this.find('#graph')
  var interval = 2000 // 2 seconds between each call to poll()
  var nodeIds = []
  var edgeIds = []
  var options = {
    height: "200px"
  }
  var self = this
  var nodesDS
    , edgesDS
    , visData

  
  // NETWORK
  if (!this.network) {
    // Initialize the vis.DataSets and the vis.Network objects
    nodesDS = new vis.DataSet()
    edgesDS = new vis.DataSet()
    visData = { nodes: nodesDS, edges: edgesDS }
    this.network = new vis.Network(container, visData, options)
    this.network.addEventListener('click', clickOnGraph)
  }

  function clickOnGraph(data) {
    // console.log(data)
    // { edges: <array of string edge ids>
    // , nodes: <array of string node ids"
    // , event: <event object>
    // , pointer: {
    //     DOM: {x: <integer>, y: <integer> }
    //   , canvas: {x: <float>, y: <float> }
    //   }
    // }
    // NOTE: nodes will have 1 element if click was on node
    //       else edges will have 1 element if click was on edge
    //       else click was on background
    
    if (data.nodes.length) {
      selectNode(data.nodes[0])
    } else if (data.edges.length) {
      selectEdge(data.edges[0])
    } else {
      self.deselectAll()
    }

    function selectNode(nodeId) {
      var tracker = self.getCloneTracker(nodesDS, nodeId)
      var trackers = Trackers.get()
      var selectEnd = trackers.selectEnd
      trackers.selectEnd = !selectEnd
   
      if (selectEnd) {
        // May be the same as trackers.startNode -> circular link
        trackers.edge = self.getEmptyTracker("edge")
        trackers.endNode = tracker

      } else {
        trackers.startNode = tracker
        trackers.edge = null
        trackers.endNode = null
      }
      
      Trackers.set(trackers)
    }

    function selectEdge(edgeId) {
      var nodeIds = self.network.getConnectedNodes(edgeId)
      var trackers = Trackers.get()

      trackers.startNode = self.getCloneTracker(nodesDS, nodeIds[0])
      trackers.edge = self.getCloneTracker(edgesDS, edgeId)
      trackers.endNode = self.getCloneTracker(nodesDS, nodeIds[1])
      trackers.selectEnd = false

      Trackers.set(trackers)
    }
  }

  function poll(ignoreTimestamp) {
    Meteor.call('graph', ignoreTimestamp, graphCallback)
    setTimeout(poll, interval)
  }

  function graphCallback(error, data) {
    if (!error) {
      // data should be an object with the format
      // { nodes: <array of nodes>, edges: <array of edges> }
      
      var items
      function identifyItems(itemArray, idArray) {
        var ii
          , item
          , id
        var addedItems = []
          , updatedItems = []
        var items = {
          added: addedItems
        , updated: updatedItems
        }

        for(ii = 0; item = itemArray[ii]; ii += 1) {
          id = item.id
          if (idArray.indexOf(id) < 0) {
            // This is a new item
            addedItems.push(item)
            idArray.push(id)
          } else {
            updatedItems.push(item)
          }
        }
        
        return items
      }

      items = identifyItems(data.nodes, nodeIds)
      nodesDS.add(items.added)
      nodesDS.update(items.updated)

      items = identifyItems(data.edges, edgeIds)
      edgesDS.add(items.added)
      edgesDS.update(items.updated)
    }
  }

  poll(true)
})

Template.startNode.helpers({
  "selected": function () {
    return !!Trackers.get().startNode
  }
, class: function () {
    // Red outline if the next click on a node will change its value
    // Grey if it is not possible to delete it
    var trackers = Trackers.get()
    var startNode = trackers.startNode
    var deleteEnabled = startNode.deleteEnabled("node")
    return deleteEnabled
           ? trackers.selectEnd 
             ? "unlocked"     // white
             : "selectNext"   // red
           : trackers.selectEnd 
             ? "locked"       // grey
             : "selectLocked" // reddish-grey
  }
, id: function () {
    var startNode = Trackers.get().startNode
    return startNode.id || "<set automatically>"
  }
, label: function () {
    var startNode = Trackers.get().startNode
    return startNode.label || ""
  }
, group: function () {
    var selector = $("select[name=group]")[0]
    var startNode = Trackers.get().startNode
    if (selector) {
      selector.value = startNode.group || ""
    }

    return "group"
  }
, updatedAt: function () {
    var startNode = Trackers.get().startNode
    return startNode.updatedAt || "<set automatically>"
  }
, custom: function () {
    var startNode = Trackers.get().startNode
    return startNode.custom || ""
  }
})

Template.startNode.events({
  "keyup input[name=label]": function (event) {
    var trackers = Trackers.get()
    var label = event.currentTarget.value
    trackers.startNode.modify("label", label) 
    console.log(trackers.startNode)
    Trackers.set(trackers)
  }
, "change select": function (event) {
    var trackers = Trackers.get()
    var target = event.currentTarget
    var group = target.value
    trackers.startNode.modify("group", group) 
    console.log(Trackers.get().startNode)
    Trackers.set(trackers)
  }
, "keyup input[name=custom]": function (event) {
    var trackers = Trackers.get()
    var custom = event.currentTarget.value
    trackers.startNode.modify("custom", custom)
    console.log(startNode)
    Trackers.set(trackers)
  }
, "click button[name=delete]": function (event) {
  
  }
, "click button[name=update]": function (event) {
  
  }
, "click button[name=create]": function (event) {
  
  }
})

Template.nodeButtons.helpers({
  "delete_disabled": function () {
    var deleteEnabled = Trackers.get().startNode.deleteEnabled("node")
    // trackers.edge needs to be more permissive, when the edge
    // object exists but the edge itself does not.
    return deleteEnabled
           ? ""
           : "disabled"
  }
, "update_disabled": function () {
    var startNode = Trackers.get().startNode
    return startNode.updateEnabled() ? "" : "disabled"
  }
, "create_disabled": function () {
    var startNode = Trackers.get().startNode
    return startNode.createEnabled() ? "" : "disabled"
  }
})

Template.edge.helpers({
  selected: function () {
    return !!Trackers.get().edge
  }
, class: function () {
    var edge = Trackers.get().edge
    return edge
           ? edge.id
             ? "unlocked"
             : "create"
           : "unlocked"
  }
, id: function () {
    showEdgeType() // WORKAROUND, paired with edgeTypes onRendered

    var edge = Trackers.get().edge
    return edge.id || "<set automatically>"
  }
, updatedAt: function () {
    var edge = Trackers.get().edge
    return edge.updatedAt || "<set automatically>"
  }
, custom: function () {
    var edge = Trackers.get().edge
    return edge.custom || ""
  }
})

Template.edgeTypes.onRendered(function () {
  showEdgeType()
})

function showEdgeType () {
  // WORKAROUND to show selected item dynamically. The type selector
  // is a sub-template, and so it is not rendered until after the
  // elements it contains have been determined. This routine needs to
  // be run after it has renderd (onRendered) and when a new edge
  // item is displayed, as evidenced by a change in updatedAt.
  var selector = $("select[name=type]")[0]
  var edge = Trackers.get().edge
  if (selector) {
    selector.value = edge.type || ""
  }
}

Template.edgeButtons.helpers({
  // Delete should be disabled if there is no edge
  // Update should be disabled if there is no edge or if the user
  // has not modified the settings for the edge
  // Create should be disabled if there is a edge with unchanged
  // settings
  "delete_disabled": function () {
    var edge = Trackers.get().edge
    return edge.deleteEnabled("edge") ? "" : "disabled"
  }
, "update_disabled": function () {
    // Should be disable only if no changes have been made to edge
    var edge = Trackers.get().edge
    return edge.updateEnabled() ? "" : "disabled"
  }
, "create_disabled": function () {
    // Should be disable only if no changes have been made to edge
    var edge = Trackers.get().edge
    return edge.createEnabled() ? "" : "disabled"
  }
})

Template.edge.events({
  "keyup input[name=label]": function (event) {
    var trackers = Trackers.get()
    var label = event.currentTarget.value
    trackers.startNode.modify("label", label) 
    console.log(trackers.startNode)
    Trackers.set(trackers)
  }
, "change select": function (event) {
    var trackers = Trackers.get()
    var target = event.currentTarget
    var type = target.value
    trackers.edge.modify("type", type) 
    Trackers.set(trackers)
  }
, "keyup input[name=custom]": function (event) {
    var trackers = Trackers.get()
    var custom = event.currentTarget.value
    trackers.edge.modify("custom", custom)
    Trackers.set(trackers)
  }
, "click button[name=delete]": function (event) {
  
  }
, "click button[name=update]": function (event) {
  
  }
, "click button[name=create]": function (event) {
  
  }
})

Template.endNode.helpers({
  "selected": function () {
    return !!Trackers.get().endNode
  }
, "start_selected": function () {
    return !!Trackers.get().startNode
  }
, "class": function () {
    var trackers = Trackers.get()
    return trackers.selectEnd 
           ? "selectNext"   // red
           : trackers.endNode
             ? "locked"   // grey
             : "unlocked" // white
  }
, id: function () {
    var endNode = Trackers.get().endNode
    return endNode.id
  }
, label: function () {
    var endNode = Trackers.get().endNode
    return endNode.label || ""
  }
, group: function () {
    var endNode = Trackers.get().endNode
    return endNode.group || ""
  }
, updatedAt: function () {
    var endNode = Trackers.get().endNode
    return endNode.updatedAt || ""
  }
, custom: function () {
    var endNode = Trackers.get().endNode
    return endNode.custom || ""
  }
})