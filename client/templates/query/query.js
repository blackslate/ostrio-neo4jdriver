

Template.query.events({
  "click button[class=execute]": function (event, template) {
    Meteor.call("relationshipTypes_test", callback)

    function callback(error, data) {
      if (error) {
        var selector = { query: "query" }
        var modifier = { query: "query", result: error }
        var options = {}
        var callback = function (error, data) {
          console.log("relationshipTypes_test result (", error, ")", data)
        }
        Result.upsert( selector, modifier, options, callback )
      }
      
      console.log("relationshipTypes_test()", error, data)
    }
  }
})