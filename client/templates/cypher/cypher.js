  
Template.cypher.events({
  "click button[class=execute]": function (event, template) {
    var parent = document.querySelector(".tabs-content.active")
    var inputs = parent. children[0].children

    getQuery("cypher", "fetch", inputs) //packages/lxo:toolkit/toolkit.js         
  }
})