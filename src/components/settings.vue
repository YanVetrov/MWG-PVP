<template>
    <div 
    class="settings"  style="overflow-y: scroll;
    height: 90%;">
    <div class="username" v-if="user.accountName">{{user.accountName}}</div>
    <div style="display:flex;">
      <div style="width:50%">
    <div> <input type="checkbox" id="sound" @change="$emit('update:soundEnabled',$event.target.checked)" :checked="soundEnabled"></input> <label for="sound">Sound enabled</label> </div>
    <div> <input type="checkbox" id="scan" @change="$emit('scanlines',$event.target.checked)" :checked="scanlines"></input> <label for="scan">Scanlines effect</label> </div>
    <div> <input type="checkbox" id="chat" @change="$emit('chatsound',$event.target.checked)" :checked="chatsound"></input> <label for="chat">Chat sound</label> </div>
    <div style="margin-bottom:15px;"> 
      <input type="checkbox" id="music" @change="$emit('musicEnabled',$event.target.checked)" :checked="musicEnabled"></input> <label for="music">Music enabled</label> </div>
    RPC ENDPOINT:
    <select @change="$emit('changeEndpoint',$event.target.value)" style="margin-top:20px">
      <option v-for="link in endpoints" :selected="user.rpc.endpoint===link" :key="link">{{link}}</option>
    </select>
    {{ping}}ms
    <br/>
    <button @click="$emit('clear')">Clear cache</button>
    <button @click="$emit('logout')">Log out</button>
    </div>
    <div style="width:50%">
    Autosign transaction for (only private key sign in method):
    <div style="display: flex;
    flex-wrap: wrap;"> <label class="check_confirm"  v-for="(val,key) in confirms" :key="key"> <input type="checkbox" @change="$emit('confirm',{key,val:$event.target.checked})" :checked="val"/> {{key}}</label> </div>
    </div>
    </div>
    
    </div>
    
  </div>
</template>
<script>
import endpoints from '~/static/endpoints.js'

export default {
    props:['soundEnabled','musicEnabled','fullscreen','user','waxBalance','ping','confirms','scanlines','chatsound'],
    data(){
      return{
        endpoints
      }
    },
}
</script>
<style scoped>
.check_confirm{
  margin: 3px;
    font-size: 15px;
    border: 1px solid rebeccapurple;
    padding: 5px;
    border-radius: 2px;
}
.check_confirm:hover{
    transform: scale(1.1);
    background:rebeccapurple;
}
</style>