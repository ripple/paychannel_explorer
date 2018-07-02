const rippled = require('./src/rippled');

(async() => {
  const resp = await rippled.getAccountChannels('rEE1JVZrpEjgZibGddhVv4ESmFpcxnjNUv')

  resp.channels[0].details = {
    source_balance: await rippled.getXRPBalance(resp.channels[0].source, resp.ledger_index),
    destination_balance: await rippled.getXRPBalance(resp.channels[0].destination, resp.ledger_index),
    history: await rippled.getChannelHistory(resp.channels[0].marker, 5)
  };

  console.log(JSON.stringify(resp.channels[0], null, 2));
  process.exit();
})();