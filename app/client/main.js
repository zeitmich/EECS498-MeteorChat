import { Messages } from '/api/Messages';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.main.onCreated(function() {
	Session.set('currentUser', '');
	//Meteor.call('clearMessages');
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
			var userExists = Messages.find({ user: newUsername }).count();

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
			var userExists = Messages.find({ user: newUsername }).count();

			if(userExists) {
				Template.instance().signupError.set("Error: Username already exists");
				$('#signup-error').css('display', 'block');
			}
			else {
				Session.set('currentUser', newUsername);

				var newUserChats = {};
				var allUsers = Messages.find().fetch();

				for(var i = 0; i < allUsers.length; ++i) {
					var user = allUsers[i];

					var userChats = user['chats'];
					userChats[newUsername] = [];

					Messages.update(user['_id'], {
						$set: { chats: userChats },
					});

					newUserChats[user['user']] = [];
				}

				Messages.insert({
					user: newUsername,
					chats: newUserChats
				});

				$('#signup-error').css('display', 'none');
			}
		}
		else {
			Template.instance().signupError.set("Error: Please enter a username");
			$('#signup-error').css('display', 'block');
		}
	},
});

Template.chat.onCreated(function() {
	Session.set('currentChat', '');
});

Template.chat.helpers({
	getCurrentUser() {
		return Session.get('currentUser');
	},
	getNumChats() {
		var currUser = Session.get('currentUser');
		return Messages.find({ user: { $ne: currUser } }).count();
	},
	getUsers() {
		var currUser = Session.get('currentUser');
		return Messages.find({ user: { $ne: currUser } }).fetch();
	},
	getClickedUser() {
		return Session.get('currentChat');
	},
	getMessages() {
		var currUser = Session.get('currentUser');
		var clickedUser = Session.get('currentChat');

		if(clickedUser) {
			var user = Messages.findOne({ user: currUser });
			return user['chats'][clickedUser];
		}

		return [];
	},
});

Template.chat.events({
	'click #logout': function(event) {
		event.preventDefault();

		Session.set('currentUser', '');
	},
	'click .user': function(event) {
		var oldUser = Session.get('currentChat');

		if(oldUser) {
			$('#' + oldUser).removeClass('selected');
		}

		var clickedUser = $(event.target).text();
		$('#' + clickedUser).addClass('selected');

		Session.set('currentChat', clickedUser);
	},
	'submit #send-msg': function(event) {
		event.preventDefault()

		var currUser = Session.get('currentUser');
		var clickedUser = Session.get('currentChat');

		if(clickedUser) {
			var user = Messages.findOne({ user: currUser });
			var userChats = user['chats'];

			userChats[clickedUser].push({
				sender: currUser,
				text: $('#messageInput').val()
			});

			Messages.update(user['_id'], {
				$set: { chats: userChats },
			});

			user = Messages.findOne({ user: clickedUser });
			userChats = user['chats'];

			userChats[currUser].push({
				sender: currUser,
				text: $('#messageInput').val()
			});

			Messages.update(user['_id'], {
				$set: { chats: userChats },
			});

			$('#messageInput').val('');
		}
	},
	'click .delete-msg': function() {
		console.log("DELETE");
	},
});
