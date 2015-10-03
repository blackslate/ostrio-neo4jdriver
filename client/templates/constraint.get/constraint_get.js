
Template["constraint.get"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "get"
    , object: "constraint"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})