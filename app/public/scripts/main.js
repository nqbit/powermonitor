'use strict';

// Initializes PowerMonitor.
function PowerMonitor() {

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.initFirebase();
}

PowerMonitor.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.database = firebase.database();
  this.loadMessages();
};

// Loads messages history and listens for upcoming ones.
PowerMonitor.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('cores');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.updateDevice(data.key);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

PowerMonitor.prototype.updateDevice = function(key) {
  this.deviceRef = this.database.ref('cores/' + key);
  this.deviceRef.off();

  // Loads the last update and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(key, val.data, val.published_at);
  }.bind(this);
  this.deviceRef.limitToLast(1).on('child_added', setMessage);
  this.deviceRef.limitToLast(1).on('child_changed', setMessage);
};

// Template for messages.
PowerMonitor.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="state"></div>' +
      '<div class="coreid"></div>' +
      '<div class="timestamp"></div>' +
    '</div>';

// Displays a Message in the UI.
PowerMonitor.prototype.displayMessage = function(coreid, state, timestamp) {
  var div = document.getElementById(coreid);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = PowerMonitor.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', coreid);
    this.messageList.appendChild(div);
  }

  var d = new Date(timestamp);

  div.querySelector('.coreid').textContent = coreid;
  div.querySelector('.state').textContent = state;
  div.querySelector('.timestamp').textContent = d.toString();

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollBottom = this.messageList.scrollHeight;
};

window.onload = function() {
  window.powermonitor = new PowerMonitor();
};
