import React from "react";

/**
 * @summary  DocumentHandler model that doesn't do much.
 * @description This model exposes only one method, getMap(),
 * so it does not do anything crucial. But you can see it
 * as an example of how a plugin can be separated in different
 * components.
 *
 * @class DocumentHandlerModel
 */

const fetchConfig = {
  credentials: "same-origin"
};

export default class DocumentHandlerModel {
  internalId = 0;

  async listAllAvailableDocuments(callback) {
    let response;
    try {
      response = await fetch(
        "http://localhost:55630/informative/list",
        fetchConfig
      );
      const text = await response.text();
      const document = await JSON.parse(text);
      callback(document);
    } catch (err) {}
  }

  async fetchJsonDocument(title, callback) {
    let response;
    try {
      response = await fetch(
        `http://localhost:55630/informative/load/${title}`,
        fetchConfig
      );
      const text = await response.text();
      const document = await JSON.parse(text);
      this.internalId = 0;
      document.chapters.forEach(chapter => {
        this.setParentChapter(chapter, undefined);
        this.setInternalId(chapter);
        this.setScrollReferences(chapter);
        this.internalId = this.internalId + 1;
      });

      callback(document);
    } catch (err) {}
  }

  setScrollReferences = chapter => {
    chapter.scrollRef = React.createRef();
    if (chapter.chapters.length > 0) {
      chapter.chapters.forEach(child => {
        this.setScrollReferences(child);
      });
    }
  };

  setInternalId(chapter) {
    chapter.id = this.internalId;
    if (chapter.chapters.length > 0) {
      chapter.chapters.forEach(child => {
        this.internalId = this.internalId + 1;
        this.setInternalId(child);
      });
    }
  }

  setParentChapter(chapter, parent) {
    chapter.parent = parent;
    if (chapter.chapters.length > 0) {
      chapter.chapters.forEach(child => {
        this.setParentChapter(child, chapter);
      });
    }
  }
}