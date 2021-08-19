<template>
    <div 
    class="settings" @click="test" >
    <div class="username" v-if="user.accountName">username: {{user.accountName}} ({{waxBalance}})</div>
    <div @click="$emit('fullscreen')">
      <input type="checkbox" id="fullscreen" :checked="fullscreen" ></input>
      <label for="fullscreen">Switch fullscreen</label>
    </div>
    <div> <input type="checkbox" id="sound" @change="$emit('update:soundEnabled',$event.target.checked)" :checked="soundEnabled"></input> <label for="sound">Sound enabled</label> </div>
    <div> <input type="checkbox" id="music" @change="$emit('update:musicEnabled',$event.target.checked)" :checked="musicEnabled"></input> <label for="music">Music enabled</label> </div>
    Request confirm transaction for(only private key sign in method):
    <div> <label v-for="(val,key) in confirms" :key="key"> <input type="checkbox" :checked="val"/> {{key}}</label> </div>
    RPC ENDPOINT:
    <select @change="$emit('changeEndpoint',$event.target.value)" style="margin-top:20px">
      <option v-for="link in endpoints" :selected="user.rpc.endpoint===link" :key="link">{{link}}</option>
    </select>
    {{ping}}ms
    <br/>
    <button @click="$emit('clear')">Clear cache</button>
    <button @click="$emit('logout')">Log out</button>
    </div>
    
  </div>
</template>
<script>
import endpoints from '~/static/endpoints.js'

export default {
    props:['soundEnabled','musicEnabled','fullscreen','user','waxBalance','ping','confirms'],
    data(){
      return{
        endpoints
      }
    },
}
</script>