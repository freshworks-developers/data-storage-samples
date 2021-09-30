/**
 * @desc - This app allows you to save a memo linked to the ticket
 * @info - https://developers.freshservice.com/docs/data-storage
 */

let noteKey;

function q(selector, context = document) {
  return context.querySelector(selector);
}

document.addEventListener('DOMContentLoaded', () => {
  (function () {
    app.initialized().then((_client) => {
      window.client = _client;
      client.events.on('app.activated', () => {
        fetchInfo(() => {
          displayNote();
          q("#note-save").addEventListener('click', saveNote);
          q("#note-delete").addEventListener('click', deleteNote);
        });
      })
    }, (err) => {
      console.error('Error: Failed to initialise the app');
      showError(err);
    });


    function showError(err) {
      client.interface.trigger("showNotify", {
        type: "warning", title: "Warning",
        message: `Error: App is facing issues during initialzation - ${err}`
      }).then(function (data) {
        console.info(`Err: Interface API - ${data}`);
      }).catch(function (error) {
        console.error(`Some error Encountered: ${error}`);
      });
    }

    function saveNote() {
      console.log('save note clicked')
      var noteData = q("#note").value;
      if (noteData == '') {
        notify('warning', 'Note is empty');
        return;
      }
      client.db.set(noteKey, { note: noteData }).then(() => {
        notify('success', 'Note has been stored');
      }, () => {
        notify('danger', 'Error storing the note');
      });
    }

    function deleteNote() {
      client.db.delete(noteKey)
        .then(function () {
          q("#note").value = '';
          notify('success', 'Note has been deleted');
        }, function () {
          notify('danger', 'Error deleting the note');
        });
    }

    function displayNote() {
      client.db.get(noteKey).then((data) => {
        q("#note").value = data.note;
      });
    }

    function notify(status, message) {
      client.interface.trigger('showNotify', {
        type: status,
        message: message
      });
    }

    function fetchInfo(callback) {
      client.data.get('loggedInUser').then((userData) => {
        console.log(userData)
        client.data.get('ticket').then((ticketData) => {
          console.log(ticketData)
          noteKey = `${userData.loggedInUser.id} : ${ticketData.ticket.id}`;
          callback();
        });
      });
    }
  })();
});
