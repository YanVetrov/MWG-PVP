<template>
<div style="padding-top:30px;height:93%;overflow-y:scroll">
    <button :class="{active:tab===1}" @click="tab=1">manage</button> 
    <button :class="{active:tab===2}" @click="tab=2">list orders</button>
    <button :class="{active:tab===3}" @click="tab=3"><img src="../assets/question.svg" /></button>
    <transition name="fade" mode="out-in">
    <div v-if="tab===1" :key="1">
        <br>
        <div style="display:flex;justify-content:space-around">
    <div class="inline">
    <div>how much you can pay? <img src="../assets/pay.svg" /></div>
	<input type="number"  v-model="amount" placeholder="wax amount"></input>
	</div>
    <div class="inline">
    <div>how much you need days? <img src="../assets/time.svg" /></div>
    <input type="number"  v-model="days" placeholder="days"></input>
	</div>
    <div class="inline">
    <div>how much (in wax) you need cpu? <img src="../assets/cpu.svg" /></div>
    <input type="number"   v-model="stake_amount" placeholder="stake amount"></input>
	</div>
    </div>
    <div style="display:flex;justify-content:center">
    <button style="font-size:20px;" @click="$emit('order',{amount,days,stake_amount})">CREATE ORDER</button>
    </div>
	<br><br>
    <div class="list_orders">
        <div style="text-align:center">Your requests</div>
        <div v-if="selfRequests.length">
        <div class="order" v-for="item in selfRequests" :key="item.id">
            <span style="    margin-right: 10px;">{{item.id}}: </span>
            <div class="order_who" :style="!item.creditor?{opacity:0.7,color:'wheat'}:''">{{item.creditor||'no creditor'}}</div>
            <div class="mini"><img src="../assets/right-arrow.svg" /></div>
            <div class="order_who" style="color:gold">YOU</div>
            <div class="order_percent">
                <div><timer v-if="item.start_time" :time="item.start_time*1000+(item.days*24*60*60*1000)" /></div>
                <div class="micr">proposed {{item.price.split(' ')[0].split('.')[0]}}wax for {{item.stake_money.split(' ')[0].split('.')[0]}}wax(CPU) ({{item.days}}days)</div>
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
    <div class="empty" v-else>You havn't orders
        <div>
            <img style="width:100px;" src="../assets/empty.svg" />
        </div>
    </div>
    
    </div>
    <div class="list_orders">
        <div style="text-align:center">Your rents as creditor</div>
        <div v-if="selfCredits.length">
        <div class="order" v-for="item in selfCredits" :key="item.id">
            <span style="    margin-right: 10px;">{{item.id}}: </span>
            <div class="order_who" style="color:gold">YOU</div>
            <div class="mini"><img src="../assets/right-arrow.svg" /></div>
            <div class="order_who">{{item.owner}}</div>
            <div class="order_percent">
                <div><timer v-if="item.start_time" :time="item.start_time*1000+item.days*24*60*60*1000" /></div>
                 <div class="micr">proposed {{item.price.split(' ')[0].split('.')[0]}}wax for {{item.stake_money.split(' ')[0].split('.')[0]}}wax(CPU) ({{item.days}}days)</div>
            </div>
            <div>
                    <button
                     @click="$emit('claimRent',{order_id:item.id,amount:item.stake_money,receiver:item.owner})">
                     claim {{Number(item.price.split(' ')[0].split('.')[0])-Number(item.price.split(' ')[0].split('.')[0])*0.05}}WAX({{item.price.split(' ')[0].split('.')[0]}}WAX-5%)
                     </button>
            </div>
        </div>
        </div>
        <div class="empty" v-else>You are not a creditor 
        <div>
            <img style="width:100px;" src="../assets/empty.svg" />
        </div>
    </div>
    </div>
    </div>
    <div v-if="tab===2" class="list_orders" :key="2">
        <div v-if="allOrdersFiltered.length">
        <div class="order" v-for="item in allOrdersFiltered" :key="item.id">
            <span style="    margin-right: 10px;">{{item.id}}: </span>
            <div class="order_who" :style="!item.creditor?{opacity:0.7,color:'wheat'}:''">{{item.creditor||'no creditor'}}</div>
            <div class="mini"><img src="../assets/right-arrow.svg" /></div>
            <div class="order_who">{{item.owner}}</div>
            <div class="order_percent">
                <div><timer v-if="item.start_time" :time="item.start_time*1000+item.days*24*60*60*1000" /></div>
                 <div class="micr">proposed {{item.price.split(' ')[0].split('.')[0]}}wax for {{item.stake_money.split(' ')[0].split('.')[0]}}wax(CPU) ({{item.days}}days) <div style="color:yellow">{{item.percent}}%/day </div></div>
            </div>
            <div>
                    <button
                     @click="$emit('stakeRent',{order_id:item.id,amount:item.stake_money,receiver:item.owner})">
                     stake
                     </button>
            </div>
        </div>
        </div>
        <div class="empty" v-else>There are currently no open offers
        <div>
            <img style="width:100px;" src="../assets/empty.svg" />
        </div>
    </div>
    </div>
    <div v-if="tab===3" class="list_orders" :key="3">
        <button @click="lang='ru'" :class="{active:lang==='ru'}">rus</button>
         <button @click="lang='en'" :class="{active:lang==='en'}">eng</button>
        <div v-if="lang==='en'">
            <h1>
                Metal War CPU Renting 
            </h1>

<p>
    
    Borrowers: Players will be able to create rental orders to have WAX staked to their CPU for a certain time period
</p>

<p>
    Renters: Players will be able to stake WAX to fulfill borrow orders
</p>

<p>
    1. When WAX is staked, the following two irreversible transactions are sent to blockchain:
</p>

<p>
    - Renter’s account delegates the amount of WAX in the CPU corresponding to the order for the borrower’s account
    - Renter’s account informs the metalwarrent contract is the order has been fulfilled
</p>

<p>
    2. Once the CPU rental has expired, renters can claim their WAX + Reward using the claim buttom using the following 2 actions in 1 irreversible transactions:
</p>

<p>
    - Renter’s account informs metalwarrent to send reward for completed order
    - Renter’s account takes back the WAX that was staked for borrower’s CPU 
</p>
<p style="color:yellow;">
for claim Wax charges a fee in the amount of 5% of the reward amount</p>
<p>
    Protection for borrowers:
</p>

<p>
    - If a renter who provided the CPU ressources to borrower pulls the stake before the end of the rental period, this will be considered to be a violation of the terms of use of smart contract. Borrowers will then be able to Report the action for the order number
    - In such case, the order is cleared from the system and the rental fee is  returned to borrower if the report is approved 
</p>

<p>
    This rental system has been created to solve the absence of trusted ressources and services for temporary WAX CPU usage.
</p>

<p>
    There is currently no peer-to-peer rental system within a safe and trustworthy contract system. Both renters and borrowers will be protected in this rental system everything will be transacted within the smart contract.
</p>
        </div>
        <div v-if="lang==='ru'">
<p>
    1. участники которым необходимы WAX для CPU создают об этом заказ (при этом они совершают перевод WAX на покрытие награды для исполнителя и эти WAX находятся на контракте до тех пор пока не выплатятся исполнителю после окончания срока аренды или в качестве возврата вернутся заказчику в случае события Report)
</p>

<p>
    2. участники которые хотят получать вознаграждение за предоставления своих WAX могут исполнять ордера при помощи кнопки Stake
</p>

<p>
    в момент нажатия Stake происходит 2 действия в одной необратимой транзакции:<br><br>
    - 1 ваш акаунт делегирует соответствующее заказу количество WAX в CPU для акаунта заказчика<br>
    - 2 ваш акаунт сообщает контракту  'metalwarrent'  о том что он исполнил этот заказ<br>
</p>

<p>
    3. после истечения срока аренды участник который делегировал свои WAX в пользу заказчика указаного в ордере становится доступна кнопка Claim (востребование награды + разморозка своих кровных)
</p>

<p>
    в момент нажатия  Claim происходит 2 действия в одной необратимой транзакции:
</p>
<p>
    - 1 ваш акаунт сообщает контракту  'metalwarrent'  о том что он желает получить вознаграждения за завершенный  заказ тогда контракт отправит вам вознаграждение указаное в данном заказе<br>
    - 2 ваш акаунт отзывает делегированные  ранее  соответствующее заказу количество WAX в CPU для акаунта заказчика<br>
    <span style="color:yellow;">
за claim, wax взимает комиссию в размере 5% от суммы награды</span>
</p>

<p>
    Особенности взаиморасчетов и предусмотренная защита от преждевременного отзывания делегированых ресурсов:
</p>
<p>
    - если участник который  делегирует соответствующее заказу количество WAX в CPU для акаунта заказчика вдруг по какой то причине решит отозвать ресурсы раньше положеного срока нарушив тем самым условия использования смартконтракта тогда  у заказчика а так же любого другого акаунта системы появляется возможность вызвать действие Report для соответствующего номера заказа <br>
    - в этом случае контракт возвращает WAX предназначеный для вознагрождения обратно заказчику и запись о заказе очищается из системы, нарушитель не сможет иметь возможность Claim данного заказа при окончании срока заказа так как заказ анулируется при успешном Report <br>
</p>

<p>
    Данная система призвана решить глобальную проблему доверия между крупными держателями ресурсов и сервисами для передачи во временное пользования другим участникам сети.
    при текущем дизайне системы люди предоставляют ресурсы друг другу без необходимости доверия контракту суммы для делегирования 
    контракт лишь помагает гарантировать передачу обещаного вознаграждений от заказчика к исполнителю по окончании срока аренды и возврат средств заказчику в случае несоблюдения исполнителем договоренностей
      
</p>      </div>
    </div>
    </transition>
    </div>
</template>
<script>
import {store} from '../store.js'
import timer from './timer.vue'
export default {
    components:{timer},
    data(){
        return{
            tab:1,
            lang:'en',
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
                upper_bound : store.user.accountName,
                limit:1000
            })
            let selfCredits = await store.user.rpc.get_table_rows({
					code : 'metalwarrent',
					scope : 'metalwarrent',
					table : 'orders',
					index_position : 'tertiary',
					key_type : 'name',
					lower_bound : store.user.accountName,
                    upper_bound : store.user.accountName,
                    limit:1000
                });
                let allOrders = await store.user.rpc.get_table_rows({
					code : 'metalwarrent',
					scope : 'metalwarrent',
					table : 'orders',
					index_position : 'fourth',
                    key_type : 'i64',
                    limit:1000
				});
            this.selfRequests = selfRequests.rows;
            this.selfCredits = selfCredits.rows;
            this.allOrders = allOrders.rows.map(el=>{
                let price = el.price.split(' ')[0].split('.')[0]
                let stake_money = el.stake_money.split(' ')[0].split('.')[0];
                let days = el.days+3;
                let percent = (price/days/stake_money*100).toFixed(5);
                return {...el,percent};
            });
            this.allOrders.sort((a,b)=>{
                if(a.percent>b.percent)return -1;
                else if(b.percent>a.percent)return 1;
                else return 0;
            });
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
.inline{
    display: inline-block;
    color: silver;
    font-size: 10px;
}
.inline img{
    width:20px;
}
.inline>div{
    display: flex;
    align-items: center;
    justify-content: space-around;
}
.mini img{
        width: 25px;
    position: relative;
    top: 4px;
}
button img{
    width:11px;
}
.empty{
        display: flex;
    align-items: center;
    flex-direction: column;
    opacity: 0.5;
    padding: 20px;
}
</style>