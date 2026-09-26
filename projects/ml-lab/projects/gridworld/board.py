"""方格编辑与本地 Canvas 回放；文本只作为环境内部序列化格式。"""
import json
import streamlit as st
from .experiment import MAPS


def edit_cell(key,row,col,tool):
    board=[list(line) for line in st.session_state[key].splitlines()]
    previous=board[row][col]
    if tool in ('起点','终点'):
        char='S' if tool=='起点' else 'G'
        if previous in ('S','G') and previous!=char:return
        for line in board:
            for i,value in enumerate(line):
                if value==char:line[i]='.'
        board[row][col]=char
    elif previous not in ('S','G'):
        board[row][col]='.' if tool=='擦除' or previous=='#' else '#'
    st.session_state[key]='\n'.join(''.join(line) for line in board)


def editor():
    preset=st.selectbox('地图',list(MAPS))
    key=f'board_{preset}'
    if key not in st.session_state:st.session_state[key]=MAPS[preset]
    tool=st.radio('点击格子的操作',['墙壁','擦除','起点','终点'],horizontal=True,key='map_tool')
    if st.button('恢复这张地图',key='map_reset'):st.session_state[key]=MAPS[preset]
    board=st.session_state[key].splitlines();n=len(board[0])
    st.caption('蓝色小车是起点，棋旗是终点。先选工具，再点击格子；墙壁工具再次点击可拆墙。起终点不能互相覆盖。')
    # Scoped selectors target only these native, keyboard-accessible buttons.
    css=[]
    with st.container(width=min(620,72*n)):
        for r,line in enumerate(board):
            for col,(c,value) in zip(st.columns(n,gap='small'),enumerate(line)):
                cellkey=f'cell_{r}_{c}';color={'#':'#68788b','S':'#dceafb','G':'#e0f2e9','.':'#f7f9fc'}[value]
                css.append(f'.st-key-{cellkey} button{{background:{color};width:100%;aspect-ratio:1;height:auto;min-height:36px;border:1px solid #bcc9d7;border-radius:4px;padding:0;font-size:22px}}')
                with col:
                    st.button({'#':'🧱','S':'🤖','G':'🏁','.':'·'}[value],key=cellkey,help=f'第 {r+1} 行，第 {c+1} 列',on_click=edit_cell,args=(key,r,c,tool),width='stretch')
    st.markdown('<style>'+''.join(css)+'</style>',unsafe_allow_html=True)
    return st.session_state[key]


def playback(grid,start,goal,path,records):
    payload=json.dumps(dict(grid=grid.tolist(),start=start,goal=goal,path=path,records=records))
    template='''<!doctype html><html lang="zh"><meta charset="utf-8"><style>
body{margin:0;font:14px system-ui;color:#253044}canvas{display:block;width:min(100%,520px);height:auto;border:1px solid #d9e0e8;border-radius:6px}button{background:white;border:1px solid #b8c4d2;border-radius:5px;padding:8px 16px;color:#253044;cursor:pointer}button:focus-visible{outline:3px solid #2563a6}.controls{display:flex;gap:8px;margin:12px 0}input{width:min(96%,510px)}p{margin:9px 0}
</style><canvas id="board" width="520" height="520" role="img" aria-label="机器人在方格地图中的送样路线"></canvas>
<div class="controls"><button id="play">播放</button><button id="pause">暂停</button><button id="reset">重置</button><button id="next">下一步</button></div><input id="step" type="range" min="0" value="0" aria-label="路线步骤"><p id="status" role="status"></p>
<script>const d=PAYLOAD,canvas=document.getElementById('board'),ctx=canvas.getContext('2d'),slider=document.getElementById('step');let step=0,timer=null;slider.max=d.path.length-1;
const rows=d.grid.length,cols=d.grid[0].length,size=520/Math.max(rows,cols);const ratio=window.devicePixelRatio||1;canvas.width=cols*size*ratio;canvas.height=rows*size*ratio;ctx.scale(ratio,ratio);
function point(p){return [(p[1]+.5)*size,(p[0]+.5)*size]}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ctx.fillStyle=d.grid[r][c]==='#'?'#64748b':'#f6f8fb';ctx.fillRect(c*size,r*size,size,size);ctx.strokeStyle='#d0d9e4';ctx.strokeRect(c*size,r*size,size,size);if(d.grid[r][c]==='#'){ctx.strokeStyle='#8390a2';ctx.beginPath();ctx.moveTo(c*size,r*size+size/2);ctx.lineTo((c+1)*size,r*size+size/2);ctx.stroke();}}
let [sx,sy]=point(d.start);ctx.fillStyle='#d1e5fc';ctx.beginPath();ctx.arc(sx,sy,size*.32,0,Math.PI*2);ctx.fill();
let [gx,gy]=point(d.goal);ctx.strokeStyle='#187953';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx-size*.2,gy+size*.27);ctx.lineTo(gx-size*.2,gy-size*.3);ctx.stroke();for(let i=0;i<3;i++)for(let j=0;j<4;j++){ctx.fillStyle=(i+j)%2?'#fff':'#187953';ctx.fillRect(gx-size*.2+j*size*.12,gy-size*.3+i*size*.12,size*.12,size*.12)}
ctx.strokeStyle='#2563a6';ctx.lineWidth=Math.max(2,size*.05);ctx.beginPath();d.path.slice(0,step+1).forEach((p,i)=>{let[x,y]=point(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
let[x,y]=point(d.path[step]);ctx.fillStyle='#2563a6';ctx.fillRect(x-size*.25,y-size*.22,size*.5,size*.44);ctx.fillStyle='#fff';for(let sign of [-1,1]){ctx.beginPath();ctx.arc(x+sign*size*.12,y-size*.05,size*.045,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#20354f';for(let sign of [-1,1]){ctx.fillRect(x+sign*size*.23-size*.045,y+size*.15,size*.09,size*.15)}
slider.value=step;let rec=d.records[step-1];document.getElementById('status').textContent=`第 ${step} / ${d.path.length-1} 步 · 第 ${d.path[step][0]+1} 行，第 ${d.path[step][1]+1} 列`+(rec?` · 动作 ${['上','右','下','左'][rec.action]} · 奖励 ${rec.reward}`:' · 等待出发');}
function stop(){clearInterval(timer);timer=null}document.getElementById('play').onclick=()=>{stop();if(step>=d.path.length-1)step=0;draw();timer=setInterval(()=>{if(step>=d.path.length-1){stop();return}step++;draw()},220)};document.getElementById('pause').onclick=stop;document.getElementById('reset').onclick=()=>{stop();step=0;draw()};document.getElementById('next').onclick=()=>{stop();step=Math.min(step+1,d.path.length-1);draw()};slider.oninput=()=>{stop();step=Number(slider.value);draw()};draw();</script></html>'''
    st.iframe(template.replace('PAYLOAD',payload),height='content')
