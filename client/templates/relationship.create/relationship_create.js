
Template["relationship.create"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "create"
    , object: "relationship"
    , postOp: "get"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})