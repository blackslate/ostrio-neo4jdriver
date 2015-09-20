
Template.graph.onRendered(function() {
  var container = this.find('#graph')
  var interval = 2000 // 2 seconds between each call to poll()
  var options = {
    height: "200px"
  }
  var nodeIds = []
  var edgeIds = []
  var network
    , nodesDS
    , edgesDS
    , visData

  var trackers = this.trackers = new ReactiveVar({
    startNode: null
  , link: null
  , endNode: null
  , selectEnd: false
  })
  var self = this

  deselectAll()

  
  if (!network) {
    // Initialize the vis.DataSets and the vis.Network objects
    nodesDS = new vis.DataSet()
    edgesDS = new vis.DataSet()
    visData = { nodes: nodesDS, edges: edgesDS }
    network = new vis.Network(container, visData, options)
    network.addEventListener('click', clickOnGraph)
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
      deselectAll()
    }

    function selectNode(nodeId) {
      var tracker = getChangeTracker(nodesDS, nodeId)
      var trackers = self.trackers.get()
      var selection = Session.get("selection")
      var selectEnd = selection.selectEnd
      selection.selectEnd = !selectEnd

      selection.link = ""
      
      if (selectEnd) {
        // May be the same as selection.startNode -> circular link
        selection.endNode = nodeId

        trackers.startNode = tracker
        trackers.link = 0
        trackers.endNode = tracker

      } else {
        selection.endNode = ""
        selection.startNode = nodeId

        trackers.startNode = tracker
        trackers.link = 0
        trackers.endNode = 0
      }

      self.trackers.set(trackers)
      Session.set("selection", selection)
      console.log(selection)
    }

    function selectEdge(edgeId) {
      var trackers = self.trackers.get()
      var nodeIds = network.getConnectedNodes(edgeId)
      var selection = Session.get("selection")

      selection.startNode = nodeIds[0]
      trackers.startNode = getChangeTracker(nodesDS, nodeIds[0])
      selection.link = edgeId
      trackers.link = getChangeTracker(edgesDS, edgeId)
      selection.endNode = nodeIds[1]
      trackers.endNode = getChangeTracker(nodesDS, nodeIds[1])

      selection.selectEnd = false

      self.trackers.set(trackers)
      Session.set("selection", selection)
      console.log(selection)
    }
  }

  function deselectAll() {
    var selection = {
      startNode: ""
    , endNode: ""
    , link: ""
    , selectEnd: false
    }

    Session.set("selection", selection)
    console.log(selection)
  }

  function getChangeTracker(dataSet, itemId) {
    var item = dataSet.get(itemId)
    var tracker = _.extend({}, item)

    tracker.modified = 0

    tracker.modify = function (key, value) {
      var original = item[key]
      var modified = this[key] !== original

      if (value === original) {
        // Revert
        if (original === undefined) {
          delete this[key]
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
      }
    }

    return tracker
  }
})

