var noteKey, client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', setup);
})();

async function setup() {
  let {
    loggedInUser: { id: agentId }
  } = await client.data.get('loggedInUser');
  let {
    ticket: { id: ticketId }
  } = await client.data.get('ticket');

  noteKey = `${agentId}:${ticketId}`;
  let [err, note] = await to(client.db.get(noteKey));
  if (err) {
    console.error(err);
    await showErrorToUser(err, {
      title: 'DB — ',
      message: 'Retrive operation failed'
    });
    return;
  }
  console.info('note', note);
  pick('#note').value = note;
}

async function showErrorToUser(error, info) {
  let { type, title, message } = info;
  let notificationType = {
    type: 'warning',
    title,
    message
  };

  await client.interface.trigger('showNotify', notificationType);
}

function pick(selector, context = document) {
  return context.querySelector(selector);
}

// utility to handle
function to(promise, improved) {
  return promise
    .then((data) => [null, data])
    .catch((err) => {
      if (improved) {
        Object.assign(err, improved);
      }
      return [err];
    });
}
