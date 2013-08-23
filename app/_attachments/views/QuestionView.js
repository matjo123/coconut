// Generated by CoffeeScript 1.6.2
var QuestionView, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

window.SkipTheseWhen = function(argQuestions, result) {
  var disabledClass, question, questions, _i, _j, _len, _len1, _results;

  questions = [];
  argQuestions = argQuestions.split(/\s*,\s*/);
  for (_i = 0, _len = argQuestions.length; _i < _len; _i++) {
    question = argQuestions[_i];
    questions.push(window.questionCache[question]);
  }
  disabledClass = "disabled_skipped";
  _results = [];
  for (_j = 0, _len1 = questions.length; _j < _len1; _j++) {
    question = questions[_j];
    if (result) {
      _results.push(question.addClass(disabledClass));
    } else {
      _results.push(question.removeClass(disabledClass));
    }
  }
  return _results;
};

window.ResultOfQuestion = function(name) {
  var _base;

  return (typeof (_base = window.getValueCache)[name] === "function" ? _base[name]() : void 0) || null;
};

QuestionView = (function(_super) {
  var _this = this;

  __extends(QuestionView, _super);

  function QuestionView() {
    this.render = __bind(this.render, this);
    this.initialize = __bind(this.initialize, this);    _ref = QuestionView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  QuestionView.prototype.initialize = function(options) {
    var key, value, _ref1;

    for (key in options) {
      value = options[key];
      this[key] = value;
    }
    if ((_ref1 = Coconut.resultCollection) == null) {
      Coconut.resultCollection = new ResultCollection();
    }
    return this.autoscrollTimer = 0;
  };

  QuestionView.prototype.el = '#content';

  QuestionView.prototype.triggerChangeIn = function(names) {
    var elements, name, _i, _len, _results,
      _this = this;

    _results = [];
    for (_i = 0, _len = names.length; _i < _len; _i++) {
      name = names[_i];
      elements = [];
      elements.push(window.questionCache[name].find("input, select, textarea"));
      _results.push($(elements).each(function(index, element) {
        var event;

        event = {
          target: element
        };
        return _this.actionOnChange(event);
      }));
    }
    return _results;
  };

  QuestionView.prototype.render = function() {
    var key, questionsName, skipperList, standard_value_table, value,
      _this = this;

    window.skipLogicCache = {};
    if ("module" !== Coconut.config.local.get("mode")) {
      questionsName = "<h1>" + this.model.id + "</h1>";
    }
    if ('module' === Coconut.config.local.get('mode')) {
      standard_value_table = "      <table class='standard_values'>      " + (((function() {
        var _ref1, _results;

        _ref1 = this.standard_values;
        _results = [];
        for (key in _ref1) {
          value = _ref1[key];
          _results.push("<tr>        <td>" + key + "</td><td>" + value + "</td>      </tr>");
        }
        return _results;
      }).call(this)).join('')) + "      </table>";
    }
    this.$el.html("    <style>      .message      {        color: grey;        font-weight: bold;        padding: 10px;        border: 1px yellow dotted;        background: yellow;        display: none;      }    </style>      " + (standard_value_table || '') + "      <div style='position:fixed; right:5px; color:white; background-color: #333; padding:20px; display:none; z-index:10' id='messageText'>        Saving...      </div>      " + (questionsName || '') + "      <div id='question-view'>          " + (this.toHTMLForm(this.model)) + "      </div>    ");
    this.updateCache();
    this.updateSkipLogic();
    skipperList = [];
    $(this.model.get("questions")).each(function(index, question) {
      if (question.actionOnChange().match(/skip/i)) {
        skipperList.push(question.safeLabel());
      }
      if (question.actionOnQuestionsLoaded() !== "") {
        return CoffeeScript["eval"](question.actionOnQuestionsLoaded());
      }
    });
    js2form($('#question-view').get(0), this.result.toJSON());
    this.triggerChangeIn(skipperList);
    this.$el.find("input[type=text],input[type=number],input[type='autocomplete from previous entries'],input[type='autocomplete from list']").textinput();
    this.$el.find('input[type=radio],input[type=checkbox]').checkboxradio();
    this.$el.find('ul').listview();
    this.$el.find('select').selectmenu();
    this.$el.find('a').button();
    this.$el.find('input[type=date]').datebox({
      mode: "calbox",
      dateFormat: "%d-%m-%Y"
    });
    _.each($("input[type='autocomplete from list'],input[type='autocomplete from previous entries']"), function(element) {
      var minLength, source;

      element = $(element);
      if (element.attr("type") === 'autocomplete from list') {
        source = element.attr("data-autocomplete-options").replace(/\n|\t/, "").split(/, */);
        minLength = 0;
      } else {
        source = document.location.pathname.substring(0, document.location.pathname.indexOf("index.html")) + ("_list/values/byValue?key=\"" + (element.attr("name")) + "\"");
        minLength = 1;
      }
      return element.autocomplete({
        source: source,
        minLength: minLength,
        target: "#" + (element.attr("id")) + "-suggestions",
        callback: function(event) {
          element.val($(event.currentTarget).text());
          return element.autocomplete('clear');
        }
      });
    });
    if (this.readonly) {
      return $('input, textarea').attr("readonly", "true");
    }
  };

  QuestionView.prototype.events = {
    "change #question-view input": "onChange",
    "change #question-view select": "onChange",
    "change #question-view textarea": "onChange",
    "click button.repeat": "repeat",
    "click #question-view a:contains(Get current location)": "getLocation",
    "click .next_error": "runValidate",
    "click .validate_one": "onValidateOne"
  };

  QuestionView.prototype.runValidate = function() {
    return this.validateAll();
  };

  QuestionView.prototype.onChange = function(event) {
    var $target, eventStamp, messageVisible, targetName, wasValid;

    $target = $(event.target);
    eventStamp = $target.attr("id");
    if (eventStamp === this.oldStamp && (new Date()).getTime() < this.throttleTime + 1000) {
      return;
    }
    this.throttleTime = (new Date()).getTime();
    this.oldStamp = eventStamp;
    targetName = $target.attr("name");
    if (targetName === "complete") {
      if (this.changedComplete) {
        this.changedComplete = false;
        return;
      }
      this.validateAll();
      Coconut.menuView.update();
    } else {
      this.changedComplete = false;
      messageVisible = window.questionCache[targetName].find(".message").is(":visible");
      if (!messageVisible) {
        wasValid = this.validateOne({
          key: targetName,
          autoscroll: false,
          button: "<button type='button' data-name='" + targetName + "' class='validate_one'>Validate</button>"
        });
      }
    }
    this.save();
    this.updateSkipLogic();
    this.actionOnChange(event);
    if (wasValid && !messageVisible) {
      return this.autoscroll(event);
    }
  };

  QuestionView.prototype.onValidateOne = function(event) {
    var $target, name;

    $target = $(event.target);
    name = $(event.target).attr('data-name');
    return this.validateOne({
      key: name,
      autoscroll: true,
      leaveMessage: false,
      button: "<button type='button' data-name='" + name + "' class='validate_one'>Validate</button>"
    });
  };

  QuestionView.prototype.validateAll = function() {
    var isValid, key, questionIsntValid, _i, _len, _ref1;

    isValid = true;
    _ref1 = window.keyCache;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      key = _ref1[_i];
      questionIsntValid = !this.validateOne({
        key: key,
        autoscroll: isValid,
        leaveMessage: false
      });
      if (isValid && questionIsntValid) {
        isValid = false;
      }
    }
    this.completeButton(isValid);
    if (isValid) {
      $("[name=complete]").scrollTo();
    }
    return isValid;
  };

  QuestionView.prototype.validateOne = function(options) {
    var $message, $question, autoscroll, button, e, key, leaveMessage, message;

    key = options.key || '';
    autoscroll = options.autoscroll || false;
    button = options.button || "<button type='button' class='next_error'>Next Error</button>";
    leaveMessage = options.leaveMessage || false;
    $question = window.questionCache[key];
    $message = $question.find(".message");
    try {
      message = this.isValid(key);
    } catch (_error) {
      e = _error;
      alert("isValid error in " + key + "\n" + e);
      message = "";
    }
    if ($message.is(":visible") && leaveMessage) {
      if (message === "") {
        return true;
      } else {
        return false;
      }
    }
    if (message === "") {
      $message.hide();
      if (autoscroll) {
        this.autoscroll($question);
      }
      return true;
    } else {
      $message.show().html("        " + message + "        " + button + "      ").find("button").button();
      return false;
    }
  };

  QuestionView.prototype.isValid = function(question_id) {
    var error, labelText, question, questionWrapper, required, result, type, validation, validationFunctionResult, value, _ref1;

    if (!question_id) {
      return;
    }
    result = [];
    questionWrapper = window.questionCache[question_id];
    if (questionWrapper.hasClass("label")) {
      return "";
    }
    question = $("[name='" + question_id + "']", questionWrapper);
    type = $(questionWrapper.find("input").get(0)).attr("type");
    labelText = type === "radio" ? $("label[for=" + (question.attr("id").split("-")[0]) + "]", questionWrapper).text() || "" : (_ref1 = $("label[for=" + (question.attr("id")) + "]", questionWrapper)) != null ? _ref1.text() : void 0;
    required = questionWrapper.attr("data-required") === "true";
    validation = unescape(questionWrapper.attr("data-validation"));
    if (validation === "undefined") {
      validation = null;
    }
    value = window.getValueCache[question_id]();
    if (!questionWrapper.is(":visible")) {
      return "";
    }
    if (question.find("input").length !== 0 && (type === "checkbox" || type === "radio")) {
      return "";
    }
    if (required && value === "" || value === null) {
      result.push("'" + labelText + "' is required.");
    }
    if ((validation != null) && validation !== "") {
      try {
        validationFunctionResult = (CoffeeScript["eval"]("(value) -> " + validation, {
          bare: true
        }))(value);
        if (validationFunctionResult != null) {
          result.push(validationFunctionResult);
        }
      } catch (_error) {
        error = _error;
        if (error === 'invisible reference') {
          return '';
        }
        alert("Validation error for " + question_id + " with value " + value + ": " + error);
      }
    }
    if (result.length !== 0) {
      return result.join("<br>") + "<br>";
    }
    return "";
  };

  QuestionView.prototype.autoscroll = function(event) {
    var $div, $target, name,
      _this = this;

    clearTimeout(this.autoscrollTimer);
    if (event.jquery) {
      $div = event;
      name = $div.attr("data-question-name");
    } else {
      $target = $(event.target);
      name = $target.attr("name");
      $div = window.questionCache[name];
    }
    this.$next = $div.next();
    if (!this.$next.is(":visible")) {
      while (!this.$next.is(":visible")) {
        this.$next = this.$next.next();
      }
    }
    if (this.$next.is(":visible")) {
      $(window).on("scroll", function() {
        $(window).off("scroll");
        return clearTimeout(_this.autoscrollTimer);
      });
      return this.autoscrollTimer = setTimeout(function() {
        $(window).off("scroll");
        return _this.$next.scrollTo().find("input[type=text],input[type=number]").focus();
      }, 1000);
    }
  };

  QuestionView.prototype.actionOnChange = function(event) {
    var $divQuestion, $target, code, error, message, name, newFunction, nodeName, value;

    nodeName = $(event.target).get(0).nodeName;
    $target = nodeName === "INPUT" || nodeName === "SELECT" || nodeName === "TEXTAREA" ? $(event.target) : $(event.target).parent().parent().parent().find("input,textarea,select");
    name = $target.attr("name");
    $divQuestion = $(".question [data-question-name='" + name + "']");
    code = $divQuestion.attr("data-action_on_change");
    try {
      value = ResultOfQuestion(name);
    } catch (_error) {
      error = _error;
      if (error === "invisible reference") {
        return;
      }
    }
    if (code === "" || (code == null)) {
      return;
    }
    code = "(value) -> " + code;
    try {
      newFunction = CoffeeScript["eval"].apply(this, [code]);
      return newFunction(value);
    } catch (_error) {
      error = _error;
      name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
      message = error.message;
      return alert("Action on change error in question " + ($divQuestion.attr('data-question-id') || $divQuestion.attr("id")) + "\n\n" + name + "\n\n" + message);
    }
  };

  QuestionView.prototype.updateSkipLogic = function() {
    var $question, error, message, name, result, skipLogicCode, _ref1, _results;

    _ref1 = window.questionCache;
    _results = [];
    for (name in _ref1) {
      $question = _ref1[name];
      skipLogicCode = window.skipLogicCache[name];
      if (skipLogicCode === "" || (skipLogicCode == null)) {
        continue;
      }
      try {
        result = eval(skipLogicCode);
      } catch (_error) {
        error = _error;
        if (error === "invisible reference") {
          result = true;
        } else {
          name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
          message = error.message;
          alert("Skip logic error in question " + ($question.attr('data-question-id')) + "\n\n" + name + "\n\n" + message);
        }
      }
      if (result) {
        _results.push($question[0].style.display = "none");
      } else {
        _results.push($question[0].style.display = "");
      }
    }
    return _results;
  };

  QuestionView.prototype.save = _.throttle(function() {
    var currentData;

    currentData = $('#question-view').toObject({
      skipEmpty: false
    });
    currentData.lastModifiedAt = moment(new Date()).format(Coconut.config.get("datetime_format"));
    currentData.savedBy = $.cookie('current_user');
    return Coconut.questionView.result.save(currentData, {
      success: function() {
        return $("#messageText").slideDown().fadeOut();
      }
    });
  }, 1000, {
    trailing: false
  });

  QuestionView.prototype.completeButton = function(value) {
    this.changedComplete = true;
    if ($('[name=complete]').prop("checked") !== value) {
      return $('[name=complete]').click();
    }
  };

  QuestionView.prototype.toHTMLForm = function(questions, groupId) {
    var html, index, isRepeatable, name, newGroupId, option, options, question, question_id, repeatable, _i, _len;

    if (questions == null) {
      questions = this.model;
    }
    window.skipLogicCache = {};
    if (questions.length == null) {
      questions = [questions];
    }
    html = '';
    for (_i = 0, _len = questions.length; _i < _len; _i++) {
      question = questions[_i];
      isRepeatable = question.repeatable();
      repeatable = isRepeatable ? "<button class='repeat'>+</button>" : "";
      window.skipLogicCache[name] = question.skipLogic() !== '' ? CoffeeScript.compile(question.skipLogic(), {
        bare: true
      }) : '';
      if (isRepeatable) {
        name = name + "[0]";
        question_id = question.get("id") + "-0";
      } else {
        name = question.safeLabel();
        question_id = question.get("id");
      }
      if (groupId != null) {
        name = "group." + groupId + "." + name;
      }
      if (question.questions().length !== 0) {
        newGroupId = question_id;
        if (isRepeatable) {
          newGroupId = newGroupId + "[0]";
        }
        html += "          <div             data-group-id='" + question_id + "'            data-question-name='" + name + "'            data-question-id='" + question_id + "'            class='question group'>            " + (this.toHTMLForm(question.questions(), newGroupId)) + "          </div>          " + (repeatable || '') + "          ";
      } else {
        html += "          <div             data-validation='" + (question.validation() ? _.escape(question.validation()) : void 0) + "'             data-required='" + (question.required()) + "'            class='question " + ((typeof question.type === "function" ? question.type() : void 0) || '') + "'            data-question-name='" + name + "'            data-question-id='" + question_id + "'            data-action_on_change='" + (_.escape(question.actionOnChange())) + "'          >          " + (!~(question.type().indexOf('hidden')) ? "<label type='" + (question.type()) + "' for='" + question_id + "'>" + (question.label()) + " <span></span></label>" : void 0) + "          <div class='message'></div>          " + ((function() {
          var _j, _len1, _ref1;

          switch (question.type()) {
            case "textarea":
              return "<input name='" + name + "' type='text' id='" + question_id + "' value='" + (_.escape(question.value())) + "'></input>";
            case "select":
              if (this.readonly) {
                return question.value();
              } else {
                html = "<select>";
                _ref1 = question.get("select-options").split(/, */);
                for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
                  option = _ref1[index];
                  html += "<option name='" + name + "' id='" + question_id + "-" + index + "' value='" + option + "'>" + option + "</option>";
                }
                return html += "</select>";
              }
              break;
            case "radio":
              if (this.readonly) {
                return "<input name='" + name + "' type='text' id='" + question_id + "' value='" + (question.value()) + "'></input>";
              } else {
                options = question.get("radio-options");
                return _.map(options.split(/, */), function(option, index) {
                  return "                      <label for='" + question_id + "-" + index + "'>" + option + "</label>                      <input type='radio' name='" + name + "' id='" + question_id + "-" + index + "' value='" + (_.escape(option)) + "'/>                    ";
                }).join("");
              }
              break;
            case "checkbox":
              if (this.readonly) {
                return "<input name='" + name + "' type='text' id='" + question_id + "' value='" + (_.escape(question.value())) + "'></input>";
              } else {
                return "<input style='display:none' name='" + name + "' id='" + question_id + "' type='checkbox' value='true'></input>";
              }
              break;
            case "autocomplete from list":
            case "autocomplete from previous entries":
              return "                  <!-- autocomplete='off' disables browser completion -->                  <input autocomplete='off' name='" + name + "' id='" + question_id + "' type='" + (question.type()) + "' value='" + (question.value()) + "' data-autocomplete-options='" + (question.get("autocomplete-options")) + "'></input>                  <ul id='" + question_id + "-suggestions' data-role='listview' data-inset='true'/>                ";
            case "location":
              return "                  <a data-question-id='" + question_id + "'>Get current location</a>                  <label for='" + question_id + "-description'>Location Description</label>                  <input type='text' name='" + name + "-description' id='" + question_id + "-description'></input>                  " + (_.map(["latitude", "longitude"], function(field) {
                return "<label for='" + question_id + "-" + field + "'>" + field + "</label><input readonly='readonly' type='number' name='" + name + "-" + field + "' id='" + question_id + "-" + field + "'></input>";
              }).join("")) + "                  " + (_.map(["altitude", "accuracy", "altitudeAccuracy", "heading", "timestamp"], function(field) {
                return "<input type='hidden' name='" + name + "-" + field + "' id='" + question_id + "-" + field + "'></input>";
              }).join("")) + "                ";
            case "image":
              return "<img style='" + (question.get("image-style")) + "' src='" + (question.get("image-path")) + "'/>";
            case "label":
              return "";
            default:
              return "<input name='" + name + "' id='" + question_id + "' type='" + (question.type()) + "' value='" + (question.value()) + "'></input>";
          }
        }).call(this)) + "          </div>          " + (repeatable || '') + "        ";
      }
    }
    return html;
  };

  QuestionView.prototype.updateCache = function() {
    var $qC, accessorFunction, inputs, isCheckable, name, question, selects, type, _i, _len, _ref1;

    window.questionCache = {};
    window.getValueCache = {};
    window.$questions = $(".question");
    _ref1 = window.$questions;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      question = _ref1[_i];
      name = question.getAttribute("data-question-name");
      if ((name != null) && name !== "") {
        accessorFunction = {};
        window.questionCache[name] = $(question);
        $qC = window.questionCache[name];
        selects = $("select[name='" + name + "']", $qC);
        if (selects.length === 0) {
          inputs = $("input[name='" + name + "']", $qC);
          if (inputs.length !== 0) {
            type = inputs[0].getAttribute("type");
            isCheckable = type === "radio" || type === "checkbox";
            if (isCheckable) {
              (function(name, $qC) {
                return accessorFunction = function() {
                  return $("input:checked", $qC).safeVal();
                };
              })(name, $qC);
            } else {
              (function(inputs) {
                return accessorFunction = function() {
                  return inputs.safeVal();
                };
              })(inputs);
            }
          } else {
            (function(name, $qC) {
              return accessorFunction = function() {
                return $(".textarea[name='" + name + "']", $qC).safeVal();
              };
            })(name, $qC);
          }
        } else {
          (function(selects) {
            return accessorFunction = function() {
              return selects.safeVal();
            };
          })(selects);
        }
        window.getValueCache[name] = accessorFunction;
      }
    }
    return window.keyCache = _.keys(questionCache);
  };

  QuestionView.prototype.currentKeyExistsInResultsFor = function(question) {
    var _this = this;

    return Coconut.resultCollection.any(function(result) {
      return _this.result.get(_this.key) === result.get(_this.key) && result.get('question') === question;
    });
  };

  QuestionView.prototype.repeat = _.throttle(function() {
    var $button, inputElement, name, newIndex, newQuestion, questionId, regex, _i, _len, _ref1;

    $button = $(event.target);
    newQuestion = $button.prev(".question").clone();
    questionId = newQuestion.attr("data-group-id") || '';
    data - question - name;
    _ref1 = newQuestion.find("input");
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      inputElement = _ref1[_i];
      inputElement = $(inputElement);
      name = inputElement.attr("name");
      regex = new RegExp("" + questionId + "\\[(\\d)\\]");
      newIndex = parseInt(_.last(name.match(regex))) + 1;
      inputElement.attr("name", name.replace(regex, "" + questionId + "[" + newIndex + "]"));
    }
    $button.after(newQuestion.add($button.clone()));
    $button.remove();
    return Coconut.questionView.updateCache();
  }, 1000, {
    trailing: false
  });

  QuestionView.prototype.getLocation = function(event) {
    var question_id,
      _this = this;

    question_id = $(event.target).closest("[data-question-id]").attr("data-question-id");
    $("#" + question_id + "-description").val("Retrieving position, please wait.");
    return navigator.geolocation.getCurrentPosition(function(geoposition) {
      _.each(geoposition.coords, function(value, key) {
        return $("#" + question_id + "-" + key).val(value);
      });
      $("#" + question_id + "-timestamp").val(moment(geoposition.timestamp).format(Coconut.config.get("datetime_format")));
      $("#" + question_id + "-description").val("Success");
      _this.save();
      return $.getJSON("http://api.geonames.org/findNearbyPlaceNameJSON?lat=" + geoposition.coords.latitude + "&lng=" + geoposition.coords.longitude + "&username=mikeymckay&callback=?", null, function(result) {
        $("#" + question_id + "-description").val(parseFloat(result.geonames[0].distance).toFixed(1) + " km from center of " + result.geonames[0].name);
        return _this.save();
      });
    }, function(error) {
      return $("#" + question_id + "-description").val("Error: " + error);
    }, {
      frequency: 1000,
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    });
  };

  return QuestionView;

}).call(this, Backbone.View);

(function($) {
  $.fn.scrollTo = function(speed, callback) {
    var e;

    if (speed == null) {
      speed = 500;
    }
    try {
      $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
      }, speed, null, callback);
    } catch (_error) {
      e = _error;
      console.log("error", e);
      console.log("Scroll error with 'this'", this);
    }
    return this;
  };
  return $.fn.safeVal = function() {
    if (this.is(":visible")) {
      return (this.val() || '').trim();
    } else {
      return null;
    }
  };
})($);

/*
//@ sourceMappingURL=QuestionView.map
*/
