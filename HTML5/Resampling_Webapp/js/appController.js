
/*
  socr.controller is the controller object for the SOCR app.

  @author: selvam , ashwini
  @return: {object}
  SOCR - Statistical Online Computational Resource
 */

(function() {
  socr.controller = function(model, view) {
    var _currentMode, _generate, _id, _noOfSteps, _runsElapsed, _this;
    _id = 0;
    _runsElapsed = 0;
    _this = this;
    _noOfSteps = 0;
    _currentMode = "Experiment";

    /*
    @method: [private] _generate()
    @description:   This function generates 1000 resamples by calling the generateSample() of model.
    @dependencies: generateSample()
     */
    _generate = function() {
      var i, percent;
      if (_runsElapsed !== _noOfSteps) {
        i = 1000;
        while (i--) {
          model.generateSample();
        }
        view.updateSlider();
        _runsElapsed++;
        percent = Math.ceil((_runsElapsed / _noOfSteps) * 100);
        view.updateStatus("update", percent);
      } else {
        view.updateCtrlMessage("samples generated sucessfully.", "success", 2000);
        view.updateStatus("finished");
        view.updateSimulationInfo();
        PubSub.publish("Random samples generated");
        _this.stop();
      }
    };
    return {
      currentMode: _currentMode,

      /*
      @method: [private] initialize()
      @description:Initializes the app..binds all the buttons...create the show slider
       */
      initialize: function() {
        _this = this;
        console.log("initialize() invoked ");
        $(".controller-handle").on("click", view.toggleControllerHandle);
        $(".help").on("change click", function(e) {
          e.preventDefault();
          socr.tutorial.toggleStatus();
          if (socr.tutorial.getStatus() === "on") {
            $(".help").css("background-color", "green").html("<a href='#'>Help : ON</a>");
          } else {
            $(".help").css("background-color", "").html("<a href='#'>Help : OFF</a>");
          }
        });
        $("#showButton").on("click", function() {
          view.createList($(".show-list-start").val(), $(".show-list-end").val());
        });
        PubSub.subscribe("Random samples generated", function() {
          var end, start;
          start = Math.floor(model.getRSampleCount() * 0.5);
          end = model.getRSampleCount();
          $("#showCount").html(start + " - " + end);
          $(".show-list-start").val(start);
          $(".show-list-end").val(end);
          $("#showButton").trigger("click");
        });
        $("#startApp").on("click", function() {
          console.log("Launch button clicked");
          $("#welcome").animate({
            left: -2999
          }, 1000, "easeInCubic");
          $("#main").css("visibility", "visible");
        });
        $("#share-instance-button").on("click", function() {
          var html;
          $(".generate-response").html("");
          html = "<p>Dataset:<strong>" + model.getDataset() + "</strong></p>";
          html += "<p>Count Size:<strong>" + $("#countSize").val() + "</strong></p>";
          html += "<p>datapoints:<strong>" + $("#nSize").val() + "</strong></p>";
          $("#settings").html(html);
        });
        $("#generate-url-button").on("click", function() {
          var alertblock;
          if (model.getDataset() !== "") {
            $("#url").val(baseUrl + "index.html?" + "type=url&dataset=" + model.getDataset() + "&countSize=" + $("#countSize").val() + "&nSize=" + $("#nSize").val());
          } else {
            console.log("Dataset not initialised");
            alertblock = "<div class=\"alert alert-block\">Dataset not initialised</div>";
            $(".generate-response").html(alertblock);
          }
        });
        $("#reset-button").on("click", function() {
          _this.reset();
        });
        $(".input-controls").delegate("td", "mousedown", function() {
          table.startEdit($(this));
        });
        $(".input-controls").delegate("input#generateMatrix", "click", function() {
          console.log("Table Generated");
          console.log(table.getMatrix());
        });
        $(".input-controls").delegate("input#submatrix", "click", function() {
          var end, start;
          start = $(".input-controls").find("input[name=\"start\"]").val();
          end = $(".input-controls").find("input[name=\"end\"]").val();
          table.generateSub(start, end);
        });
        $("#accordion").accordion();
        $(".dropdown-toggle").dropdown();
        $(".popups").popover({
          html: true,
          trigger: "click",
          animation: true
        });
        $(".tooltips").tooltip();
        view.createShowSlider();
      },
      initController: function() {
        var e;
        model.setK();
        $(".tooltips").tooltip();
        $(".controller-back").on("click", function(e) {
          var err;
          e.preventDefault();
          try {
            model.reset();
            view.reset();
            console.log("exp_" + socr.exp.current.name);
            socr.dataTable.simulationDriven.init("exp_" + socr.exp.current.name);
            socr.exp.current.initialize();
          } catch (_error) {
            err = _error;
            console.log(err.message);
          }
        });
        $("#runButton").on("click", function(e) {
          e.preventDefault();
          console.log("Run Started");
          setTimeout(socr.controller.run, 500);
        });
        $("#stepButton").on("click", function(e) {
          e.preventDefault();
          console.log("Step pressed ");
          socr.controller.step();
        });
        $("#stopButton").on("click", function(e) {
          e.preventDefault();
          console.log("Stop Pressed ");
          socr.controller.stop();
        });
        $("#resetButton").on("click", function(e) {
          e.preventDefault();
          console.log("Reset pressed");
          socr.controller.reset();
        });
        $("#infer").on("click", function(e) {
          e.preventDefault();
          if (model.getSample(1) === false) {
            view.handleResponse("<h4 class=\"alert-heading\">No Random samples to infer From!</h4>Please generate some random samples. Click \"back\" button on the controller to go to the \"Generate Random Samples!\" button.", "error", "controller-content");
          } else {
            setTimeout(socr.controller.setDotplot, 50);
            view.toggleControllerHandle("hide");
            setTimeout((function() {
              PubSub.publish("Dotplot generated");
            }), 500);
          }
        });
        $("#variable").on("change", function() {
          if ($(this).val() === "Mean" || $(this).val() === "Count") {
            $("#index").attr("disabled", false);
          } else {
            $("#index").attr("disabled", true);
          }
        });
        $("#analysis").on("change", function() {
          var el;
          if (socr.analysis[$(this).val()] !== "undefined") {
            el = "";
            $.each(socr.analysis[$(this).val()]["variables"], function(key, value) {
              el += "<option value=\"" + value + "\">" + value.replace("-", " ") + "</option>";
            });
            $("#variable").html(el);
          }
        });
        $(".update").on("click", function() {
          var val;
          val = [];
          $.each($(".nValues"), function(k, v) {
            val.push($(v).val());
          });
          socr.model.setN(val);
        });
        try {
          $(".controller-popups").popover({
            html: true
          });
        } catch (_error) {
          e = _error;
          console.log(e.message);
        }
      },

      /*
      @method: step()
      @description: It generates 1 random sample with animation effect showing the generation.
      @dependencies: view.animate()
       */
      step: function() {
        var e;
        $("#accordion").accordion("activate", 1);
        view.disableButtons();
        try {
          model.generateSample();
          $(".removable").remove();
          view.updateSlider();
          view.updateCtrlMessage("samples generated sucessfully.", "success", 2000);
          view.updateSimulationInfo();
          PubSub.publish("Random samples generated");
          view.updateSimulationInfo();
        } catch (_error) {
          e = _error;
          console.log(e);
        }
        view.enableButtons();
      },

      /*
      @method: run()
      @description:It generates X random sample with animation effect showing the generation.
       */
      run: function() {
        var d, _temp;
        view.disableButtons();
        view.updateStatus("started");
        model.setStopCount($("#countSize").val());
        _temp = model.getStopCount() / 1000;
        _noOfSteps = Math.ceil(_temp);
        d = Date();
        console.log("start" + _runsElapsed + d);
        _generate();
        _id = setInterval(_generate, 0);
      },

      /*
      @method: stop()
      @description:It resets the setInterval for _generate() ans halts the random sample generation immediately.
       */
      stop: function() {
        var d;
        d = Date();
        console.log("end" + _runsElapsed + d);
        view.updateSlider();
        clearInterval(_id);
        _runsElapsed = 0;
        view.enableButtons();
      },

      /*
      @method: reset()
      @description:It resets the application by clearing the appModel and appView.
       */
      reset: function() {
        $("<div></div>").appendTo("body").html("<div><h6>Are you sure you want to reset? Data will be lost!</h6></div>").dialog({
          modal: true,
          title: "Reset Data?",
          zIndex: 10000,
          autoOpen: true,
          width: "auto",
          resizable: false,
          buttons: {
            Yes: function() {
              _this.stop();
              model.reset();
              view.reset();
              socr.exp.current = {};
              view.toggleControllerHandle("hide");
              socr.dataTable.simulationDriven.resetScreen();
              $(this).dialog("close");
            },
            No: function() {
              $(this).dialog("close");
            }
          },
          close: function(event, ui) {
            $(this).remove();
          }
        });
      },
      setDotplot: function() {
        var index;
        $("#dotplot").html("");
        index = parseInt($("#index").val());
        console.log("setdotplot started");
        console.log("variable:" + $("#variable").val());
        view.createDotplot({
          variable: $("#variable").val(),
          index: index
        });
      },
      loadController: function(setting) {
        var result;
        if (typeof setting !== "object") {
          return false;
        }
        if (setting.to === "dataDriven") {
          if (setting.from !== "undefined") {
            socr.controller.setCurrentMode(setting.from);
          }
          PubSub.publish("Datadriven controller loaded");
          if (!$.isEmptyObject(socr.exp.current)) {
            if (socr.exp.current.getDataset() !== "") {
              console.log("simulation drive has some data");
              result = model.setDataset({
                keys: socr.exp.current.getDatasetKeys(),
                values: socr.exp.current.getDatasetValues(),
                processed: true
              });
              if (result === true) {
                view.toggleControllerHandle("show");
                view.updateSimulationInfo();
              }
            }
          } else {
            console.log("Experiment object not defined!");
          }
          model.setN();
          view.createControllerView();
        }
      },
      setCurrentMode: function(mode) {
        if (mode !== undefined) {
          _currentMode = mode;
        }
        return true;
      },
      getCurrentMode: function() {
        return _currentMode;
      }
    };
  };

}).call(this);
