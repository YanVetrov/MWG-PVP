<template>
  <div class="shards_cards" style="height:88%">
    <div class="shards_line">
      <shard
        class="shards_point"
        @shardsToNft="$emit('shardsToNft', $event)"
        @craftMech="$emit('craftMech', $event)"
        v-for="tank in shards"
        :key="tank.id"
        :ident="tank.id"
        :name="tank.name"
        :shards="tank.shards"
        :image="tank.image"
        :code="tank.shardCode"
        :mechShard="tank.mechShard"
      />
      <shard
        class="shards_point"
        @shardsToNft="$emit('shardsToNft', $event)"
        @craftMech="$emit('craftMech', $event)"
        :ident="2"
        :name="'pumpkin'"
        :shards="pumpkin"
        :code="'PUMPKIN'"
        :mechShard="0"
      />
    </div>
    <!-- <div class="shards_line" style="height:9%">
      <div
        class="shards_point"
        style="background:none;"
        @click="$emit('nftToUnit', tank.id)"
        v-for="tank in shards"
        :key="tank.id"
      >
        <img style="width:15px" src="~/assets/exchange.svg" />
      </div>
    </div> -->
    <!-- <div class="shards_line">
      <div
        class="shards_point"
        :style="{ background: 'none' }"
        @click="$emit('nftToUnit', tank.id)"
        v-for="tank in shards"
        :key="tank.id"
      >
        <div class="button raid">
          BUY <br />
          {{ tank.name }}<br />
          [500]
        </div>
      </div>
    </div> -->
  </div>
</template>
<script>
import shard from "./shard.vue";
export default {
  components: { shard },
  props: ["shards", "balance", "pumpkin"],
};
</script>
