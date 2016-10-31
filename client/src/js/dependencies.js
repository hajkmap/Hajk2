// Copyright (C) 2016 Göteborgs Stad
//
// Detta program är fri mjukvara: den är tillåtet att redistribuera och modifeara
// under villkoren för licensen CC-BY-NC-ND 4.0.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the CC-BY-NC-ND 4.0 licence.
//
// http://creativecommons.org/licenses/by-nc-nd/4.0/
//
// Det är fritt att dela och anpassa programvaran för valfritt syfte
// med förbehåll att följande villkor följs:
// * Cypyright till upphovsmannen inte modifieras.
// * Programvaran används i icke-komersiellt syfte.
// * Licenstypen inte modifieras.
//
// Den här programvaran är öppen i syfte att den skall vara till nytta för andra
// men UTAN NÅGRA GARANTIER; även utan underförstådd garanti för
// SÄLJBARHET eller LÄMPLIGHET FÖR ETT VISST SYFTE.
//
// https://github.com/Johkar/Hajk2

global.window._ = require('underscore');
global.window.ol = require('openlayers');
global.window.Backbone = require('backbone');
global.window.moment = require('moment');
global.window.React = require('react');
global.window.ReactDOM = require('react-dom');
global.window.Datetime = require('react-datetime');
global.window.proj4 = require('proj4');
global.window.marked = require('marked');
global.window.X2JS = require('x2js');

var $ = jQuery = require('jquery');
require('jquery-sortable');
global.window.$ = $;
global.window.jQuery = $;