const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./DwcQrXx3.js","./Bf9RGRjV.js","./x5p3b3Tg.js","./CQEiDZtN.js","./CmKTTxBW.js","./Gi6I4Gst.js","./Du6F06X2.js"])))=>i.map(i=>d[i]);
import{d as y,r as c,o as v,K as C,x as f,_ as T,D as w,L as p,g as u,E as B,B as _,v as h,G as D,H as E,y as e,A as i,C as m,M as P,J as V}from"./Bf9RGRjV.js";const G=Symbol.for("nuxt:client-only"),L=y({name:"ClientOnly",inheritAttrs:!1,props:["fallback","placeholder","placeholderTag","fallbackTag"],setup(g,{slots:a,attrs:d}){const r=c(!1);return v(()=>{r.value=!0}),C(G,!0),o=>{var l;if(r.value)return(l=a.default)==null?void 0:l.call(a);const s=a.fallback||a.placeholder;if(s)return s();const n=o.fallback||o.placeholder||"",t=o.fallbackTag||o.placeholderTag||"span";return f(t,d,n)}}}),O={class:"loading-overlay"},A={key:0},N={class:"header-container"},S={class:"graphs-container"},H={class:"graph-item"},I={class:"graph-content"},R={__name:"genres",setup(g){const a=c(!0),d=w(),r=()=>{d.push("/main")},o=c(null),s=c(null);return v(()=>{p(()=>import("./DwcQrXx3.js"),__vite__mapDeps([0,1]),import.meta.url).then(n=>{o.value=n.default}),p(()=>import("./x5p3b3Tg.js"),__vite__mapDeps([2,3,1,4,5,6]),import.meta.url).then(n=>{s.value=n.default}),setTimeout(()=>{a.value=!1},2e3)}),(n,t)=>{const l=u("v-progress-circular"),b=u("v-btn"),k=L,x=u("v-container");return h(),B(x,{fluid:"",class:"animated-background"},{default:_(()=>[D(e("div",O,[i(l,{size:80,width:8,indeterminate:"",color:"white",class:"loading-spinner"}),t[0]||(t[0]=e("div",{class:"loading-message"},"Loading...",-1))],512),[[E,a.value]]),a.value?V("",!0):(h(),f("div",A,[e("div",N,[t[2]||(t[2]=e("h1",{class:"page-title"},"Genre Pie Chart and Word Cloud!",-1)),i(b,{color:"primary",class:"back-button",onClick:r},{default:_(()=>t[1]||(t[1]=[m(" Back to Home ")])),_:1})]),t[4]||(t[4]=e("div",{class:"explanation-section",style:{"max-width":"800px"}},[e("h2",{class:"subtitle"},"Chart Explanations"),e("p",{class:"explanation-text"},[e("strong",null,"Genre Distribution Pie Chart:"),m(" Displays the distribution of your favorite genres in a pie chart format. Hover or tap on each slice to see more details. Genres with only one artist listen are grouped together and listed below the chart. ")]),e("p",{class:"explanation-text"},"These charts are created using D3.js.")],-1)),e("div",S,[e("div",H,[t[3]||(t[3]=e("h3",{class:"graph-title"},"Genre Pie Chart",-1)),e("div",I,[i(k,null,{default:_(()=>[i(P(s))]),_:1})])])])]))]),_:1})}}},W=T(R,[["__scopeId","data-v-30aa4c93"]]);export{W as default};
