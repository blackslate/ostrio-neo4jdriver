

// Template.query.events({
//   "click button[class=execute]": function (event, template) {
//     Meteor.call("relationshipTypes_test", callback)

//     function callback(error, data) {
//       if (error) {
//         var selector = { query: "query" }
//         var modifier = { query: "query", result: error }
//         var options = {}
//         var callback = function (error, data) {
//           console.log("relationshipTypes_test result (", error, ")", data)
//         }
//         Result.upsert( selector, modifier, options, callback )
//       }
      
//       console.log("relationshipTypes_test()", error, data)
//     }
//   }
// })

Session.setDefault("cypher_query", "MATCH (n) \n" +
"WHERE id(n) = {id} \n" +
"RETURN n")
Session.setDefault("opts", "id: 42")

genericCallbackFunction = function (error, data) {
  if (!error) {
    result = prettifyHTML(error)
  } else {
    result = prettifyHTML(data)
  }

  console.log(result)
}

Template.query.helpers({
  tabs: function () {
    return [
      { name: 'Object Syntax', slug: 'object' }
    , { name: 'String Syntax', slug: 'string' }
    ]
  }
})

Template.query.events({
  "click button[class=execute]": function (event, template) {
    var object = {}
    var parent = document.querySelector(".tabs-content.active")
    var inputs = parent. children[0].children
    var regex = /\w+/
    var parameters = []
    var useObject = false
    var checked
      , type
      , dataType
      , label
      , value
      , ii
      , elements
      , jj
      , element

    for(ii = 0; elements = inputs[ii]; ii += 1) {
      elements = elements.children
      checked = true
      dataType = undefined
      label = undefined

      for (jj = 0; element = elements[jj]; jj += 1) {
        if (checked) {
          if (element.type === "checkbox") {
            if (!element.checked) {
              // Stop treating this item if it is explicitly unchecked
              checked = false
            }
          } else {
            type = element.nodeName.toUpperCase()
            if (!dataType) {
              dataType = element.dataset.type
            }

            switch (type) {
              case "LABEL":
                label = regex.exec(element.innerHTML)[0]
                useObject = true
              break
              case "TEXTAREA": // fall through
              case "SELECT":
                value = element.value
              break
            }
          }
        }
      }

      if (checked) {
        // Add this element to the query
        value = checkValue(value, dataType)
        parameters.push( { label: label, value: value } )
      }
    }

    if (useObject) {
      // Create a single object from the elements in the array
      parameters = parameters.reduce(function (current, object) {
        current[object.label] = object.value
        return current
      }, {})
      
    } else {
      // Provide the parameters as an array
      parameters = parameters.map(function (item, index, array) {
        return item.value
      })
    }

  //   db.query(parameters)
  
    Meteor.call("query", parameters, callback)

    function callback(error, data) {
      if (error) {
        var selector = { query: "query" }
        var modifier = { query: "query", result: error }
        var options = {}
        var callback = function (error, data) {
          console.log("query result (", error, ")", data)
        }
        Result.upsert( selector, modifier, options, callback )
      }
      
      console.log("db.query()", error, data)
    }
  

    function checkValue(string, dataType) {
      switch (dataType) {
        case "boolean":
          return getBoolean(string)
        case "object":
          return getEvaluatedObject(string)
        case "function":
          alert("The server will use its own callback function")
          return genericCallbackFunction
        default:
          return string
      }

      function getBoolean(string) {
        switch (value) {
          case "false":
          case "":
          case "null":
          case "undefined":
            return false
        }
        return true
      }

      function getEvaluatedObject(string) {
        // String should be something like "key: 'value', etc: 0")
        var output
        var regex = /(\w+)[:]/g
        string = string.trim()
        if (string.charAt(0) !== "{") {
          string = "{" + string
        }

        if (string.slice(-1) !== "}") {
          string += "}"
        }

        try {
          //output = eval('"'+string+'"')
          output = JSON.parse(string)
        } catch (exception) {
          output = assumeNoEmbeddedCommasOrColons(string)
          if (!output) {

            alert ("Unable to parse or convert\n"
             + string 
             + "\nPlease use JSON format for objects.")
            console.log(exception)
            output = {}
          }
        }

        return output

        function assumeNoEmbeddedCommasOrColons(string) {
          var object = {}

          string = string.replace(/^\{|\}$/g, '') // remove { ... }
          var keyValueArray = string.split(",")
          var regex = /(["'])(.+)\1/
          var keyAndValue
            , result
            , key
            , value

          var valid = keyValueArray.every(function (keyValue) {
            keyAndValue = keyValue.split(":")
            if (keyAndValue.length !== 2) {
              return false
            }

            // Wrap key in double quotes
            key = keyAndValue[0].trim()

            if (result = regex.exec(key)) {
              // Strip any paired " or ' quotes
              // ['quoted', "'", quoted]
              key = result[2]
            }
            //key = '"' + key + '"'

            value = convertValue(keyAndValue[1].trim(), regex)

            object[key] = value

            return true

            function convertValue(string, regex) {
              if (string.indexOf("'")<0 && string.indexOf('"')<0) {
                // Then string is not enclosed in quotes.
                // Number or Boolean?
                switch (string.trim()) {
                  case "true":
                    return true
                  case "false":
                    return false
                }

                var number = parseFloat(string)
                if (isNaN(number)) {
                  return string
                } else {
                  return number
                }
              } else {
                if (result = regex.exec(string)) {
                  // Strip any paired " or ' quotes
                  string = result[2]
                }

                return string
              }
            }
          })

          if (!valid) {
            object = false
          }

          return object
        }
      }
    }
  }

, "keyup textarea": function(event, template) {
    treatTextInput(event, template)
  }
, "keyup input": function(event, template) {
    treatTextInput(event, template)
  }
})

function treatTextInput(event, template) {
  var target = event.currentTarget
  var id = target.id
  if (id) {
    Session.set(id, target.value || target.innerHTML)
  }
  
  // Auto-enable  the checkbox, if there is one
  var $checkbox = $("input[type=checkbox]", target.parentNode)
  if ($checkbox.length) {
    $checkbox[0].checked = true
  }
}

Template.cypher_query.helpers({
  cypher_query: function () {
    return Session.get("cypher_query")
  }
})

Template.opts.helpers({
  opts: function () {
    return Session.get("opts")
  }
})

Template.reactive.events({
  "click input": function (event) {
    var checked = event.currentTarget.checked
    Session.set("reactive", checked)
  }
})

Template.reactive.helpers({
  disabled: function () {
    return Session.get("reactive") ? "" : "disabled"
  }
})
