  
Template.querySync.events({
  "click button[class=execute]": function (event, template) {
    getQuery("querySync", "fetch") // in packages/lxo:toolkit/toolkit.js 
  }
})