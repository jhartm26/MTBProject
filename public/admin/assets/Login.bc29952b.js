import{ac as E,I as N,at as F,au as O,ax as j,ah as R,az as M,aA as U,ai as q,a8 as H,ad as G,aC as J,P as Q,q as c,ae as W,aD as X,aE as Y,aF as Z,am as ee,aH as te,aI as ae,an as le,aO as se,ak as oe,O as ne,a,aN as re,j as ie,$ as k,e as V,m as ce,aP as de,o as b,h as ue,w as d,f as h,c as ve,k as me,d as ye,b as fe}from"./index.84324f05.js";import{_ as xe,a as ke,b as be}from"./VCard.fe71e90b.js";const he=E("v-alert-title"),Ve=["success","info","warning","error"],Ce=N()({name:"VAlert",props:{border:{type:[Boolean,String],validator:e=>typeof e=="boolean"||["top","end","bottom","start"].includes(e)},borderColor:String,closable:Boolean,closeIcon:{type:F,default:"$close"},closeLabel:{type:String,default:"$vuetify.close"},icon:{type:[Boolean,String,Function,Object],default:null},modelValue:{type:Boolean,default:!0},prominent:Boolean,title:String,text:String,type:{type:String,validator:e=>Ve.includes(e)},...O(),...j(),...R(),...M(),...U(),...q(),...H(),...G(),...J({variant:"flat"})},emits:{"click:close":e=>!0,"update:modelValue":e=>!0},setup(e,r){let{emit:u,slots:t}=r;const o=Q(e,"modelValue"),s=c(()=>{var l;if(e.icon!==!1)return e.type?(l=e.icon)!=null?l:`$${e.type}`:e.icon}),i=c(()=>{var l;return{color:(l=e.color)!=null?l:e.type,variant:e.variant}}),{themeClasses:C}=W(e),{colorClasses:_,colorStyles:g,variantClasses:p}=X(i),{densityClasses:P}=Y(e),{dimensionStyles:T}=Z(e),{elevationClasses:S}=ee(e),{locationStyles:A}=te(e),{positionClasses:I}=ae(e),{roundedClasses:B}=le(e),{textColorClasses:K,textColorStyles:$}=se(oe(e,"borderColor")),{t:w}=ne(),v=c(()=>({"aria-label":w(e.closeLabel),onClick(l){o.value=!1,u("click:close",l)}}));return()=>{const l=!!(t.prepend||s.value),z=!!(t.title||e.title),D=!!(e.text||t.text),L=!!(t.close||e.closable);return o.value&&a(e.tag,{class:["v-alert",e.border&&{"v-alert--border":!!e.border,[`v-alert--border-${e.border===!0?"start":e.border}`]:!0},{"v-alert--prominent":e.prominent},C.value,_.value,P.value,S.value,I.value,B.value,p.value],style:[g.value,T.value,A.value],role:"alert"},{default:()=>{var m,y,f;return[re(!1,"v-alert"),e.border&&a("div",{key:"border",class:["v-alert__border",K.value],style:$.value},null),l&&a("div",{key:"prepend",class:"v-alert__prepend"},[t.prepend?a(k,{key:"prepend-defaults",disabled:!s.value,defaults:{VIcon:{density:e.density,icon:s.value,size:e.prominent?44:28}}},t.prepend):a(ie,{key:"prepend-icon",density:e.density,icon:s.value,size:e.prominent?44:28},null)]),a("div",{class:"v-alert__content"},[z&&a(he,{key:"title"},{default:()=>{var n,x;return[(x=(n=t.title)==null?void 0:n.call(t))!=null?x:e.title]}}),D&&((y=(m=t.text)==null?void 0:m.call(t))!=null?y:e.text),(f=t.default)==null?void 0:f.call(t)]),t.append&&a("div",{key:"append",class:"v-alert__append"},[t.append()]),L&&a("div",{key:"close",class:"v-alert__close"},[t.close?a(k,{key:"close-defaults",defaults:{VBtn:{icon:e.closeIcon,size:"x-small",variant:"text"}}},{default:()=>{var n;return[(n=t.close)==null?void 0:n.call(t,{props:v.value})]}}):a(V,ce({key:"close-btn",icon:e.closeIcon,size:"x-small",variant:"text"},v.value),null)])]}})}}}),_e={data(){return{errorText:"",storedApiKey:""}},computed:{apiKey:{get(){return this.storedApiKey},set(e){return this.storedApiKey=e}}},methods:{async login(){await de.validateKey(this.apiKey)?(localStorage.setItem("token",this.apiKey),this.$router.push("/")):this.errorText="Invalid API Key"}}},ge={class:"d-flex justify-center align-center",style:{height:"100vh"}},pe=fe("div",{class:"text-subtitle-1 text-medium-emphasis"},"API Key",-1);function Pe(e,r,u,t,o,s){return b(),ue("div",ge,[a(ke,{class:"mx-auto pa-12 pb-2 pt-4",elevation:"8","max-width":"448",rounded:"lg"},{default:d(()=>[a(be,{class:"text-center"},{default:d(()=>[h("CAMBA Uploader Dashboard")]),_:1}),o.errorText?(b(),ve(Ce,{key:0,color:"error",icon:"$error",title:"Error",text:o.errorText},null,8,["text"])):me("",!0),pe,a(ye,{density:"compact",placeholder:"Key","prepend-inner-icon":"mdi-key-outline",variant:"outlined",type:"password",modelValue:s.apiKey,"onUpdate:modelValue":r[0]||(r[0]=i=>s.apiKey=i)},null,8,["modelValue"]),a(V,{block:"",class:"mb-8",color:"blue",size:"large",variant:"tonal",onClick:s.login},{default:d(()=>[h(" Log In ")]),_:1},8,["onClick"])]),_:1})])}const Ae=xe(_e,[["render",Pe]]);export{Ae as default};