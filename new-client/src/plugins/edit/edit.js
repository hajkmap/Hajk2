import React, { Component } from "react";
import { createPortal } from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";

import Panel from "../../components/Panel.js";
import EditView from "./EditView.js";
import EditModel from "./EditModel.js";
import Observer from "react-event-observer";

const styles = theme => {
  return {};
};

class Edit extends Component {
  state = {
    panelOpen: false
  };

  onClick = e => {
    this.app.onPanelOpen(this);
    this.setState({
      panelOpen: true
    });
  };

  closePanel = () => {
    this.setState({
      panelOpen: false
    });
  };

  constructor(spec) {
    super(spec);
    this.text = "Redigera";
    this.app = spec.app;
    this.observer = Observer();
    this.observer.subscribe("myEvent", message => {
      console.log(message);
    });
    this.editModel = new EditModel({
      map: spec.map,
      app: spec.app,
      observer: this.observer
    });
    this.app.registerPanel(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.panelOpen !== nextState.panelOpen;
  }

  componentDidMount() {
    this.setState({
      panelOpen: this.props.options.visibleAtStart
    });
  }

  renderPanel() {
    return createPortal(
      <Panel
        title={this.text}
        onClose={this.closePanel}
        position="left"
        open={this.state.panelOpen}
      >
        <EditView
          app={this.app}
          map={this.map}
          parent={this}
          observer={this.observer}
        />
      </Panel>,
      document.getElementById("map-overlay")
    );
  }

  renderAsWidgetItem() {
    const { classes } = this.props;
    return (
      <div>
        <Button
          variant="fab"
          color="default"
          aria-label="Editeringsverktyg"
          className={classes.button}
          onClick={this.onClick}
        >
          <EditIcon />
        </Button>
        {this.renderPanel()}
      </div>
    );
  }

  renderAsToolbarItem() {
    return (
      <div>
        <ListItem
          button
          divider={true}
          selected={this.state.panelOpen}
          onClick={this.onClick}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={this.text} />
        </ListItem>
        {this.renderPanel()}
      </div>
    );
  }

  render() {
    if (this.props.type === "toolbarItem") {
      return this.renderAsToolbarItem();
    }

    if (this.props.type === "widgetItem") {
      return this.renderAsWidgetItem();
    }

    return null;
  }
}

export default withStyles(styles)(Edit);
