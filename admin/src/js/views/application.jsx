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

const Alert = require('views/alert');

var defaultState = {
  alert: false,
  corfirm: false,
  alertMessage: "",
  content: "",
  confirmAction: () => {},
  denyAction: () => {}
};
/**
 *
 */
class Application extends React.Component {
  /**
   *
   */
  constructor() {
    super();
    this.state = defaultState;
  }
  /**
   *
   */
  componentDidMount () {
    this.setState({
      content: this.props.model.get('content')
    });

    this.props.model.on('change:content', () => {
      this.setState({
        content: this.props.model.get('content')
      });
    });
  }
  /**
   *
   */
  resetAlert() {
    this.setState({
      alert: false,
      alertMessage: ""
    });
  }
  /**
   *
   */
  getAlertOptions() {
    return {
      visible: this.state.alert,
      message: this.state.alertMessage,
      confirm: this.state.confirm,
      confirmAction: () => {
        this.state.confirmAction();
        this.setState({
          alert: false,
          confirm: false,
          alertMessage: ""
        })
      },
      denyAction: () => {
        this.state.denyAction();
        this.setState({
          alert: false,
          confirm: false,
          alertMessage: ""
        })
      },
      onClick: () => {
        this.setState({
          alert: false,
          alertMessage: ""
        })
      }
    };
  }
  /**
   *
   */
  renderTabs() {
    if (!this.state) return null;

    var tabs = this.props.tabs;

    return tabs.map((item, i) =>  {
      var anchor = "#!/" + item.name
      ,   active = this.state.content === item.name ? "active" : "";
      return (
        <li className={active} key={i}>
          <a href={anchor}>{item.title}</a>
        </li>
      );
    });
  }
  /**
   *
   */
  renderContent() {
    if (!this.state || !this.state.content) return null;

    var content = null;
    var model = null;

    try {
      content = require("views/" + this.state.content);
      model = require("models/" + this.state.content);
    }
    catch (e) {
      console.error(e);
      return (<div>{e.message}</div>);
    }
    return React.createElement(content, {
      model: model,
      config: this.props.config[this.state.content],
      application: this
    });
  }
  /**
   *
   */
  render() {
    var content = this.renderContent();
    var tabs = this.renderTabs();
    return (
      <main>
        <Alert options={this.getAlertOptions()}/>
        <nav>
          <ul className="nav nav-tabs">
            {tabs}
          </ul>
        </nav>
        <section className="tab-content">
          {content}
        </section>
      </main>
    );
  }

}

module.exports = Application;