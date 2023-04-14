import{a3 as E,v as N,at as F,au as R,ax as j,ae as O,az as M,aA as U,af as q,$ as H,aa as Q,aC as G,D as J,c,ab as W,aD as X,aE as Y,aF as Z,aj as ee,aH as te,aI as ae,ak as le,aO as oe,ah as se,C as ne,n as a,aN as re,a7 as ie,Q as k,a6 as g,L as ce,aP as de,l as b,ap as ue,w as d,R as h,m as ve,ar as me,V as ye,q as fe}from"./index.02a137cd.js";import{_ as xe,a as ke,b as be}from"./VCard.7e17fd63.js";const he=E("v-alert-title"),ge=["success","info","warning","error"],Ve=N()({name:"VAlert",props:{border:{type:[Boolean,String],validator:e=>typeof e=="boolean"||["top","end","bottom","start"].includes(e)},borderColor:String,closable:Boolean,closeIcon:{type:F,default:"$close"},closeLabel:{type:String,default:"$vuetify.close"},icon:{type:[Boolean,String,Function,Object],default:null},modelValue:{type:Boolean,default:!0},prominent:Boolean,title:String,text:String,type:{type:String,validator:e=>ge.includes(e)},...R(),...j(),...O(),...M(),...U(),...q(),...H(),...Q(),...G({variant:"flat"})},emits:{"click:close":e=>!0,"update:modelValue":e=>!0},setup(e,r){let{emit:u,slots:t}=r;const s=J(e,"modelValue"),o=c(()=>{var l;if(e.icon!==!1)return e.type?(l=e.icon)!=null?l:`$${e.type}`:e.icon}),i=c(()=>{var l;return{color:(l=e.color)!=null?l:e.type,variant:e.variant}}),{themeClasses:V}=W(e),{colorClasses:C,colorStyles:p,variantClasses:_}=X(i),{densityClasses:P}=Y(e),{dimensionStyles:T}=Z(e),{elevationClasses:S}=ee(e),{locationStyles:A}=te(e),{positionClasses:K}=ae(e),{roundedClasses:B}=le(e),{textColorClasses:I,textColorStyles:D}=oe(se(e,"borderColor")),{t:L}=ne(),v=c(()=>({"aria-label":L(e.closeLabel),onClick(l){s.value=!1,u("click:close",l)}}));return()=>{const l=!!(t.prepend||o.value),$=!!(t.title||e.title),w=!!(e.text||t.text),z=!!(t.close||e.closable);return s.value&&a(e.tag,{class:["v-alert",e.border&&{"v-alert--border":!!e.border,[`v-alert--border-${e.border===!0?"start":e.border}`]:!0},{"v-alert--prominent":e.prominent},V.value,C.value,P.value,S.value,K.value,B.value,_.value],style:[p.value,T.value,A.value],role:"alert"},{default:()=>{var m,y,f;return[re(!1,"v-alert"),e.border&&a("div",{key:"border",class:["v-alert__border",I.value],style:D.value},null),l&&a("div",{key:"prepend",class:"v-alert__prepend"},[t.prepend?a(k,{key:"prepend-defaults",disabled:!o.value,defaults:{VIcon:{density:e.density,icon:o.value,size:e.prominent?44:28}}},t.prepend):a(ie,{key:"prepend-icon",density:e.density,icon:o.value,size:e.prominent?44:28},null)]),a("div",{class:"v-alert__content"},[$&&a(he,{key:"title"},{default:()=>{var n,x;return[(x=(n=t.title)==null?void 0:n.call(t))!=null?x:e.title]}}),w&&((y=(m=t.text)==null?void 0:m.call(t))!=null?y:e.text),(f=t.default)==null?void 0:f.call(t)]),t.append&&a("div",{key:"append",class:"v-alert__append"},[t.append()]),z&&a("div",{key:"close",class:"v-alert__close"},[t.close?a(k,{key:"close-defaults",defaults:{VBtn:{icon:e.closeIcon,size:"x-small",variant:"text"}}},{default:()=>{var n;return[(n=t.close)==null?void 0:n.call(t,{props:v.value})]}}):a(g,ce({key:"close-btn",icon:e.closeIcon,size:"x-small",variant:"text"},v.value),null)])]}})}}}),Ce={data(){return{errorText:"",storedApiKey:""}},computed:{apiKey:{get(){return this.storedApiKey},set(e){return console.log(e),this.storedApiKey=e}}},methods:{async login(){console.log(this.apiKey);const e=await de.validateKey(this.apiKey);console.log(e),e?(localStorage.setItem("token",this.apiKey),this.$router.push("/")):this.errorText="Invalid API Key"}}},pe={class:"d-flex justify-center align-center",style:{height:"100vh"}},_e=fe("div",{class:"text-subtitle-1 text-medium-emphasis"},"API Key",-1);function Pe(e,r,u,t,s,o){return b(),ue("div",pe,[a(ke,{class:"mx-auto pa-12 pb-2 pt-4",elevation:"8","max-width":"448",rounded:"lg"},{default:d(()=>[a(be,{class:"text-center"},{default:d(()=>[h("CAMBA Uploader Dashboard")]),_:1}),s.errorText?(b(),ve(Ve,{key:0,color:"error",icon:"$error",title:"Error",text:s.errorText},null,8,["text"])):me("",!0),_e,a(ye,{density:"compact",placeholder:"Key","prepend-inner-icon":"mdi-key-outline",variant:"outlined",type:"password",modelValue:o.apiKey,"onUpdate:modelValue":r[0]||(r[0]=i=>o.apiKey=i)},null,8,["modelValue"]),a(g,{block:"",class:"mb-8",color:"blue",size:"large",variant:"tonal",onClick:o.login},{default:d(()=>[h(" Log In ")]),_:1},8,["onClick"])]),_:1})])}const Ae=xe(Ce,[["render",Pe]]);export{Ae as default};
