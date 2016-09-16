'use strict';

var firebase = require('firebase');

firebase.initializeApp({
  databaseURL: "https://reallysimplebutton.firebaseio.com",
  serviceAccount: "service_account.json"
});

var db = firebase.database();

// A map to keep track of the coreids in the database.
// ex. coreid => {state:"on", timestamp:"2016-09-13T03:26:19.292Z", notify:true}
var cores_state = new Map();

// A map to keep track of the users and what cores they want updates on.
// ex. user_name => {number:"555-555-5555", cores:{nickname:"coreid1", nickname2:"coreid2"]}
var users_to_cores = new Map();

// A value indicating whether or not updates should be sent to users.
var updates_enabled = false;


function startCoresDatabaseListeners() {
    var coresRef = db.ref("cores");

    coresRef.on('child_added', function(data) {
	registerCoreid(data.key);
    });
    
    coresRef.on('child_removed', function(data) {
	unregisterCoreid(data.key);
    });
}

function registerCoreid(coreid) {
    console.log("registerCoreid");
    var deviceRef = db.ref("cores/" + coreid);
    deviceRef.off();

    deviceRef.on("child_added", function(data) {
	var val = data.val();
	var state = val.data;
	var timestamp = val.published_at;

	if (coreid in cores_state) {
	    var device_state = cores_state[coreid];
	    
	    if (device_state.state != state) {
		device_state.notify = true;
	    }

	    device_state.state = state;
	    device_state.timestamp = timestamp;
	} else {
	    cores_state[coreid] = {state:state, timestamp:timestamp, notify:false};
	}

	if (updates_enabled) {
	    sendUpdatesToUsers(coreid);
	}
    });

    deviceRef.once("value", function(data) {
    	updates_enabled = true;
    });
}

function unregisterCoreid(coreid) {
    console.log("unregisterCoreid");
    var deviceRef = db.ref("cores/" + coreid);
    deviceRef.off();
    delete cores_state[coreid];
}

function startUsersDatabaseListeners() {
    var usersRef = db.ref("users");

    usersRef.on('child_added', function(data) {
	updateUser(data.key, data.val());
    });

    usersRef.on('child_changed', function(data) {
	updateUser(data.key, data.val());
    });
    
    usersRef.on('child_removed', function(data) {
	unregisterUser(data.key);
    });
}

function unregisterUser(user_key) {
    console.log("unregisterUser");
    delete users_to_cores[user_key];
}

function updateUser(user_key, data) {
    console.log("updateUser: " + user_key);
    users_to_cores[user_key] = data;
}

function sendUpdatesToUsers(coreid) {
    var user_keys = Object.keys(users_to_cores);
    var updated_cores = new Array();

    for (var i = 0,length = user_keys.length; i < length; i++) {
	var user_key = user_keys[i];
	var user = users_to_cores[user_key];
	
	console.log("updating: " + user_key);

	var core_keys = Object.keys(user.cores);
	if (core_keys.indexOf(coreid) >= 0) {
	    var core_nickname = user.cores[coreid];

	    if (coreid in cores_state) {
		if (updated_cores.indexOf(coreid) < 0) {
		    updated_cores.push(coreid);
		}

		if (cores_state[coreid].notify) {
		    console.log("notifying: " + user_key + " about " +
				core_nickname + "::" + coreid + " :: " +
				user.number);
		}
	    }
	}
    }

    console.log(updated_cores);

    for (var i = 0, length = updated_cores.length; i < length; i++) {
	var coreid = updated_cores[i];
	cores_state[coreid].notify = false;
    }
}

// Begin listening for changes.
startCoresDatabaseListeners();

// Add users for sms.
startUsersDatabaseListeners();
