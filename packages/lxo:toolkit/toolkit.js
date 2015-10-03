
prettify = function prettify(input, padding) {
  if (typeof padding !== "string") {
    padding = ""
  }

  var type = (input === null)
             ? "null"
             : (input instanceof Array)
               ? "array"
               : typeof input

  switch (type) {
    case ("undefined"):
      return 'undefined\n'
    case ("null"):
      return 'null\n'
    case ("boolean"):
    case ("number"):
      return input + '\n'
    case ("string"):
      return '"' + input + '"\n'
    case ("array"):
      return prettifyArray(input, padding)
    case ("object"):
      return prettifyObject(input, padding)
  }

  function prettifyArray(input, padding) {
    var output

    if (!input.length) {
      output = "[]\n"
    } else {
      output = input.reduce(function (string, item){
        var value = prettify(item, padding + "  ")
        return string + padding + ", " + value
      }, "")

      var offset = output.indexOf(",") + 1
      output = "[\n " + padding + output.substring(offset) + padding + "]\n"
    }

    return output
  }

  function prettifyObject(input, padding) {
    var output
    var keys = Object.keys(input)

    if (!keys.length) {
      output = "{}\n"

    } else {
      var keyLength = keys.reduce(function (max, key) {
        var length = key.length
        if (max < length) {
          return length
        }
        return max
      }, 0)

      output = keys.reduce(function (string, key) {
        var value = prettify(input[key], padding + "  ")
        var keyDelta = keyLength - key.length
        var keyPadding = ""

        while (keyDelta--) {
          keyPadding += " "
        }
        return string + padding + ", " + key + ": " + keyPadding + value
      }, "")  

      var offset = output.indexOf(",") + 1
      output = "{\n " + padding + output.substring(offset) + padding + "}\n"
    }
    
    return output
  }
}

prettifyHTML = function prettifyHTML(input, padding) {
  if (typeof padding !== "string") {
    padding = ""
  }

 var type = (input === null)
             ? "null"
             : (input instanceof Array)
               ? "array"
               : typeof input

  switch (type) {
    case ("undefined"):
      return 'undefined<br />'
    case ("null"):
      return 'null<br />'
    case ("boolean"):
    case ("number"):
      return input + '<br />'
    case ("string"):
      return '"' + input + '"<br />'
    case ("array"):
      return prettifyArray(input, padding)
    case ("object"):
      return prettifyObject(input, padding)
  }

  function prettifyArray(input, padding) {
    var output

    if (!input.length) {
      output = "[]<br />"
    } else {
      output = input.reduce(function (string, item){
        var value = prettifyHTML(item, padding + "&nbsp;&nbsp;")
        return string + padding + ", " + value
      }, "")

      var offset = output.indexOf(",") + 1
      output = "[<br />&nbsp;" + padding + output.substring(offset) + padding + "]<br />"
    }
    return output
  }

  function prettifyObject(input, padding) {
    var output
    var keys = Object.keys(input)

    if (!keys.length) {
      output = "{}<br />"
    } else {
      var keyLength = keys.reduce(function (max, key) {
        var length = key.length
        if (max < length) {
          return length
        }
        return max
      }, 0)

      output = keys.reduce(function (string, key) {
        var value = prettifyHTML(input[key], padding + "&nbsp;&nbsp;")
        var keyDelta = keyLength - key.length
        var keyPadding = ""

        while (keyDelta--) {
          keyPadding += "&nbsp;"
        }
        return string + padding + ", " + key + ": " + keyPadding + value
      }, "")

      var offset = output.indexOf(",") + 1
      output = "{<br />&nbsp;" + padding + output.substring(offset) + padding + "}<br />"
    }
    
    return output
  }
}

getAll = function getAll(command) {
  Meteor.call("getAll", command, callback)

  function callback(error, data) {
    if (error) {
      var doc = Result.findOne({ query: command })
      var id = doc._id
      var selector = { _id: id }
      var modifier = { result: error, query: command }
      modifier = _.extend(modifier, selector)
      var options = {}
      var callback = function (error, data) {
        console.log(command + "_test result (", error, ")", data)
      }
      Result.update( selector, modifier, options, callback )
    }
    
    console.log(command + "_test()", error, data)
  }
}

getQuery = function getQuery(command, postOp, inputs) {
  var options = {}

  if (typeof command === "object") {
    // { command: <string>
    // , object: <string>
    // }
    options = command
  } else {
    options.command = command
    options.postOp = postOp || false
  }

  if (!inputs) {
    inputs = document.querySelector("#query-string").children
  }
  options.parameters = getParameters(inputs)

  //var command = options.command
  Meteor.call("getQuery", options, callback)

  function callback(error, data) {
    if (error) {
      var doc = Result.findOne({ query: command })
      var id = doc._id
      var selector = { _id: id }
      var modifier = { result: error, query: command }
      modifier = _.extend(modifier, selector)
      var options = {}
      var callback = function (error, data) {
        console.log(command + " result (", error, ")", data)
      }
      Result.update( selector, modifier, options, callback )
    }
    
    console.log(command + "()", error, data)
  }

  function getParameters(inputs) {
    var object = {}
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
      if (elements.type === "submit") {
        // Ignore the submit button
        continue
      }

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
              case "INPUT": // fall through // ASSUME TO BE TEXT?
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
        if (value) {
          parameters.push( { label: label, value: value } )
        }
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

    return parameters

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
       case "number":
          return getNumber(string)
        case "object":
          return getEvaluatedObject(string)
        case "function":
          alert("The server will make the call synchronously")
          return false
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

      function getNumber(string) {
        var value = parseInt(string, 10)
        if (isNaN(value)) {
          alert ("Number required")
          return false
        } else {
          return value
        }
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
}
