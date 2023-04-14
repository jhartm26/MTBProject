import{_ as we,V as Ce,a as te,b as de,c as Ie}from"./VCard.7e17fd63.js";import{p as Se,i as De,c as v,r as E,a as ve,u as mt,b as Q,g as He,o as ft,d as vt,e as ht,f as gt,h as pt,j as Ke,k as yt,l as N,m as P,w as s,n as a,q as G,t as q,s as bt,v as W,x as It,y as _t,z as kt,A as Vt,B as wt,C as Ct,D as he,E as St,F as Tt,G as At,H as _e,I as ae,V as O,J as $e,K as xt,L as K,M as Ut,N as Ee,O as Dt,P as $t,Q as ge,R as b,S as Ge,T as Nt,U as xe,W as Lt,X as Bt,Y as Pt,Z as Et,_ as Re,$ as me,a0 as Te,a1 as Ne,a2 as qe,a3 as Rt,a4 as pe,a5 as Le,a6 as R,a7 as ee,a8 as We,a9 as Ze,aa as Xe,ab as Ye,ac as Mt,ad as jt,ae as Ot,af as zt,ag as Ft,ah as Ue,ai as Ht,aj as Kt,ak as Gt,al as qt,am as Wt,an as Zt,ao as Je,ap as Xt,aq as Yt,ar as Jt}from"./index.02a137cd.js";const ke=Symbol.for("vuetify:layout"),Qe=Symbol.for("vuetify:layout-item"),Me=1e3,Qt=Se({overlaps:{type:Array,default:()=>[]},fullHeight:Boolean},"layout"),ea=Se({name:{type:String},order:{type:[Number,String],default:0},absolute:Boolean},"layout-item");function ta(){const e=De(ke);if(!e)throw new Error("[Vuetify] Could not find injected layout");return{getLayoutItem:e.getLayoutItem,mainRect:e.mainRect,mainStyles:e.mainStyles}}function aa(e){var n;const l=De(ke);if(!l)throw new Error("[Vuetify] Could not find injected layout");const t=(n=e.id)!=null?n:`layout-item-${vt()}`,i=He("useLayoutItem");Ke(Qe,{id:t});const u=E(!1);ht(()=>u.value=!0),gt(()=>u.value=!1);const{layoutItemStyles:o,layoutItemScrimStyles:d}=l.register(i,{...e,active:v(()=>u.value?!1:e.active.value),id:t});return pt(()=>l.unregister(t)),{layoutItemStyles:o,layoutRect:l.layoutRect,layoutItemScrimStyles:d}}const la=(e,l,t,i)=>{let u={top:0,left:0,right:0,bottom:0};const o=[{id:"",layer:{...u}}];for(const d of e){const n=l.get(d),r=t.get(d),m=i.get(d);if(!n||!r||!m)continue;const f={...u,[n.value]:parseInt(u[n.value],10)+(m.value?parseInt(r.value,10):0)};o.push({id:d,layer:f}),u=f}return o};function na(e){const l=De(ke,null),t=v(()=>l?l.rootZIndex.value-100:Me),i=E([]),u=ve(new Map),o=ve(new Map),d=ve(new Map),n=ve(new Map),r=ve(new Map),{resizeRef:m,contentRect:f}=mt(),w=v(()=>{var h;const y=new Map,U=(h=e.overlaps)!=null?h:[];for(const M of U.filter(I=>I.includes(":"))){const[I,$]=M.split(":");if(!i.value.includes(I)||!i.value.includes($))continue;const X=u.get(I),j=u.get($),z=o.get(I),c=o.get($);!X||!j||!z||!c||(y.set($,{position:X.value,amount:parseInt(z.value,10)}),y.set(I,{position:j.value,amount:-parseInt(c.value,10)}))}return y}),k=v(()=>{const y=[...new Set([...d.values()].map(h=>h.value))].sort((h,M)=>h-M),U=[];for(const h of y){const M=i.value.filter(I=>{var $;return(($=d.get(I))==null?void 0:$.value)===h});U.push(...M)}return la(U,u,o,n)}),g=v(()=>!Array.from(r.values()).some(y=>y.value)),_=v(()=>k.value[k.value.length-1].layer),D=v(()=>({"--v-layout-left":Q(_.value.left),"--v-layout-right":Q(_.value.right),"--v-layout-top":Q(_.value.top),"--v-layout-bottom":Q(_.value.bottom),...g.value?void 0:{transition:"none"}})),A=v(()=>k.value.slice(1).map((y,U)=>{let{id:h}=y;const{layer:M}=k.value[U],I=o.get(h),$=u.get(h);return{id:h,...M,size:Number(I.value),position:$.value}})),le=y=>A.value.find(U=>U.id===y),B=He("createLayout"),Z=E(!1);ft(()=>{Z.value=!0}),Ke(ke,{register:(y,U)=>{let{id:h,order:M,position:I,layoutSize:$,elementSize:X,active:j,disableTransitions:z,absolute:c}=U;d.set(h,M),u.set(h,I),o.set(h,$),n.set(h,j),z&&r.set(h,z);const C=yt(Qe,B==null?void 0:B.vnode).indexOf(y);C>-1?i.value.splice(C,0,h):i.value.push(h);const V=v(()=>A.value.findIndex(S=>S.id===h)),F=v(()=>t.value+k.value.length*2-V.value*2),ue=v(()=>{const S=I.value==="left"||I.value==="right",Y=I.value==="right",H=I.value==="bottom",se={[I.value]:0,zIndex:F.value,transform:`translate${S?"X":"Y"}(${(j.value?0:-110)*(Y||H?-1:1)}%)`,position:c.value||t.value!==Me?"absolute":"fixed",...g.value?void 0:{transition:"none"}};if(!Z.value)return se;const x=A.value[V.value];if(!x)throw new Error(`[Vuetify] Could not find layout item "${h}"`);const re=w.value.get(h);return re&&(x[re.position]+=re.amount),{...se,height:S?`calc(100% - ${x.top}px - ${x.bottom}px)`:X.value?`${X.value}px`:void 0,left:Y?void 0:`${x.left}px`,right:Y?`${x.right}px`:void 0,top:I.value!=="bottom"?`${x.top}px`:void 0,bottom:I.value!=="top"?`${x.bottom}px`:void 0,width:S?X.value?`${X.value}px`:void 0:`calc(100% - ${x.left}px - ${x.right}px)`}}),ne=v(()=>({zIndex:F.value-1}));return{layoutItemStyles:ue,layoutItemScrimStyles:ne,zIndex:F}},unregister:y=>{d.delete(y),u.delete(y),o.delete(y),n.delete(y),r.delete(y),i.value=i.value.filter(U=>U!==y)},mainRect:_,mainStyles:D,getLayoutItem:le,items:A,layoutRect:f,rootZIndex:t});const ye=v(()=>["v-layout",{"v-layout--full-height":e.fullHeight}]),fe=v(()=>({zIndex:t.value,position:l?"relative":void 0,overflow:l?"hidden":void 0}));return{layoutClasses:ye,layoutStyles:fe,getLayoutItem:le,items:A,layoutRect:f,layoutRef:m}}const sa={props:{name:String,number:Number}},oa={class:"text-h4 text--primary"};function ia(e,l,t,i,u,o){return N(),P(te,{rounded:"lg",class:"ma-2",width:"max-content"},{default:s(()=>[a(Ce,null,{default:s(()=>[G("div",null,q(this.name),1),G("p",oa,q(this.number),1)]),_:1})]),_:1})}const ua=we(sa,[["render",ia]]),T=bt.create({baseURL:{}.VUE_APP_API_BASE_URL});T.interceptors.request.use(e=>(e!=null&&e.headers&&(e.headers["x-access-token"]=localStorage.getItem("token")||""),e));const be={async getAccounts(){const e=await T.get("/rest/api/social-media/accounts"),l=[];for(const t of e.data){const i=Object.assign({},t);i.trails_table=i.trails.map(u=>u.name).join(", "),i.last_update=new Date(i.last_update).toLocaleString(),l.push(i)}return l},async getAccount(e){const t=(await T.get(`/rest/api/social-media/accounts?id=${e}`)).data;return t.trails_table=t.trails.map(i=>i.name).join(", "),t.last_update=new Date(t.last_update).toLocaleString(),t},async createAccount(e){const l=await T.put("/rest/api/social-media/accounts",e);return e.UUID=l.data.UUID,await this.associateAccount(e.trails,e),l.data},async updateAccount(e,l){const t=[],i=e.trails.map(r=>r.UUID);for(const r of l.trails)i.includes(r.UUID)||t.push(r);const u=[],o=l.trails.map(r=>r.UUID);for(const r of e.trails)o.includes(r.UUID)||u.push(r);t.length>0&&await this.associateAccount(t,e),u.length>0&&await this.disassociateAccount(u,e);const d=Object.assign({},l);return delete d.trails,(await T.post(`/rest/api/social-media/accounts/edit?id=${l.UUID}`,d)).data},async deleteAccount(e){return(await T.delete(`/rest/api/social-media/accounts?id=${e}`)).data},async associateAccount(e,l){return(await T.post(`/rest/api/social-media/accounts/associate-trails?id=${l.UUID}`,{trails:e})).data},async disassociateAccount(e,l){return(await T.post(`/rest/api/social-media/accounts/disassociate-trails?id=${l.UUID}`,{trails:e})).data}},oe={async getTrails(e=!0){return(await T.get(`/rest/api/trails?simple=${e}`)).data},async getTrail(e,l=!0){return(await T.get(`/rest/api/trails?id=${e}&simple=${l}`)).data},async getStates(){return(await T.get("/rest/api/trails/states")).data},async getStatusCount(){return(await T.get("/rest/api/trails/status/count")).data},async deleteTrail(e){return console.log(`Deleting trail ${e}`),(await T.delete(`/rest/api/trails?id=${e}`)).data},async createTrail(e){return(await T.post("/rest/api/trails/add",e)).data},async editTrail(e,l){return(await T.post(`/rest/api/trails/edit?id=${e}`,l)).data}};function ra(e,l,t){if(l==null)return e;if(Array.isArray(l))throw new Error("Multiple matches is not implemented");return typeof l=="number"&&~l?a($e,null,[a("span",{class:"v-autocomplete__unmask"},[e.substr(0,l)]),a("span",{class:"v-autocomplete__mask"},[e.substr(l,t)]),a("span",{class:"v-autocomplete__unmask"},[e.substr(l+t)])]):e}const et=W()({name:"VAutocomplete",props:{search:String,...It({filterKeys:["title"]}),..._t(),...kt(Vt({modelValue:null}),["validationValue","dirty","appendInnerIcon"]),...wt({transition:!1})},emits:{"update:search":e=>!0,"update:modelValue":e=>!0,"update:menu":e=>!0},setup(e,l){let{slots:t}=l;const{t:i}=Ct(),u=E(),o=E(!1),d=E(!0),n=E(),r=he(e,"menu"),m=v({get:()=>r.value,set:c=>{var p;r.value&&!c&&((p=n.value)==null?void 0:p.\u03A8openChildren)||(r.value=c)}}),{items:f,transformIn:w,transformOut:k}=St(e),g=he(e,"search",""),_=he(e,"modelValue",[],c=>w(Nt(c)),c=>{var C;const p=k(c);return e.multiple?p:(C=p[0])!=null?C:null}),D=Tt(),{filteredItems:A,getMatches:le}=At(e,f,v(()=>d.value?void 0:g.value)),B=v(()=>_.value.map(c=>f.value.find(p=>e.valueComparator(p.value,c.value))||c)),Z=v(()=>e.hideSelected?A.value.filter(c=>!B.value.some(p=>p.value===c.value)):A.value),ye=v(()=>B.value.map(c=>c.props.value)),fe=E();function y(c){e.openOnClear&&(m.value=!0),g.value=""}function U(){e.hideNoData&&!f.value.length||e.readonly||(D==null?void 0:D.isReadonly.value)||(m.value=!0)}function h(c){var p,C;e.readonly||(D==null?void 0:D.isReadonly.value)||(["Enter","ArrowDown","ArrowUp"].includes(c.key)&&c.preventDefault(),["Enter","ArrowDown"].includes(c.key)&&(m.value=!0),["Escape"].includes(c.key)&&(m.value=!1),["Enter","Escape","Tab"].includes(c.key)&&(d.value=!0),c.key==="ArrowDown"?(p=fe.value)==null||p.focus("next"):c.key==="ArrowUp"&&((C=fe.value)==null||C.focus("prev")))}function M(c){g.value=c.target.value}function I(){o.value&&(d.value=!0)}function $(c){o.value=!0}function X(c){var p;c.relatedTarget==null&&((p=u.value)==null||p.focus())}const j=E(!1);function z(c){if(e.multiple){const p=ye.value.findIndex(C=>e.valueComparator(C,c.value));if(p===-1)_.value=[..._.value,c],g.value="";else{const C=[..._.value];C.splice(p,1),_.value=C}}else _.value=[c],j.value=!0,t.selection||(g.value=c.title),m.value=!1,d.value=!0,xe(()=>j.value=!1)}return _e(o,c=>{var p,C;c?(j.value=!0,g.value=e.multiple||!!t.selection?"":String((C=(p=B.value.at(-1))==null?void 0:p.props.title)!=null?C:""),d.value=!0,xe(()=>j.value=!1)):(m.value=!1,g.value="")}),_e(g,c=>{!o.value||j.value||(c&&(m.value=!0),d.value=!c)}),ae(()=>{const c=!!(e.chips||t.chip),p=!!(!e.hideNoData||Z.value.length||t.prepend||t.append||t["no-data"]),[C]=O.filterProps(e);return a(O,K({ref:u},C,{modelValue:g.value,"onUpdate:modelValue":V=>{V==null&&(_.value=[])},validationValue:_.externalValue,dirty:_.value.length>0,onInput:M,class:["v-autocomplete",{"v-autocomplete--active-menu":m.value,"v-autocomplete--chips":!!e.chips,[`v-autocomplete--${e.multiple?"multiple":"single"}`]:!0,"v-autocomplete--selection-slot":!!t.selection}],appendInnerIcon:e.menuIcon,readonly:e.readonly,"onClick:clear":y,"onMousedown:control":U,onFocus:()=>o.value=!0,onBlur:()=>o.value=!1,onKeydown:h}),{...t,default:()=>a($e,null,[a(xt,K({ref:n,modelValue:m.value,"onUpdate:modelValue":V=>m.value=V,activator:"parent",contentClass:"v-autocomplete__content",eager:e.eager,maxHeight:310,openOnClick:!1,closeOnContentClick:!1,transition:e.transition,onAfterLeave:I},e.menuProps),{default:()=>[p&&a(Ut,{ref:fe,selected:ye.value,selectStrategy:e.multiple?"independent":"single-independent",onMousedown:V=>V.preventDefault(),onFocusin:$,onFocusout:X},{default:()=>{var V,F,ue,ne;return[!Z.value.length&&!e.hideNoData&&((F=(V=t["no-data"])==null?void 0:V.call(t))!=null?F:a(Ee,{title:i(e.noDataText)},null)),(ue=t["prepend-item"])==null?void 0:ue.call(t),Z.value.map(S=>{var Y,H;return(H=(Y=t.item)==null?void 0:Y.call(t,{item:S,props:K(S.props,{onClick:()=>z(S)})}))!=null?H:a(Ee,K({key:S.value},S.props,{onClick:()=>z(S)}),{prepend:se=>{let{isSelected:x}=se;return e.multiple&&!e.hideSelected?a(Dt,{modelValue:x,ripple:!1},null):void 0},title:()=>{var se,x,re;return d.value?S.title:ra(S.title,(se=le(S))==null?void 0:se.title,(re=(x=g.value)==null?void 0:x.length)!=null?re:0)}})}),(ne=t["append-item"])==null?void 0:ne.call(t)]}})]}),B.value.map((V,F)=>{var S,Y;function ue(H){H.stopPropagation(),H.preventDefault(),z(V)}const ne={"onClick:close":ue,modelValue:!0,"onUpdate:modelValue":void 0};return a("div",{key:V.value,class:"v-autocomplete__selection"},[c?t.chip?a(ge,{key:"chip-defaults",defaults:{VChip:{closable:e.closableChips,size:"small",text:V.title}}},{default:()=>{var H;return[(H=t.chip)==null?void 0:H.call(t,{item:V,index:F,props:ne})]}}):a($t,K({key:"chip",closable:e.closableChips,size:"small",text:V.title},ne),null):(Y=(S=t.selection)==null?void 0:S.call(t,{item:V,index:F}))!=null?Y:a("span",{class:"v-autocomplete__selection-text"},[V.title,e.multiple&&F<B.value.length-1&&a("span",{class:"v-autocomplete__selection-comma"},[b(",")])])])})])})}),Ge({isFocused:o,isPristine:d,menu:m,search:g,filteredItems:A,select:z},u)}});const Ve=W()({name:"VDialog",props:{fullscreen:Boolean,retainFocus:{type:Boolean,default:!0},scrollable:Boolean,...Lt({origin:"center center",scrollStrategy:"block",transition:{component:Bt},zIndex:2400})},emits:{"update:modelValue":e=>!0},setup(e,l){let{slots:t}=l;const i=he(e,"modelValue"),{scopeId:u}=Pt(),o=E();function d(r){var w,k;const m=r.relatedTarget,f=r.target;if(m!==f&&((w=o.value)==null?void 0:w.contentEl)&&((k=o.value)==null?void 0:k.globalTop)&&![document,o.value.contentEl].includes(f)&&!o.value.contentEl.contains(f)){const g=[...o.value.contentEl.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])')].filter(A=>!A.hasAttribute("disabled")&&!A.matches('[tabindex="-1"]'));if(!g.length)return;const _=g[0],D=g[g.length-1];m===_?D.focus():_.focus()}}Et&&_e(()=>i.value&&e.retainFocus,r=>{r?document.addEventListener("focusin",d):document.removeEventListener("focusin",d)},{immediate:!0}),_e(i,async r=>{var m,f;await xe(),r?(m=o.value.contentEl)==null||m.focus({preventScroll:!0}):(f=o.value.activatorEl)==null||f.focus({preventScroll:!0})});const n=v(()=>K({"aria-haspopup":"dialog","aria-expanded":String(i.value)},e.activatorProps));return ae(()=>{const[r]=Re.filterProps(e);return a(Re,K({ref:o,class:["v-dialog",{"v-dialog--fullscreen":e.fullscreen,"v-dialog--scrollable":e.scrollable}]},r,{modelValue:i.value,"onUpdate:modelValue":m=>i.value=m,"aria-modal":"true",activatorProps:n.value,role:"dialog"},u),{activator:t.activator,default:function(){for(var m=arguments.length,f=new Array(m),w=0;w<m;w++)f[w]=arguments[w];return a(ge,{root:!0},{default:()=>{var k;return[(k=t.default)==null?void 0:k.call(t,...f)]}})}})}),Ge({},o)}});const ie=W()({name:"VContainer",props:{fluid:{type:Boolean,default:!1},...me()},setup(e,l){let{slots:t}=l;return ae(()=>a(e.tag,{class:["v-container",{"v-container--fluid":e.fluid}]},t)),{}}}),tt=(()=>Te.reduce((e,l)=>(e[l]={type:[Boolean,String,Number],default:!1},e),{}))(),at=(()=>Te.reduce((e,l)=>{const t="offset"+Ne(l);return e[t]={type:[String,Number],default:null},e},{}))(),lt=(()=>Te.reduce((e,l)=>{const t="order"+Ne(l);return e[t]={type:[String,Number],default:null},e},{}))(),je={col:Object.keys(tt),offset:Object.keys(at),order:Object.keys(lt)};function da(e,l,t){let i=e;if(!(t==null||t===!1)){if(l){const u=l.replace(e,"");i+=`-${u}`}return e==="col"&&(i="v-"+i),e==="col"&&(t===""||t===!0)||(i+=`-${t}`),i.toLowerCase()}}const ca=["auto","start","end","center","baseline","stretch"],J=W()({name:"VCol",props:{cols:{type:[Boolean,String,Number],default:!1},...tt,offset:{type:[String,Number],default:null},...at,order:{type:[String,Number],default:null},...lt,alignSelf:{type:String,default:null,validator:e=>ca.includes(e)},...me()},setup(e,l){let{slots:t}=l;const i=v(()=>{const u=[];let o;for(o in je)je[o].forEach(n=>{const r=e[n],m=da(o,n,r);m&&u.push(m)});const d=u.some(n=>n.startsWith("v-col-"));return u.push({"v-col":!d||!e.cols,[`v-col-${e.cols}`]:e.cols,[`offset-${e.offset}`]:e.offset,[`order-${e.order}`]:e.order,[`align-self-${e.alignSelf}`]:e.alignSelf}),u});return()=>{var u;return qe(e.tag,{class:i.value},(u=t.default)==null?void 0:u.call(t))}}}),Be=["start","end","center"],nt=["space-between","space-around","space-evenly"];function Pe(e,l){return Te.reduce((t,i)=>{const u=e+Ne(i);return t[u]=l(),t},{})}const ma=[...Be,"baseline","stretch"],st=e=>ma.includes(e),ot=Pe("align",()=>({type:String,default:null,validator:st})),fa=[...Be,...nt],it=e=>fa.includes(e),ut=Pe("justify",()=>({type:String,default:null,validator:it})),va=[...Be,...nt,"stretch"],rt=e=>va.includes(e),dt=Pe("alignContent",()=>({type:String,default:null,validator:rt})),Oe={align:Object.keys(ot),justify:Object.keys(ut),alignContent:Object.keys(dt)},ha={align:"align",justify:"justify",alignContent:"align-content"};function ga(e,l,t){let i=ha[e];if(t!=null){if(l){const u=l.replace(e,"");i+=`-${u}`}return i+=`-${t}`,i.toLowerCase()}}const L=W()({name:"VRow",props:{dense:Boolean,noGutters:Boolean,align:{type:String,default:null,validator:st},...ot,justify:{type:String,default:null,validator:it},...ut,alignContent:{type:String,default:null,validator:rt},...dt,...me()},setup(e,l){let{slots:t}=l;const i=v(()=>{const u=[];let o;for(o in Oe)Oe[o].forEach(d=>{const n=e[d],r=ga(o,d,n);r&&u.push(r)});return u.push({"v-row--no-gutters":e.noGutters,"v-row--dense":e.dense,[`align-${e.align}`]:e.align,[`justify-${e.justify}`]:e.justify,[`align-content-${e.alignContent}`]:e.alignContent}),u});return()=>{var u;return qe(e.tag,{class:["v-row",i.value]},(u=t.default)==null?void 0:u.call(t))}}}),ce=Rt("flex-grow-1","div","VSpacer"),pa={data:()=>({loadingAccounts:!0,accounts:[],trails:[],search:"",dialog:!1,dialogDelete:!1,editedIndex:-1,formTitle:"",sortBy:[],editedItem:{uuid:"",account_name:"",page_id:"",trails:[]},defaultItem:{account_name:"",page_id:"",trails:[]},accountHeaders:[{title:"Account",value:"account_name",key:"account_name",sortable:!0},{title:"Twitter Account ID",value:"page_id",sortable:!0},{title:"Last Updated",value:"last_update",sortable:!0},{title:"Trails",value:"trails_table",key:"trails_table",sortable:!0},{title:"UUID",value:"uuid",align:" d-none"},{title:"Actions",key:"actions",sortable:!1}]}),methods:{async loadAccounts(){this.loadingAccounts=!0;try{this.accounts=[],this.accounts=await be.getAccounts(),this.trails=[],this.trails=await oe.getTrails(),this.loadingAccounts=!1}catch{this.loadingAccounts=!1}},editItem(e){this.editedIndex=this.accounts.indexOf(e),this.editedItem=Object.assign({},e),this.formTitle="Edit Account",this.dialog=!0},deleteItem(e){this.editedIndex=this.accounts.indexOf(e),this.editedItem=Object.assign({},e),this.formTitle="",this.dialogDelete=!0},async deleteItemConfirm(){await be.deleteAccount(this.editedItem.UUID),await this.loadAccounts(),this.closeDelete()},close(){this.dialog=!1,this.formTitle="",this.$nextTick(()=>{this.editedItem=Object.assign({},this.defaultItem),this.editedIndex=-1})},closeDelete(){this.dialogDelete=!1,this.formTitle="",this.$nextTick(()=>{this.editedItem=Object.assign({},this.defaultItem),this.editedIndex=-1})},async save(){this.editedIndex>-1?await be.updateAccount(this.accounts[this.editedIndex],this.editedItem):await be.createAccount(this.editedItem),await this.loadAccounts(),this.close()}},created(){this.loadAccounts()}},ya=G("span",{class:"headline"},"Accounts",-1),ba={class:"text-h5"};function Ia(e,l,t,i,u,o){const d=pe("v-data-table");return N(),P(te,{rounded:"lg",width:"100%"},{default:s(()=>[a(de,null,{default:s(()=>[ya]),_:1}),a(Le),a(d,{items:e.accounts,headers:e.accountHeaders,loading:e.loadingAccounts,search:e.search,"sort-by":e.sortBy,"onUpdate:sortBy":l[6]||(l[6]=n=>e.sortBy=n),"item-key":"uuid"},{top:s(()=>[a(L,{class:"d-flex mt-4",style:{"align-items":"center","max-width":"100%"}},{default:s(()=>[a(O,{modelValue:e.search,"onUpdate:modelValue":l[0]||(l[0]=n=>e.search=n),label:"Search",class:"mr-4 ml-5"},null,8,["modelValue"]),a(Ve,{modelValue:e.dialog,"onUpdate:modelValue":l[4]||(l[4]=n=>e.dialog=n),"max-width":"500px"},{activator:s(({props:n})=>[a(R,K({color:"primary",dark:"",class:"mb-2 mr-5 ml-2"},n),{default:s(()=>[b(" New Item ")]),_:2},1040)]),default:s(()=>[a(te,null,{default:s(()=>[a(de,null,{default:s(()=>[G("span",ba,q(e.formTitle||"Add Account"),1)]),_:1}),a(Ce,null,{default:s(()=>[a(ie,null,{default:s(()=>[a(L,null,{default:s(()=>[a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.account_name,"onUpdate:modelValue":l[1]||(l[1]=n=>e.editedItem.account_name=n),label:"Account Name"},null,8,["modelValue"])]),_:1}),a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.page_id,"onUpdate:modelValue":l[2]||(l[2]=n=>e.editedItem.page_id=n),label:"Account Username"},null,8,["modelValue"])]),_:1})]),_:1}),a(L,null,{default:s(()=>[a(J,null,{default:s(()=>[a(et,{modelValue:e.editedItem.trails,"onUpdate:modelValue":l[3]||(l[3]=n=>e.editedItem.trails=n),items:e.trails,"item-title":"name","item-value":"UUID","return-object":"",chips:"","closable-chips":"",label:"Trails",multiple:""},null,8,["modelValue","items"])]),_:1})]),_:1})]),_:1})]),_:1}),a(Ie,null,{default:s(()=>[a(ce),a(R,{color:"blue-darken-1",variant:"text",onClick:o.close},{default:s(()=>[b(" Cancel ")]),_:1},8,["onClick"]),a(R,{color:"blue-darken-1",variant:"text",onClick:o.save},{default:s(()=>[b(" Save ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1},8,["modelValue"]),a(Ve,{modelValue:e.dialogDelete,"onUpdate:modelValue":l[5]||(l[5]=n=>e.dialogDelete=n),"max-width":"500px"},{default:s(()=>[a(te,null,{default:s(()=>[a(de,{class:"text-h5"},{default:s(()=>[b("Are you sure you want to delete this item?")]),_:1}),a(Ie,null,{default:s(()=>[a(ce),a(R,{color:"blue-darken-1",variant:"text",onClick:o.closeDelete},{default:s(()=>[b("Cancel")]),_:1},8,["onClick"]),a(R,{color:"blue-darken-1",variant:"text",onClick:o.deleteItemConfirm},{default:s(()=>[b("OK")]),_:1},8,["onClick"]),a(ce)]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),"item.actions":s(({item:n})=>[a(ee,{size:"small",class:"me-2",onClick:r=>o.editItem(n.raw)},{default:s(()=>[b(" mdi-pencil ")]),_:2},1032,["onClick"]),a(ee,{size:"small",onClick:r=>o.deleteItem(n.raw)},{default:s(()=>[b(" mdi-delete ")]),_:2},1032,["onClick"])]),"item.account_name":s(({item:n})=>[b(q(n.raw.account_name.length>15?n.raw.account_name.slice(0,15).trim()+"...":n.raw.account_name),1)]),"item.trails_table":s(({item:n})=>[b(q(n.raw.trails_table.length>15?n.raw.trails_table.slice(0,15).trim()+"...":n.raw.trails_table),1)]),_:1},8,["items","headers","loading","search","sort-by"])]),_:1})}const _a=we(pa,[["render",Ia]]);const ka={data:()=>({loading:!0,search:"",dialog:!1,dialogDelete:!1,editedIndex:-1,formTitle:"",trails:[],states:[],sortBy:[],editedItem:{UUID:"",mtb_id:"",name:"",city:"",state:"",center_latitude:null,center_longitude:null},defaultItem:{UUID:"",mtb_id:"",name:"",city:"",state:"",center_latitude:null,center_longitude:null},headers:[{title:"MTB ID",value:"mtbID",sortable:!0},{title:"Name",value:"name",key:"name",sortable:!0},{title:"City",value:"city",sortable:!0},{title:"State",value:"state.name",sortable:!0},{title:"Status",value:"status.mtbStatus",sortable:!0},{title:"Weather",value:"weather.notes",sortable:!0},{title:"UUID",value:"uuid",align:" d-none"},{title:"Actions",key:"actions",sortable:!1}]}),methods:{async loadTrails(){this.loading=!0;try{this.trails=await oe.getTrails(!1),this.states=await oe.getStates(),this.loading=!1}catch{this.loading=!1}},editItem(e){this.editedIndex=this.trails.indexOf(e),this.editedItem=Object.assign({},e),this.formTitle="Edit Trail",(e.mtbId||e.mtbID)&&(this.editedItem.mtb_id=e.mtbId||e.mtbID),e.centerLatitude&&(this.editedItem.center_latitude=e.centerLatitude),e.centerLongitude&&(this.editedItem.center_longitude=e.centerLongitude),this.dialog=!0},deleteItem(e){this.editedIndex=this.trails.indexOf(e),this.editedItem=Object.assign({},e),this.formTitle="",this.dialogDelete=!0},async deleteItemConfirm(){console.log(this.editedItem),await oe.deleteTrail(this.editedItem.UUID),await this.loadTrails(),this.closeDelete()},close(){this.dialog=!1,this.formTitle="",this.$nextTick(()=>{this.editedItem=Object.assign({},this.defaultItem),this.editedIndex=-1})},closeDelete(){this.dialogDelete=!1,this.$nextTick(()=>{this.editedItem=Object.assign({},this.defaultItem),this.editedIndex=-1})},async save(){this.editedIndex>-1?console.log(await oe.editTrail(this.editedItem.UUID,this.editedItem)):console.log(await oe.createTrail(this.editedItem)),await this.loadTrails(),this.close()}},created(){this.loadTrails()}},Va=e=>(We("data-v-a4342072"),e=e(),Ze(),e),wa=Va(()=>G("span",{class:"headline"},"Trails",-1)),Ca={class:"text-h5"};function Sa(e,l,t,i,u,o){const d=pe("v-data-table");return N(),P(te,{rounded:"lg",width:"100%"},{default:s(()=>[a(de,null,{default:s(()=>[wa]),_:1}),a(Le),a(d,{items:e.trails,headers:e.headers,loading:e.loading,search:e.search,"sort-by":e.sortBy,"onUpdate:sortBy":l[9]||(l[9]=n=>e.sortBy=n),"item-key":"uuid"},{top:s(()=>[a(L,{class:"d-flex mt-4",style:{"align-items":"center","max-width":"100%"}},{default:s(()=>[a(O,{modelValue:e.search,"onUpdate:modelValue":l[0]||(l[0]=n=>e.search=n),label:"Search",class:"mr-4 ml-5"},null,8,["modelValue"]),a(Ve,{modelValue:e.dialog,"onUpdate:modelValue":l[7]||(l[7]=n=>e.dialog=n),"max-width":"500px"},{activator:s(({props:n})=>[a(R,K({color:"primary",dark:"",class:"mb-2 mr-5 ml-2"},n),{default:s(()=>[b(" New Trail ")]),_:2},1040)]),default:s(()=>[a(te,null,{default:s(()=>[a(de,null,{default:s(()=>[G("span",Ca,q(e.formTitle||"Add Trail"),1)]),_:1}),a(Ce,null,{default:s(()=>[a(ie,null,{default:s(()=>[a(L,null,{default:s(()=>[a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.mtb_id,"onUpdate:modelValue":l[1]||(l[1]=n=>e.editedItem.mtb_id=n),label:"MTB ID"},null,8,["modelValue"])]),_:1}),a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.name,"onUpdate:modelValue":l[2]||(l[2]=n=>e.editedItem.name=n),label:"Trail Name"},null,8,["modelValue"])]),_:1})]),_:1}),a(L,null,{default:s(()=>[a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.city,"onUpdate:modelValue":l[3]||(l[3]=n=>e.editedItem.city=n),label:"City"},null,8,["modelValue"])]),_:1}),a(J,null,{default:s(()=>[a(et,{modelValue:e.editedItem.state,"onUpdate:modelValue":l[4]||(l[4]=n=>e.editedItem.state=n),items:e.states,"item-title":"name","item-value":"UUID",label:"State"},null,8,["modelValue","items"])]),_:1})]),_:1}),a(L,null,{default:s(()=>[a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.center_latitude,"onUpdate:modelValue":l[5]||(l[5]=n=>e.editedItem.center_latitude=n),label:"Latitude",type:"number"},null,8,["modelValue"])]),_:1}),a(J,null,{default:s(()=>[a(O,{modelValue:e.editedItem.center_longitude,"onUpdate:modelValue":l[6]||(l[6]=n=>e.editedItem.center_longitude=n),label:"Longitude",type:"number"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1}),a(Ie,null,{default:s(()=>[a(ce),a(R,{color:"blue-darken-1",variant:"text",onClick:o.close},{default:s(()=>[b(" Cancel ")]),_:1},8,["onClick"]),a(R,{color:"blue-darken-1",variant:"text",onClick:o.save},{default:s(()=>[b(" Save ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1}),a(Ve,{modelValue:e.dialogDelete,"onUpdate:modelValue":l[8]||(l[8]=n=>e.dialogDelete=n),"max-width":"500px"},{default:s(()=>[a(te,null,{default:s(()=>[a(de,{class:"text-h5"},{default:s(()=>[b("Are you sure you want to delete this trail?")]),_:1}),a(Ie,null,{default:s(()=>[a(ce),a(R,{color:"blue-darken-1",variant:"text",onClick:o.closeDelete},{default:s(()=>[b("Cancel")]),_:1},8,["onClick"]),a(R,{color:"blue-darken-1",variant:"text",onClick:o.deleteItemConfirm},{default:s(()=>[b("OK")]),_:1},8,["onClick"]),a(ce)]),_:1})]),_:1})]),_:1},8,["modelValue"])]),"item.actions":s(({item:n})=>[a(ee,{size:"small",class:"me-2",onClick:r=>o.editItem(n.raw)},{default:s(()=>[b(" mdi-pencil ")]),_:2},1032,["onClick"]),a(ee,{size:"small",onClick:r=>o.deleteItem(n.raw)},{default:s(()=>[b(" mdi-delete ")]),_:2},1032,["onClick"])]),"item.name":s(({item:n})=>[b(q(n.raw.name.length>15?n.raw.name.slice(0,15).trim()+"...":n.raw.name),1)]),_:1},8,["items","headers","loading","search","sort-by"])]),_:1})}const Ta=we(ka,[["render",Sa],["__scopeId","data-v-a4342072"]]),ze={async getServerStatus(){try{return(await T.get("/rest/api/heartbeat")).data.state===1?"Running":"Restarting"}catch{return"Errored"}}},Aa={async checkSocials(){return(await T.post("/rest/api/check-socials")).data}};const xa=W()({name:"VApp",props:{...Qt({fullHeight:!0}),...Xe()},setup(e,l){let{slots:t}=l;const i=Ye(e),{layoutClasses:u,layoutStyles:o,getLayoutItem:d,items:n,layoutRef:r}=na(e),{rtlClasses:m}=Mt();return ae(()=>{var f;return a("div",{ref:r,class:["v-application",i.themeClasses.value,u.value,m.value],style:o.value},[a("div",{class:"v-application__wrap"},[(f=t.default)==null?void 0:f.call(t)])])}),{getLayoutItem:d,items:n,theme:i}}});const Ua=Se({text:String,...me()},"v-toolbar-title"),Da=W()({name:"VToolbarTitle",props:Ua(),setup(e,l){let{slots:t}=l;return ae(()=>{const i=!!(t.default||t.text||e.text);return a(e.tag,{class:"v-toolbar-title"},{default:()=>{var u;return[i&&a("div",{class:"v-toolbar-title__placeholder"},[t.text?t.text():e.text,(u=t.default)==null?void 0:u.call(t)])]}})}),{}}}),$a=[null,"prominent","default","comfortable","compact"],ct=Se({absolute:Boolean,collapse:Boolean,color:String,density:{type:String,default:"default",validator:e=>$a.includes(e)},extended:Boolean,extensionHeight:{type:[Number,String],default:48},flat:Boolean,floating:Boolean,height:{type:[Number,String],default:64},image:String,title:String,...jt(),...Ot(),...zt(),...me({tag:"header"}),...Xe()},"v-toolbar"),Fe=W()({name:"VToolbar",props:ct(),setup(e,l){var k;let{slots:t}=l;const{backgroundColorClasses:i,backgroundColorStyles:u}=Ft(Ue(e,"color")),{borderClasses:o}=Ht(e),{elevationClasses:d}=Kt(e),{roundedClasses:n}=Gt(e),{themeClasses:r}=Ye(e),m=E(!!(e.extended||((k=t.extension)==null?void 0:k.call(t)))),f=v(()=>parseInt(Number(e.height)+(e.density==="prominent"?Number(e.height):0)-(e.density==="comfortable"?8:0)-(e.density==="compact"?16:0),10)),w=v(()=>m.value?parseInt(Number(e.extensionHeight)+(e.density==="prominent"?Number(e.extensionHeight):0)-(e.density==="comfortable"?4:0)-(e.density==="compact"?8:0),10):0);return qt({VBtn:{variant:"text"}}),ae(()=>{var A;const g=!!(e.title||t.title),_=!!(t.image||e.image),D=(A=t.extension)==null?void 0:A.call(t);return m.value=!!(e.extended||D),a(e.tag,{class:["v-toolbar",{"v-toolbar--absolute":e.absolute,"v-toolbar--collapse":e.collapse,"v-toolbar--flat":e.flat,"v-toolbar--floating":e.floating,[`v-toolbar--density-${e.density}`]:!0},i.value,o.value,d.value,n.value,r.value],style:[u.value]},{default:()=>[_&&a("div",{key:"image",class:"v-toolbar__image"},[t.image?a(ge,{key:"image-defaults",disabled:!e.image,defaults:{VImg:{cover:!0,src:e.image}}},t.image):a(Wt,{key:"image-img",cover:!0,src:e.image},null)]),a(ge,{defaults:{VTabs:{height:Q(f.value)}}},{default:()=>{var le,B,Z;return[a("div",{class:"v-toolbar__content",style:{height:Q(f.value)}},[t.prepend&&a("div",{class:"v-toolbar__prepend"},[(le=t.prepend)==null?void 0:le.call(t)]),g&&a(Da,{key:"title",text:e.title},{text:t.title}),(B=t.default)==null?void 0:B.call(t),t.append&&a("div",{class:"v-toolbar__append"},[(Z=t.append)==null?void 0:Z.call(t)])])]}}),a(ge,{defaults:{VTabs:{height:Q(w.value)}}},{default:()=>[a(Zt,null,{default:()=>[m.value&&a("div",{class:"v-toolbar__extension",style:{height:Q(w.value)}},[D])]})]})]})}),{contentHeight:f,extensionHeight:w}}}),Na=W()({name:"VAppBar",props:{modelValue:{type:Boolean,default:!0},location:{type:String,default:"top",validator:e=>["top","bottom"].includes(e)},...ct(),...ea(),height:{type:[Number,String],default:64}},emits:{"update:modelValue":e=>!0},setup(e,l){let{slots:t}=l;const i=E(),u=he(e,"modelValue"),o=v(()=>{var f,w,k,g;const r=(w=(f=i.value)==null?void 0:f.contentHeight)!=null?w:0,m=(g=(k=i.value)==null?void 0:k.extensionHeight)!=null?g:0;return r+m}),{ssrBootStyles:d}=Je(),{layoutItemStyles:n}=aa({id:e.name,order:v(()=>parseInt(e.order,10)),position:Ue(e,"location"),layoutSize:o,elementSize:o,active:u,absolute:Ue(e,"absolute")});return ae(()=>{const[r]=Fe.filterProps(e);return a(Fe,K({ref:i,class:["v-app-bar",{"v-app-bar--bottom":e.location==="bottom"}],style:{...n.value,height:void 0,...d.value}},r),t)}),{}}});const Ae=W()({name:"VMain",props:{scrollable:Boolean,...me({tag:"main"})},setup(e,l){let{slots:t}=l;const{mainStyles:i}=ta(),{ssrBootStyles:u}=Je();return ae(()=>a(e.tag,{class:["v-main",{"v-main--scrollable":e.scrollable}],style:[i.value,u.value]},{default:()=>{var o,d;return[e.scrollable?a("div",{class:"v-main__scroller"},[(o=t.default)==null?void 0:o.call(t)]):(d=t.default)==null?void 0:d.call(t)]}})),{}}}),La={data:()=>({links:[{name:"Dashboard",focus:"dashboard"},{name:"Social Media Accounts",focus:"social-media-accounts"},{name:"Trails",focus:"trails"}],accountNum:0,trailNum:0,statusNum:0,interval:null,serverStatus:null,darkMode:!1,buttonText:"Run Check",checkClass:"",focus:"dashboard",disabledCheck:!1}),methods:{async loadData(){this.statusNum=0,this.statusNum=await oe.getStatusCount()},async runCheck(){this.buttonText="Running",this.checkClass="yellow-lighten-1",this.disabledCheck=!0;try{const e=await Aa.checkSocials();this.buttonText=`Updated ${e.numberUpdated} Trails!`,this.checkClass="green-lighten-1",this.disabledCheck=!1}catch(e){this.buttonText="Errored!",console.error(e),this.checkClass="red-lighten-1"}finally{setTimeout(()=>{this.buttonText="Run Check",this.checkClass="",this.disabledCheck=!1},5e3),await this.$refs.accountManager.loadAccounts(),await this.loadData()}},changeFocus(e){this.focus=e}},components:{NumberDisplayer:ua,AccountManager:_a,TrailManager:Ta},mounted(){this.$watch(()=>this.$refs.accountManager.accounts,e=>{this.accountNum=e.length}),this.$watch(()=>this.$refs.accountManager.trails,e=>{this.trailNum=e.length}),ze.getServerStatus().then(e=>{this.serverStatus=e}),this.loadData(),this.interval=setInterval(async()=>{this.serverStatus=await ze.getServerStatus()},5e3)},unmounted(){clearInterval(this.interval)}},Ba=e=>(We("data-v-71b6ad4c"),e=e(),Ze(),e),Pa={class:"mb-6 pa-6 bg-grey-lighten-1 rounded-lg"},Ea=Ba(()=>G("div",null,"Server Status",-1)),Ra={class:"d-flex justify-start align-center gap-5"},Ma={class:"text-h4 text--primary"};function ja(e,l,t,i,u,o){const d=pe("NumberDisplayer"),n=pe("AccountManager"),r=pe("TrailManager");return N(),P(xa,{id:"inspire"},{default:s(()=>[a(Na,{flat:""},{default:s(()=>[a(ie,{class:"fill-height d-flex align-center wide"},{default:s(()=>[(N(!0),Xt($e,null,Yt(e.links,m=>(N(),P(R,{key:m,variant:"text",onClick:f=>o.changeFocus(m.focus)},{default:s(()=>[b(q(m.name),1)]),_:2},1032,["onClick"]))),128))]),_:1})]),_:1}),e.focus==="dashboard"?(N(),P(ie,{key:0,class:"fill-height"},{default:s(()=>[a(Ae,{class:"bg-grey-lighten-3"},{default:s(()=>[a(ie,null,{default:s(()=>[a(L,{justify:"center",dense:""},{default:s(()=>[G("div",Pa,[a(L,{align:"center"},{default:s(()=>[a(te,{rounded:"lg",class:"ma-2"},{default:s(()=>[a(Ce,null,{default:s(()=>[Ea,G("div",Ra,[G("p",Ma,q(this.serverStatus||"Unknown"),1),this.serverStatus==="Running"?(N(),P(ee,{key:0,icon:"mdi-check-circle-outline",size:"large",color:"green-darken-2"})):this.serverStatus==="Restarting"?(N(),P(ee,{key:1,icon:"mdi-minus-circle-outline",size:"large",color:"yellow-darken-2"})):this.serverStatus==="Errored"?(N(),P(ee,{key:2,icon:"mdi-alpha-x-circle-outline",size:"large",color:"red-darken-2"})):(N(),P(ee,{key:3,icon:"mdi-help-circle-outline",size:"large",color:"blue-grey-darken-2"}))])]),_:1})]),_:1}),a(d,{name:"Number of Accounts",number:e.accountNum},null,8,["number"]),a(d,{name:"Number of Trails",number:e.trailNum},null,8,["number"]),a(d,{name:"Number of Updates",number:e.statusNum},null,8,["number"]),a(Le,{thickness:5,inset:"",vertical:""}),a(R,{height:"90","min-width":"164",class:"ml-2",color:e.checkClass,disabled:e.disabledCheck,onClick:o.runCheck},{default:s(()=>[b(q(e.buttonText),1)]),_:1},8,["color","disabled","onClick"])]),_:1})]),a(L,{class:"wide mb-5"},{default:s(()=>[a(n,{ref:"accountManager"},null,512)]),_:1}),a(L,{class:"wide mt-5"},{default:s(()=>[a(r,{class:"mt-5"})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})):e.focus==="social-media-accounts"?(N(),P(ie,{key:1,class:"fill-height",style:{padding:"0"}},{default:s(()=>[a(Ae,{class:"bg-grey-lighten-3 fill-height",style:{width:"100%"}},{default:s(()=>[a(L,{class:"mt-5",justify:"center"},{default:s(()=>[a(n,{ref:"accountManager",style:{width:"90% !important"}},null,512)]),_:1})]),_:1})]),_:1})):e.focus==="trails"?(N(),P(ie,{key:2,class:"fill-height",style:{padding:"0"}},{default:s(()=>[a(Ae,{class:"bg-grey-lighten-3 fill-height",style:{width:"100%"}},{default:s(()=>[a(L,{class:"mt-5",justify:"center"},{default:s(()=>[a(r,{style:{width:"90% !important"}})]),_:1})]),_:1})]),_:1})):Jt("",!0)]),_:1})}const Fa=we(La,[["render",ja],["__scopeId","data-v-71b6ad4c"]]);export{Fa as default};
