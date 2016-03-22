import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    getGithub(){
      $.ajax({
        type: "GET",
        url: "https://game-on.org/play/GitHubAuth"
      });
    }
  }
});
