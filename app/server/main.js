import { Users } from '/api/Users';
import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {

	return Meteor.methods({
		'clearUsers': function() {
			return Users.remove({});
		},
	});
});
