

Template["relationship.get"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "get"
    , object: "relationship"
    , postOp: "get"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})