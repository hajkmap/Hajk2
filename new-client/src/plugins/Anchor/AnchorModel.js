import { isValidLayerId } from "../../utils/Validator";
class AnchorModel {
  constructor(settings) {
    this.app = settings.app;
    this.getCleanUrl = settings.getCleanUrl;
    this.cqlFilters = {};
    this.map = settings.map;
    this.localObserver = settings.localObserver;

    this.map.getView().on("change", this.update);

    this.map
      .getLayers()
      .getArray()
      .forEach((layer) => {
        // Grab an unique ID for each layer, we'll need this to save CQL filter value for each layer
        const layerId = layer.get("name");

        // Update anchor each time layer visibility changes (to reflect current visible layers)
        layer.on("change:visible", (event) => {
          this.localObserver.publish("mapUpdated", this.getAnchor());
        });

        // Update anchor each time an underlying Source changes in some way (could be new CQL params, for example).
        layer.getSource().on("change", ({ target }) => {
          if (typeof target.getParams !== "function") return;

          // Update CQL filters only if a real value exists
          const cqlFilterForCurrentLayer = target.getParams()?.CQL_FILTER;
          if (
            cqlFilterForCurrentLayer !== null &&
            cqlFilterForCurrentLayer !== undefined
          ) {
            this.cqlFilters[layerId] = cqlFilterForCurrentLayer;
          }

          // Publish the event
          this.localObserver.publish("mapUpdated", this.getAnchor());
        });
      });
  }

  update = (e) => {
    // If view is still animating, postpone updating Anchor
    e.target.getAnimating() === false &&
      this.localObserver.publish("mapUpdated", this.getAnchor());
  };

  getMap() {
    return this.map;
  }

  getVisibleLayers() {
    return this.map
      .getLayers()
      .getArray()
      .filter((layer) => {
        return (
          // We consider a layer to be visible only if…
          layer.getVisible() && // …it's visible…
          layer.getProperties().name &&
          isValidLayerId(layer.getProperties().name) // …has a specified name property…
        );
      })
      .map((layer) => layer.getProperties().name)
      .join(",");
  }

  getAnchor() {
    // Read some "optional" values so we have them prepared.
    // If some conditions aren't met, we won't add them to the
    // anchor string, in order to keep the string short.
    const q = document.getElementById("searchInputField")?.value.trim() || "";
    const f = this.cqlFilters;
    const clean = this.getCleanUrl();

    // Split current URL on the "?" and just get the first part. This
    // way we'll get rid of any unwanted search params, without messing
    // up the remaining portion of URL (protocol, host, path, hash).
    const url = new URL(document.location.href.split("?")[0]);

    // The following params are always appended
    url.searchParams.append("m", this.app.config.activeMap);
    url.searchParams.append("x", this.map.getView().getCenter()[0]);
    url.searchParams.append("y", this.map.getView().getCenter()[1]);
    url.searchParams.append("z", this.map.getView().getZoom());
    url.searchParams.append("l", this.getVisibleLayers());

    // Optionally, append those too:
    // Only add 'clean' if the value is true
    clean === true && url.searchParams.append("clean", clean);
    // Only add 'f' if it isn't an empty object
    Object.keys(f).length > 0 &&
      url.searchParams.append("f", JSON.stringify(f));
    // Only add 'q' if it isn't empty
    q.length > 0 && url.searchParams.append("q", q);

    return url.toString();
  }
}

export default AnchorModel;
