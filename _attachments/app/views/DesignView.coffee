class DesignView extends Backbone.View
  initialize: ->

  el: $('#content')

  render: =>
    templateData = {}
    templateData.types = @questionTypes
    $("#content").html(this.template(templateData))
    @basicMode()

  template: Handlebars.compile "
    <style>
      .question-definition{
        border-style: dotted;
        border-width: 1px;
        margin: 10px;
        margin-top: 32px;
      }
      .question-definition-controls{
        float: right;
      }
      .group{
        border-style: dotted;
        border-width: 1px;
      }
      body.all-advanced-hidden .advanced{
        display: none;
      }
    </style>
    <h3>
      Design
    </h3>
    <small>
    <b>Instructions</b>: <p>Use the drop down below to select the type of questions that you will be asking. Click <button>Preview</button> to see what the questions will look like.</p>
    <div class='advanced'><b>Advanced: </b><p>Use <img title='repeat' src='images/repeat.png' style='background-color:#DDD'/> to make the question repeatable. If you want to group questions together to form a repeatable block then click <img title='group' src='images/group.png' style='background-color:#DDD'/> between the questions and use the <img title='repeat' src='images/repeat.png' style='background-color:#DDD'/> as before. Ungroup by using <img title='ungroup' src='images/ungroup.png' style='background-color:#DDD'/>.</p>
    </div>
    </small>
    <button>Advanced Mode</button>
    <hr/>
    <label for='element_selector'>Add questions</label>
    <select id='element_selector'>
      {{#each types}}
        <option>{{this}}</option>
      {{/each}}
    </select>
    <button>Add</button>

    <div id='questions'>
    </div>
    <button>Preview</button>
    <hr/>
    <form id='render'></form>
    <div id='form_output'></form>
  "

  questionTypes: ["text","number","date","datetime", "textarea", "hidden"]

  events:
    "click button:contains(Add)": "add"
    "click button[title=group]": "groupClick"
    "click button[title=ungroup]": "ungroupClick"
    "click button[title=delete]": "deleteClick"
    "click button[title=repeat]": "toggleRepeatable"
    "click button:contains(Preview)" : "renderForm"
    "click button:contains(Show Form Output)" : "formDump"
    "click button:contains(+)" : "repeat"
    "click button:contains(Advanced Mode)" : "advancedMode"
    "click button:contains(Basic Mode)" : "basicMode"

  add: (event) ->
    type = $(event.target).prev().val()
    id = Math.ceil(Math.random()*1000)
    if $("#questions").children().length > 0
      $("#questions").append "
        <button class='advanced' title='group'><img src='images/group.png'/></button>
      "
    $("#questions").append "
      <div data-repeat='false' class='question-definition' id='#{id}'>
        <div class='question-definition-controls'>
          <button class='advanced' title='repeat'><img src='images/repeat.png'></button>
          <input type='hidden' id=repeatable-#{id} value='false'></input>
          <button title='delete'><img src='images/delete.png'></button>
        </div>
        <div>Type: #{type}</div>
        <label for='label-#{id}'>Label</label>
        <input type='text' name='label-#{id}' id='label-#{id}'></input>
        <input type='hidden' name='type-#{id}' id='type-#{id}' value='#{type}'></input>
        <input type='hidden' name='required-#{id}' value='false'></input>
      </div>
    "

  groupClick: (event) ->
    groupDiv = $(event.target).closest("button")
    @group(groupDiv.prev(), groupDiv.next())
    groupDiv.remove()

  group: (group1,group2) ->
    for group in [group1,group2]
      if group.attr("repeat") == "false" and group.children(".question-definition").length() > 0
        @ungroup(group)
    id = Math.ceil(Math.random()*1000)
    group1.add(group2).wrapAll "
      <div data-repeat='false' class='question-definition' id='#{id}'>
        <div class='question-definition-controls'>
          <button class='advanced' title='repeat'><img src='images/repeat.png'></button>
          <input type='hidden' id=repeatable-#{id} value='false'></input>
          <button title='delete'><img src='images/delete.png'></button>
          <button class='advanced' title='ungroup'><img src='images/ungroup.png'></button>
        </div>
      </div>
    "

  ungroupClick: (event) ->
    controls = $(event.target).closest("button").parent()
    @ungroup controls

  ungroup: (itemInGroup) ->
    controls = itemInGroup.parent().children(".question-definition-controls")
    firstQuestionDefinition = itemInGroup.parent().children(".question-definition").first()
    itemInGroup.unwrap()
    controls.remove()
    firstQuestionDefinition.after "
      <button class='advanced' title='group'><img src='images/group.png'/></button>
    "
    itemInGroup

  deleteClick: (event) ->
    @deleteQuestion($(event.target).closest(".question-definition"))


  deleteQuestion: (question) ->
    surroundingQuestion = question.parent(".question-definition")
    if surroundingQuestion.children(".question-definition").length == 2
      @ungroup(question)

    # Remove Group/Ungroup buttons
    if question.next("button").length == 1
      question.next("button").remove()
    else
      question.prev("button").remove()

    # Removes the question-definition div
    question.remove()


  toggleRepeatable: (event) ->
    button = $(event.target).closest("button")

    hiddenRepeatableInputElement = button.next()
    if hiddenRepeatableInputElement.val() == "false"
      button.attr("style",'background-color:green')
      hiddenRepeatableInputElement.val("true")
    else
      button.attr("style",'')
      hiddenRepeatableInputElement.val("false")

  questions: ->
    return $('#questions').children()

  toJson: ->
    return Question.toJSON @questions()

  toObject: ->
    return Question.toObject @questions()

  toHTMLForm: ->
    return Question.toHTMLForm(@toObject())

  dump: ->
    $('#dump').html(@toJson())

  renderForm: ->
    $('#render').html @toHTMLForm()
    $('#form_output').html "
      <hr/>
      <button type='button'>Show Form Output</button><br/>
      <textarea id='dump' style='width:400px;height:100px'></textarea>
    "

  formDump: ->
    $('#dump').html(JSON.stringify($('form').toObject()))

  repeat: (event) ->
    button = $(event.target)
    newQuestion = button.prev(".question").clone()
    questionID = newQuestion.attr("data-group-id")
    questionID = "" unless questionID?

    # Fix the indexes
    for inputElement in newQuestion.find("input")
      inputElement = $(inputElement)
      name = inputElement.attr("name")
      re = new RegExp("#{questionID}\\[(\\d)\\]")
      newIndex = parseInt(_.last(name.match(re))) + 1
      inputElement.attr("name", name.replace(re,"#{questionID}[#{newIndex}]"))

    button.after(newQuestion.add(button.clone()))
    button.remove()

  advancedMode:->
    $('body').removeClass("all-advanced-hidden")
    $('button:contains(Advanced Mode)').html "Basic Mode"

  basicMode:->
    $('body').addClass("all-advanced-hidden")
    $('button:contains(Basic Mode)').html "Advanced Mode"

class Question

Question.toJSON = (questions) ->
  return JSON.stringify(Question.toObject(questions))

Question.toObject = (questions) ->
  _(questions).chain()
    .map (question) ->
      question = $(question)
      id = question.attr("id")
      return unless id
      result = { id : id }
      for property in ["label","type","repeatable"]
        result[property] = question.find("##{property}-#{id}").val()
      if question.find(".question-definition").length > 0
        result.questions = Question.toObject(question.find(".question-definition"))
      return result
    .compact().value()

Question.toHTMLForm = (questions, groupId) ->
  _.map(questions, (question) ->
    if question.repeatable == "true" then repeatable = "<button>+</button>" else repeatable = ""
    if question.type? and question.label? and question.label != ""
      name = question.label.replace(/[^a-zA-Z0-9 -]/g,"").replace(/[ -]/g,"")
      if question.repeatable == "true"
        name = name + "[0]"
        question.id = question.id + "-0"
      if groupId?
        name = "group.#{groupId}.#{name}"
      result = "
        <div class='question'>
        "
      question.value = "" unless question.value?
      unless question.type.match(/hidden/)
        result += "
          <label for='#{question.id}'>#{question.label}</label>
        "
      if question.type.match(/textarea/)
        result += "
          <textarea name='#{name}' id='#{question.id}'>#{question.value}</textarea>
        "
      else
        result += "
          <input name='#{name}' id='#{question.id}' type='#{question.type}' value='#{question.value}'></input>
        "
      result += "
        </div>
      "
      return result + repeatable
    else
      newGroupId = question.id
      newGroupId = newGroupId + "[0]" if question.repeatable
      return "<div data-group-id='#{question.id}' class='question group'>" + Question.toHTMLForm(question.questions, newGroupId) + "</div>" + repeatable
  ).join("")