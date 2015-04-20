// Build path for API request destination
  module.exports = function(urlObj, eventsOrScores) {
    console.log("urlObj: ")
    console.dir(urlObj);

    var array = [urlObj.sport, urlObj.method, urlObj.id];
    var path;
    var url;
    var param_list = [];
    var param_string;
    var key;

    path = array.filter(function (element) {
      return element !== undefined;
    }).join('/');
    url = '/' + path + '.' + urlObj.format;

    // Check for parameters and create parameter string
    if (urlObj.params) {
      for (key in urlObj.params) {
        if (urlObj.params.hasOwnProperty(key)) {
          param_list.push(encodeURIComponent(key) + '=' + encodeURIComponent(urlObj.params[key]));
        }
      }
      param_string = param_list.join('&');
      if (param_list.length > 0) {
        url += '?' + param_string;
      }
    }

    console.log("url: " + url)
    return url;
  }