class Result extends Backbone.Model
  initialize: ->
    unless this.attributes.createdAt
      @set
        createdAt: moment(new Date()).format(Coconut.config.get "date_format")
    unless this.attributes.lastModifiedAt
      @set
        lastModifiedAt: moment(new Date()).format(Coconut.config.get "date_format")

  url: "/result"

  question: ->
    return @get("question")

  tags: ->
    tags = @get("Tags")
    return tags.split(/, */) if tags?
    return []

  complete: ->
    return true if _.include(@tags(), "complete")
    complete = @get("complete")
    complete = @get("Complete") if typeof complete is "undefined"
    return false if complete is null or typeof complete is "undefined"
    return true if complete is true or complete.match(/true|yes/)

  shortString: ->
    # see ResultsView.coffee to see @string get set
    result = @string
    if result.length > 40 then result.substring(0,40) + "..." else result

  identifyingAttributes: [
    "FirstName"
    "MiddleName"
    "LastName"
    "ContactMobilepatientrelative"
    "HeadofHouseholdName"
  ]
  
  get: (attribute) ->
    original = super(attribute)
    if original? and Coconut.config.local.get("mode") is "cloud"
      if _.contains(@identifyingAttributes, attribute)
        return b64_sha1(original)

    return original

  toJSON: ->
    if Coconut.config.local.get("mode") is "cloud"
      json = super()
      _.each json, (value, key) =>
        if value? and _.contains(@identifyingAttributes, key)
          json[key] = b64_sha1(value)
      return json

    return super(attribute)

  save: (key,value,options) ->
    @set
      user: $.cookie('current_user')
    super(key,value,options)
