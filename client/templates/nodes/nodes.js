
Template.nodes.helpers({
  tabs: function () {
    return [
      { name: 'Number Syntax', slug: 'number' }
    , { name: 'Object Syntax', slug: 'object' }
    ]
  }
})

Template.nodes.events({
  "click button[class=execute]": function (event, template) {
    var parent = document.querySelector(".tabs-content.active")
    var inputs = parent. children[0].children

    getQuery("nodes", "get", inputs) // in packages/lxo:toolkit/toolkit.js 
  }
})