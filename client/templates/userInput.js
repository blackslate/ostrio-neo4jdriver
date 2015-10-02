
Session.setDefault("cypher_query", "MATCH (n) \n" +
"WHERE id(n) = {id} \n" +
"RETURN n")
Session.setDefault("reactive", false)
Session.setDefault("opts", "id: 42")
Session.setDefault("opts-checked", true)

Template.userInput.events({
  "keyup textarea": function(event, template) {
    treatTextInput(event, template)
  }
, "keyup input": function(event, template) {
    treatTextInput(event, template)
  }
})

function treatTextInput(event, template) {
  var target = event.currentTarget
  var id = target.id
  if (id) {
    Session.set(id, target.value || target.innerHTML)
  }
  
  // Auto-enable  the checkbox, if there is one
  var $checkbox = $("input[type=checkbox]", target.parentNode)
  if ($checkbox.length) {
    $checkbox[0].checked = true
  }
}

Template.opts.events({
  "click input": function (event) {
    var checked = event.currentTarget.checked
    Session.set("opts-checked", checked)
  }
})

Template.reactive.events({
  "click input": function (event) {
    var checked = event.currentTarget.checked
    Session.set("reactive", checked)
  }
})

Template.cypher_query.helpers({
  cypher_query: function () {
    return Session.get("cypher_query")
  }
})

Template.opts.helpers({
  opts: function () {
    return Session.get("opts")
  }
, checked: function () {
    return Session.get("opts-checked") ? "checked" : ""
  }
})

Template.reactive.helpers({
  disabled: function () {
    return Session.get("reactive") ? "" : "disabled"
  }
})