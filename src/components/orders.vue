<template>
<div style="padding-top:30px;height:93%;overflow-y:scroll">
    <button @click="tab=1">manage</button> <button @click="tab=2">list orders</button>
    <transition name="fade" mode="out-in">
    <div v-if="tab===1">
        <br>
	<input type="number" style="width:25%" v-model="amount" placeholder="wax amount"></input>
	<input type="number" style="width:25%" v-model="days" placeholder="days"></input>
	<input type="number" style="width:25%"  v-model="stake_amount" placeholder="stake amount"></input>
	<button @click="$emit('order',{amount,days,stake_amount})">ORDER</button>
	<br><br>
    <div class="list_orders">
        <div>Your requests:</div>
        <div class="order" v-for="item in selfRequests" :key="item.id">
            <span style="    margin-right: 10px;">{{item.id}}: </span>
            <div class="order_who" :style="!item.creditor?{opacity:0.7,color:wheat}:''">{{item.creditor||'no creditor'}}</div>
            <div class="mini">-></div>
            <div class="order_who" style="color:gold">YOU</div>
            <div class="order_percent">
                <div>{{item.start_time?Math.floor((Date.now() / 1000 - item.start_time) * 100 / (item.days * 60 * 60 * 24)):0}}%</div>
                <div class="micr">{{item.price.split(' ')[0].split('.')[0]}} -> {{item.stake_money.split(' ')[0].split('.')[0]}}({{item.days}}days)</div>
                </div>
                <div>
                    <button
                    v-if="item.start_time===0"
                     @click="$emit('closeOrder',{order_id:item.id})">
                     cancel
                     </button>
                    <button 
                    v-if="item.start_time" 
                    @click="$emit('report',{order_id:item.id})">report</button>
                </div>
        </div>
    </div>
    <div class="list_orders">
        <div>Your rents as creditor:</div>
        <div class="order" v-for="item in selfCredits" :key="item.id">
            <span style="    margin-right: 10px;">{{item.id}}: </span>
            <div class="order_who" style="color:gold">YOU</div>
            <div class="mini">-></div>
            <div class="order_who">{{item.owner}}</div>
            <div class="order_percent">
                <div>{{item.start_time?Math.floor((Date.now() / 1000 - item.start_time) * 100 / (item.days * 60 * 60 * 24)):0}}%</div>
                 <div class="micr">{{item.price.split(' ')[0].split('.')[0]}} -> {{item.stake_money.split(' ')[0].split('.')[0]}}({{item.days}}days)</div>
            </div>
            <div>
                    <button
                    v-if="item.start_time&&Math.floor((Date.now() / 1000 - item.start_time) * 100 / (item.days * 60 * 60 * 24))>=100"
                     @click="$emit('claim',{order_id:item.id,amount:item.stake_money})">
                     claim
                     </button>
            </div>
        </div>
    </div>
    </div>
    <div v-else class="list_orders">
        <div class="order" v-for="item in allOrdersFiltered" :key="item.id">
            <span style="    margin-right: 10px;">{{item.id}}: </span>
            <div class="order_who" :style="!item.creditor?{opacity:0.7,color:wheat}:''">{{item.creditor||'no creditor'}}</div>
            <div class="mini">-></div>
            <div class="order_who">{{item.owner}}</div>
            <div class="order_percent">
                <div>{{item.start_time?Math.floor((Date.now() / 1000 - item.start_time) * 100 / (item.days * 60 * 60 * 24)):0}}%</div>
                 <div class="micr">{{item.price.split(' ')[0].split('.')[0]}} -> {{item.stake_money.split(' ')[0].split('.')[0]}}({{item.days}}days)</div>
            </div>
            <div>
                    <button
                     @click="$emit('stakeRent',{order_id:item.id,amount:item.stake_money})">
                     stake
                     </button>
            </div>
        </div>
    </div>
    </transition>
    </div>
</template>
<script>
import {store} from '../store.js'
export default {
    data(){
        return{
            tab:1,
            interval:'',
            amount:'',
            days:'',
            stake_amount:'',
            order_id:'',
            selfRequests:[],
            selfCredits:[],
            allOrders:[]
        }
    },
    computed:{
        allOrdersFiltered(){
           return this.allOrders
            .filter(el=>!el.creditor&&el.owner!==store.user.accountName)
        },
        accountName(){
            return store.user.accountName;
        }
    },
    methods:{
        async getTables(){
            let selfRequests = await store.user.rpc.get_table_rows({
				code : 'metalwarrent',
				scope : 'metalwarrent',
				table : 'orders',
				index_position : 'secondary',
				key_type : 'name',
				lower_bound : store.user.accountName,
				upper_bound : store.user.accountName
            })
            let selfCredits = await store.user.rpc.get_table_rows({
					code : 'metalwarrent',
					scope : 'metalwarrent',
					table : 'orders',
					index_position : 'tertiary',
					key_type : 'name',
					lower_bound : store.user.accountName,
					upper_bound : store.user.accountName
                });
                let allOrders = await store.user.rpc.get_table_rows({
					code : 'metalwarrent',
					scope : 'metalwarrent',
					table : 'orders',
					index_position : 'fourth',
					key_type : 'i64',
				});
            this.selfRequests = selfRequests.rows;
            this.selfCredits = selfCredits.rows;
            this.allOrders = allOrders.rows;
        }
    },
    beforeDestroy(){
        clearInterval(this.interval)
    },
    mounted(){
        this.getTables();
        this.interval= setInterval(this.getTables,5000)
    }
}
</script>
<style scoped>
.list_orders{
    color:white;
    margin-top:20px;
}
.order{
    display: flex;
    color: #cce;
    padding: 20px 0;
    border-bottom: 1px solid rebeccapurple;
    align-items:center;
}
.order>div {
    width:30%
}
.order .mini{
    width:4%
}
.micr{
    font-size:9px;
}
</style>