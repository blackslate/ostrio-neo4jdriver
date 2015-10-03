
Template["constraint.create"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "create"
    , object: "constraint"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }

})