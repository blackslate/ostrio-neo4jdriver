

Template["index.create"].events({
  "click button[class=execute]": function (event, template) {
    var options = {
      command: "create"
    , object: "index"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})