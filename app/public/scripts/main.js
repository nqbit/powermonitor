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
  this.messagesRef = this.database.ref('device_msgs');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.coreid, val.state, val.published_at);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// Template for messages.
PowerMonitor.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="state"></div>' +
      '<div class="coreid"></div>' +
      '<div class="timestamp"></div>' +
    '</div>';

// Displays a Message in the UI.
PowerMonitor.prototype.displayMessage = function(key, coreid, state, timestamp) {
  var div = document.getElementById(coreid);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = PowerMonitor.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', coreid);
    this.messageList.appendChild(div);
  }
  div.querySelector('.coreid').textContent = coreid;
  div.querySelector('.state').textContent = state;
  div.querySelector('.timestamp').textContent = timestamp;

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
};

window.onload = function() {
  window.powermonitor = new PowerMonitor();
};
