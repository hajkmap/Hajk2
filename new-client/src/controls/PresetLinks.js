import React from "react";
import { createPortal } from "react-dom";
import { withStyles } from "@material-ui/core/styles";
import propTypes from "prop-types";

import { Button, Paper, Tooltip, Menu, MenuItem } from "@material-ui/core";
import Bookmarks from "@material-ui/icons/Bookmarks";

import Dialog from "../components/Dialog.js";

const styles = theme => {
  return {
    paper: {
      marginBottom: theme.spacing(1)
    },
    button: {
      minWidth: "unset"
    }
  };
};

class Preset extends React.PureComponent {
  static propTypes = {
    classes: propTypes.object.isRequired,
    appModel: propTypes.object.isRequired
  };

  state = {
    dialogOpen: false,
    view: null,
    location: null,
    zoom: null
  };

  constructor(props) {
    super(props);
    this.type = "Preset"; // Special case - plugins that don't use BaseWindowPlugin must specify .type here
    this.config = props.appModel.config.mapConfig.tools.find(
      t => t.type === "preset"
    );

    this.appModel = props.appModel;

    // If config wasn't found, it means that Preset is not configured. Quit.
    if (this.config === undefined) return null;

    // Else, if we're still here, go on.
    this.options = this.config.options;
    this.map = props.appModel.getMap();
    this.title = this.options.title || "Snabbval";
  }

  // Show dropdown menu, anchored to the element clicked
  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleItemClick = (event, item) => {
    let url = item.presetUrl.toLowerCase();
    if (url.includes("x=") && url.includes("y=") && url.includes("z=")) {
      this.handleClose(); // Ensure that popup menu is closed
      let url = item.presetUrl.split("&");
      let x = url[1].substring(2);
      let y = url[2].substring(2);
      let z = url[3].substring(2);
      let l = url[4]?.substring(2);

      const view = this.map.getView();
      let location = [x, y];
      let zoom = z;

      if (l) {
        this.setState({
          view: view,
          location: location,
          zoom: zoom
        });
        this.openDialog();
      } else {
        this.flyTo(view, location, zoom);
      }
    } else {
      this.props.enqueueSnackbar(
        "Länken till platsen är tyvärr felaktig. Kontakta administratören av karttjänsten för att åtgärda felet.",
        {
          variant: "warning"
        }
      );
      console.error(
        "Fel i verktyget Snabbval. Länken til : \n" +
          item.name +
          "\n" +
          item.presetUrl +
          "\när tyvärr felaktig. Någon av följande parametrar saknas: &x=, &y=, &z= eller innehåller fel."
      );
    }
  };

  renderMenuItems = () => {
    let menuItems = [];
    this.options.presetList.forEach((item, index) => {
      menuItems.push(
        <MenuItem
          key={index}
          onClick={event => this.handleItemClick(event, item)}
        >
          {item.name}
        </MenuItem>
      );
    });
    return menuItems;
  };

  flyTo(view, location, zoom) {
    view.animate({
      center: location,
      zoom: zoom
    });
  }

  openDialog = () => {
    this.setState({
      dialogOpen: true
    });
  };

  closeDialog = () => {
    this.setState({
      dialogOpen: false
    });
    this.appModel.clear();
    this.flyTo(this.state.view, this.state.location, this.state.zoom);
  };

  abortDialog = () => {
    this.setState({
      dialogOpen: false
    });
  };

  renderDialog() {
    if (this.state.dialogOpen) {
      return createPortal(
        <Dialog
          options={{
            text: "Alla lager i kartan kommer nu att släckas.",
            headerText: "Visa snabbval",
            buttonText: "OK",
            abortText: "Avbryt"
          }}
          open={this.state.dialogOpen}
          onClose={this.closeDialog}
          onAbort={this.abortDialog}
        />,
        document.getElementById("windows-container")
      );
    } else {
      return null;
    }
  }

  render() {
    // If config for Control isn't found, or if the config doesn't contain any presets, quit.
    if (
      this.config === undefined ||
      (this.config.hasOwnProperty("options") &&
        this.config.options.presetList.length < 1)
    ) {
      return null;
    } else {
      const { anchorEl } = this.state;
      const { classes } = this.props;
      const open = Boolean(anchorEl);
      return (
        <>
          <Tooltip title={this.title}>
            <Paper className={classes.paper}>
              <Button
                aria-label={this.title}
                className={classes.button}
                onClick={this.handleClick}
              >
                <Bookmarks />
              </Button>
            </Paper>
          </Tooltip>
          <Menu
            id="render-props-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={this.handleClose}
          >
            {this.renderMenuItems()}
          </Menu>
          {this.renderDialog()}
        </>
      );
    }
  }
}

export default withStyles(styles)(Preset);
