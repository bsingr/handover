import {dialog} from 'electron';

export default function(client, consumer) {
  if (consumer.last) {
    client.fetch(consumer.last);
  } else {
    dialog.showErrorBox('Handover', 'There is nothing handed over to you ...');
  }
}

