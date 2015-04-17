(function() {
  socr.dataStore = (function() {
    var _helper;
    _helper = function(type) {
      var _data;
      _data = {};
      return {
        getData: function(index) {
          if (typeof _data[index] !== "undefined") {
            return _data[index];
          } else {
            return _data;
          }
        },
        setData: function(data) {
          var i;
          if (typeof data === "object") {
            if (!$.isEmptyObject(_data)) {
              i = 0;
              while (i < data.length) {
                if (data[i] !== undefined && data[i] !== NaN) {
                  _data[i] = data[i];
                }
                i++;
              }
            } else {
              _data = data;
            }
            return this;
          } else {
            return false;
          }
        },
        order: function(type) {}
      };
    };
    return {
      createObject: function(name, data, type) {
        var e, h, i, name_list, newFlag, temp;
        name_list = $.normalize(name);
        temp = this;
        newFlag = false;
        try {
          i = 0;
          while (i < name_list.length) {
            if (!temp.hasOwnProperty(name_list[i])) {
              Object.defineProperty(temp, name_list[i], {
                value: {},
                writable: true,
                enumerable: true,
                configurable: true
              });
              newFlag = true;
            }
            temp = temp[name_list[i]];
            i++;
          }
          if (typeof data !== "undefined") {
            if (newFlag) {
              h = _helper();
              $.extend(temp, h);
            }
            temp.setData(data);
          }
          return this;
        } catch (_error) {
          e = _error;
          console.log(e.stack);
          PubSub.publish("Error", {
            description: "Error while creating dataStore object."
          });
        }
      },
      removeObject: function(obj) {
        var prop;
        if (typeof this[obj] !== "undefined") {
          delete this[obj];
        }
        if (obj === "all") {
          for (prop in this) {
            if (prop !== "createObject" && prop !== "removeObject") {
              delete this[prop];
            }
          }
        }
        return this;
      }
    };
  })();

}).call(this);
