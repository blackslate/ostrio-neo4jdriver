

Template.index_create.events({
  "click button[class=execute]": function (event, template) {
    var url = template.find("input[name=url]").value
    var user = template.find("input[name=username]").value
    var pass = template.find("input[name=password]").value
    var options = { url: url, user: user, pass: pass }
    Meteor.call("Neo4jDB_test", options, callback)

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