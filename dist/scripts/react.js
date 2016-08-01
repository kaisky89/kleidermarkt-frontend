var apiRoot = "http://api.kleidermarkt-gummersbach.de";

var apiPoints = {
  babySum: apiRoot+"/baby/free-sum.php",
  verkaeuferSum: apiRoot+"/verkaeufer/free-sum.php"
}


var BadgeButtonModule = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();
  },

  render: function () {

    return (
      <span className="km-button-badge mdl-badge" data-badge={this.props.badge}>
        <button className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">{this.props.children}</button>
      </span>
    );
  }

});

var WelcomeSite = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();
    $.getJSON(this.props.apiPoints.babySum, function(data){this.updateBaby(data.sum)}.bind(this));
    $.getJSON(this.props.apiPoints.verkaeuferSum, function(data){this.updateVerkaeufer(data.sum)}.bind(this));
  },

  updateVerkaeufer: function (nr) {
    this.setState({'verkaeufer': nr});
  },

  updateBaby: function (nr) {
    this.setState({'baby': nr});
  },

  getInitialState: function () {
    return {
      "verkaeufer": "??",
      "baby": "??"
    };
  },

  render: function() {
    return (

      <div className="mdl-layout mdl-js-layout">
        <header />
        <main className="km-layout mdl-layout__content">
          <div className="km-card mdl-card mdl-shadow--2dp">
            <div className="km-card__title mdl-card__title">
              <h2 className="mdl-card__title-text">Willkommen</h2></div>
            <div className="mdl-card__supporting-text">Diese kleine Website soll dir helfen, ohne große Umstände und besetzte Telefonleitungen deine Verkäufernummer für den Kinderkleidermarkt in Gummersbach zu ziehen.</div>
            <div className="km-card__actions mdl-card__actions mdl-card--border">
              <BadgeButtonModule badge={this.state.verkaeufer}>Verkäufernummer</BadgeButtonModule>
              <BadgeButtonModule badge={this.state.baby}>Babynummer</BadgeButtonModule>
            </div>
            <div className="mdl-card__menu" />
          </div>
        </main>
      </div>
    );
  }

});

var ReactApp = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();
  },

  getInitialState: function () {
    return {
      currentSite: <WelcomeSite apiPoints={apiPoints} />
    }
  },

  goTo: function (sitename, options) {
    var goToSite;
    switch (sitename) {
      case "WelcomeSite":
        goToSite = <WelcomeSite apiPoints={apiPoints} options={options} />
        break;
      default:
        goToSite = <WelcomeSite apiPoints={apiPoints} options={options} />
    }

    this.setState({
      currentSite: goToSite
    });

  },

  render: function () {
    return (
      <div id="my-react-root">
        {this.state.currentSite}
      </div>
    );
  }
});

ReactDOM.render(
  <ReactApp
    apiPoints={apiPoints}
  />,
  document.getElementById('react-container')
);
