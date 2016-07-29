window.FreeNumbersButton = React.createClass({

  getInitialState: function () {
    return {
      freeNumber: 0
    }
  },

  render: function () {
    return (
      <div className="free-numbers-button">
        <p className="free-numbers-button__free-number">
          {this.state.freeNumber}
        </p>
        <p className="free-numbers-button__name">
          {this.props.name}
        </p>
        <button className="free-numbers-button__button">
          Jetzt {this.props.name} ziehen
        </button>
      </div>
    );
  }
});
