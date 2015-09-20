Template.form.onCreated(function () {
  reset()
})

Template.startNode.helpers({
  "selected": function () {
    return !!Session.get("selection").startNode
  }
, "class": function () {
    // Red outline if the next click on a node will change its value
    // Grey if it is not possible to delete it
    var selection = Session.get("selection")
    return selection.selectEnd 
           ? selection.link
             ? "locked"       // grey
             : "unlocked"     // white
           : selection.link
             ? "selectLocked" // pale red
             : "selectNext"       // red
  }
})

Template.nodeButtons.helpers({
  "delete_disabled": function () {
    var selection = Session.get("selection")
    return !selection.startNode || selection.link
           ? "disabled"
           : ""
  }
, "update_disabled": function () {
    var selection = Session.get("selection")
    return selection.startNode ? "" : "disabled"
  }
, "create_disabled": function () {
    var selection = Session.get("selection")
    return selection.startNode ? "disabled" : ""
  }
, "id": function () {
    var selection = Session.get("selection")
    return Session.get("startNode").id || ""
  }
, "name": function () {
    var selection = Session.get("selection")
    return Session.get("startNode").label || ""
  }
, "label": function () {
    var selection = Session.get("selection")
    return Session.get("startNode").labels[0] || ""
  }
, "updatedAt": function () {
    var selection = Session.get("selection")
    return Session.get("startNode").updatedAt || "-"
  }
, "custom": function () {
   var selection = Session.get("selection")
   return Session.get("startNode").custom || ""
  }
})

Template.connect.helpers({
  "selected": function () {
    return Session.get("selection").endNode
  }
, "class": function () {
    return "unlocked"
  }
, "links": function () {
    return [ { name: "name"}, {id: "id"} ] //Session.get("link").links
  }
, "name": function () {
    return "name"
  }
, "custom": function () {
    return "custom"
  }
})

Template.linkButtons.helpers({
  // Delete should be disabled if there is no link
  // Update should be disabled if there is no link or if the user
  // has not modified the settings for the link
  // Create should be disabled if there is a link with unchanged
  // settings
  "no_link_disabled": function () {
    var selection = Session.get("selection")
    return selection.link
           ? ""
           : "disabled"
  }
, "create_disabled": function () {
    var selection = Session.get("selection")
    // Should be disable only if no changes have been made to link
    return selection.link
           ? "disabled"
           : ""
  }
})

Template.endNode.helpers({
  "selected": function () {
    return !!Session.get("selection").endNode
  }
, "start_selected": function () {
    return !!Session.get("selection").startNode
  }
, "class": function () {
    var selection = Session.get("selection")
    return selection.selectEnd 
           ? "selectNext"   // red
           : selection.endNode
             ? "locked"   // grey
             : "unlocked" // white
  }
})

function reset() {
  Session.set("selection", {})
}