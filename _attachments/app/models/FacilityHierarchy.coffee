class FacilityHierarchy extends Backbone.Model

  initialize: ->
    @set
      _id: "Facility Hierarchy"

  url: "/facilityHierarchy"

  #Note that the facilities after the line break are hospitals


  FacilityHierarchy.load = (options) ->
    facilityHierarchy = new FacilityHierarchy()
    facilityHierarchy.fetch
      success: ->
        FacilityHierarchy.hierarchy = facilityHierarchy.get("hierarchy")
        options.success()
      error: (error) ->
        console.error "Error loading Facility Hierarchy: #{JSON.stringify(error)}"
        options.error(error)

  FacilityHierarchy.hierarchy = {
    "CHAKECHAKE":[
      "CHONGA"
      "DIRA"
      "GOMBANI"
      "MGELEMA"
      "MVUMONI"
      "NDAGONI"
      "PUJINI"
      "SHUNGI"
      "TUNDAUA"
      "UWANDANI"
      "ZIWANI"

      "CHAKECHAKE"
      "VITONGOJI"
    ]
    "MICHEWENI":[
      "FINYA"
      "KINYASINI"
      "KIUYU KIPANGANI"
      "KIUYU MBUYUNI"
      "KONDE"
      "MAKANGALE"
      "MAZIWA NGOMBE"
      "MKIAWANGOMBE"
      "MSUKA"
      "SHUMBA VIAMBONI"
      "SIZINI"
      "TUMBE"
      "WINGWI"

      "MICHEWENI"
    ]
    "MKOANI":[
      "BOGOA"
      "CHAMBANI"
      "KANGANI"
      "KENGEJA"
      "KISIWA PANZA"
      "KIWANI"
      "MAKOMBENI"
      "MAKOONGWE"
      "MTAMBILE"
      "MTANGANI"
      "MWAMBE"
      "SHAMIANI"
      "SHIDI"
      "UKUTINI"
      "WAMBAA"

      "ABDALA MZEE"

    ]
    "WETE":[
      "CHWALE"
      "FUNDO"
      "JADIDA"
      "JUNGUNI"
      "KAMBINI"
      "KANGAGANI"
      "KISIWANI"
      "KIUNGONI"
      "KIUYU MINUNGWINI"
      "KOJANI"
      "MTAMBWE"
      "MZAMBARAUNI"
      "OLE"
      "PANDANI"
      "TUNGAMAA"
      "UKUNJWI"
      "UONDWE"
      "VUMBA"

      "WETE"
    ]
    "CENTRAL":[
      "BAMBI"
      "CHARAWE"
      "CHEJU"
      "CHWAKA"
      "DUNGA"
      "JENDELE"
      "KIBOJE"
      "MACHUI"
      "MARUMBI"
      "MCHANGANI"
      "MICHAMVI"
      "MIWANI"
      "MWERA"
      "NDIJANI BANIANI"
      "NDIJANI MSEWENI"
      "PONGWE"
      "TUNGUU"
      "UKONGORONI"
      "UMBUJI"
      "UNGUJA UKUU"
      "UROA"
      "UZI"
      "UZINI"
    ]
    "NORTH A":[
      "CHAANI KUBWA"
      "GAMBA"
      "KIDOTI"
      "KIJINI"
      "MASINGINI"
      "MATEMWE"
      "MKOKOTONI"
      "NUNGWI"
      "PWANI MCHANGANI"
      "TAZARI"
      "TUMBATU GOMANI"
      "TUMBATU JONGOWE"

      "KIVUNGE"
    ],
    "NORTH B":[
      "BUMBWINI"
      "BUMBWINI MAKOBA"
      "DONGE MCHANGANI"
      "DONGE VIJIBWENI"
      "FUJONI"
      "KITOPE"
      "KIWENGWA"
      "MAHONDA"
      "UPENJA"
      "ZINGWEZINGWE"
    ],
    "SOUTH":[
      "BWEJUU"
      "JAMBIANI"
      "KIBUTENI"
      "KITOGANI"
      "KIZIMKAZI DIMBANI"
      "KIZIMKAZI MKUNGUNI"
      "MTENDE"
      "MUYUNI"
      "PAJE"

      "MAKUNDUCHI"
    ],
    "URBAN":[
      "ALI AMOUR"
      "BANDARINI"
      "CHUMBUNI"
      "JANGOMBE MPENDAE"
      "JKU SAATENI"
      "KIDONGO CHEKUNDU"
      "KIDUTANI"
      "MAFUNZO"
      "MATARUMBETA"
      "MKELE"
      "RAHA LEO"
      "SDA MEYA"
      "SEBLENI"
      "SHAURIMOYO"
      "ZIWANI POLICE"

      "MNAZI MMOJA"
    ]
    "WEST":[
      "Al-HIJRA"
      "BEIT-EL-RAAS"
      "BWEFUM"
      "CHUKWANI"
      "FUONI"
      "FUONI KIBONDENI"
      "KIEMBE SAMAKI"
      "KISAUNI"
      "KIZIMBANI"
      "KMKM KAMA"
      "KOMBENI"
      "MAGOGONI"
      "MATREKTA"
      "SANASA"
      "SELEM"
      "SHAKANI"
      "AL-HIJRI"
      "WELEZO"
    ]
  }

  FacilityHierarchy.allFacilities = ->
    _.flatten(_.values(FacilityHierarchy.hierarchy))

  FacilityHierarchy.getDistrict = (facility) ->
    result = null
    _.each FacilityHierarchy.hierarchy, (facilityList,district) ->
      if _.contains(facilityList, facility)
        result = district
    return result
