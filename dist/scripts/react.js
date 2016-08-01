var WelcomeSite = React.createClass({
  render: function() {
    return (

      <div className="mdl-layout mdl-js-layout">
        <header />
        <main className="km-layout mdl-layout__content">
          <div className="km-card mdl-card mdl-shadow--2dp">
            <div className="km-card__title mdl-card__title">
              <h2 className="mdl-card__title-text">Willkommen</h2></div>
            <div className="mdl-card__supporting-text">Diese kleine Website soll dir helfen, ohne große Umstände und besetzte Telefonleitungen deine Verkäufernummer für den Kinderkleidermarkt in Gummersbach zu ziehen.</div>
            <div className="km-card__actions mdl-card__actions mdl-card--border"><span className="km-button-badge mdl-badge" data-badge={104}><button className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Verkäufernummer</button> </span><span className="km-button-badge mdl-badge" data-badge={4}><button className="km-button mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">Babynummer</button></span></div>
            <div className="mdl-card__menu" />
          </div>
        </main>
      </div>
    );
  }
});

ReactDOM.render(
  <WelcomeSite />,
  document.getElementById('react-container')
);
