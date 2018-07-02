#### XRP Ledger Payment Channel Explorer

```js
getAccountChannels(account, [ledger_index]);
getXRPBalance(account, [ledger_indx]);
getChannelHistory(marker, [limit=5]);
```

`getAccountChannels` will return all payment channels for the account as of the provided ledger index (defaults to latest validated).  Each channel will include a marker (previous transaction id) that can be used to get the channel's history of changes via `getChannelHistory`
