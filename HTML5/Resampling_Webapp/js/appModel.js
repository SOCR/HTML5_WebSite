
/*
appModel.js is the model object for the SOCR app.

@author selvam , ashwini
@constructor
@return {object}
SOCR - Statistical Online Computational Resource
 */

(function() {
  socr.model = function() {

    /*
    @method : _getRandomInt()
    @desc   : returns a random number in the range [min,max]
    @param  : min , max
    @return : {number}
     */
    var _K, _count, _generateCount, _generateDOP, _generateF, _generateMean, _generateP, _generateStandardDev, _generateZ, _getRandomInt, _n, _stopCount, _this;
    _getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };

    /*
    @method : _generateMean
    @param  : {number|string} sampleNumber - the random sample number for which the mean is to be calculated
    @param  : {number} groupNumber
    @desc   : the calculated mean value
    @return : {number}
     */
    _generateMean = function(sampleNumber, groupNumber) {
      var i, total, _val;
      groupNumber = groupNumber || 1;
      total = 0;
      if (sampleNumber === "dataset") {
        _val = socr.dataStore.dataset[groupNumber].values.getData();
        i = 0;
        while (i < _val.length) {
          total += parseFloat(_val[i]);
          i++;
        }
        total = total / _val.length;
        if (isNaN(total)) {
          return false;
        } else {
          return total;
        }
      } else {
        total = _generateCount(sampleNumber, groupNumber);
        return total / socr.dataStore.bootstrapGroup[sampleNumber].values.getData(groupNumber).length;
      }
    };

    /*
    @method : _generateCount
    @param  : sampleNumber - the random sample number for which the count is to be calculated
    @param  : groupNumber
    @desc   : the calculated total count value for the sample
    @return : {number}
     */
    _generateCount = function(sampleNumber, groupNumber) {
      var i, total, x;
      x = socr.dataStore.bootstrapGroup[sampleNumber].values.getData(groupNumber);
      total = 0;
      i = 0;
      while (i < x.length) {
        total += parseFloat(x[i]);
        i++;
      }
      return total;
    };

    /*
    @method : _generateStandardDev
    @param  : sampleNumber , groupNumber
    @desc   : the calculated mean standard deviation.
    @return : {number} standard deviation for the input sample and group numbers
     */
    _generateStandardDev = function(sampleNumber, groupNumber) {
      var i, _SD, _mean, _sample, _squaredSum;
      _mean = _generateMean(sampleNumber, groupNumber);
      _squaredSum = null;
      _sample = socr.dataStore.bootstrapGroup[sampleNumber].values.getData(groupNumber);
      i = 0;
      while (i < _sample.length) {
        _squaredSum += _sample[i] * _sample[i];
        i++;
      }
      _squaredSum = _squaredSum / _sample.length;
      _SD = Math.sqrt(_squaredSum - _mean * _mean);
      return _SD;
    };

    /*
    @method  : _generateF
    @desc   : Generates the F value using the one way ANOVA method
    @param  :sampleNumber
    @return :{object}
     */
    _generateF = function(sampleNumber) {
      var i, j, _N, _data, _dofe, _dofw, _m, _mst, _msw, _ssb, _sspace, _sst, _ssw, _temp, _total, _y, _ymean;
      if (sampleNumber === undefined) {
        return null;
      } else {
        _ymean = [];
        _total = 0;
        _N = 0;
        _sst = 0;
        _ssw = 0;
        _ssb = 0;
        _data = [];
        if (sampleNumber === "dataset") {
          i = 1;
          while (i <= _K) {
            _data[i] = socr.dataStore.dataset[i].values.getData();
            i++;
          }
        } else {
          _data = socr.dataStore.bootstrapGroup[sampleNumber].values.getData();
        }
        i = 1;
        while (i <= _K) {
          _ymean[i] = $.mean(_data[i]);
          _N += _data[i].length;
          _total += _ymean[i];
          i++;
        }
        _y = _total / _K;
        _dofe = _K - 1;
        _dofw = _N - _K;
        _sspace = [];
        i = _K;
        while (i >= 1) {
          _sspace = _sspace.concat(_data[i]);
          i--;
        }
        _m = $.mean(_sspace);
        i = _sspace.length - 1;
        while (i >= 0) {
          _sst = _sst + Math.pow(_m - _sspace[i], 2);
          i--;
        }
        i = 1;
        _temp = 0;
        while (i <= _K) {
          j = 0;
          while (j < _data[i].length) {
            _temp = _data[i][j] - _ymean[i];
            _ssw += _temp * _temp;
            j++;
          }
          i++;
        }
        _ssb = _sst - _ssw;
        _mst = _ssb / _dofe;
        _msw = _ssw / _dofw;
        return {
          fValue: _mst / _msw,
          ndf: _dofe,
          ddf: _dofw
        };
      }
    };

    /*
    @method : _generateP
    @desc   :Generates p value for the "k" data groups using one way ANOVA method.
    @param  :sampleNumber
    @param  :_ndf
    @param  :_ddf
    @return :{number}
     */
    _generateP = function(sampleNumber, _ndf, _ddf) {
      var x;
      x = _generateF(sampleNumber);
      _ndf = _ndf || x.ndf;
      _ddf = _ddf || x.ddf;
      return socr.tools.fCal.computeP(x.fValue, _ndf, _ddf);
    };

    /*
    @method  : _generateZ
    @desc   :Generates p value for the "k" data groups using difference of proportion test.
    @param  :sampleNumber
    @return : {number}
     */
    _generateZ = function(sampleNumber) {
      var SE, n1, n2, p, p1, p2, _data1, _data2;
      if (sampleNumber === "dataset") {
        _data1 = socr.dataStore.dataset[1].values.getData();
        _data2 = socr.dataStore.dataset[2].values.getData();
      } else {
        _data1 = socr.dataStore.bootstrapGroup[sampleNumber].values.getData();
        _data2 = _data1[2];
        _data1 = _data1[1];
      }
      n1 = _data1.length;
      p1 = $.sum(_data1) / n1;
      n2 = _data2.length;
      p2 = $.sum(_data2) / n2;
      p = (p1 * n1 + p2 * n2) / (n1 + n2);
      SE = Math.sqrt(p * (1 - p) * ((1 / n1) + (1 / n2)));
      return {
        zValue: (p1 - p2) / SE
      };
    };

    /*
    @desc Generates p value for the "k" data groups using difference of proportion.
    @param sampleNumber
    @param mu
    @param sigma
    @returns {number}
    @private
     */
    _generateDOP = function(sampleNumber, mu, sigma) {
      var e, x;
      try {
        x = _generateZ(sampleNumber);
        mu = mu || 0;
        sigma = sigma || 1;
      } catch (_error) {
        e = _error;
        console.log(e.message);
      }
      return socr.tools.zCal.computeP(x.zValue, mu, sigma);
    };
    _stopCount = 1000;
    _count = 0;
    _n = ["0 is taken"];
    _K = null;
    _this = this;
    return {
      n: _n,

      /*
      @method: [public] generateTrail()
      @param datasetIndex
      @desc:  Generating a random number between 0 and dataSet size {@ashwini: I think this should be a private function}
      @returns {object}
       */
      generateTrail: function(datasetIndex) {
        var randomIndex, _temp;
        _temp = socr.dataStore.sampleSpace;
        if (_temp === undefined || _K === false) {
          return null;
        } else {
          randomIndex = _getRandomInt(0, _temp.values.getData().length);
          return {
            key: _temp.keys.getData(randomIndex),
            value: _temp.values.getData(randomIndex)
          };
        }
      },

      /*
      @method [public] generateSample()
      @desc  generating a random number between 0 and dataSet size
      @return {boolean}
       */
      generateSample: function() {
        var i, j, k, keyEl, sample, temp, valEl, values;
        k = socr.model.getK();
        keyEl = ["0 is taken"];
        valEl = ["0 is taken"];
        i = 1;
        while (i <= k) {
          j = socr.model.getN()[i];
          sample = [];
          values = [];
          while (j--) {
            temp = this.generateTrail(k);
            sample[j] = temp.key;
            values[j] = temp.value;
          }
          keyEl.push(sample);
          valEl.push(values);
          i++;
        }
        socr.dataStore.createObject("bootstrapGroup." + _count + ".keys", keyEl);
        socr.dataStore.createObject("bootstrapGroup." + _count + ".values", valEl);
        _count++;
        return true;
      },

      /*
      @method getMean()
      @desc  executed when the user presses "infer" button in the controller tile. The click binding of the step button is done in the {experiment}.js
      @param groupNumber
      @return {Array}
       */
      getMean: function(groupNumber) {
        var j, obj, _mean;
        groupNumber = groupNumber || 1;
        obj = socr.dataStore.createObject(groupNumber + ".mean", [])[groupNumber].mean;
        if (obj.getData().length === _count) {
          console.log("already saved!");
          return obj.getData();
        } else {
          _mean = [];
          j = obj.getData().length;
          while (j < _count) {
            _mean[j] = _generateMean(j, groupNumber);
            j++;
          }
          obj.setData(_mean);
          return obj.getData();
        }
      },

      /*
      @method getMeanOf()
      @desc  executed when the user presses "infer" button in the controller tile.
      The click binding of the step button is done in the {experiment}.js
      @param sampleNumber
      @param groupNumber
      @returns {number}
       */
      getMeanOf: function(sampleNumber, groupNumber) {
        return _generateMean(sampleNumber, groupNumber);
      },

      /*
      STANDARD DEVIATION METHODS STARTS *
       */

      /*
      @method getStandardDev
      @param groupNumber
      @returns {*}
       */
      getStandardDev: function(groupNumber) {
        var j, _temp;
        groupNumber = groupNumber || 1;
        if (_sample.StandardDev[groupNumber] === undefined) {
          _sample.StandardDev[groupNumber] = [];
        }
        _temp = _sample.StandardDev[groupNumber];
        if (_temp.length === _bootstrapGroupValues.length) {
          return _temp;
        } else {
          j = _temp.length;
          while (j < _count) {
            _temp[j] = _generateStandardDev(j, groupNumber);
            j++;
          }
          _sample.StandardDev[groupNumber] = _temp;
          return _sample.StandardDev[groupNumber];
        }
      },

      /*
      @method getStandardDevOf
      @param sampleNumber
      @param groupNumber
      @returns {number}
       */
      getStandardDevOf: function(sampleNumber, groupNumber) {
        return _generateStandardDev(sampleNumber, groupNumber);
      },

      /*
      @param K
      @returns {number}
       */
      getStandardDevOfDataset: function(K) {
        var i, _SD, _ds, _mean, _squaredSum, _val;
        K = K || 1;
        _ds = socr.dataStore.dataset;
        _val = _ds[K].values.getData();
        _mean = this.getMeanOf("dataset", K);
        _squaredSum = null;
        i = 0;
        while (i < _val.length) {
          _squaredSum += _val[i] * _val[i];
          i++;
        }
        _squaredSum = _squaredSum / _val.length;
        _SD = Math.sqrt(_squaredSum - _mean * _mean);
        console.log("SD of Dataset:" + _SD);
        return _SD;
      },

      /*
      STANDARD DEVIATION METHODS ENDS *
       */

      /*
      COUNT METHODS STARTS *
       */

      /*
      @method getCount
      @param groupNumber
      @returns {Array}
       */
      getCount: function(groupNumber) {
        var j, obj, _c;
        groupNumber = groupNumber || 1;
        obj = socr.dataStore.createObject(groupNumber + ".count", [])[groupNumber].count;
        if (obj.getData().length === _count) {
          console.log("already saved!");
          return obj.getData();
        } else {
          _c = [];
          j = obj.getData().length;
          while (j < _count) {
            _c[j] = _generateCount(j, groupNumber);
            j++;
          }
          obj.setData(_c);
          return obj.getData();
        }
      },

      /*
      @method getCountOf
      @param {number | string}sampleNumber
      @param {number} groupNumber
      @returns {number}
       */
      getCountOf: function(sampleNumber, groupNumber) {
        var K, i, total, _ds, _val;
        K = groupNumber || 1;
        _ds = socr.dataStore.dataset;
        if (sampleNumber === "dataset") {
          _val = _ds[K].values.getData();
          total = 0;
          i = 0;
          while (i < _val.length) {
            total += parseFloat(_val[i]);
            i++;
          }
          return total;
        } else {
          return _generateCount(sampleNumber, K);
        }
      },

      /*
      COUNT METHODS ENDS *
       */

      /*
      PERCENTILE METHODS STARTS *
       */

      /*
      @method getPercentile ()
      @param  pvalue - what is the percentile value that is to be calculated.
      @return {Array}
       */
      getPercentile: function(pvalue) {
        var j;
        console.log("getPercentile() invoked");
        j = 0;
        while (j < _count) {
          _sample.Percentile[j] = this.getPercentileOf(j, pvalue);
          j++;
        }
        return _sample.Percentile;
      },

      /*
      @method getPercentileOf
      @param sampleNumber
      @param pvalue
      @returns {*}
       */
      getPercentileOf: function(sampleNumber, pvalue) {
        var position, temp;
        temp = bootstrapSampleValues[sampleNumber].sort(function(a, b) {
          return a - b;
        });
        position = Math.floor(bootstrapSampleValues[sampleNumber].length * (pvalue / 100));
        return temp[position];
      },

      /*
      @param pvalue
      @returns {*}
       */
      getPercentileOfDataset: function(pvalue) {
        var position, temp;
        temp = _datasetValues.sort(function(a, b) {
          return a - b;
        });
        position = Math.floor(_datasetValues.length * (pvalue / 100));
        return temp[position];
      },

      /*
      PERCENTILE METHODS ENDS *
       */

      /*
      @method getF
      @desc returns the F value computed from the supplied group
      @return {Object}
       */
      getF: function(groupNumber) {
        var j, obj, _f;
        groupNumber = groupNumber || 1;
        _this = this;
        obj = socr.dataStore.createObject("F-Value", [])["F-Value"];
        if (obj.getData().length === _count) {
          console.log("already saved!");
          return obj.getData();
        } else {
          _f = [];
          j = obj.getData().length;
          while (j < _count) {
            _f[j] = _generateF(j).fValue;
            j++;
          }
          obj.setData(_f);
          return obj.getData();
        }
      },

      /*
      @method  getFof
      @desc returns the F value computed from the supplied group
      @param sampleNumber - Random sample Number at which the F value is to be calculated
      @returns {Object}
       */
      getFof: function(sampleNumber) {
        if (socr.model.getK() <= 1 || socr.dataStore.bootstrapGroup === undefined) {
          return false;
        }
        _this = this;
        return _generateF(sampleNumber);
      },

      /*
      @method getP
      @return {Object}
       */
      getP: function(groupNumber) {
        var j, obj, _p;
        groupNumber = groupNumber || 1;
        _this = this;
        obj = socr.dataStore.createObject("P-Value", [])["P-Value"];
        if (obj.getData().length === _count) {
          console.log("already saved!");
          return obj.getData();
        } else {
          _p = [];
          j = obj.getData().length;
          while (j < _count) {
            _p[j] = _generateP(j);
            j++;
          }
          obj.setData(_p);
          return obj.getData();
        }
      },

      /*
      @method getPof
      @param sampleNumber
      @returns {number}
       */
      getPof: function(sampleNumber) {
        if (socr.model.getK() <= 1 && socr.dataStore.bootstrapGroup === undefined) {
          return false;
        }
        _this = this;
        return _generateP(sampleNumber);
      },

      /*
      @method getDOP
      @return {Object}
       */
      getDOP: function() {
        var j, obj, _p;
        _this = this;
        obj = socr.dataStore.createObject("DOPValue", [])["DOPValue"];
        if (obj.getData().length === _count) {
          console.log("already saved!");
          return obj.getData();
        } else {
          _p = [];
          j = obj.getData().length;
          while (j < _count) {
            _p[j] = _generateDOP(j);
            j++;
          }
          obj.setData(_p);
          return obj.getData();
        }
      },

      /*
      @method getDOPof
      @param sampleNumber
      @returns {number}
       */
      getDOPof: function(sampleNumber) {
        _this = this;
        return _generateDOP(sampleNumber);
      },

      /*
      @method getDataset
      @desc  getter function for dataSet variable.
      @param K  dataset number , field - what value to return i.e values or keys or name
      @param field
      @returns {*}
       */
      getDataset: function(K, field) {
        var e;
        if (K === undefined) {
          K = 1;
        }
        if (field === undefined) {
          field = "keys";
        }
        try {
          return socr.dataStore.dataset[K][field].getData();
        } catch (_error) {
          e = _error;
          console.log(e.message);
          return false;
        }
      },

      /*
      @method setDataset
      @desc sets the data from the input sheet into the app model
      @param input
      @return {boolean}
       */
      setDataset: function(input) {
        var i, j, ma1, ma2, t, _cells, _id, _temp;
        if (typeof input !== "object") {
          return false;
        }
        if (input.processed) {
          ma1 = [];
          ma2 = [];
          i = 0;
          while (i < input.keys.length) {
            socr.dataStore.createObject("dataset." + (i + 1) + ".values", input.values[i]).createObject("dataset." + (i + 1) + ".keys", input.keys[i]);
            ma1 = ma1.concat(input.values[i]);
            ma2 = ma2.concat(input.keys[i]);
            i++;
          }
          socr.dataStore.createObject("sampleSpace.values", ma1).createObject("sampleSpace.keys", ma2);
          console.log("Simulation data is loaded now.");
          return true;
        } else if (input.type === "url") {
          return false;
        } else if (input.type === "spreadsheet") {
          ma1 = [];
          ma2 = [];
          socr.dataStore.removeObject("dataset");
          i = 0;
          while (i < input.values.length) {
            _cells = input.values[i].cells;
            _id = input.values[i].id;
            _temp = [];
            j = 0;
            while (j < _cells.length) {
              if (_cells[j] != null) {
                if ((t = _cells[j][0]) !== null && t !== void 0 && t !== "") {
                  _temp.push(t);
                }
              }
              j++;
            }
            socr.dataStore.createObject("dataset." + _id + ".values", _temp).createObject("dataset." + _id + ".keys", _temp);
            ma1 = ma1.concat(_temp);
            ma2 = ma2.concat(_temp);
            i++;
          }
          socr.dataStore.createObject("sampleSpace.values", ma1).createObject("sampleSpace.keys", ma2);
          if (!socr.dataStore.dataset) {
            return false;
          } else {
            return true;
          }
        }
      },

      /*
      @method : getSample
      @param  : index  random sample index
      @param  : K group index
      @param  : type values or keys
      @desc   : getter and setter function for random samples.
       */
      getSample: function(index, type, K) {
        var P, _bg;
        P = 0;
        K = K || 1;
        type = type || "values";
        if (this.getRSampleCount() === 0) {
          return false;
        }
        _bg = socr.dataStore.bootstrapGroup[index];
        if (type === "values") {
          return _bg.values.getData(K);
        } else {
          return _bg.keys.getData(K);
        }
      },

      /*
      @method - getSamples
      @param type
      @param K
      @returns {Array}
       */
      getSamples: function(type, K) {
        var i, _bg, _temp;
        type = type || "values";
        K = K || 1;
        _temp = [];
        _bg = socr.dataStore.bootstrapGroup;
        if (type === "values") {
          i = 0;
          while (i < _count) {
            _temp[i] = _bg[i].values.getData(K);
            i++;
          }
        } else {
          i = 0;
          while (i < _count) {
            _temp[i] = _bg[i].keys.getData(K);
            i++;
          }
        }
        return _temp;
      },

      /*
      getter and setter for variable '_stopCount'
       */
      setStopCount: function(y) {
        _stopCount = y;
      },
      getStopCount: function() {
        return _stopCount;
      },

      /*
      getter and setter for variable '_n'
       */
      setN: function(z) {
        var e, i, _ds;
        _n.length = 0;
        _n.push("0 is taken");
        socr.model.setK();
        _ds = socr.dataStore.dataset;
        if (typeof z === "undefined" || z === null) {
          if (typeof _ds !== "undefined") {
            i = 1;
            while (i <= _K) {
              try {
                _n.push(_ds[i]["values"].getData().length);
              } catch (_error) {
                e = _error;
                console.log(e.message);
                PubSub.publish("Error in model");
              }
              i++;
            }
          }
        } else if ($.isArray(z)) {
          if ((z.length - 1 === _K) || (z.length === _K)) {
            z.forEach((function(el, index, arr) {
              if (typeof el === "undefined" || el === null) {
                z[i] = _ds[i]["values"].getData().length;
              }
            }), z);
            _n = _n.concat(z);
          } else {

          }
        } else if (typeof z === "number" || typeof z === "string") {
          console.log(typeof z + " is the type of Z");
          z = parseInt(z);
          i = _K;
          while (i > 0) {
            _n.push(z);
            i--;
          }
        }
        console.log("random sample sizes:" + _n);
      },
      getN: function() {
        return _n;
      },

      /*
      getter and setter for variable '_count'
       */
      setRSampleCount: function(v) {
        _count = v;
        return true;
      },
      getRSampleCount: function() {
        return _count;
      },
      reset: function(option) {
        if (option !== "undefined" && option === "samples") {
          socr.dataStore.removeObject("bootstrapGroup");
          socr.model.setRSampleCount(0);
        } else {
          socr.dataStore.removeObject("all");
          socr.model.setRSampleCount(0);
        }
      },

      /*
      @method :setK
      @return : none
       */
      setK: function() {
        var name, _c, _ds;
        _c = 0;
        if ((_ds = socr.dataStore.dataset) === undefined) {
          _K = null;
          return false;
        }
        for (name in _ds) {
          if (_ds.hasOwnProperty(name)) {
            _c++;
          }
        }
        _K = _c;
      },

      /*
      @method :getK
      @return : {number}
       */
      getK: function() {
        return _K;
      }
    };
  };

}).call(this);
