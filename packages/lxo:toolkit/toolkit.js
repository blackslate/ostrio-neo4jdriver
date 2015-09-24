
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