import { UALJs } from "ual-plainjs-renderer";
import { Anchor } from "ual-anchor";
import { Wax } from "ual-wax";
import { Api, ApiInterfaces, JsonRpc, RpcError } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
window.Buffer = window.Buffer || require("buffer").Buffer;
const myAppName = "Metal war game PVP";
let endpoint = localStorage.getItem("endpoint");
if (!endpoint) endpoint = "https://wax.pink.gg";
const myChain = {
  chainId: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
  rpcEndpoints: [
    {
      protocol: endpoint.split(":")[0],
      host: endpoint.split(":")[1].slice(2, 99),
      port: Number(443),
    },
  ],
};
const anchor = new Anchor([myChain], { appName: myAppName });
const wax = new Wax([myChain], { appName: myAppName });
async function initUal(handler, privateKey) {
  if (privateKey) {
    const rpc = new JsonRpc(endpoint);
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider });
    localStorage.setItem("ual-session-authenticator", "private");
    console.log(api);
    let account = await api.rpc.get_accounts_by_authorizers(
      [],
      api.signatureProvider.availableKeys
    );
    account = account.accounts[0];
    api.getAccountName = async () => account.account_name;
    api.accountName = account.account_name;
    api.requestPermission = account.permission_name;
    localStorage.setItem("ual-session-authenticator", "private");
    handler([api]);
  }
  let auth = localStorage.getItem("ual-session-authenticator");
  let expire = localStorage.getItem("ual-session-expiration");
  wax.shouldInvalidateAfter = () => 53;
  if (auth === "Anchor") {
    let anchor = new Anchor([myChain], { appName: "metal war game pvp" });
    await anchor.init();
    await anchor.login();
    if (!anchor.users || !anchor.users.length) {
      localStorage.removeItem("ual-session-authenticator");
      initUal(handler);
    } else {
      handler(anchor.users);
    }
  } else {
    let ual = new UALJs(
      e => {
        store.user = e[0];
        getIngameTanks();
      },
      [myChain],
      myAppName,
      [anchor, wax],
      { containerElement: document.getElementById("login") }
    );
    ual.userCallbackHandler = e => {
      handler(e);
      console.log(e);
    };
    ual.init();
  }
}
async function transaction(actions) {
  if (!Array.isArray(actions)) actions = [actions];
  let response = {};
  let user = actions[0].user;
  let owner = await user.getAccountName();
  let options = { actions: [] };
  actions.forEach(async action => {
    let { name, data, account = "metalwargame" } = action;
    let obj = {
      account,
      name,
      authorization: [
        {
          actor: owner,
          permission: user.requestPermission,
        },
      ],
      data: {
        asset_owner: owner,
        ...data,
      },
    };
    options.actions.push(obj);
  });
  console.log(options.actions);
  if (localStorage.getItem("ual-session-authenticator") === "Anchor") {
    try {
      response = await user.signTransaction(options, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      return true;
    } catch (e) {
      console.log({ ...e });
      return e.cause.message;
    }
  }
  if (localStorage.getItem("ual-session-authenticator") === "Wax") {
    options.actions.forEach(el => (el.authorization[0].permission = "active"));
    try {
      response = await user.wax.api.transact(options, {
        blocksBehind: 3,
        expireSeconds: 30,
        broadcast: true,
        sign: true,
      });
      return true;
    } catch (e) {
      console.log("WCW Error: ");
      console.log({ ...e }, e);
      let errorText = "";
      if (
        e &&
        e.json &&
        e.json.error &&
        e.json.error.details &&
        e.json.error.details[0]
      )
        errorText = e.json.error.details[0].message;
      else
        errorText =
          "Something wrong. Сheck your browser for pop-up pages permission.(Required for work WAX cloud)";
      return errorText;
    }
  }
  if (localStorage.getItem("ual-session-authenticator") === "private") {
    let confirms = JSON.parse(localStorage.getItem("confirms"));
    if (confirms && actions.some(action => !confirms[action.name])) {
      let actionString = options.actions
        .map(el => {
          return `${el.name}\n${JSON.stringify(el.data)}`;
        })
        .join("\n\n");
      actionString = "Confirm transaction:\n\n" + actionString;
      let ok = confirm(actionString);
      if (!ok) return "transaction not confirmed";
    }
    try {
      response = await user.transact(options, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      return true;
    } catch (e) {
      console.log({ ...e });
      return e;
    }
  }
}
export { initUal, transaction };
