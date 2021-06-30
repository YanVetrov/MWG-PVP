import { UALJs } from "ual-plainjs-renderer";
import { Anchor } from "ual-anchor";
import { Wax } from "ual-wax";
const myAppName = "Metal war game PVP";
const myChain = {
  chainId: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
  rpcEndpoints: [
    {
      protocol: "https",
      host: "wax.pink.gg",
      port: Number(443),
    },
  ],
};
const anchor = new Anchor([myChain], { appName: myAppName });
const wax = new Wax([myChain], { appName: myAppName });

const myAppRoot = {
  containerElement: document.getElementById("login"),
};

async function initUal(handler) {
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
      myAppRoot.containerElement.style.visibility = "hidden";
      document.getElementById("signout").style.visibility = "visible";
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
      myAppRoot
    );
    myAppRoot.containerElement.style.visibility = "visible";
    document.getElementById("signout").style.visibility = "hidden";
    ual.userCallbackHandler = e => {
      myAppRoot.containerElement.style.visibility = "hidden";
      document.getElementById("signout").style.visibility = "visible";
      handler(e);
      console.log(e);
    };
    ual.init();
  }
}
export { initUal };
