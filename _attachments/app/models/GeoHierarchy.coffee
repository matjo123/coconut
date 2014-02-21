#
class GeoHierarchy extends Backbone.Model
  initialize: ->
    @set
      _id: "Geo Hierarchy"

  url: "/geoHierarchy"

  @levels = ["REGION","DISTRICT","SHEHIA"]

# ward_shehia_breakdown_by_constituan_district_region

#        "REGION": {
#            "DISTRICT": {
#                "CONSTITUAN": [
#                    "WARD/ Shehia"
#                ]
#            }
#        },
#
#


  GeoHierarchy.load = (options) =>
    geoHierarchy = new GeoHierarchy()
    geoHierarchy.fetch
      success: =>
        GeoHierarchy.hierarchy = geoHierarchy.get("hierarchy")

        GeoHierarchy.root = {
          parent: null
        }

        # Adds properties region, district, shehia, etc to node
        addLevelProperties = (node) ->
          levelClimber = node
          node[levelClimber.level] = levelClimber.name
          while levelClimber.parent isnt null
            levelClimber = levelClimber.parent
            node[levelClimber.level] = levelClimber.name
          return node

        # builds the tree
        addChildren = (node,values, levelNumber) =>
          if _(values).isArray()
            node.children = for value in values
              result = {
                parent: node
                level: @levels[levelNumber]
                name: value
                children: null
              }
              result = addLevelProperties(result)
            node
          else
            node.children = for key, value of values
              result = {
                parent:node
                level: @levels[levelNumber]
                name:key
              }
              result = addLevelProperties(result)
              addChildren result, value, levelNumber+1
            return node

        addChildren(GeoHierarchy.root, GeoHierarchy.hierarchy, 0)

        options.success()
      error: (error) ->
        console.error "Error loading Geo Hierarchy: #{error}"
        options.error(error)


  GeoHierarchy.findInNodes = (nodes, requiredProperties) ->
    results = _(nodes).where requiredProperties

    if _(results).isEmpty()
      results = (for node in nodes
        GeoHierarchy.findInNodes(node.children, requiredProperties)
      ) if nodes?
      results = _.chain(results).flatten().compact().value()
      return [] if _(results).isEmpty()

    return results

  GeoHierarchy.find = (name,level) ->
    GeoHierarchy.findInNodes(GeoHierarchy.root.children, {name:name, level:level})

  GeoHierarchy.findAllForLevel = (level) ->
    GeoHierarchy.findInNodes(GeoHierarchy.root.children, {level: level})

  GeoHierarchy.findChildrenNames = (targetLevel, parentName) ->
    indexOfTargetLevel = _(@levels).indexOf(targetLevel)
    parentLevel = @levels[indexOfTargetLevel-1]
    nodeResult = GeoHierarchy.findInNodes(GeoHierarchy.root.children, {name:parentName, level:parentLevel})
    return [] if _(nodeResult).isEmpty()
    console.error "More than one match" if nodeResult.length > 2
    return _(nodeResult[0].children).pluck "name"

  # I think this is redundant-ish
  GeoHierarchy.findAllDescendantsAtLevel = (name, sourceLevel, targetLevel) ->

    getLevelDescendants = (node) ->
      return node if node.level is targetLevel
      return (for childNode in node.children
        getLevelDescendants(childNode)
      )

    sourceNode = GeoHierarchy.find(name, sourceLevel)
    _.flatten(getLevelDescendants sourceNode[0])

  GeoHierarchy.findShehia = (targetShehia) ->
    GeoHierarchy.find(targetShehia,"SHEHIA")

  GeoHierarchy.findOneShehia = (targetShehia) ->
    shehia = GeoHierarchy.findShehia(targetShehia)
    switch shehia.length
      when 0 then return null
      when 1 then return shehia[0]
      else
        console.error "Multiple Shehia's found for #{targetShehia}"

  GeoHierarchy.findAllShehiaNamesFor = (name, level) ->
    _.pluck GeoHierarchy.findAllDescendantsAtLevel(name, level, "SHEHIA"), "name"

  GeoHierarchy.allDistricts = ->
    _.pluck GeoHierarchy.findAllForLevel("DISTRICT"), "name"