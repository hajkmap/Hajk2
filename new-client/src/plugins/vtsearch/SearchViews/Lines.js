import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  TextField,
  Button,
  Typography,
  Divider,
  Grid,
  FormControl
} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InactivePolygon from "../img/polygonmarkering.png";
import InactiveRectangle from "../img/rektangelmarkering.png";
import ActivePolygon from "../img/polygonmarkering-blue.png";
import ActiveRectangle from "../img/rektangelmarkering-blue.png";

// Define JSS styles that will be used in this component.
// Examle below utilizes the very powerful "theme" object
// that gives access to some constants, see: https://material-ui.com/customization/default-theme/

const styles = theme => ({
  searchButton: { marginTop: 8, borderColor: theme.palette.primary.main },
  divider: { margin: theme.spacing(3, 3) },
  textFields: { marginLeft: 10 },
  fontSize: { fontSize: 12 },
  polygonAndRectangle: {
    marginLeft: 10
  },
  firstMenuItem: { minHeight: 36 },
  searchButtonText: { color: theme.palette.primary.main }
});

//TODO - Only mockup //Tobias

class Lines extends React.PureComponent {
  // Initialize state - this is the correct way of doing it nowadays.
  state = {
    publicLineName: "",
    internalLineNumber: "",
    municipalities: [],
    municipalityName: "",
    trafficTransportNames: [],
    trafficTransportName: "",
    throughStopArea: "",
    isPolygonActive: false,
    isRectangleActive: false
  };

  // propTypes and defaultProps are static properties, declared
  // as high as possible within the component code. They should
  // be immediately visible to other devs reading the file,
  // since they serve as documentation.
  static propTypes = {
    model: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    localObserver: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    // If you're not using some of properties defined below, remove them from your code.
    // They are shown here for demonstration purposes only.
    super(props);
    this.model = this.props.model;
    this.localObserver = this.props.localObserver;
    this.globalObserver = this.props.app.globalObserver;
    this.model.fetchAllPossibleMunicipalityZoneNames().then(result => {
      this.setState({
        municipalities: result.length > 0 ? result : []
      });
      this.model.fetchAllPossibleTransportModeTypeName().then(result => {
        this.setState({
          trafficTransportNames: result.length > 0 ? result : []
        });
      });
    });
  }

  togglePolygonState = () => {
    this.setState({ isPolygonActive: !this.state.isPolygonActive }, () => {
      this.handlePolygonClick();
    });
  };
  toggleRectangleState = () => {
    this.setState({ isRectangleActive: !this.state.isRectangleActive }, () => {
      this.handleRectangleClick();
    });
  };

  /**
   * Method that in actives all search inputs and both spatial buttons.
   *
   * @memberof Lines
   */
  clearSearchInputAndButtons = () => {
    this.setState({ isPolygonActive: false, isRectangleActive: false });
    this.setState({
      publicLineName: "",
      internalLineNumber: "",
      municipalityName: "",
      trafficTransportName: "",
      throughStopArea: ""
    });
  };

  searchButtonClick = () => {
    const {
      publicLineName,
      internalLineNumber,
      municipalityName,
      trafficTransportName,
      throughStopArea
    } = this.state;
    this.localObserver.publish("routes-search", {
      publicLineName: publicLineName,
      internalLineNumber: internalLineNumber,
      municipalityName: municipalityName.gid,
      trafficTransportName: trafficTransportName,
      throughStopArea: throughStopArea,
      selectedFormType: "",
      searchCallback: this.clearSearchInputAndButtons
    });
  };

  handlePolygonClick = () => {
    const {
      publicLineName,
      internalLineNumber,
      municipalityName,
      trafficTransportName,
      throughStopArea
    } = this.state;
    this.localObserver.publish("routes-search", {
      publicLineName: publicLineName,
      internalLineNumber: internalLineNumber,
      municipalityName: municipalityName.gid,
      trafficTransportName: trafficTransportName,
      throughStopArea: throughStopArea,
      selectedFormType: "Polygon",
      searchCallback: this.clearSearchInputAndButtons
    });
  };
  handleRectangleClick = () => {
    const {
      publicLineName,
      internalLineNumber,
      municipalityName,
      trafficTransportName,
      throughStopArea
    } = this.state;
    this.localObserver.publish("routes-search", {
      publicLineName: publicLineName,
      internalLineNumber: internalLineNumber,
      municipalityName: municipalityName.gid,
      trafficTransportName: trafficTransportName,
      throughStopArea: throughStopArea,
      selectedFormType: "Box",
      searchCallback: this.clearSearchInputAndButtons
    });
  };

  handleInternalLineNrChange = event => {
    this.setState({
      internalLineNumber: event.target.value
    });
  };
  handlePublicLineNameChange = event => {
    this.setState({
      publicLineName: event.target.value
    });
  };
  handleMunicipalChange = e => {
    this.setState({
      municipalityName: e.target.value
    });
  };
  handleTrafficTransportChange = e => {
    this.setState({
      trafficTransportName: e.target.value
    });
  };
  handleThroughStopAreaChange = event => {
    this.setState({
      throughStopArea: event.target.value
    });
  };

  renderPublicAndTechnicalNrSection = () => {
    return (
      <>
        <Grid item xs={6}>
          <Typography variant="caption">PUBLIKT NR</Typography>
          <TextField
            id="standard-helperText"
            onChange={this.handlePublicLineNameChange}
            value={this.state.publicLineName}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption">TEKNISKT NR</Typography>
          <TextField
            id="standard-helperText"
            onChange={this.handleInternalLineNrChange}
            value={this.state.internalLineNumber}
          />
        </Grid>
      </>
    );
  };

  renderInputValueSection = () => {
    return (
      <Grid item xs={12}>
        <Typography variant="caption">VIA HÅLLPLATS</Typography>
        <TextField
          fullWidth
          id="standard-helperText"
          value={this.state.throughStopArea}
          onChange={this.handleThroughStopAreaChange}
        />
      </Grid>
    );
  };

  renderTrafficTypeSection = () => {
    const { trafficTransportNames } = this.state;
    return (
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Typography variant="caption">TRAFIKSLAG</Typography>
          <Select
            value={this.state.trafficTransportName}
            onChange={this.handleTrafficTransportChange}
          >
            {trafficTransportNames.map((name, index) => {
              return (
                <MenuItem key={index} value={name}>
                  {name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
    );
  };
  renderMunicipalitySection = () => {
    const { classes } = this.props;
    const { municipalities } = this.state;
    return (
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Typography variant="caption">KOMMUN</Typography>
          <Select
            value={this.state.municipalityName}
            onChange={this.handleMunicipalChange}
          >
            {municipalities.map((municipality, index) => {
              if (municipality.name === "") {
                return (
                  <MenuItem
                    className={classes.firstMenuItem}
                    key={index}
                    value={municipality}
                  >
                    <Typography>{municipality.name}</Typography>
                  </MenuItem>
                );
              } else {
                return (
                  <MenuItem key={index} value={municipality}>
                    <Typography>{municipality.name}</Typography>
                  </MenuItem>
                );
              }
            })}
          </Select>
        </FormControl>
      </Grid>
    );
  };

  renderSearchButtonSection = () => {
    const { classes } = this.props;
    return (
      <Grid item xs={12}>
        <Button
          className={classes.searchButton}
          onClick={this.searchButtonClick}
          variant="outlined"
        >
          <Typography className={classes.searchButtonText}>SÖK</Typography>
        </Button>
      </Grid>
    );
  };

  renderSpatialSearchSection = () => {
    const { classes } = this.props;
    return (
      <>
        <Grid item xs={12}>
          <Divider className={classes.divider} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">AVGRÄNSA SÖKOMRÅDE I KARTAN</Typography>
        </Grid>
        <Grid justify="center" container>
          <Grid item xs={4}>
            <div>
              <img
                src={
                  this.state.isPolygonActive ? ActivePolygon : InactivePolygon
                }
                onClick={this.togglePolygonState}
                value={this.state.selectedFormType}
                alt="#"
              ></img>
            </div>
            <Grid item xs={4}>
              <Typography variant="body2">POLYGON</Typography>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <div>
              <img
                src={
                  this.state.isRectangleActive
                    ? ActiveRectangle
                    : InactiveRectangle
                }
                onClick={this.toggleRectangleState}
                value={this.state.selectedFormType}
                alt="#"
              ></img>
            </div>
            <Grid item xs={4}>
              <Typography variant="body2">REKTANGEL</Typography>
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  };
  render() {
    return (
      <div>
        <Grid container justify="center" spacing={2}>
          {this.renderPublicAndTechnicalNrSection()}
          {this.renderInputValueSection()}
          {this.renderTrafficTypeSection()}
          {this.renderMunicipalitySection()}
          {this.renderSearchButtonSection()}
          {this.renderSpatialSearchSection()}
        </Grid>
      </div>
    );
  }
}

// Exporting like this adds some props to DummyView.
// withStyles will add a 'classes' prop, while withSnackbar
// adds to functions (enqueueSnackbar() and closeSnackbar())
// that can be used throughout the Component.
export default withStyles(styles)(Lines);
