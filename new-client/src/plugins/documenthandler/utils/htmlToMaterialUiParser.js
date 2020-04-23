/**
 * Default export of function that takes a html-string as input and returns array with MaterialUIComponents
 * @param {string} html String with html that needs to be converted to materialUIComponents
 * @param {Array} tagSpecificCallbacks Tags that should be interpreted to Material UI components, the rest will be ignored.
 * @returns {Array} Returns array with MaterialUI Components - see getTagSpecificCallbacks to see the translation used
 * @memberof htmlToMaterialUiParser
 */

export default (html, tagSpecificCallbacks) => {
  let generatedHtml = [];
  parseHtml(html, generatedHtml, tagSpecificCallbacks);
  return generatedHtml.map(tag => {
    return tag.renderCallback(tag);
  });
};

/**
 * Private help method that adds all tags that has no ending, e.g. the br tag.
 *
 * @memberof htmlToMaterialUiParser
 */
const getTagsWithoutEnding = () => {
  return ["br"];
};

/**
 * Parse the html code so that it can be translated into Material UI components.
 * Only html tags that can be found in the tagSpecificCallbacks will be added. The rest
 * will be ignored.
 * @param {object} html The html code.
 *
 * @memberof htmlToMaterialUiParser
 */
const parseHtml = (html, generatedHtml, tagSpecificCallbacks) => {
  const { tagType, tagValue, tagEndIndex } = findStartTag(html);
  generatedHtml.push({
    tagType: tagType,
    text: [],
    renderCallback: getTagSpecificCallback(tagType, tagSpecificCallbacks)
  });

  recursiveParseSubTags(
    generatedHtml[generatedHtml.length - 1],
    tagType,
    tagValue,
    tagSpecificCallbacks
  );

  const htmlExceptFirstTag = html.substring(tagEndIndex);
  if (htmlExceptFirstTag.length > 0)
    parseHtml(htmlExceptFirstTag, generatedHtml, tagSpecificCallbacks);
};

/**
 * Private help method that parsers all sub tags within a tag.
 * @param {array} parsedObject The current part ot the generated array that will be filled up.
 * @param {string} tagType The type of the most outer tag.
 * @param {string} tagValue The text value of the most outer tag as pure text.
 * @param {array} tagSpecificCallbacks An array of all tags that should be handled as React components.
 *
 * @memberof htmlToMaterialUiParser
 */
const recursiveParseSubTags = (
  parsedObject,
  tagType,
  tagValue,
  tagSpecificCallbacks
) => {
  const { text, restHtml, addTag } = extractFirstInnerTag(
    tagType,
    tagValue,
    tagSpecificCallbacks
  );
  if (addTag) {
    text.forEach(textElement => {
      textElement.renderCallback = getTagSpecificCallback(
        textElement.tagType,
        tagSpecificCallbacks
      );
      parsedObject.text.push(textElement);
    });
  }

  if (restHtml.length > 0)
    recursiveParseSubTags(
      parsedObject,
      tagType,
      restHtml,
      tagSpecificCallbacks
    );
};

/**
 * Private help method that extracts the first inner tag within a tag.
 * @param {string} tagType The tag type of the first tag.
 * @param {string} tagValue The pure tag value as a text, can contains tags inside itself.
 * @param {array} tagSpecificCallbacks An array of all tags that should be handled as React components.
 * @returns {object} Returns an object that consists of three parts. The parsed first tag found, the
 * rest html that still needs to be parsed ans finally if this tag should be added or not, i.e. is a
 * tag within the array of tag specific callbacks.
 *
 * @memberof htmlToMaterialUiParser
 */
const extractFirstInnerTag = (tagType, tagValue, tagSpecificCallbacks) => {
  const { firstTag, restHtml, addTag } = extractDataFromFirstTag(
    tagValue,
    tagSpecificCallbacks
  );
  return {
    text: firstTag,
    restHtml: restHtml,
    addTag: addTag
  };
};

/**
 * Private help method that finds the start tag in the html text.
 * @param {string} html The html code.
 * @returns {object} Returns the tag type, tag value, the index of the first tag and the last index of the
 * first tag.
 *
 * @memberof htmlToMaterialUiParser
 */
const findStartTag = html => {
  const indexStart = html.indexOf("<");
  let indexEnd = html.indexOf(">");

  let possibleIndexEnd = html.indexOf("/>");
  if (indexEnd - 1 === possibleIndexEnd) indexEnd = html.indexOf(" ");
  if (indexEnd === possibleIndexEnd) indexEnd = html.length;

  let tagType = getTagType(html, indexStart, indexEnd);

  let tagEndIndex = findEndTagIndex(html, tagType);
  if (tagEndIndex === 1) tagEndIndex = possibleIndexEnd;
  if (tagType === null)
    return {
      tagType: tagType,
      tagValue: html,
      tagStartIndex: indexStart,
      tagEndIndex: tagEndIndex
    };

  const startIndex = indexStart + 2 + tagType.length;
  let endIndex = tagEndIndex - 3 - tagType.length;
  if (tagEndIndex - 3 - tagType.length <= 0)
    endIndex = indexStart + 2 + tagType.length;
  if (possibleIndexEnd > 0) endIndex = tagEndIndex - tagType.length;
  const tagValue = html.substring(startIndex, endIndex);

  return {
    tagType: tagType,
    tagValue: tagValue,
    tagStartIndex: indexStart,
    tagEndIndex: tagEndIndex
  };
};

/**
 * Private help method that extracts data from the first tag, i.e. will find out if there are any data
 * before the tag and/or data within the tag itself.
 * @param {string} html The part of the html that will be parsed.
 * @param {Array} tagSpecificCallbacks An array of all tags that should be handled as React components.
 * @returns {object} Returns an object that consists of three parts; the first parsed tag, the rest html
 * that needs to be parsed at a later "time" and finally if the tag should be added or not, i.e. is a
 * tag within the array of tag specific callbacks.
 *
 * @memberof htmlToMaterialUiParser
 */
const extractDataFromFirstTag = (html, tagSpecificCallbacks) => {
  let firstTag = [];
  const { textBeforeTag, pureTag } = getTextBeforeTag(html);
  addPossibleTextBeforeTag(firstTag, textBeforeTag);

  const { tagType, tagValue, tagEndIndex } = findStartTag(pureTag);
  const textAddedToTag = addPossibleTextToTag(
    firstTag,
    textBeforeTag,
    tagType,
    tagValue !== "" ? tagValue : pureTag,
    tagSpecificCallbacks
  );

  if (!textAddedToTag) addPossibleOnlyTextToParentTag(firstTag, pureTag);

  let restHtml = html.substr(textBeforeTag.length + tagEndIndex);
  if (!isTagSpecific(tagType, tagSpecificCallbacks) || isTextATag(tagValue))
    restHtml = tagValue;
  if (tagEndIndex === -1) restHtml = "";

  return {
    firstTag: firstTag,
    restHtml: restHtml,
    addTag: isTagSpecific(tagType, tagSpecificCallbacks, true)
  };
};

/**
 * Private help method that finds the start tag in the html text.
 * @param {string} html The html code.
 * @param {int} indexStart The html code.
 * @param {int} indexEnd The html code.
 * @returns {object} Returns the tag type, tag value and the last index of the fist tag.
 *
 * @memberof htmlToMaterialUiParser
 */
const getTagType = (html, indexStart, indexEnd) => {
  if (indexStart === -1) return null;

  const tagTypeWithOptionalAttributes = html.substring(
    indexStart + 1,
    indexEnd
  );
  let startIndexOfAttributes = tagTypeWithOptionalAttributes.indexOf(" ");
  let tagType = tagTypeWithOptionalAttributes;

  if (startIndexOfAttributes > -1) {
    tagType = html.substring(
      indexStart + 1,
      indexStart + 1 + startIndexOfAttributes
    );
  }
  return tagType;
};

/**
 * Private help method that find the nest end tag.
 * @param {string} html The html text.
 * @param {string} tagType The type of html tag.
 * @returns {int} Returns the index of the end tag.
 *
 * @memberof htmlToMaterialUiParser
 */
const findEndTagIndex = (html, tagType) => {
  if (
    getTagsWithoutEnding()
      .map(item => item)
      .includes(tagType)
  ) {
    return tagType.length + 2;
  }

  let hasEndTag = true;
  let indexStart = html.indexOf("</" + tagType + ">");
  if (indexStart === -1) {
    indexStart = html.indexOf("/>");
    hasEndTag = false;
  }
  if (indexStart === -1) indexStart = html.indexOf("<" + tagType + ">");

  let indexEnd = indexStart + 2;
  if (hasEndTag) indexEnd = indexEnd + tagType.length + 1;

  return indexEnd;
};

/**
 * Private help method that gets all text before a tag.
 * @param {string} html The html code that will be investigated.
 * @returns {object} Returns an object consists of the text before a tag and the
 * pure text of a tag including the tag itself.
 *
 * @memberof htmlToMaterialUiParser
 */
const getTextBeforeTag = html => {
  const { tagStartIndex } = findStartTag(html);
  return {
    textBeforeTag: html.substring(0, tagStartIndex),
    pureTag: html.substring(tagStartIndex)
  };
};

/**
 * Private help method that adds possible text before a tag.
 * @param {string} firstTag The tag object that will be added to the generated html array.
 * @param {string} textBeforeTag The text that is before a tag.
 *
 * @memberof htmlToMaterialUiParser
 */
const addPossibleTextBeforeTag = (firstTag, textBeforeTag) => {
  if (textBeforeTag !== "") {
    firstTag.push({ tagType: null, text: textBeforeTag });
    return true;
  }
  return false;
};

/**
 * Private help method that adds possible text to a tag, e.g. text to a p-tag before an img-tag.
 * @param {object} firstTag The tag object that will be added to the generated html array.
 * @param {string} textBeforeTag The text that is before a tag.
 * @param {string} tagType The type of html tag.
 * @param {string} tagValue The pure tag value as a text, can contains tags inside itself.
 * @param {Array} tagSpecificCallbacks An array of all tags that should be handled as React components.
 * @returns {boolean} Returns if the possible text was addded to ths first tag object.
 *
 * @memberof htmlToMaterialUiParser
 */
const addPossibleTextToTag = (
  firstTag,
  textBeforeTag,
  tagType,
  tagValue,
  tagSpecificCallbacks
) => {
  if (isTextATag(tagValue)) return false;

  if (textBeforeTag !== "" || tagValue !== "") {
    if (tagType === null || isTagSpecific(tagType, tagSpecificCallbacks)) {
      firstTag.push({ tagType: tagType, text: tagValue });
      return true;
    }
  }
  return false;
};

const isTextATag = tagValue => {
  const { tagType } = findStartTag(tagValue);
  if (tagType) return true;

  return false;
};

/**
 * Private help method
 * @param {object} firstTag The tag object that will be added to the generated html array.
 * @param {string} pureTag The value of a tag excluded the tag itself.
 * @returns {boolean} Returns if the possible text was addded to ths first tag object.
 *
 * @memberof htmlToMaterialUiParser
 */
const addPossibleOnlyTextToParentTag = (firstTag, pureTag) => {
  if (isTextATag(pureTag)) return false;

  if (pureTag !== "") {
    firstTag.push({ tagType: null, text: pureTag });
    return true;
  }
  return false;
};

const getTagSpecificCallback = (tagType, tagSpecificCallbacks) => {
  let foundTag = tagSpecificCallbacks.find(
    element => element.tagType === tagType
  );
  if (foundTag) return foundTag.callback;
  return null;
};

/**
 * Private help method that determines if a tag is an allowed tag according to the tag specific array.
 * @param {string} tagType The type of html tag.
 * @param {array} tagSpecificCallbacks An array of all tags that should be handled as React components.
 * @param {boolean} allowNull Optional boolean that specifies if a null tag should be threated as an
 * allowed tag.
 */
const isTagSpecific = (tagType, tagSpecificCallbacks, allowNull = false) => {
  if (allowNull && tagType === null) return true;
  if (getTagSpecificCallback(tagType, tagSpecificCallbacks)) {
    return true;
  }
  return false;
};