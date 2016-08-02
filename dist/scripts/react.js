var apiRoot = "http://api.kleidermarkt-gummersbach.de";

var apiPoints = {
  babySum: apiRoot+"/baby/free-sum.php",
  verkaeuferSum: apiRoot+"/verkaeufer/free-sum.php",
  conditions: apiRoot+"/data/conditions.php",
  reservation: {
    baby: apiRoot+"/baby/reservation.php",
    verkaeufer: apiRoot+"/verkaeufer/reservation.php"
  }
};

var options = {
  ajaxPullTime: 5000
};

// datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
Date.dateDiff = function(datepart, fromdate, todate) {
  datepart = datepart.toLowerCase();
  var diff = todate - fromdate;
  var divideBy = { w:604800000,
                  d:86400000,
                  h:3600000,
                  n:60000,
                  s:1000 };

  return Math.floor( diff/divideBy[datepart]);
}

var Spinner = React.createClass({
  render: function () {
    return (
      <div style={this.props.styling}>
        <div className="mdl-spinner mdl-js-spinner is-active"></div>
      </div>
    );
  }
});

var BadgeButtonModule = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();
  },

  render: function () {
    if (this.props.badge == null) {
      return <Spinner styling={{
        width: '100px',
        display: 'inline-block'
      }} />;
    }

    return (
      <span className="km-button-badge mdl-badge" data-badge={this.props.badge}>
        <button
          onClick={function () {
            this.props.functions.setNrType(this.props.nrType);
            this.props.functions.goTo(this.props.goToSite);
          }.bind(this)}
          className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
        >
          {this.props.name}
        </button>
      </span>
    );
  }

});

var Timer = React.createClass({

  getInitialState: function () {
    return {s: 0, m: 0};
  },

  componentDidMount: function () {
    this.updateTime();
    this.timerInterval = setInterval(this.updateTime, 1000);
  },

  componentWillUnmount: function () {
    clearInterval(this.timerInterval);
  },

  updateTime: function () {
    var otherDay= new Date(this.props.unixTime*1000);
    var today= new Date();
    var s = Date.dateDiff('s', today, otherDay) % 60;
    var m = Date.dateDiff('n', today, otherDay);
    if (s < 0) {
      s = 0;
    }
    if (m < 0) {
      m = 0;
    }
    this.setState({s: s, m: m});
  },

  render: function () {

    var content = <span>{this.state.m}m {this.state.s}s</span>;

    if (this.state.m == 0 && this.state.s == 0) {
      content = <span>Abgelaufen</span>;
    }

    return content;
  }

})

var WelcomeSite = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  componentWillUnmount: function () {
    clearInterval(this.timerBaby);
    clearInterval(this.timerVerkaeufer);
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();
    this.refreshBaby();
    this.refreshVerkaeufer();

    this.timerBaby = setInterval(this.refreshBaby, options.ajaxPullTime);
    this.timerVerkaeufer = setInterval(this.refreshVerkaeufer, options.ajaxPullTime);
  },

  refreshBaby: function () {
    $.getJSON(this.props.apiPoints.babySum, function(data){this.updateBaby(data.sum)}.bind(this));
  },

  refreshVerkaeufer: function () {
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
      "verkaeufer": null,
      "baby": null
    };
  },

  render: function() {
    return (

      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Willkommen</h2></div>
              <div className="mdl-card__supporting-text">Diese kleine Website soll dir helfen, ohne große Umstände und besetzte Telefonleitungen deine Verkäufernummer für den Kinderkleidermarkt in Gummersbach zu ziehen.</div>
              <div className="km-card__actions mdl-card__actions mdl-card--border">
                <BadgeButtonModule
                  name="Verkäufernummer"
                  badge={this.state.verkaeufer}
                  functions={this.props.functions}
                  goToSite="ConditionsSite"
                  nrType="verkaeufer"
                />
                <BadgeButtonModule
                  name="Babynummer"
                  badge={this.state.baby}
                  functions={this.props.functions}
                  goToSite="ConditionsSite"
                  nrType="baby"
                />
              </div>
              <div className="mdl-card__menu" />
            </div>
          </main>
        </div>
      </div>
    );
  }

});

var ConditionsSite = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();

    // get Conditions
    $.get(this.props.apiPoints.conditions, function(data){
      this.setState({
        conditions: data,
        gotConditions: true
      });
    }.bind(this));

    // post Reservation
    $.post(
      this.props.apiPoints.reservation[this.props.functions.getNrType()],
      function (data) {
        this.props.functions.setNr(data.nr);
        this.props.functions.setReservationTime(data.reservation);
        this.setState({sessionTime: <Timer unixTime={this.props.functions.getReservationTime()} />});
      }.bind(this)
    );

  },

  getInitialState: function () {
    return {
      sessionTime: <Spinner styling={{display: 'inline'}} />,
      conditions: <Spinner styling={{
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto'
      }} />,
      gotConditions: false
    }
  },

  conditionsRaw: function () {
    if (this.state.gotConditions) {
      return { __html: this.state.conditions };
    }

    return this.state.conditions;
  },

  acceptAndNext: function () {
    this.props.functions.goTo('DataSite');
  },

  render: function() {
    var conditions = this.state.conditions;
    if (this.state.gotConditions) {
      conditions = <div dangerouslySetInnerHTML={this.conditionsRaw()}></div>
    }
    return (

      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Verkäuferinformationen</h2></div>
              <div className="mdl-card__supporting-text">{conditions}</div>
              <div className="km-card__actions mdl-card__actions mdl-card--border">
                <button onClick={this.acceptAndNext} className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Akzeptieren und weiter</button>
              </div>
              <div className="km-card__menu mdl-card__menu">
                <div className="km-timer"><i className="material-icons">timer</i> Sitzung endet: <span className="km-timer__time">{this.state.sessionTime}</span></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
});

var DataSite = React.createClass({
  render: function () {

  }
})

var ReactApp = React.createClass({

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  },

  getFunctions: function () {
    return {
      goTo: this.goTo,
      setNrType: this.setNrType,
      getNrType: this.getNrType,
      getNr: this.getNr,
      setNr: this.setNr,
      getReservationTime: this.getReservationTime,
      setReservationTime: this.setReservationTime
    };
  },

  componentDidMount: function () {
    componentHandler.upgradeDom();
  },

  getInitialState: function () {
    var functions = this.getFunctions();
    return {
      currentSite: <WelcomeSite apiPoints={apiPoints} options={options} functions={functions} />,
      nrType: null,
      nr: null,
      reservationTime: null
    }
  },

  setNrType: function (nrType) {
    this.setState({nrType: nrType});
  },

  getNrType: function () {
    return this.state.nrType;
  },

  setNr: function (nr) {
    this.setState({nr: nr});
  },

  getNr: function () {
    return this.state.nr;
  },

  setReservationTime: function (reservationTime) {
    this.setState({reservationTime: reservationTime});
  },

  getReservationTime: function () {
    return this.state.reservationTime;
  },

  goTo: function (sitename) {
    var goToSite;
    var functions = this.getFunctions();
    switch (sitename) {
      case "WelcomeSite":
        goToSite = <WelcomeSite apiPoints={apiPoints} options={options} functions={functions} />
        break;
      case "ConditionsSite":
        goToSite = <ConditionsSite apiPoints={apiPoints} options={options} functions={functions} />
        break;
      case "DataSite":
        goToSite = <DataSite apiPoints={apiPoints} options={options} functions={functions} />
        break;
      default:
        goToSite = <WelcomeSite apiPoints={apiPoints} options={options} functions={functions} />
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
