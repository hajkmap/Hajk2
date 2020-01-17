/**
 * @summary SearchModel used for VT specific searches.
 * @description NEED TO ADD A DESCRIPTION
 *
 * @class SearchModel
 */

export default class SearchModel {
  /**
   * Settings with labels, urls etc. for the search functions.
   */
  geoServer = null;

  /**
   * Constructor for the search model.
   * @param {object} settings The settings from the json settings file.
   */
  constructor(settings) {
    this.map = settings.map;
    this.app = settings.app;
    this.localObserver = settings.localObserver;
    this.geoServer = settings.geoServer;
  }

  /**
   * Private method that a adjusts the CQL filter so that it's supported for a web browser and GeoServer.
   * @param {string} cql The CQL that needs to be adjusted.
   * @returns {string} Returns a supported wkt for GeoServer.
   *
   * @memberof SearchModel
   */
  encodeCqlForGeoServer = cql => {
    return cql
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/ /g, "%20")
      .replace(/'/g, "%27");
  };

  /**
   * Private method that adjusts the WKT filter so that it's supported for a web browser and GeoServer.
   * Fix parentheses and so on, so that the WKT are GeoServer valid.
   * @param {string} wkt The WKT that needs to be adjusted.
   * @returns {string} Returns a supported wkt for GeoServer.
   *
   * @memberof SearchModel
   */
  encodeWktForGeoServer = wkt => {
    return wkt
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/ /g, "%20")
      .replace(/,/g, "%5C,");
  };

  /**
   * Private method that gets all attributes that should remain from GeoServer.
   * @param {Array<string, string>} attributesToDisplay An array of attributes to be displayed.
   * @returns {Array<string>} Returns an array with only attribute names, stripped of all other data.
   *
   * @memberof SearchModel
   */
  attributesToKeepFromSettings = attributesToDisplay => {
    return attributesToDisplay.map(attribute => {
      return attribute.key;
    });
  };

  /**
   * Private method that determines if a we have a line number or a line name, i,e, only
   * consists of numbers.
   * @param {string} lineNameOrNumber The text string to check.
   * @returns {boolean} Returns true if the text string is a line number.
   *
   * @memberof SearchModel
   */
  isLineNumber = lineNameOrNumber => {
    // Checks for only digits.
    if (lineNameOrNumber.match(/^[0-9]+$/) != null) return true;

    return false;
  };

  /**
   * Private method that tests if a string is null or empty
   * @param {string} stringValue The string to test.
   * @returns {boolean} Returns true if the string is empty or null.
   */
  isNullOrEmpty = stringValue => {
    return stringValue == null || stringValue === "";
  };

  /**
   * Private method that removes all unnecessary attributes from a collection.
   * @param {Object} featureCollection The feature collection with unnecessary attributes.
   * @param {Array<string>} attributesToKeep An array with the attributes that will remain.
   * @returns {Object} Returns a feature collection with no unnecessary attributes in it.
   *
   * @memberof SearchModel
   */
  removeUnnecessaryAttributes = (featureCollection, attributesToKeep) => {
    featureCollection.features = featureCollection.features.map(feature => {
      let names = Object.keys(feature.properties);
      for (let indexName = 0; indexName < names.length; indexName++) {
        if (!attributesToKeep.includes(names[indexName]))
          delete feature.properties[names[indexName]];
      }

      return feature;
    });

    return featureCollection;
  };

  /**
   * Private method that removes all duplicates from a feature collection and
   * updates the number return value.
   * @param {Object} featureCollection The feature collection with duplicates.
   * @returns {Object} A feature collection with no duplicates in it.
   *
   * @memberof SearchModel
   */
  removeDuplicates = featureCollection => {
    let features = featureCollection.features;
    let uniqueArray = this.removeDuplicatedItems(features);
    featureCollection.features = uniqueArray;
    featureCollection.numberReturned = uniqueArray.length;
    return featureCollection;
  };

  /**
   * Private method that removes all duplicates from an array of features.
   * The function checks if properties diverges.
   * @param {Array<Object>} features The feature collection with duplicates.
   * @returns {Array<Object>} Returns an array with no duplicates in it.
   *
   * @memberof SearchModel
   */
  removeDuplicatedItems = features => {
    let uniqueArray = [];
    for (let indexFeature = 0; indexFeature < features.length; indexFeature++) {
      if (uniqueArray.indexOf(features[indexFeature]) === -1) {
        let shouldAddFeature = true;
        for (
          let indexUniqueArray = 0;
          indexUniqueArray < uniqueArray.length;
          indexUniqueArray++
        ) {
          shouldAddFeature =
            shouldAddFeature &&
            !this.hasSameProperties(
              uniqueArray[indexUniqueArray].properties,
              features[indexFeature].properties
            );
        }

        if (shouldAddFeature) uniqueArray.push(features[indexFeature]);
      }
    }

    return uniqueArray;
  };

  /**
   * Private help method for removeDuplicates, that checks if two objects are the same or not.
   * The comparison looks at property name and values.
   * @param {Object} objectOne The first object to compare.
   * @param {Object} objectTwo The second object to compare.
   * @returns {boolean} Returns true if two object has the same property name and values.
   *
   * @memberof SearchModel
   */
  hasSameProperties(objectOne, objectTwo) {
    const propertyNamesOne = Object.keys(objectOne);
    const propertyNamesTwo = Object.keys(objectTwo);
    if (!this.propertiesHasTheSameLength(propertyNamesOne, propertyNamesTwo))
      return false;

    if (!this.propertyNamesAreTheSame(propertyNamesOne, propertyNamesTwo))
      return false;

    const propertyValuesOne = Object.values(objectOne);
    const propertyValuesTwo = Object.values(objectTwo);
    return this.propertyValuesAreTheSame(propertyValuesOne, propertyValuesTwo);
  }

  /**
   * Private help method that checks if two array have the same length. The reason for this
   * help method is to check if two objects have the same properties and if the number of
   * properties diverges they can not be the same.
   * @param {Array<string>} propertyNamesOne An array of object one's property names.
   * @param {Array<string>} propertyNamesTwo An array of object two's property names.
   * @returns Returns true if the two properties arrays have the same length.
   *
   * @memberof SearchModel
   */
  propertiesHasTheSameLength(propertyNamesOne, propertyNamesTwo) {
    return propertyNamesOne.length === propertyNamesTwo.length;
  }

  /**
   * Private help method that checks if two arrays of property names are the same. The reason
   * for this is to check if the property names diverges. If the do, the objects can not be
   * the same.
   * @param {Array<string>} propertyNamesOne An array of object one's property names.
   * @param {Array<string>} propertyNamesTwo An array of object two's property names.
   * @returns Returns true if the two properties arrays have the exact same names.
   *
   * @memberof SearchModel
   */
  propertyNamesAreTheSame(propertyNamesOne, propertyNamesTwo) {
    let someDifference = propertyNamesOne.some((value, index) => {
      return value !== propertyNamesTwo[index];
    });

    return !someDifference;
  }

  /**
   * Private help method that checks if two arrays of property values are the same. The reason
   * for this is to check if the property values diverges. If the do, the objects can not be
   * the same.
   * @param {Array<string>} propertyValuesOne An array of object one's property values.
   * @param {Array<string>} propertyValuesTwo An array of object two's property values.
   */
  propertyValuesAreTheSame(propertyValuesOne, propertyValuesTwo) {
    let someDifference = propertyValuesOne.some((value, index) => {
      return value !== propertyValuesTwo[index];
    });

    return !someDifference;
  }

  /**
   * Private method that swaps all coordinates in a WKT polygon so that Sql Server can read them correctly. Otherwise will
   * the N- and E-coordinates be swapped.
   * @param {string} polygonAsWkt The polygon as a WKT.
   * @returns {string} A polygon adapted for Sql Server.
   *
   * @memberof SearchModel
   */
  swapWktCoordinatesForSqlServer = polygonAsWkt => {
    let { updatedWkt, remainingWkt } = this.removePolygonStartOfWkt(
      polygonAsWkt
    );
    updatedWkt = this.swapCoordinates(updatedWkt, remainingWkt).updatedWkt;
    updatedWkt = this.addEndOfPolygonWkt(updatedWkt);

    return updatedWkt;
  };

  /**
   * Private help method that removes the start of the WKT polygon.
   * @param {string} polygonAsWkt A polygon as a WKT.
   * @returns {string} A WKT polygon with all coordinates swapped.
   *
   * @memberof SearchModel
   */
  removePolygonStartOfWkt = polygonAsWkt => {
    let updatedWkt = "";
    const removeWktTypeText = "POLYGON((";
    const indexOfRemoveText = polygonAsWkt.indexOf(removeWktTypeText);
    updatedWkt = polygonAsWkt.substring(
      0,
      indexOfRemoveText + removeWktTypeText.length
    );
    polygonAsWkt = polygonAsWkt.substring(removeWktTypeText.length);

    const returnObject = {
      updatedWkt: updatedWkt,
      remainingWkt: polygonAsWkt
    };

    return returnObject;
  };

  /**
   * Private help method that adds the ending, i.e. two right parentheses of a WKT polygon.
   * @param {string} polygonAsWktWithoutEnding A correct WKT polygon excepts the ending.
   * @returns {string} A correct WKT polygon.
   *
   * @memberof SearchModel
   */
  addEndOfPolygonWkt = polygonAsWktWithoutEnding => {
    return polygonAsWktWithoutEnding + "))";
  };

  /**
   * Private help method that swaps the position of the all coordinates in the WKT.
   * @param {string} updatedWkt The so far updated wkt.
   * @param {string} remainingWkt The remaining wkt text to be handled.
   * @returns {Object<string, string>} Returns hte updated and remaining WKT.
   *
   * @memberof SearchModel
   */
  swapCoordinates = (updatedWkt, remainingWkt) => {
    let continueToLoopIfCommaCharacter = true;
    while (continueToLoopIfCommaCharacter) {
      const partlySwappedCoordinates = this.swapCoordinatePart(
        updatedWkt,
        remainingWkt
      );
      updatedWkt = partlySwappedCoordinates.updatedWkt;
      remainingWkt = partlySwappedCoordinates.remainingWkt;

      if (remainingWkt.indexOf(",") === -1)
        continueToLoopIfCommaCharacter = false;
    }

    const fullySwappedCoordinates = this.swapCoordinatePart(
      updatedWkt,
      remainingWkt
    );
    updatedWkt = fullySwappedCoordinates.updatedWkt;
    remainingWkt = fullySwappedCoordinates.remainingWkt;

    const returnObject = {
      updatedWkt: updatedWkt,
      remainingWkt: remainingWkt
    };

    return returnObject;
  };

  /**
   * Private help method that swaps the position of the northing and easting coordinate.
   * @param {string} updatedWkt The so far updated wkt.
   * @param {string} remainingWkt The remaining wkt text to be handled.
   * @returns {Object<string, string>} Returns hte updated and remaining WKT.
   *
   * @memberof SearchModel
   */
  swapCoordinatePart = (updatedWkt, remainingWkt) => {
    let lastCoordinateSignIsCommaCharacter = true;
    let indexOfCoordinateEnd = remainingWkt.indexOf(",");
    if (indexOfCoordinateEnd === -1) {
      indexOfCoordinateEnd = remainingWkt.indexOf(")");
      lastCoordinateSignIsCommaCharacter = false;
    }
    const coordinates = remainingWkt
      .substring(0, indexOfCoordinateEnd)
      .split(" ");
    const northing = coordinates[0];
    const easting = coordinates[1];

    updatedWkt = updatedWkt + `${easting} ${northing}`;
    if (lastCoordinateSignIsCommaCharacter) updatedWkt = updatedWkt + ",";
    remainingWkt = remainingWkt.substring(indexOfCoordinateEnd + 1);

    const returnObject = {
      updatedWkt: updatedWkt,
      remainingWkt: remainingWkt
    };

    return returnObject;
  };

  /**
   * Autocomplete function that gets the line numbers or public line numbers that match a search text.
   * @param {string} searchText The search text for a line number or public line number.
   * @returns {array(string)} Returns an array of matching line numbers or public line numbers.
   *
   * @memberof SearchModel
   */
  autocompleteLineNumbersOrPublicLineNumbers(searchText) {
    // If the search is empty no result will be found.
    if (this.isNullOrEmpty(searchText)) return null;

    // Build up the url with cql.
    let url = this.geoServer.lineNumberAndPublicLineNumber.url;
    let cql = "&CQL_FILTER=";

    // Checks if the argument is a line number or a public line number
    const isLineNumber = this.isLineNumber(searchText);

    if (!this.isNullOrEmpty(searchText)) {
      if (isLineNumber) cql = cql + `LineNumber like '${searchText}%'`;
      else cql = cql + `PublicLineNumber like '${searchText}%'`;
    }

    // Fix percent and so on, so that the CQL filters are GeoServer valid.
    if (!this.isNullOrEmpty(searchText)) cql = this.encodeCqlForGeoServer(cql);

    url = url + cql;
    return fetch(url)
      .then(res => {
        return res.json().then(jsonResult => {
          let lineNumberOrPublicLineNumber = jsonResult.features.map(
            feature => {
              if (isLineNumber) return feature.properties.LineNumber;

              return feature.properties.PublicLineNumber;
            }
          );

          return lineNumberOrPublicLineNumber;
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Autocomplete function that gets all municipality names sorted in alphabetic order array.
   * @returns {Array<string>} Returns all municipality names sorted in alphabetic order.
   *
   * @memberof SearchModel
   */
  autocompleteMunicipalityZoneNames() {
    const url = this.geoServer.municipalityZoneNames.url;
    return fetch(url)
      .then(res => {
        return res.json().then(jsonResult => {
          let municipalityNames = jsonResult.features.map(feature => {
            return feature.properties.Name;
          });

          municipalityNames = municipalityNames.sort(function(a, b) {
            return a.localeCompare(b);
          });

          return municipalityNames;
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Autocomplete function that gets the stop area names or stop area numbers that match a search text.
   * @param {string} searchText The search text for a line number or public line number.
   * @returns {array(string)} Returns an array of matching line numbers or public line numbers.
   *
   * @memberof SearchModel
   */
  autocompleteStopAreaNamesOrNumbers(searchText) {
    // If the search is empty no result will be found.
    if (this.isNullOrEmpty(searchText)) return null;

    // Build up the url with cql.
    let url = this.geoServer.stopAreaNameAndStopAreaNumber.url;
    let cql = "&cql_filter=";

    // Checks if the argument is a line number or a public line number
    const isLineNumber = this.isLineNumber(searchText);

    if (!this.isNullOrEmpty(searchText)) {
      if (isLineNumber) cql = cql + `Number like '${searchText}%'`;
      else cql = cql + `Name like '${searchText}%'`;
    }

    // Fix percent and so on, so that the CQL filters are GeoServer valid.
    if (!this.isNullOrEmpty(searchText)) cql = this.encodeCqlForGeoServer(cql);

    // Fetch the result as a promise, sort it and attach it to the event.
    url = url + cql;

    return fetch(url)
      .then(res => {
        return res.json().then(jsonResult => {
          let stopAreaNamesOrNumbers = jsonResult.features.map(feature => {
            if (isLineNumber) return feature.properties.Number;

            return feature.properties.Name;
          });

          console.log(stopAreaNamesOrNumbers);
          return stopAreaNamesOrNumbers;
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Autocomplete function that gets then transport mode type names and numbers.
   * @returns {array(string, int)} Returns all mode type names as an array of tuples.
   *
   * @memberof SearchModel
   */
  autocompleteTransportModeTypeName() {
    this.localObserver.publish("transportModeTypeNames-result-begin", {
      label: this.geoServer.transportModeTypeNames.searchLabel
    });

    const url = this.geoServer.transportModeTypeNames.url;
    return fetch(url).then(res => {
      return res.json().then(jsonResult => {
        let transportModeTypes = jsonResult.features.map(feature => {
          return feature.properties.Name;
        });

        return transportModeTypes;
      });
    });
  }

  /**
   * Gets requested journeys. Sends an event when the function is called and another one when it's promise is done.
   * @param {string} fromTime Start time, pass null if no start time is given.
   * @param {string} endTime End time, pass null of no end time is given.
   * @param {string} filterOnWkt A polygon as a WKT, pass null of no polygon is given.
   *
   * @memberof SearchModel
   */
  getJourneys(filterOnFromDate, filterOnToDate, filterOnWkt) {
    this.localObserver.publish("vtsearch-result-begin", {
      label: this.geoServer.journeys.searchLabel
    });

    // Fix parentheses and so on, so that the WKT are GeoServer valid.
    if (!this.isNullOrEmpty(filterOnWkt))
      filterOnWkt = this.encodeWktForGeoServer(filterOnWkt);

    // Build up the url with viewparams.
    let url = this.geoServer.journeys.url;
    let viewParams = "&viewparams=";
    if (!this.isNullOrEmpty(filterOnFromDate))
      viewParams = viewParams + `filterOnFromDate:${filterOnFromDate};`;
    if (!this.isNullOrEmpty(filterOnToDate))
      viewParams = viewParams + `filterOnToDate:${filterOnToDate};`;
    if (!this.isNullOrEmpty(filterOnWkt))
      viewParams = viewParams + `filterOnWkt:${filterOnWkt};`;

    if (
      !this.isNullOrEmpty(filterOnFromDate) ||
      !this.isNullOrEmpty(filterOnToDate) ||
      !this.isNullOrEmpty(filterOnWkt)
    )
      url = url + viewParams;

    // Fetch the result as a promise and attach it to the event.
    fetch(url)
      .then(res => {
        res.json().then(jsonResult => {
          let journeys = {
            featureCollection: jsonResult,
            label: this.geoServer.journeys.searchLabel,
            type: "journeys"
          };

          journeys.featureCollection = this.removeUnnecessaryAttributes(
            journeys.featureCollection,
            this.attributesToKeepFromSettings(
              this.geoServer.journeys.attributesToDisplay
            )
          );
          journeys.featureCollection = this.removeDuplicates(
            journeys.featureCollection
          );

          this.localObserver.publish("vtsearch-result-done", journeys);
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Gets all Routes. Sends an event when the function is called and another one when it's promise is done.
   * @param {string} publicLineName Public line name.
   * @param {string} internalLineNumber The internal line number.
   * @param {string} isInMunicipalityZoneGid The Gid number of a municipality
   * @param {string} transportModeType The transport type of lines.
   * @param {string} stopAreaNameOrNumber The stop area name or stop area number.
   * @param {string} polygonAsWkt A polygon, as a WKT, to intersects with.
   *
   * @memberof SearchModel
   */
  getRoutes(
    publicLineName,
    internalLineNumber,
    isInMunicipalityZoneGid,
    transportModeType,
    stopAreaNameOrNumber,
    polygonAsWkt
  ) {
    this.localObserver.publish("vtsearch-result-begin", {
      label: this.geoServer.routes.searchLabel
    });

    if (polygonAsWkt)
      polygonAsWkt = this.swapWktCoordinatesForSqlServer(polygonAsWkt);

    // Build up the url with cql.
    let url = this.geoServer.routes.url;
    let cql = "&CQL_FILTER=";
    let addAndInCql = false;
    if (!this.isNullOrEmpty(publicLineName)) {
      cql = cql + `PublicLineName like '${publicLineName}'`;
      addAndInCql = true;
    }
    if (!this.isNullOrEmpty(internalLineNumber)) {
      if (addAndInCql) cql = cql + " AND ";
      cql = cql + `InternalLineNumber like '${internalLineNumber}'`;
      addAndInCql = true;
    }
    if (!this.isNullOrEmpty(isInMunicipalityZoneGid)) {
      if (addAndInCql) cql = cql + " AND ";
      cql = cql + `IsInMunicipalityZoneGid like '${isInMunicipalityZoneGid}'`;
      addAndInCql = true;
    }
    if (!this.isNullOrEmpty(transportModeType)) {
      if (addAndInCql) cql = cql + " AND ";
      cql = cql + `TransportModeType like '${transportModeType}'`;
      addAndInCql = true;
    }
    if (!this.isNullOrEmpty(stopAreaNameOrNumber)) {
      if (addAndInCql) cql = cql + " AND ";
      if (this.isLineNumber(stopAreaNameOrNumber))
        cql = cql + `StopAreaNumber like '${stopAreaNameOrNumber}'`;
      else cql = cql + `StopAreaName like '${stopAreaNameOrNumber}'`;
      addAndInCql = true;
    }
    if (!this.isNullOrEmpty(polygonAsWkt)) {
      if (addAndInCql) cql = cql + " AND ";
      polygonAsWkt = this.encodeWktForGeoServer(polygonAsWkt);
      cql = cql + `INTERSECTS(Geom, '${polygonAsWkt}')`;
      addAndInCql = true;
    }

    if (
      !this.isNullOrEmpty(publicLineName) ||
      !this.isNullOrEmpty(internalLineNumber) ||
      !this.isNullOrEmpty(isInMunicipalityZoneGid) ||
      !this.isNullOrEmpty(transportModeType) ||
      !this.isNullOrEmpty(stopAreaNameOrNumber) ||
      !this.isNullOrEmpty(polygonAsWkt)
    )
      url = url + this.encodeCqlForGeoServer(cql);

    // Fetch the result as a promise and attach it to the event.
    fetch(url)
      .then(res => {
        res.json().then(jsonResult => {
          const routes = {
            featureCollection: jsonResult,
            label: this.geoServer.routes.searchLabel,
            type: "routes"
          };

          routes.featureCollection = this.removeUnnecessaryAttributes(
            routes.featureCollection,
            this.attributesToKeepFromSettings(
              this.geoServer.routes.attributesToDisplay
            )
          );
          routes.featureCollection = this.removeDuplicates(
            routes.featureCollection
          );

          this.localObserver.publish("vtsearch-result-done", routes);
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Get all stop areas. Sends an event when the function is called and another one when it's promise is done.
   * @param {string} filterOnNameOrNumber The public name or the number of the stop point, pass null of no name is given.
   * @param {string} filterOnPublicLine The public line number, pass null of no line is given.
   * @param {string} filterOnMunicipalName The municipality name, pass null of no municipality name is given.
   * @param {string} filterOnWkt A polygon as a WKT, pass null of no polygon is given.
   *
   * @memberof SearchModel
   */
  getStopAreas(
    filterOnNameOrNumber,
    filterOnPublicLine,
    filterOnMunicipalName,
    filterOnWkt
  ) {
    this.localObserver.publish("vtsearch-result-begin", {
      label: this.geoServer.stopAreas.searchLabel
    });

    // Fix parentheses and so on, so that the WKT are GeoServer valid.
    if (!this.isNullOrEmpty(filterOnWkt))
      filterOnWkt = this.encodeWktForGeoServer(filterOnWkt);

    // Build up the url with viewparams.
    let url = this.geoServer.stopAreas.url;
    let viewParams = "&viewparams=";
    if (!this.isNullOrEmpty(filterOnNameOrNumber)) {
      if (this.isLineNumber(filterOnNameOrNumber))
        viewParams = viewParams + `filterOnName:${filterOnNameOrNumber};`;
      else viewParams = viewParams + `filterOnNumber:${filterOnNameOrNumber};`;
    }
    if (!this.isNullOrEmpty(filterOnPublicLine))
      viewParams = viewParams + `filterOnPublicLine:${filterOnPublicLine};`;
    if (!this.isNullOrEmpty(filterOnMunicipalName))
      viewParams =
        viewParams + `filterOnMunicipalName:${filterOnMunicipalName};`;
    if (!this.isNullOrEmpty(filterOnWkt))
      viewParams = viewParams + `filterOnWkt:${filterOnWkt};`;

    if (
      !this.isNullOrEmpty(filterOnNameOrNumber) ||
      !this.isNullOrEmpty(filterOnPublicLine) ||
      !this.isNullOrEmpty(filterOnMunicipalName) ||
      !this.isNullOrEmpty(filterOnWkt)
    )
      url = url + viewParams;

    // Fetch the result as a promise and attach it to the event.
    fetch(url).then(res => {
      res
        .json()
        .then(jsonResult => {
          let stopAreas = {
            featureCollection: jsonResult,
            label: this.geoServer.stopAreas.searchLabel,
            type: "stopAreas"
          };

          stopAreas.featureCollection = this.removeUnnecessaryAttributes(
            stopAreas.featureCollection,
            this.attributesToKeepFromSettings(
              this.geoServer.stopAreas.attributesToDisplay
            )
          );
          stopAreas.featureCollection = this.removeDuplicates(
            stopAreas.featureCollection
          );

          this.localObserver.publish("vtsearch-result-done", stopAreas);
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  /**
   * Get all stop points. Sends an event when the function is called and another one when it's promise is done.
   * @param {string} filterOnNameOrNumber The public name or the number of the stop point, pass null of no name is given.
   * @param {string} filterOnPublicLine The public line number, pass null of no line is given.
   * @param {string} filterOnMunicipalName The municipality name, pass null of no municipality name is given.
   * @param {string} filterOnNumber The number of the stop point, pass null of no number is given.
   *
   * @memberof SearchModel
   */
  getStopPoints(
    filterOnNameOrNumber,
    filterOnPublicLine,
    filterOnMunicipalName,
    filterOnWkt
  ) {
    this.localObserver.publish("vtsearch-result-begin", {
      label: this.geoServer.stopPoints.searchLabel
    });

    // Fix parentheses and so on, so that the WKT are GeoServer valid.
    if (!this.isNullOrEmpty(filterOnWkt))
      filterOnWkt = this.encodeWktForGeoServer(filterOnWkt);

    // Build up the url with viewparams.
    let url = this.geoServer.stopPoints.url;
    let viewParams = "&viewparams=";
    if (!this.isNullOrEmpty(filterOnNameOrNumber)) {
      if (this.isLineNumber(filterOnNameOrNumber))
        viewParams = viewParams + `filterOnName:${filterOnNameOrNumber};`;
      else viewParams = viewParams + `filterOnNumber:${filterOnNameOrNumber};`;
    }
    if (!this.isNullOrEmpty(filterOnPublicLine))
      viewParams = viewParams + `filterOnPublicLine:${filterOnPublicLine};`;
    if (!this.isNullOrEmpty(filterOnMunicipalName))
      viewParams =
        viewParams + `filterOnMunicipalName:${filterOnMunicipalName};`;
    if (!this.isNullOrEmpty(filterOnWkt))
      viewParams = viewParams + `filterOnWkt:${filterOnWkt};`;

    if (
      !this.isNullOrEmpty(filterOnNameOrNumber) ||
      !this.isNullOrEmpty(filterOnPublicLine) ||
      !this.isNullOrEmpty(filterOnMunicipalName) ||
      !this.isNullOrEmpty(filterOnWkt)
    )
      url = url + viewParams;

    // Fetch the result as a promise and attach it to the event.
    fetch(url).then(res => {
      res
        .json()
        .then(jsonResult => {
          let stopPoints = {
            featureCollection: jsonResult,
            label: this.geoServer.stopPoints.searchLabel,
            type: "stopPoints"
          };

          stopPoints.featureCollection = this.removeUnnecessaryAttributes(
            stopPoints.featureCollection,
            this.attributesToKeepFromSettings(
              this.geoServer.stopPoints.attributesToDisplay
            )
          );
          stopPoints.featureCollection = this.removeDuplicates(
            stopPoints.featureCollection
          );

          this.localObserver.publish("vtsearch-result-done", stopPoints);
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  /**
   * Returns the global Map object.
   * @returns {object} Map
   *
   * @memberof SearchModel
   */
  getMap() {
    return this.map;
  }
}