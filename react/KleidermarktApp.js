// Modules
var FreeNumbersButton = window.FreeNumbersButton;

// Sites
var Welcome           = window.Welcome;



window.KleidermarktApp = React.createClass({

  getInitialState: function () {
    return {
      currentSite: <Welcome />
    }
  },

  render: function() {
    return (
      this.state.currentSite
    );
  }
});
