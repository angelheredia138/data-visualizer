import{i as E}from"./Gi6I4Gst.js";import{o as B}from"./CmKTTxBW.js";import{r as L}from"./BrdkUO9V.js";function T(t,e){let o;if(e===void 0)for(const i of t)i!=null&&(o<i||o===void 0&&i>=i)&&(o=i);else{let i=-1;for(let a of t)(a=e(a,++i,t))!=null&&(o<a||o===void 0&&a>=a)&&(o=a)}return o}function N(t){return t}var H=1,R=2,_=3,b=4,C=1e-6;function X(t){return"translate("+t+",0)"}function Y(t){return"translate(0,"+t+")"}function j(t){return e=>+t(e)}function q(t,e){return e=Math.max(0,t.bandwidth()-e*2)/2,t.round()&&(e=Math.round(e)),o=>+t(o)+e}function D(){return!this.__axis}function P(t,e){var o=[],i=null,a=null,l=6,s=6,g=3,u=typeof window<"u"&&window.devicePixelRatio>1?0:.5,f=t===H||t===b?-1:1,m=t===b||t===R?"x":"y",c=t===H||t===_?X:Y;function n(r){var h=i??(e.ticks?e.ticks.apply(e,o):e.domain()),A=a??(e.tickFormat?e.tickFormat.apply(e,o):N),x=Math.max(l,0)+g,y=e.range(),z=+y[0]+u,F=+y[y.length-1]+u,V=(e.bandwidth?q:j)(e.copy(),u),M=r.selection?r.selection():r,k=M.selectAll(".domain").data([null]),d=M.selectAll(".tick").data(h,e).order(),S=d.exit(),I=d.enter().append("g").attr("class","tick"),v=d.select("line"),w=d.select("text");k=k.merge(k.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),d=d.merge(I),v=v.merge(I.append("line").attr("stroke","currentColor").attr(m+"2",f*l)),w=w.merge(I.append("text").attr("fill","currentColor").attr(m,f*x).attr("dy",t===H?"0em":t===_?"0.71em":"0.32em")),r!==M&&(k=k.transition(r),d=d.transition(r),v=v.transition(r),w=w.transition(r),S=S.transition(r).attr("opacity",C).attr("transform",function(p){return isFinite(p=V(p))?c(p+u):this.getAttribute("transform")}),I.attr("opacity",C).attr("transform",function(p){var O=this.parentNode.__axis;return c((O&&isFinite(O=O(p))?O:V(p))+u)})),S.remove(),k.attr("d",t===b||t===R?s?"M"+f*s+","+z+"H"+u+"V"+F+"H"+f*s:"M"+u+","+z+"V"+F:s?"M"+z+","+f*s+"V"+u+"H"+F+"V"+f*s:"M"+z+","+u+"H"+F),d.attr("opacity",1).attr("transform",function(p){return c(V(p)+u)}),v.attr(m+"2",f*l),w.attr(m,f*x).text(A),M.filter(D).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===R?"start":t===b?"end":"middle"),M.each(function(){this.__axis=V})}return n.scale=function(r){return arguments.length?(e=r,n):e},n.ticks=function(){return o=Array.from(arguments),n},n.tickArguments=function(r){return arguments.length?(o=r==null?[]:Array.from(r),n):o.slice()},n.tickValues=function(r){return arguments.length?(i=r==null?null:Array.from(r),n):i&&i.slice()},n.tickFormat=function(r){return arguments.length?(a=r,n):a},n.tickSize=function(r){return arguments.length?(l=s=+r,n):l},n.tickSizeInner=function(r){return arguments.length?(l=+r,n):l},n.tickSizeOuter=function(r){return arguments.length?(s=+r,n):s},n.tickPadding=function(r){return arguments.length?(g=+r,n):g},n.offset=function(r){return arguments.length?(u=+r,n):u},n}function U(t){return P(_,t)}function W(t){return P(b,t)}function G(){var t=B().unknown(void 0),e=t.domain,o=t.range,i=0,a=1,l,s,g=!1,u=0,f=0,m=.5;delete t.unknown;function c(){var n=e().length,r=a<i,h=r?a:i,A=r?i:a;l=(A-h)/Math.max(1,n-u+f*2),g&&(l=Math.floor(l)),h+=(A-h-l*(n-u))*m,s=l*(1-u),g&&(h=Math.round(h),s=Math.round(s));var x=L(n).map(function(y){return h+l*y});return o(r?x.reverse():x)}return t.domain=function(n){return arguments.length?(e(n),c()):e()},t.range=function(n){return arguments.length?([i,a]=n,i=+i,a=+a,c()):[i,a]},t.rangeRound=function(n){return[i,a]=n,i=+i,a=+a,g=!0,c()},t.bandwidth=function(){return s},t.step=function(){return l},t.round=function(n){return arguments.length?(g=!!n,c()):g},t.padding=function(n){return arguments.length?(u=Math.min(1,f=+n),c()):u},t.paddingInner=function(n){return arguments.length?(u=Math.min(1,n),c()):u},t.paddingOuter=function(n){return arguments.length?(f=+n,c()):f},t.align=function(n){return arguments.length?(m=Math.max(0,Math.min(1,n)),c()):m},t.copy=function(){return G(e(),[i,a]).round(g).paddingInner(u).paddingOuter(f).align(m)},E.apply(c(),arguments)}export{U as a,G as b,W as c,T as m};