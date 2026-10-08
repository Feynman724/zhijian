import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import timing from './timing.json';

const C={bg:'#172e28',cream:'#f3f0e8',white:'#fffdfa',mint:'#b9d5c7',bronze:'#c29b68',line:'#6d8c7d'};
const titles=[
 ['为什么需要织见','会议与群聊，不该断开'],['讨论散落在不同地方','过几天只能重新拼图'],['三个核心能力','接回会议 · 带走上下文 · 群内 AI'],
 ['09:02 · 群聊发起','第一版做网页还是小程序？'],['09:30 · 会议接上','沿用同一议题，不另起纪要'],['两种不同判断','网页先行：更快验证需求'],
 ['保留不同意见','网页入口可能造成流失'],['证据进入讨论','访谈文件关联会议原话'],['会后归入原议题','转写、文件与群聊连成一线'],
 ['@织见机器人','直接在群里读取完整上下文'],['AI 给出可验证方案','先做网页，低于 30% 就复核'],['不同意见有出处','反方、原话、访谈一起保留'],
 ['D-001 · 结构化决策','结论、证据、负责人、复核线'],['三天后回看','为什么当时选择网页？'],['新数据进入时间线','24% 低于 30% 的复核线'],
 ['决策不是终点','条件改变，提醒团队重谈'],['开放式上下文','预览并导出 Markdown / JSON'],['消息可带走','发言、来源、证据与决定完整保留'],['织讨论 · 见决策','每个决定，都找得到来处']
];
const tags=['定位','痛点','方案','群聊','会议','观点','分歧','文件','时间线','群内 AI','建议','反方意见','决策','回溯','数据','复核','导出','开放','织见'];
// Source-image coordinates. Each box targets one actual message or the meeting-return card.
const focus:Record<number,[number,number,number,number]>={
  3:[330,222,892,100], 4:[330,338,892,100], 5:[330,454,892,100],
  6:[330,570,892,100], 7:[330,686,892,100], 8:[315,790,907,110],
  9:[330,222,892,100], 10:[330,338,892,100], 11:[330,454,892,100],
  12:[330,570,892,100], 13:[330,338,892,100], 14:[330,454,892,100],
  15:[330,570,892,100],
};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const ease=(v:number)=>1-Math.pow(1-v,3);

const Scene:React.FC<{i:number,local:number,duration:number}> = ({i,local,duration})=>{
 const enter=ease(clamp(local/.7,0,1)); const leave=clamp((duration-local)/.5,0,1); const opacity=enter*leave;
 const screenshotScale=1.015+clamp(local/duration,0,1)*.025;
 const box=focus[i];
 return <AbsoluteFill style={{opacity,background:C.bg}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 8% 9%, #31574a 0, #172e28 38%, #12251f 100%)'}}/>
  <div style={{position:'absolute',top:42,left:64,color:C.cream,fontSize:36,fontWeight:800,letterSpacing:3}}>织见 <span style={{fontSize:20,fontWeight:500,color:C.mint,letterSpacing:1}}>ZHĪJIÀN / PRODUCT WALKTHROUGH</span></div>
  <div style={{position:'absolute',top:43,right:60,color:C.mint,fontSize:25,fontVariantNumeric:'tabular-nums'}}>{String(i+1).padStart(2,'0')} / 19</div>
  <div style={{position:'absolute',left:62,top:128,width:1440,height:810,borderRadius:24,background:C.white,overflow:'hidden',boxShadow:'0 28px 75px #071b1599',border:'1px solid #799688'}}>
    <div style={{position:'relative',width:'100%',height:'100%',transform:`scale(${screenshotScale})`,transformOrigin:i<3?'40% 46%':'46% 42%'}}>
      <Img src={staticFile(`frames/scene-${String(i).padStart(2,'0')}.png`)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      {box&&<div style={{position:'absolute',left:box[0]*.75,top:box[1]*.75,width:box[2]*.75,height:box[3]*.75,border:`4px solid ${C.bronze}`,borderRadius:13,boxShadow:'0 0 0 999px #092a2119, 0 0 24px #c29b6866',opacity:clamp((local-1.2)/.45,0,1),pointerEvents:'none'}}/>}
    </div>
  </div>
  <div style={{position:'absolute',left:1545,top:158,width:308,height:700,display:'flex',flexDirection:'column',alignItems:'flex-start',transform:`translateY(${(1-enter)*38}px)`}}>
    <div style={{border:`1px solid ${C.line}`,borderRadius:100,padding:'12px 23px',fontSize:23,color:C.bronze,letterSpacing:3,fontWeight:700}}>{tags[i]}</div>
    <div style={{marginTop:32,width:'100%',height:3,background:C.line}}/>
    <div style={{marginTop:41,color:C.mint,fontSize:31,lineHeight:1.35,fontWeight:600}}>{titles[i][0]}</div>
    <div style={{marginTop:25,color:C.cream,fontSize:46,lineHeight:1.35,fontWeight:800,letterSpacing:-1,wordBreak:'break-word'}}>{titles[i][1]}</div>
    <div style={{marginTop:'auto',display:'flex',gap:9}}>{[0,1,2].map((n)=><div key={n} style={{width:n===Math.min(2,Math.floor(i/7))?57:12,height:10,borderRadius:8,background:n===Math.min(2,Math.floor(i/7))?C.bronze:C.line}}/>)}</div>
  </div>
 </AbsoluteFill>
};

export const ZhijianDemo:React.FC=()=>{
 const frame=useCurrentFrame(); const time=frame/30;
 const i=Math.max(0,timing.findIndex((x,idx)=>time<(idx===timing.length-1?180:timing[idx+1].start-.08)));
 const start=i===0?0:timing[i].start-.1; const end=i===18?180:timing[i+1].start-.08;
 const cap=timing[i].captions.find(x=>time>=x.start&&time<x.end);
 return <AbsoluteFill style={{fontFamily:'PingFang SC, Microsoft YaHei, sans-serif',background:C.bg,color:C.cream}}>
   <Scene i={i} local={Math.max(0,time-start)} duration={end-start}/>
   <div style={{position:'absolute',left:64,right:64,bottom:118,height:2,background:'#83a39455'}}><div style={{width:`${frame/5399*100}%`,height:'100%',background:C.bronze,boxShadow:`0 0 15px ${C.bronze}`}}/></div>
   <div style={{position:'absolute',left:64,right:64,bottom:32,height:75,display:'flex',alignItems:'center',justifyContent:'center',background:'#0d221bcc',borderRadius:17,border:'1px solid #71938666',padding:'0 30px',fontSize:35,fontWeight:650,letterSpacing:.3,textAlign:'center',whiteSpace:'nowrap'}}>{cap?.text||''}</div>
   <Audio src={staticFile('narration.m4a')}/>
 </AbsoluteFill>
};
