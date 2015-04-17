
/*
appView.js is the view object for the SOCR app.

@author: selvam , ashwini
@return: {object}
SOCR - Statistical Online Computational Resource
 */

(function() {
  socr.view = function(model) {

    /*
    @method: [private] _create
    @param :  start: the first sample number to be displayed
    @param :  size: how many samples to be displayed
    @return : {boolean}
    @desc:   populates the sampleList div with random samples
     */
    var _create, _createPagination, _currentExperiment, _currentValues, _currentVariable;
    _create = function(start, size) {
      var config, end, i, j, k, obj, temp, _datapoints;
      _datapoints = $("#nSize").val();
      end = parseInt(start) + size;
      j = 0;
      k = model.getK();
      if (size === undefined || start === undefined) {
        return false;
      }
      console.log("_create(" + start + "," + size + ") function started");
      $("#sampleList").html("");
      config = {
        entries: []
      };
      obj = {};
      i = start;
      while (i < end) {
        obj.sampleNo = i;
        obj.datapoints = _datapoints;
        obj.sample = [];
        j = 0;
        while (j <= k - 1) {
          temp = obj.sample[j] = {};
          if (j === 0) {
            temp["class"] = "active";
          } else {
            temp["class"] = "";
          }
          temp.kIndex = j + 1;
          temp.id = i * (Math.pow(10, Math.ceil(Math.log(i) / Math.log(10)))) + (j + 1);
          temp.values = model.getSample(i, "values", j + 1);
          temp.keys = model.getSample(i, "keys", j + 1);
          j++;
        }
        config.entries.push(obj);
        obj = {};
        i++;
      }
      $.get("partials/sampleList.tmpl", function(data) {
        temp = Mustache.render(data, config);
        $("#sampleList").html(temp);
        $(".tooltips").tooltip();
        $(".nav-tabs li").click(function(e) {
          var kIndex;
          e.preventDefault();
          kIndex = $(this).find("a").html();
          $(this).parent().parent().find(".toggle-sample").attr("k-index", kIndex);
          $(this).find("a").tab("show");
        });
        $(".plot").on("click", function(e) {
          var id, kIndex, values;
          e.preventDefault();
          $(".chart").html("");
          id = $(this).attr("sample-number");
          kIndex = $(this).parent().parent().find(".toggle-sample").attr("k-index");
          values = model.getSample(id, "values", kIndex);
          i = 0;
          while (i < values.length) {
            values[i] = parseFloat(values[i]);
            i++;
          }
          $("#plot").find("h3").text(" Sample : " + id);
          socr.vis.generate({
            parent: ".chart",
            data: values,
            height: 380,
            width: 500,
            method: "discrete",
            variable: "Frequency"
          });
        });
        $(".toggle-sample").on("click", function(e) {
          var id, kIndex;
          e.preventDefault();
          id = $(this).attr("sample-number");
          kIndex = $(this).parent().parent().find(".toggle-sample").attr("k-index");
          console.log();
          if ($(this).attr("data-type") === "value") {
            $(this).parent().parent().find("div.active pre").text(model.getSample(id, "keys", kIndex));
            $(this).attr("data-type", "keys");
          } else {
            $(this).parent().parent().find("div.active pre").text(model.getSample(id, "values", kIndex));
            $(this).attr("data-type", "value");
          }
        });
      });
      $(".contribution").on("click", function(e) {
        var createDotplot, html, table;
        createDotplot = function(setting) {
          var datum, histogram, values;
          if (setting.variable === "mean") {
            values = model.getMean();
            datum = model.getMeanOf("dataset", 1);
            console.log("Mean Values:" + values);
          } else if (setting.variable === "standardDev") {
            values = model.getStandardDev();
            datum = model.getStandardDevOfDataset(1);
            console.log("SD Values:" + values);
          } else {
            values = model.getPercentile();
          }
          datum = Math.floor(datum * 100) / 100;
          histogram = socr.vis.generate({
            parent: "#dotplot",
            data: values,
            height: 390,
            datum: datum,
            sample: setting.sample
          });
        };
        e.preventDefault();
        console.log("Mean of this sample:" + model.getMeanOf($(this).attr("id")));
        $("#accordion").accordion("activate", 2);
        console.log("dataset mean:" + model.getMeanOf("dataset", 1));
        console.log("standard deviation:" + model.getStandardDevOf($(this).attr("id")));
        $("#dotplot").html("");
        createDotplot({
          variable: "mean",
          sample: {
            mean: model.getMeanOf($(this).attr("id")),
            meanDataset: model.getMeanOf("dataset", 1),
            standardDev: model.getStandardDevOf($(this).attr("id"))
          }
        });
        html = "<div> Mean of Sample :" + model.getMeanOf($(this).attr("id")) + " Mean of DataSet : " + model.getMeanOf("dataset", 1) + " Standard Deviation :" + model.getStandardDevOf($(this).attr("id")) + "</div>";
        table = ["<table class=\"table table-striped>\""];
        table.push("<tr><td>Mean Of Sample</td><td></td></tr>");
        $("#contribution-details").html(html);
      });
    };

    /*
    @method: [private] _createPagination
    @param :  x: the first sample number to be displayed
    @param :  y: how many samples to be displayed
    @desc:  creates interactive pagination depending upon the number of samples being shown
     */
    _createPagination = function(x, y) {
      var count;
      console.log("_createPagination() invoked");
      count = Math.ceil((y - x) / 500);
      $(".pagination").paginate({
        count: count,
        start: 1,
        display: 8,
        border: true,
        border_color: "#fff",
        text_color: "#fff",
        background_color: "black",
        border_hover_color: "#ccc",
        text_hover_color: "#000",
        background_hover_color: "#fff",
        images: false,
        mouse: "press",
        onChange: function(page) {
          $("._current", "#paginationdemo").removeClass("_current").hide();
          $("#p" + page).addClass("_current").show();
        }
      });
      $(".pagination li").on("click", function() {
        var start;
        start = $(this).text() * 500 - 500;
        console.log(start);
        _create(start, 500);
      });
    };
    model = model;
    _currentVariable = void 0;
    _currentValues = void 0;
    _currentExperiment = null;
    return {

      /*
      @method - toggleControllerHandle
      @description - Method to toggle the controller slider
       */
      initialize: function() {},
      toggleControllerHandle: function(action) {
        var $target, hide, show;
        console.log(action);
        $target = $("#slide-out-controller");
        show = function() {
          $target.addClass("active").show().css({
            left: -425
          }).animate({
            left: 0
          }, 200);
          $(".controller-handle").css({
            left: -30
          }).animate({
            left: 394
          }, 200);
          socr.exp.controllerSliderState = "show";
        };
        hide = function() {
          $target.removeClass("active").animate({
            left: -425
          }, 500);
          $(".controller-handle").css({
            left: 400
          }).animate({
            left: -30
          }, 500);
          socr.exp.controllerSliderState = "hide";
        };
        if (typeof action === "object") {
          if (socr.exp.controllerSliderState === "hide") {
            show();
          } else {
            hide();
          }
        } else if (action === "show" && socr.exp.controllerSliderState === "hide") {
          show();
          true;
        } else if (action === "hide" && socr.exp.controllerSliderState === "show") {
          hide();
          true;
        } else {
          false;
        }
      },

      /*
      @method - disableButtons()
      @description: Disables step,run and show buttons
      @dependencies : none
       */
      disableButtons: function() {
        console.log("disableButtons invoked");
        $("#stepButton").attr("disabled", "true");
        $("#runButton").attr("disabled", "true");
        $("#showButton").attr("disabled", "true");
      },

      /*
      @method - enableButtons()
      @description: Enables step,run and show buttons
      @dependencies : none
       */
      enableButtons: function() {
        console.log("enableButtons invoked");
        $("#stepButton").removeAttr("disabled");
        $("#runButton").removeAttr("disabled");
        $("#showButton").removeAttr("disabled");
      },

      /*
      @method - reset()
      @description: Clears all canvas and div. Resetting the view of the whole App
      @dependencies : none
       */
      reset: function(option) {
        if (option !== "undefined" && option === "samples") {
          $("#sampleList").html("");
        } else {
          $("#sampleList").html("");
          $("#showCount").html("");
          socr.view.updateSlider();
          $("#dataPlot").html("");
          $("#dotplot").empty();
          $("#accordion").accordion("activate", 0);
          $(".pagination").html("");
          $("#details").html("");
          $("#dataset").html("");
          _currentValues = [];
          $("#controller-content").html("<div class=\"alert alert-error\">Choose a experiment from \"simulation drive\" or enter data in the \"data drive\" first!</div>");
        }
      },

      /*
      Dont know where its called?
       */
      createDatasetPlot: function() {
        var histogram, values;
        values = [0.1, 0.5];
        histogram = socr.vis.generate({
          parent: "#dataPlot",
          data: values,
          range: [0, 1]
        });
      },

      /*
      @method : createList(range)
      @param :start- start sample number
      @param : end -  stop sample number
      @description: It generates all the samples in the List
      @dependencies : _create(start,stop)
       */
      createList: function(start, end) {
        console.log("createList(" + start + "," + end + ") invoked ");
        if (socr.model.getRSampleCount() === 0) {
          $("#sampleList").html("<div class=\"alert alert-error\"><a class=\"close\" data-dismiss=\"alert\" href=\"#\">x</a><h4 class=\"alert-heading\">No Random samples to show!</h4>Please generate a dataset using the list of experiments or manually enter the data. Then generate some random samples from the controller tile before click \"show\"</div>");
        } else {
          if ((end - start) < 500) {
            _create(start, end - start);
          } else {
            _createPagination(start, end);
            _create(start, 500);
          }
          PubSub.publish("Sample List generated");
        }
      },

      /*
      @method : updateSlider()
      @description:update the slider value
      @dependencies : none
       */
      updateSlider: function() {
        $("#displayCount").text(model.getRSampleCount());
        $("#range").slider("option", "max", model.getRSampleCount());
        $("#range").slider("option", "min", 0);
      },

      /*
      @method : createShowSlider()
      @description:Create the slider for show option
      @dependencies : none
       */
      createShowSlider: function() {
        $("#range").slider({
          range: true,
          min: 0,
          max: 500,
          values: [75, 300],
          slide: function(event, ui) {
            $("#showCount").html(ui.values[0] + " - " + ui.values[1]);
            $(".show-list-start").val(ui.values[0]);
            $(".show-list-end").val(ui.values[1]);
          }
        });
        $("#showCount").html($("#range").slider("values", 0) + " - " + $("#range").slider("values", 1));
      },

      /*
      @method: createControllerView
      @description: called for replacing the controller div with data driven controls.
      @return : none
       */
      createControllerView: function() {
        var config, i, prop, showBack, _RSampleLength, _analysis, _indexes, _k, _showIndex, _variables;
        _RSampleLength = socr.model.getN().slice(0);
        _RSampleLength.splice(0, 1);
        _k = socr.model.getK();
        _analysis = [];
        _showIndex = void 0;
        _indexes = [];
        for (prop in socr.analysis) {
          if (_k >= socr.analysis[prop]["start"] && _k <= socr.analysis[prop]["end"]) {
            _analysis.unshift(prop);
            _variables = socr.analysis[prop]["variables"];
          }
        }
        if (_k > 1) {
          _showIndex = true;
          _indexes = [];
          i = 0;
          while (_k--) {
            _indexes[i] = i + 1;
            i++;
          }
        } else {
          _showIndex = false;
        }
        showBack = (socr.controller.getCurrentMode() === "Experiment" ? true : false);
        config = {
          animationSpeed: false,
          analysis: _analysis,
          variables: _variables,
          RSampleLength: _RSampleLength,
          showIndex: _showIndex,
          index: _indexes,
          showBack: showBack
        };
        $.get("partials/controller.tmpl", function(data) {
          var _output;
          _output = Mustache.render(data, config);
          $("#controller-content").html(_output);
          socr.controller.initController();
        });
      },

      /*
      @method: animate
      @param: setting
      @description: animates the resample generation process....input is the resample datapoints array indexes
      @return : none
       */
      animate: function(setting) {
        var accordion, animation, data, datakeys, i, keys, stopCount, _dimensions;
        animation = function() {
          var content, count, currentX, currentY, destinationX, destinationY, divHeight, i, sampleNumber, samplesInRow, self, speed;
          speed = $("#speed-value").html();
          sampleNumber = keys[i];
          count = i;
          self = $("#device" + sampleNumber);
          content = self.clone();
          self.addClass("removable");
          currentX = $("#device" + sampleNumber + "-container").position().left;
          console.log("currentX:" + currentX);
          currentY = $("#device" + sampleNumber + "-container").position().top;
          console.log("currentY:" + currentY);
          samplesInRow = $("#generatedSamples").width() / _dimensions["width"] - 1;
          divHeight = (stopCount / samplesInRow) * _dimensions["height"];
          $("#generatedSamples").height(divHeight);
          if (count < samplesInRow) {
            destinationX = count * _dimensions["width"] + $("#generatedSamples").position().left;
          } else {
            destinationX = (count % samplesInRow) * _dimensions["width"] + $("#generatedSamples").position().left;
          }
          console.log("destinationX:" + destinationX);
          destinationY = Math.floor(count / samplesInRow) * _dimensions["height"] + $("#generatedSamples").position().top;
          console.log("destinationY:" + destinationY);
          self.transition({
            perspective: "100px",
            rotateY: "360deg",
            duration: speed / 4 + "ms"
          });
          self.transition({
            x: destinationX - currentX,
            y: destinationY - currentY,
            duration: speed / 4 + "ms"
          }, function() {
            var k;
            content.appendTo("#device" + sampleNumber + "-container");
            self.removeAttr("id");
            if (socr.exp.current.type === "coin") {
              k = new Coin(document.getElementById("device" + sampleNumber));
              k.setValue(data[sampleNumber]);
            } else if (socr.exp.current.type === "card") {
              k = new Card(document.getElementById("device" + sampleNumber));
              k.setValue(data[sampleNumber]);
            } else {
              k = new Ball(document.getElementById("device" + sampleNumber));
              k.setValue(datakeys[sampleNumber], data[sampleNumber]);
            }
          });
          i = i + 1;
          if (i < stopCount) {
            setTimeout(animation, speed);
          } else {
            $(".ui-accordion-header").removeClass("ui-state-disabled");
            socr.view.enableButtons();
            console.log("enableButtons() invoked");
          }
        };
        this.disableButtons();
        $(".ui-accordion-header").addClass("ui-state-disabled");
        accordion = $("#accordion").data("accordion");
        accordion._std_clickHandler = accordion._clickHandler;
        accordion._clickHandler = function(event, target) {
          var clicked;
          clicked = $(event.currentTarget || target);
          if (!clicked.hasClass("ui-state-disabled")) {
            this._std_clickHandler(event, target);
          }
        };
        data = socr.exp.current.getDataset(1, "values");
        datakeys = socr.exp.current.getDataset(1, "keys");
        stopCount = setting.stopCount;
        keys = setting.indexes;
        i = 0;
        _dimensions = socr.exp.current.getSampleHW();
        setTimeout(animation);
      },

      /*
      @method: createDotPlot
      @description: Dot plot tab in the accordion is populated by this call.
      Call invoked when "infer" button pressed in the controller tile.
      @return : {boolean}
       */
      createDotplot: function(setting) {
        var binNo, datum, dotplot, e, end, err, flag, index, lSide, pvalue, rSide, start, stop, temp, total, values;
        if (setting.variable == null) {
          return false;
        }
        _currentVariable = setting.variable;
        $("#accordion").accordion("activate", 2);
        Array.max = function(array) {
          return Math.max.apply(Math, array);
        };
        Array.min = function(array) {
          return Math.min.apply(Math, array);
        };
        switch (setting.variable) {
          case "Mean":
            values = model.getMean(setting.index);
            datum = model.getMeanOf("dataset", setting.index);
            break;
          case "standardDev":
            values = model.getStandardDev(setting.index);
            datum = model.getStandardDevOfDataset(setting.index);
            break;
          case "percentile":
            try {
              pvalue = parseInt($("#percentile-value").html());
            } catch (_error) {
              err = _error;
              console.log("unable to read the percentile value from DOM. setting default value to 50%");
              pvalue = 50;
            }
            values = model.getPercentile(pvalue);
            datum = model.getPercentileOfDataset(pvalue);
            console.log("Percentile Values:" + values);
            break;
          case "Count":
            values = model.getCount(setting.index);
            datum = model.getCountOf("dataset", setting.index);
            break;
          case "F-Value":
            values = model.getF();
            datum = model.getFof("dataset").fValue;
            break;
          case "P-Value":
            values = model.getP();
            datum = model.getPof("dataset");
            break;
          case "Difference-Of-Proportions":
            values = model.getDOP();
            datum = model.getDOPof("dataset");
            break;
          default:
            values = model.getMean(setting.index);
            datum = model.getMeanOf("dataset", setting.index);
        }
        $.grep(values, function(a) {
          return !isNaN(a);
        });
        temp = values.sort(function(a, b) {
          return a - b;
        });
        start = Math.floor(temp[0]);
        stop = Math.ceil(temp[values.length - 1]);
        console.log("start: " + start + " stop: " + stop);
        if (setting.variable === "P-Value" || setting.variable === "Difference-Of-Proportions") {
          total = temp.length;
          lSide = void 0;
          rSide = void 0;
          start = 0;
          end = temp.length - 1;
          index = void 0;
          flag = 0;
          if (datum < temp[0]) {
            lSide = 0;
            rSide = 100;
          } else if (datum > temp[temp.length - 1]) {
            lSide = 100;
            rSide = 0;
          } else {
            while (end !== (start + 1)) {
              index = Math.ceil((start + end) / 2);
              if (datum === temp[index]) {
                break;
              } else if (datum < temp[index]) {
                end = index;
              } else {
                start = index;
              }
            }
            lSide = (index / total) * 100;
            rSide = 100 - lSide;
          }
          console.log("total: " + total);
          console.log("index: " + index);
          console.log("R Side : " + rSide + ".... L Side : " + lSide);
        }
        binNo = ($("input[name=\"binno\"]").val() !== "" ? $("input[name=\"binno\"]").val() : 10);
        _currentValues = values;
        try {
          dotplot = socr.vis.generate({
            parent: "#dotplot",
            data: values,
            height: 390,
            range: [start, stop],
            datum: datum,
            bins: binNo,
            variable: setting.variable,
            pl: lSide,
            pr: rSide
          });
        } catch (_error) {
          e = _error;
          console.log(e);
          dotplot = socr.vis.generate({
            parent: "#dotplot",
            data: values,
            height: 390,
            range: [start, stop],
            bins: binNo,
            variable: setting.variable
          });
        }
        this.updateCtrlMessage("Infer plot created.", "success");
        return true;
      },

      /*
      @method updateSimulationInfo
      @desc Called when the 'step button' or 'run button' is pressed in the controller tile.
      Call is made in appController.js
      @return none
       */
      updateSimulationInfo: function(name) {
        var config, e, i, obj;
        console.log("updateSimulationInfo() invoked");
        if (name !== "Data Driven Experiment") {
          try {
            name = socr.exp.current.name;
          } catch (_error) {
            e = _error;
            name = "Data Driven Experiment";
          }
        }
        config = {
          name: name,
          k: socr.model.getK(),
          groups: [],
          results: [],
          rCount: model.getRSampleCount()
        };
        if (config.k > 1) {
          if (socr.model.getPof("dataset") !== false) {
            config.results.push({
              param: "P-Value",
              value: socr.model.getPof("dataset")
            });
          }
          if (socr.model.getFof("dataset") !== false) {
            config.results.push({
              param: "F-Value",
              value: socr.model.getFof("dataset").fValue
            });
          }
        }
        i = 1;
        while (i <= config.k) {
          obj = {};
          obj.mean = socr.model.getMeanOf("dataset", i);
          obj.size = socr.model.getDataset(i).length;
          obj.number = i;
          config.groups.push(obj);
          i++;
        }
        $.get("partials/info.tmpl", function(data) {
          var temp;
          temp = Mustache.render(data, config);
          $("#details").html(temp);
        });
      },

      /*
      @method: CoverPage
      @description: Called from the index.html page. Called whenever the window is resized!
      @return : none
       */
      CoverPage: function() {
        var height, width;
        height = $(document).height();
        width = $(window).width();
        $("#welcome").css("height", height);
      },

      /*
      @method: loadInputSheet
      @description: Called from the {experiment}.js at the {Experiment}.generate() function.
      @return : none
       */
      loadInputSheet: function(data) {
        console.log("loadInputSheet() has been called....data is : " + data);
      },
      handleResponse: function(content, type, id) {
        var $alertbox, $response;
        console.log("handleResponse");
        console.log($("#" + id + "-message"));
        if ($("#" + id + "-message").length === 0) {
          console.log($("#" + id));
          $("#" + id).append("<div id='" + id + "-message'></div>");
          $response = $("#" + id + "-message");
        }
        console.log($response);
        $response.html("").slideUp(300);
        $response.append($("<div></div>").addClass("alert").html(content)).slideDown(300);
        $alertbox = $response.children("div");
        switch (type) {
          case "success":
            $alertbox.addClass("alert-success");
            return $alertbox.append(" <i class=\"icon-ok\"></i> ");
          case "error":
            return $alertbox.addClass("alert-error");
        }
      },
      updateCtrlMessage: function(msg, type, duration) {
        var el, err;
        console.log("updateCtrlMessage called()");
        duration = duration || 2000;
        type = type || "info";
        if (msg === undefined) {
          false;
        } else {
          try {
            el = $("#ctrlMessage");
            el.html("").removeClass().addClass("span8").css("display", "");
            el.html(msg).addClass("alert").addClass("alert" + "-" + type);
            el.delay(duration).fadeOut("slow");
          } catch (_error) {
            err = _error;
            console.log(err.message);
          }
        }
      },
      updateStatus: function(action, percent) {
        var current, el, html;
        console.log("updateStatus");
        if (action === undefined) {
          return false;
        }
        switch (action) {
          case "started":
            console.log("started");
            html = "<div class=\"progress progress-info progress-striped active\"><div class=\"bar\" style=\"width:0%\"></div></div>";
            el = $("#progressBar");
            el.html("").removeClass().addClass("span8").css("display", "").html(html);
            break;
          case "update":
            if (percent === undefined) {
              return false;
            }
            el = $("div#progressBar > div > div");
            current = el.css("width");
            console.log("percent= " + percent);
            if (percent % 10 === 0) {
              console.log("change");
              el.css("width", percent + "%");
              el.style;
            }
            break;
          case "finished":
            console.log("finished");
            el = $("#progressBar").html("").css("display", "none");
        }
      }
    };
  };

}).call(this);
