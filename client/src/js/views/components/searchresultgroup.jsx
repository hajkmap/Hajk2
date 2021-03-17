// Copyright (C) 2016 Göteborgs Stad
//
// Denna programvara är fri mjukvara: den är tillåten att distribuera och modifiera
// under villkoren för licensen CC-BY-NC-SA 4.0.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the CC-BY-NC-SA 4.0 licence.
//
// http://creativecommons.org/licenses/by-nc-sa/4.0/
//
// Det är fritt att dela och anpassa programvaran för valfritt syfte
// med förbehåll att följande villkor följs:
// * Copyright till upphovsmannen inte modifieras.
// * Programvaran används i icke-kommersiellt syfte.
// * Licenstypen inte modifieras.
//
// Den här programvaran är öppen i syfte att den skall vara till nytta för andra
// men UTAN NÅGRA GARANTIER; även utan underförstådd garanti för
// SÄLJBARHET eller LÄMPLIGHET FÖR ETT VISST SYFTE.
//
// https://github.com/hajkmap/Hajk

var shiftIsDown = false;
var ctrlIsDown = false;

window.onkeydown = (e) => {
  shiftIsDown = e.shiftKey;
  ctrlIsDown = e.ctrlKey;
};

window.onkeyup = (e) => {
  shiftIsDown = e.shiftKey;
  ctrlIsDown = e.ctrlKey;
};

/**
 * @class
 */
SearchResultGroup = {

  getInitialState: function () {
    return {
      activeClass: null,
      showInfobox: false
    };
  },

  componentDidMount: function () {
    var groups = $(ReactDOM.findDOMNode(this)).find('.group');

    groups.click(function () {
      $(this).next().toggleClass('hidden');
    });

    if (Array.isArray(this.props.model.get('selectedIndices'))) {
      _.each(groups, group => {
        var items = this.props.model.get('selectedIndices').filter(item => group.id === item.group);
        if (items.length > 0) {
          items.forEach(item => {
            var nth = item.index + 1,
              elem = $(group).next().find('div:nth-child(' + nth + ')');

            //elem.addClass('selected');
          });
        }
      });
    }
  },

  handleClick: function (hit, index, event) {
    var element = $(event.target),
      parent = $(ReactDOM.findDOMNode(this)),
      group = parent.find('.group');

      this.setState({
        activeClass: index
      });

      var currentId = 'hit-' + index + '-' + group[0].id;
      var infoboxId = 'hit-' + index + '-' + group[0].id + '-infobox';

      if ($("#"+currentId).next('#'+infoboxId).length == 0) {
        if (event.target.className == "fa fa-angle-down") {
          $("#"+currentId).addClass("show-infobox");
          $(event.target).removeClass("fa fa-angle-down");
          $(event.target).addClass("fa fa-angle-up");

          $('<div id='+infoboxId+' class="infobox-text"></div>').insertAfter($("#"+currentId));
        }
      } else if (event.target.className == "fa fa-angle-up") {
          $("#"+currentId).removeClass("show-infobox");
          $(event.target).removeClass("fa fa-angle-up");
          $(event.target).addClass("fa fa-angle-down");

         $("#"+infoboxId).remove();
      }

    var item = {
      index: index,
      hits: this.props.result.hits,
      hit: hit,
      id: group[0].id
    };

    if (shiftIsDown) {
      let topIndex = 0;
      let items = [];
      let i;

      parent.find('.selected').each(function (e, i) {
        topIndex = $(this).attr('data-index');
      });

      i = topIndex;

      for (; i <= index; i++) {
        items.push({
          index: i,
          hits: this.props.result.hits,
          hit: this.props.result.hits[i],
          id: group[0].id
        });
      }

      //items.forEach(item => {
      //  this.props.model.append(item);
      //  parent.find(`div[data-index=${item.index}]`).addClass('selected');
      //});
    } else if (ctrlIsDown) {
      //if (element.hasClass('selected')) {
      //  this.props.model.detach(item);
      //} else {
      //  this.props.model.append(item);
      //}
    } else {
      //$('.search-results').find('.selected').each(function (e) {
      //  $(this).removeClass('selected');
      //});
      this.props.model.focus(item, this.props.isBar == 'yes');
      this.props.model.focusInfobox(item, this.props.isBar == 'yes');
    }

    //if (!shiftIsDown) {
    //  if (element.hasClass('selected')) { element.removeClass('selected'); } else { element.addClass('selected'); }
    //}

    if (isMobile) {
      if (this.props.parentView) {
        if (this.props.parentView.props.navigationPanel) {
          this.props.parentView.props.navigationPanel.minimize();
        }
      }
    }

    if(this.props.model.get("moveablePopup")) {
      // Make the popup moveable
      const ovl = this.props.model.get('map').getOverlayById('popup-0');

      //moveablePopup - if popup is set to moveable, make it moveable.
      //if(this.get("moveablePopup")){
      this.makeMoveable(this.props.model.get('map'), ovl);
      //}
    }
  },

  makeMoveable: function(map, overlay) {
    //clear attributes from previous popup moves.
    if (this.props.model.get('originalDownPosition')) {this.props.model.unset('originalDownPosition')};
    if (this.props.model.get('originalOverlayPosition')) {this.props.model.unset('originalOverlayPosition')};
    if (this.props.model.get('movedOverlayPosition')) {this.props.model.unset('movedOverlayPosition')};
    const element = overlay.getElement();
    const viewport = map.getViewport();


    this.props.model.set('moveListener', this.movePopup).bind(this);
    this.props.model.set('endMoveListener', this.endMovePopup).bind(this);

    element.addEventListener('mousedown', function (event) {
      this.props.model.set('originalDownPosition', this.props.model.get('map').getEventCoordinate(event));
      this.props.model.set('originalOverlayPosition', overlay.getPosition());

      if (event.target === element) { //don't want events on children such as popup-content.
        viewport.addEventListener('mousemove', this.props.model.get('moveListener'));
        viewport.addEventListener('mouseup', this.props.model.get('endMoveListener'));
      }
    }.bind(this));
  },

  movePopup: function(event) {
    const originalClickedPosition = this.props.model.get('originalDownPosition');
    const originalOverlayPosition = this.props.model.get('originalOverlayPosition');

    const originalClickedX = originalClickedPosition[0];
    const originalClickedY = originalClickedPosition[1];

    //work out the changes to the original clicked position.
    var currentX = this.props.model.get('map').getEventCoordinate(event)[0];
    var currentY = this.props.model.get('map').getEventCoordinate(event)[1];

    var xChange = originalClickedX - currentX;
    var yChange = originalClickedY - currentY;

    //apply these changes to the popup position.
    var overlayX = originalOverlayPosition[0];
    var overlayY = originalOverlayPosition[1];

    newPopupX = overlayX - xChange;
    newPopupY = overlayY - yChange;
    var newOverlayPosition  = [newPopupX, newPopupY];

    //set the new popup position.
    overlay.setPosition(newOverlayPosition);
  },

  endMovePopup: function(event) {
    this.removePopupListeners();
    this.props.model.set("movedOverlayPosition", this.props.model.get('map').getOverlayById("popup-0").getPosition());
  },

  removePopupListeners: function() {
    this.props.model.get('map').getViewport().removeEventListener('mousemove', this.props.model.get('moveListener'));
    this.props.model.get('map').getViewport().removeEventListener('mouseup', this.props.model.get('endMoveListener'));
  },

  render: function () {
    var id = this.props.id,
      groupStyleClass = this.props.numGroups === 1 ? '' : 'hidden'
    ;

    var isActive = (index) => {
      return this.state.activeClass === index ? 'selected' : '';
    };

    return (
      <div>
        <div className='group' id={this.props.id}>{this.props.result.layer}
          <span className='label'>{this.props.result.hits.length}</span>
        </div>
        <div className={groupStyleClass}>
          {
            this.props.result.hits.map((hit, i) => {
              function getTitle (property) {
                if (Array.isArray(property)) {
                  return property.map(item => hit.getProperties()[item]).join(', ');
                } else {
                  return hit.getProperties()[property] || property;
                }
              }
              var hitId = 'hit-' + i + '-' + id,
                title = getTitle(this.props.result.displayName),
                index = i
              ;
              return (
                <div id={hitId} className={isActive(index)} key={hitId} index={i} data-index={i} onClick={this.handleClick.bind(this, hit, i)}>
                  {title}
                  <span className='clickable pull-right' title='Dölj info' style={{ position: 'relative', marginRight: '14px' }}>
                    <i className='fa fa-angle-down' style={{ fontSize: '18px' }} />
                  </span>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
};

module.exports = React.createClass(SearchResultGroup);