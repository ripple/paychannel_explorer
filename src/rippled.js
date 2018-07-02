const config = require('./config');
const axios = require('axios');
const moment = require('moment');
const getXRPBalanceChanges = require('./getXRPBalanceChanges');
const summarizePayChannel = require('./summarizePayChannel');
const toXRP = require('./dropsToXRP');

const TIMEOUT = config.get('ripple:timeout') || 5000;
const url = `http://${config.get('ripple:host')}:${config.get('ripple:port')}`;
const EPOCH_OFFSET = 946684800

async function query(method, params) {
  const resp = await axios({
    method: 'post',
    url: url,
    data: { method, params: [params] },
    timeout: TIMEOUT
  });

  return resp.data.result
}

module.exports.getXRPBalance = async function(account, ledger_index = 'validated') {
  const resp = await query('account_info', { account, ledger_index })
  return toXRP(resp.account_data.Balance);
}

module.exports.getChannelHistory = async function(previousTxnID, limit = 5) {
  let prevId = previousTxnID
  let txs = []

  while (prevId !== undefined) {
    const rawTx = await query('tx', { transaction: prevId })
    const tx = {
      ledger_index: rawTx.ledger_index,
      tx_hash: rawTx.hash,
      account: rawTx.Account,
      type: rawTx.TransactionType,
      fee: toXRP(rawTx.Fee)
    };

    const summary = summarizePayChannel(rawTx.meta.AffectedNodes);
    const changes = getXRPBalanceChanges(rawTx.meta.AffectedNodes);

    Object.assign(tx, summary.changes);

    if (changes[summary.source]) {
      tx.source_balance_change = changes[summary.source].change;
      tx.source_final_balance = changes[summary.source].final_balance;
    }

    if (changes[summary.destination]) {
      tx.destination_balance_change = changes[summary.destination].change;
      tx.destination_final_balance = changes[summary.destination].final_balance;
    }

    prevId = summary.prev_tx;

    txs.push(tx)

    if (txs.length === limit) {
      break;
    }
  }

  return {
    transactions: txs,
    marker: prevId
  };
}

module.exports.getAccountChannels = async function(account, ledger_index = 'validated') {
  const resp = await query('account_objects', {
    type: 'payment_channel',
    account,
    ledger_index
  });

  const channels = []
  for (let channel of resp.account_objects) {
    channels.push({
      channel_id: channel.index,
      public_key: channel.PublicKey,
      source: channel.Account,
      destination: channel.Destination,
      amount: toXRP(channel.Amount),
      balance: toXRP(channel.Balance),
      settle_delay: channel.SettleDelay,
      cancel_after: channel.CancelAfter,
      expiration: channel.Expiration ?
        moment.unix(channel.Expiration + EPOCH_OFFSET).utc().format() : undefined,
      marker: channel.PreviousTxnID
    });
  }

  return {
    channels,
    ledger_index: resp.ledger_index
  }
}
