var apiRoot = "//api.kleidermarkt-gummersbach.de";

var apiPoints = {
  babySum: apiRoot+"/baby/free-sum.php",
  verkaeuferSum: apiRoot+"/verkaeufer/free-sum.php",
  conditions: apiRoot+"/data/conditions.php",
  introText: apiRoot+"/data/intro.php",
  reservation: {
    baby: apiRoot+"/baby/reservation.php",
    verkaeufer: apiRoot+"/verkaeufer/reservation.php"
  },
  postData: {
    baby: apiRoot+"/baby/",
    verkaeufer: apiRoot+"/verkaeufer/"
  }
};

var options = {
  ajaxPullTime: 5000,
  supportEmail: 'verkaufsnummer@kleidermarkt-gummersbach.de',
  reservationTime: 240,
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

var MaterialDesignMixin = {
  componentDidMount: function () {
    componentHandler.upgradeDom();
  },

  componentDidUpdate: function () {
    componentHandler.upgradeDom();
  }
}

var SpinnerModule = React.createClass({
  render: function () {
    return (
      <div style={this.props.styling}>
        <div className="mdl-spinner mdl-js-spinner is-active"></div>
      </div>
    );
  }
});

var BadgeButtonModule = React.createClass({
  mixins: [MaterialDesignMixin],

  render: function () {
    if (this.props.badge == null) {
      return <SpinnerModule styling={{
        width: '100px',
        display: 'inline-block'
      }} />;
    }

    var disabled = false;
    if (this.props.badge == 0) {
      disabled = true;
    }

    return (
      <span className="km-button-badge mdl-badge" data-badge={this.props.badge}>
        <button
          onClick={function () {
            this.props.functions.setNrType(this.props.nrType);
            this.props.functions.goTo(this.props.goToSite);
          }.bind(this)}
          className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
          disabled={disabled}
        >
          {this.props.name}
        </button>
      </span>
    );
  }

});

var ButtonModule = React.createClass({
  mixins: [MaterialDesignMixin],

  render: function () {
    return (
        <button
          onClick={function () {
            this.props.functions.goTo(this.props.goToSite);
          }.bind(this)}
          className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
        >
          {this.props.name}
        </button>
    );
  }

});


var TimerModule = React.createClass({

  getInitialState: function () {
    return {s: 0, m: 0};
  },

  componentDidMount: function () {
    this.updateTime();
    this.timerInterval = setInterval(this.updateTime, 1000);
  },

  componentDidUpdate: function () {
    if (this.state.s == 0 && this.state.m == 0) {
      this.props.functions.goTo('SessionOverSite');
    }
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

var FormFieldModule = React.createClass({
  render: function () {

    if (this.props.data.type == "checkbox") {
      return (
        <label htmlFor={this.props.data.name} className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
          <input onChange={this.props.handleChange.bind(null, this.props.data.name)} type="checkbox" id={this.props.data.name} name={this.props.data.name} className="mdl-checkbox__input" />
          <span className="mdl-checkbox__label">{this.props.data.label}</span>
        </label>
      );
    }

    var message = this.props.data.message;
    if (message) {
      message = <span className="mdl-textfield__error">{message}</span>
    };

    var required;
    if (!this.props.data.required) {
      required = false;
    }

    return (
      <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
        <input required={required} onChange={this.props.handleChange.bind(null, this.props.data.name)} className="mdl-textfield__input" type={this.props.data.type} pattern={this.props.data.pattern} name={this.props.data.name} id={this.props.data.name} />
        <label className="mdl-textfield__label" htmlFor={this.props.data.name} >{this.props.data.label}</label>{message}
      </div>
    );
  }
});

var WelcomeSite = React.createClass({
  mixins: [MaterialDesignMixin],

  componentWillUnmount: function () {
    clearInterval(this.timerBaby);
    clearInterval(this.timerVerkaeufer);
  },

  componentDidMount: function () {

    // Get Data for the IntroText
    $.get(this.props.apiPoints.introText, function(data){
      this.setState({
        introText: <div className="mdl-card__supporting-text" dangerouslySetInnerHTML={{__html: data}} />
      });
    }.bind(this));

    // Get Data for the Badges
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
      "baby": null,
      introText: <SpinnerModule styling={{marginTop: 30, marginBottom: 30, marginLeft: 'auto', marginRight: 'auto'}} />
    };
  },

  render: function() {
    var sadText;
    if (this.state.baby == 0 && this.state.verkaeufer > 0) {
     sadText = (
       <div className="mdl-card__supporting-text">
         Schade, es scheint keine Babynummer mehr für dich zu geben.
         Du kannst aber gerne einfach eine Verkäufernummer nehmen, damit lassen
         sich genau so gut auch Babysachen verkaufen.
       </div>
     );
    }

    if (this.state.baby > 0 && this.state.verkaeufer == 0) {
     sadText = (
       <div className="mdl-card__supporting-text">
         Schade, es scheint keine Verkäufernummer mehr für dich zu geben.
         Vielleicht kannst du aber etwas mit einer Babynummer anfangen?
       </div>
     );
    }

    if (this.state.baby == 0 && this.state.verkaeufer == 0) {
     sadText = (
       <div className="mdl-card__supporting-text">
         Schade, es scheint weder normale Verkaufsnummern noch Babynummern
         mehr für dich zu geben. Vielleicht klappts ja beim Nächsten mal...
       </div>
     );
    }

    return (

      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Willkommen</h2></div>
              {this.state.introText}
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
              {sadText}
              <div className="mdl-card__menu" />
            </div>
          </main>
        </div>
      </div>
    );
  }

});

var ConditionsSite = React.createClass({
  mixins: [MaterialDesignMixin],

  componentDidMount: function () {

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
        this.props.functions.setReservationTime(Math.round(new Date().getTime()/1000) + options.reservationTime);
        this.setState({sessionTime: <TimerModule functions={this.props.functions} unixTime={this.props.functions.getReservationTime()} />});
      }.bind(this)
    ).fail(function (data) {
      if (data.responseText == "NO_RESERVATION_AVAILABLE") {
        this.props.functions.goTo('NoReservationSite');
      }
    }.bind(this));


  },

  getInitialState: function () {
    return {
      sessionTime: <SpinnerModule styling={{display: 'inline'}} />,
      conditions: <SpinnerModule styling={{
        marginTop: 30,
        marginBottom: 30,
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
      conditions = (<div
        className="mdl-card__supporting-text"
        dangerouslySetInnerHTML={this.conditionsRaw()}
      />);
    }

    var disabled = !this.state.gotConditions;


    return (
      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Verkäuferinformationen</h2></div>
              {conditions}
              <div className="km-card__actions mdl-card__actions mdl-card--border">
                <button disabled={disabled} onClick={this.acceptAndNext} className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Akzeptieren und weiter</button>
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
  getInitialState: function () {
    return {
      formFields: [
        {type: "text", name: "vorname", label: "Vorname", required: true},
        {type: "text", name: "name", label: "Name", required: true},
        {type: "text", name: "strasse", label: "Straße", required: true},
        {type: "text", name: "ort", label: "Ort", required: true},
        {type: "text", name: "plz", label: "PLZ", pattern: "-?[0-9]{5}?", message: "Keine gültige PLZ", required: true},
        {type: "text", name: "tel", label: "Telefon", pattern: '-?[0-9 /\\-\\+]+?', message: "Keine gültige Telefonnummer", required: true},
        {type: "email", name: "email", label: "Email", pattern: '[A-Za-z0-9._%+-]+@[A-za-z0-9.-]+\.[A-za-z]{2,4}$', message: "Keine gültige Email Adresse", required: true},
        {type: "checkbox", name: "neu", label: "Ich mache zum ersten mal mit"}
      ],
      userData: {},
      userDataIsCorrect: false,
      isLoading: false
    };
  },

  handleChange: function (key, e) {
    var tempUserData = this.state.userData;
    tempUserData[key] = e.target.value;

    if(e.target.type == "checkbox") {
      tempUserData[key] = !$(e.target).parent().hasClass('is-checked');
    }

    this.setState({userData: tempUserData});
    this.checkIfUserDataIsCorrect();
  },

  checkIfUserDataIsCorrect: function () {
    this.setState({userDataIsCorrect: true});

    // check, if all Patterns are fine
    this.state.formFields.forEach(function (formField) {
      if(formField.pattern) {
        var pattern = new RegExp(formField.pattern);
        var str = this.state.userData[formField.name];
        var res = pattern.test(str);
        if(!res){
          this.setState({userDataIsCorrect: false});
        }
      }

    }, this)

    // check, if all required fields have content
    this.state.formFields.forEach(function (formField) {
      if(formField.required) {
        var pattern = new RegExp(formField.pattern);
        if(!this.state.userData[formField.name]){
          this.setState({userDataIsCorrect: false});
        }
      }
    }, this)
  },

  saveNumber: function () {
    if (this.state.userDataIsCorrect) {
      // Show loading Screen
      this.props.functions.setLoading(true);

      // Prepare Data
      var userData = this.state.userData;
      userData.nr = this.props.functions.getNr();

      // Send Data
      $.post(
        this.props.apiPoints.postData[this.props.functions.getNrType()],
        userData,
        function (data) {
          console.log(data);
          this.props.functions.setLoading(false);
          if (data.status == 'error') {
            alert(data.message);
            return;
          }
          this.props.functions.setUserData(userData);
          this.props.functions.goTo('FinishSite');
        }.bind(this)
      );
    }
  },

  render: function() {
    var formFields = this.state.formFields.map(function(formField){
      return <FormFieldModule data={formField} key={formField.name} handleChange={this.handleChange}/>;
    }.bind(this));
    return (

      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Deine Daten</h2></div>
              <div className="mdl-card__supporting-text">
                <form className="km-form" action="#">
                  {formFields}
                </form>
              </div>
              <div className="km-card__actions mdl-card__actions mdl-card--border">
                <button onClick={this.saveNumber} className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" disabled={!this.state.userDataIsCorrect} >Nummer sichern</button>
              </div>
              <div className="km-card__menu mdl-card__menu">
                <div className="km-timer"><i className="material-icons">timer</i> Sitzung endet: <span className="km-timer__time"><TimerModule functions={this.props.functions} unixTime={this.props.functions.getReservationTime()} /></span></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
});

var FinishSite = React.createClass({
  render: function() {
    var userData = this.props.functions.getUserData();
    return (

      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Danke: Alles hat geklappt!</h2></div>
              <div className="mdl-card__supporting-text">
                <h4 className="km-number-holder">Deine Nummer: <span className="km-number-holder__number">{userData.nr}</span></h4>
                <table className="km-table mdl-data-table mdl-js-data-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Deine Eingabe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Vorname</td>
                      <td>{userData.vorname}</td>
                    </tr>
                    <tr>
                      <td>Name</td>
                      <td>{userData.name}</td>
                    </tr>
                    <tr>
                      <td>Straße</td>
                      <td>{userData.strasse}</td>
                    </tr>
                    <tr>
                      <td>Ort</td>
                      <td>{userData.ort}</td>
                    </tr>
                    <tr>
                      <td>PLZ</td>
                      <td>{userData.plz}</td>
                    </tr>
                    <tr>
                      <td>Telefon</td>
                      <td>{userData.tel}</td>
                    </tr>
                    <tr>
                      <td>Email</td>
                      <td>{userData.email}</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  Bitte beachte: Du bekommst eine email an {userData.email},
                  wo alle wichtigen Daten noch einmal enthalten sind. Falls du
                  keine email bekommst, überprüfe dein Spam Filter. Wenn alles
                  nicht hilft, wende dich an <a href={'mailto:' + this.props.options.supportEmail}>{this.props.options.supportEmail}</a>.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
});

var LoadingSite = React.createClass({
  mixins: [MaterialDesignMixin],

  render: function () {
    return (
      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text"></h2>
              </div>
              <SpinnerModule
                styling={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: 30,
                  marginBottom: 30
                }}
              />
              <div className="mdl-card__menu" />
            </div>
          </main>
        </div>
      </div>
    )
  }
});

var SessionOverSite = React.createClass({
  mixins: [MaterialDesignMixin],

  render: function () {
    return (
      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Sitzung Abgelaufen</h2>
              </div>
              <div className="mdl-card__supporting-text">
                <p>
                  Leider ist die Zeit für deine Sitzung abgelaufen.
                </p>
                <p>
                  Eine Sitzung ist die Zeit, für die wir eine Verkäufernummer für
                  dich reservieren. Eine Sitzung ist immer nur 4 Minuten gültig.
                  In dieser Zeit muss du es geschafft haben, deine Daten einzugeben
                  und eine Verkäufernummer zu beantragen.
                </p>
                <p>
                  Versuche es doch noch einmal...
                </p>
              </div>
              <div className="km-card__actions mdl-card__actions mdl-card--border">
                <ButtonModule
                  name="Neu starten"
                  functions={this.props.functions}
                  goToSite="reset"
                />
              </div>
              <div className="mdl-card__menu" />
            </div>
          </main>
        </div>
      </div>
    )
  }
});

var NoReservationSite = React.createClass({
  mixins: [MaterialDesignMixin],

  render: function () {
    return (
      <div>
        <div className="mdl-layout mdl-js-layout">
          <header />
          <main className="km-layout mdl-layout__content">
            <div className="km-card mdl-card mdl-shadow--2dp">
              <div className="km-card__title mdl-card__title">
                <h2 className="mdl-card__title-text">Keine Nummer mehr frei</h2>
              </div>
              <div className="mdl-card__supporting-text">
                <p>
                  Leider gibt es für deine Anfrage keine freien Nummern mehr.
                </p>
                <p>
                  Da war hat dir wohl gerade jemand die letzte Nummer vor der Nase
                  weggeschnappt.
                </p>
                <p>
                  Versuche es doch noch einmal...
                </p>
              </div>
              <div className="km-card__actions mdl-card__actions mdl-card--border">
                <ButtonModule
                  name="Neu starten"
                  functions={this.props.functions}
                  goToSite="reset"
                />
              </div>
              <div className="mdl-card__menu" />
            </div>
          </main>
        </div>
      </div>
    )
  }
});


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
      setReservationTime: this.setReservationTime,
      setUserData: this.setUserData,
      getUserData: this.getUserData,
      setLoading: this.setLoading
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
      reservationTime: null,
      userData: null,
      isLoading: false
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

  setUserData: function (userData) {
    this.setState({userData});
  },

  getUserData: function (userData) {
    return this.state.userData;
  },

  setLoading: function (isLoading) {
    this.setState({isLoading});
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
      case "FinishSite":
        goToSite = <FinishSite apiPoints={apiPoints} options={options} functions={functions} />
        break;
      case "SessionOverSite":
        goToSite = <SessionOverSite apiPoints={apiPoints} options={options} functions={functions} />
        break;
      case "NoReservationSite":
        goToSite = <NoReservationSite apiPoints={apiPoints} options={options} functions={functions} />
        break;
      case "reset":
        this.setState(this.getInitialState());
        goToSite = <WelcomeSite apiPoints={apiPoints} options={options} functions={functions} />
        break;

      default:
        goToSite = <WelcomeSite apiPoints={apiPoints} options={options} functions={functions} />
    }

    this.setState({
      currentSite: goToSite
    });

  },

  render: function () {
    var siteToRender = this.state.currentSite;

    if (this.state.isLoading) {
      siteToRender = <LoadingSite />
    }

    return (
      <div id="my-react-root">
        {siteToRender}
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
