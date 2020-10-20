import React from "react";
import cslx from "clsx";
import FeaturePropsParsing from "../../components/FeatureInfo/FeaturePropsParsing";
import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableContainer,
  Typography,
} from "@material-ui/core";

const styles = () => ({
  hidden: {
    display: "none",
  },
  tableCell: {
    paddingLeft: 0,
    wordBreak: "break-all",
  },
  customDetailsHtmlTypography: {
    overflow: "hidden",
  },
  showMoreInformationButton: {
    width: "100%",
  },
});

class SearchResultsDatasetFeature extends React.PureComponent {
  state = {
    visibleFeatureInfo: null,
    hiddenFeatureInfo: null,
  };

  constructor(props) {
    super(props);

    this.featurePropsParsing = new FeaturePropsParsing({
      globalObserver: props.app.globalObserver,
    });
  }

  componentDidMount = () => {
    const { feature, source } = this.props;
    if (this.shouldRenderCustomInfoBox()) {
      this.getHtmlItemInfoBox(feature, source.infobox);
    }
  };

  renderTableCell = (content, position) => {
    const { classes } = this.props;
    const textToRender = Array.isArray(content) ? content.join(", ") : content;
    return (
      <TableCell align={position} className={classes.tableCell}>
        {textToRender}
      </TableCell>
    );
  };

  getHtmlSections = (renderedHtml) => {
    let visibleFeatureInfo = renderedHtml[0].props.children.find((child) => {
      return child.props && child.props.hasOwnProperty("data-visible");
    });

    let hiddenFeatureInfo = renderedHtml[0].props.children.find((child) => {
      return child.props && child.props.hasOwnProperty("data-hidden");
    });

    return {
      visibleFeatureInfo: visibleFeatureInfo
        ? visibleFeatureInfo.props.children
        : "",
      hiddenFeatureInfo: hiddenFeatureInfo
        ? hiddenFeatureInfo.props.children
        : "",
    };
  };

  getHtmlItemInfoBox = (feature, infoBox) => {
    feature.properties = this.featurePropsParsing.extractPropertiesFromJson(
      feature.properties
    );
    this.featurePropsParsing
      .mergeFeaturePropsWithMarkdown(infoBox, feature.properties)
      .then((featureInfo) => {
        const { visibleFeatureInfo, hiddenFeatureInfo } = this.getHtmlSections(
          featureInfo
        );
        this.setState({
          visibleFeatureInfo: visibleFeatureInfo,
          hiddenFeatureInfo: hiddenFeatureInfo,
        });
      });
  };

  getFeatureTitle = () => {
    const { feature, source } = this.props;

    return source.displayFields.reduce((featureTitleString, df) => {
      let displayField = feature.properties[df];
      if (Array.isArray(displayField)) {
        displayField = displayField.join(", ");
      }

      if (displayField) {
        if (featureTitleString.length > 0) {
          featureTitleString = featureTitleString.concat(` | ${displayField}`);
        } else {
          featureTitleString = displayField;
        }
      }

      return featureTitleString;
    }, "");
  };

  renderHiddenSection = () => {
    if (this.state.hiddenFeatureInfo) {
      return this.state.hiddenFeatureInfo.map((element, index) => {
        if (typeof element == "string") {
          return <Typography key={index}>{element}</Typography>;
        }
        return <React.Fragment key={index}>{element}</React.Fragment>;
      });
    }

    return this.state.hiddenFeatureInfo;
  };

  renderVisibleSection = () => {
    if (this.state.visibleFeatureInfo) {
      return this.state.visibleFeatureInfo.map((element, index) => {
        if (typeof element == "string") {
          return <Typography key={index}>{element}</Typography>;
        }
        return <React.Fragment key={index}>{element}</React.Fragment>;
      });
    }

    return this.state.visibleFeatureInfo;
  };

  renderDefaultInfoBoxTable = () => {
    const { feature, classes, showAllInformation } = this.props;

    return Object.entries(feature.properties).map((row, index) => {
      return (
        <TableBody key={index}>
          <TableRow
            className={cslx(
              !showAllInformation && index >= 2 ? classes.hidden : null
            )}
            key={row[0]}
          >
            {this.renderTableCell(row[0])}
            {this.renderTableCell(row[1], "right")}
          </TableRow>
        </TableBody>
      );
    });
  };

  renderCustomInfoBoxTable = () => {
    const { showAllInformation } = this.props;

    return (
      <>
        {this.renderVisibleSection()}
        {showAllInformation && this.renderHiddenSection()}
      </>
    );
  };

  shouldRenderCustomInfoBox = () => {
    const { source } = this.props;
    return (
      source.infobox &&
      source.infobox !== "" &&
      source.infobox.search("<section data-visible>") !== -1
    );
  };

  renderDetailsTitle = () => {
    const { classes } = this.props;
    return (
      <TableHead>
        <TableRow>
          <TableCell colSpan="6" variant="head" className={classes.tableCell}>
            <Typography variant="subtitle1" align="left">
              {this.getFeatureTitle()}
            </Typography>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  render() {
    if (this.shouldRenderCustomInfoBox()) {
      return (
        <>
          <Typography variant="subtitle1" align="left">
            {this.getFeatureTitle()}
          </Typography>
          {this.renderCustomInfoBoxTable()}
        </>
      );
    } else {
      return (
        <>
          <TableContainer>
            <Table size={"small"}>
              {this.renderDetailsTitle()}
              {this.renderDefaultInfoBoxTable()}
            </Table>
          </TableContainer>
        </>
      );
    }
  }
}
export default withStyles(styles)(SearchResultsDatasetFeature);