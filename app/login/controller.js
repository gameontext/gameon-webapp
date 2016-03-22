import Ember from 'ember';

export default Ember.Controller.extend({
  // session: Ember.inject.service(),
  //
  // actions: {
  //   authenticate() {
  //     var credentials = this.getProperties('identification', 'password'),
  //       authenticator = 'authenticator:jwt';
  //
  //     this.get('session').authenticate(authenticator, credentials);
  //   }
  // }
  showLogin: false,
  actions: {
    openLogin(){
      this.toggleProperty('showLogin');
    }
  }
});
