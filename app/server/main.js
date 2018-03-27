import { Messages } from '/api/Messages';
import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {

	return Meteor.methods({
		'clearMessages': function() {
			return Messages.remove({});
		},
	});
});
