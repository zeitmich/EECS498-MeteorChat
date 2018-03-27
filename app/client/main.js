import { Users } from '/api/Users';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.main.onCreated(function() {
	Session.set('currentUser', '');
	//Meteor.call('clearUsers');
});

Template.main.helpers({
	getCurrentUser() {
		return Session.get('currentUser');
	},
});

Template.login.onCreated(function() {
	this.loginError = new ReactiveVar("Error: Please enter a username");
	this.signupError = new ReactiveVar("Error: Please enter a username");
});

Template.login.helpers({
	getLoginError() {
		return Template.instance().loginError.get();
	},
	getSignupError() {
		return Template.instance().signupError.get();
	},
});

Template.login.events({
	'submit #login-user': function(event) {
		event.preventDefault();

		$('#signup-error').css('display', 'none');

		var newUsername = event.target.loginUser.value;

		if(newUsername) {
			var userExists = Users.find({ username: newUsername }).count();

			if(userExists) {
				Session.set('currentUser', newUsername);

				$('#login-error').css('display', 'none');
			}
			else {
				Template.instance().loginError.set("Error: Username does not exist");
				$('#login-error').css('display', 'block');
			}
		}
		else {
			Template.instance().loginError.set("Error: Please enter a username");
			$('#login-error').css('display', 'block');
		}
	},
	'submit #signup-user': function(event) {
		event.preventDefault();

		$('#login-error').css('display', 'none');

		var newUsername = event.target.signupUser.value;

		if(newUsername) {
			var userExists = Users.find({ username: newUsername }).count();

			if(userExists) {
				Template.instance().signupError.set("Error: Username already exists");
				$('#signup-error').css('display', 'block');
			}
			else {
				Users.insert({
					username: newUsername
				});

				Session.set('currentUser', newUsername);

				$('#signup-error').css('display', 'none');
			}
		}
		else {
			Template.instance().signupError.set("Error: Please enter a username");
			$('#signup-error').css('display', 'block');
		}
	},
});

Template.chat.helpers({
	getCurrentUser() {
		return Session.get('currentUser');
	},
	getNumChats() {
		var currUser = Session.get('currentUser');
		return Users.find({ username: { $ne: currUser } }).count();
	},
	getUsers() {
		var currUser = Session.get('currentUser');
		return Users.find({ username: { $ne: currUser } }).fetch();
	},
});
