<template>
  <div class="login">
    <ual-trigger :options="opts" @login="userCallback" />
  </div>
</template>
<script>
import { ualTrigger, version } from "ual-vuejs-renderer";
import { Scatter } from "ual-scatter";
import { Anchor } from "ual-anchor";
import { Wax } from "ual-wax";
import nets from "~/static/nets";
import Vue from "vue";
export default {
  components: {
    ualTrigger
  },
  data() {
    return {
      timeout: "",
      timeout2: "",
      timeout3: "",
      version,
      user: {
        accountName: "",
        chainId: ""
      },
      opts: {
        name: "Metal war game",
        nets,
        chains: { ...nets },
        authenticators: [
          //   {authenticator: Scatter, netChainIds: ['1'], options: { appName: 'Metal war game' }},
          {
            authenticator: Anchor,
            netChainIds: [
              "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4"
            ],
            options: { appName: ".etal.war.ga2", requestStatus: false }
          },
          {
            authenticator: Wax,
            netChainIds: [
              "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4"
            ],
            options: { appName: ".etal.war.ga2" }
          }
        ]
      }
    };
  },
  methods: {
    async userCallback(users) {
      const loggedInUser = users[0];
      if (!loggedInUser) return 0;
      localStorage.setItem("auth", "Anchor");
      if (loggedInUser.wax) {
        loggedInUser.rpc = loggedInUser.wax.rpc;
        localStorage.setItem("auth", "Wax");
      }
      Vue.prototype.$user = loggedInUser;
      loggedInUser.rpc.endpoint =
        localStorage.getItem("endpoint") ||
        nets[0].rpcEndpoints[0].protocol + "://" + nets[0].rpcEndpoints[0].host;
      console.log(loggedInUser);
      console.log(this);
      this.user.accountName = await loggedInUser.getAccountName();
      this.user.chainId = await loggedInUser.getChainId();
      this.$store.commit("global/user", this.user);
      await this.$store.dispatch("global/getTanks");
      await this.$store.dispatch("global/getWaxBalance");
      await this.$store.dispatch("global/getUnique");
      await this.$store.dispatch("global/getIngameTanks");
      this.$store.dispatch("global/setTimers");
    }
  }
};
</script>
