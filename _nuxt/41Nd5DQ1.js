import{_ as m,t as y,g as a,E as _,B as t,v as g,A as o,C as s,y as d,q as v}from"./C69F-6un.js";const w={__name:"index",setup(x){const n=v(),p=()=>{const l=n.public.spotifyClientId,e=n.public.spotifyRedirectUri,i=`https://accounts.spotify.com/authorize?client_id=${l}&response_type=token&redirect_uri=${e}&scope=user-read-recently-played user-read-currently-playing user-top-read&show_dialog=true`;window.location.href=i};return y({title:"Data Visualizer"}),(l,e)=>{const r=a("v-card-title"),i=a("v-card-text"),u=a("v-btn"),c=a("v-card"),f=a("v-container");return g(),_(f,{fluid:"",class:"animated-background"},{default:t(()=>[o(c,{class:"mx-auto p-8 text-center","max-width":"500",elevation:"8",style:{"padding-bottom":"20px"}},{default:t(()=>[o(r,{class:"text-center",style:{color:"#2f855a","font-size":"2em","font-weight":"700"}},{default:t(()=>e[0]||(e[0]=[s(" Spotify Data Visualizer ")])),_:1}),o(i,{class:"text-center",style:{"font-size":"1em"}},{default:t(()=>e[1]||(e[1]=[s(" Log in to view your Spotify listening habits. ")])),_:1}),o(u,{color:"primary",class:"hoverable-btn",onClick:p},{default:t(()=>e[2]||(e[2]=[s(" Log in with Spotify ")])),_:1})]),_:1}),o(c,{class:"mx-auto text-center","max-width":"600",elevation:"0",style:{"margin-top":"40px"}},{default:t(()=>[o(i,{style:{"font-weight":"bold",color:"red","font-size":"1em","margin-bottom":"16px","align-items":"center","text-align":"center"}},{default:t(()=>e[3]||(e[3]=[s(" If you have not been specifically added to this app's users, you will not be able to access it. If you would like to, "),d("a",{href:"mailto:herediafangel@gmail.com",style:{color:"red"}},"email me",-1),s(" and I will give you permissions for 48 hours to be able to access and view your statistics. In the meantime, if you would like to view a demo of this page, please see the video below. ")])),_:1}),o(i,null,{default:t(()=>e[4]||(e[4]=[d("iframe",{width:"100%",height:"315",src:"https://drive.google.com/file/d/1dAy7ze4M7QB8N6-KQNn-u1Tg7LLtmpfw/preview",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowfullscreen:""},null,-1)])),_:1})]),_:1})]),_:1})}}},h=m(w,[["__scopeId","data-v-c430280b"]]);export{h as default};
