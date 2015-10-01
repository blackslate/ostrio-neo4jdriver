

Template.nodes.events({
  "click button[class=execute]": function (event, template) {
    var id = template.find("input[name=id]").value
    var reactive = template.find("input[name=reactive]").value === "true"
    var options = { id: id, reactive: reactive }
    Meteor.call("nodes_test", options, callback)

    function callback(error, data) {
      if (error) {
        var selector = { query: "Neo4jDB" }
        var modifier = { query: "Neo4jDB", result: error }
        var options = {}
        var callback = function (error, data) {
          console.log("Neo4jDB_test result (", error, ")", data)
        }
        Result.upsert( selector, modifier, options, callback )
      }
      
      console.log("Neo4jDB_test()", error, data)
    }
  }
})