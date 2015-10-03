

Template["index.get"].events({
  "click button[class=execute]": function (event, template) {
   var options = {
      command: "get"
    , object: "index"
    }
    getQuery(options) // in packages/lxo:toolkit/toolkit.js 
  }
})