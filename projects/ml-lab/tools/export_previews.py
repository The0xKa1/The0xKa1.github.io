"""从真实参考实现输出生成网站图表预览。需要额外安装 matplotlib；数字识别预览使用基础 scikit-learn。

python tools/export_previews.py --output ../../apps/web/public/images/ml-guide
"""
import argparse
import sys
from pathlib import Path
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib import font_manager

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from common.runtime import load_functions, json_default

parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
args.output.mkdir(parents=True,exist_ok=True)
font_candidates=['PingFang SC','Heiti TC','Noto Sans CJK SC','Microsoft YaHei','DejaVu Sans']
available={f.name for f in font_manager.fontManager.ttflist}
plt.rcParams.update({'font.family':next(f for f in font_candidates if f in available),
                     'font.size':11,'axes.spines.top':False,'axes.spines.right':False,
                     'axes.labelcolor':'#243044','text.color':'#243044', 'axes.unicode_minus':False})
colors=['#2563a6','#b45309','#087f8c']
metrics={}
def save(fig,name):
    fig.tight_layout(pad=2)
    fig.savefig(args.output/f'lab-{name}.png',dpi=160,facecolor='white')
    plt.close(fig)

from common.pictures import sample_image
from projects.image_lab.experiment import run as image_run
r=image_run(load_functions('image_lab','演示'),sample_image())
fig,axes=plt.subplots(1,3,figsize=(12,4.4))
for ax,key,title in zip(axes,['image','noisy','smooth'],['原始果盘','加入噪声','均值滤波 · 窗口3']):
    ax.imshow(r[key],cmap='gray',vmin=0,vmax=1);ax.set_title(title);ax.axis('off')
metrics['image_lab']=r['metrics'];save(fig,'image_lab')

from projects.classification_arena.experiment import run as arena_run,KINDS
r=arena_run(load_functions('classification_arena','演示'))
fig,axes=plt.subplots(1,3,figsize=(12,4.4))
for ax,name in zip(axes,KINDS):
    ax.contourf(*r['axes'],r['boundaries'][name],levels=[-.5,.5,1.5],cmap=ListedColormap(colors[:2]),alpha=.16)
    for label in [0,1]:
        ids=r['valid'][r['y'].loc[r['valid']].to_numpy()==label]
        ax.scatter(r['X'].loc[ids].iloc[:,0],r['X'].loc[ids].iloc[:,1],s=18,color=colors[label],marker=['o','D'][label])
    ax.set(title=f"{name} · 验证 {r['metrics'][name]:.1%}",xlabel='特征 1',ylabel='特征 2');ax.set_aspect('equal')
metrics['classification_arena']=r['metrics'];save(fig,'classification_arena')

from projects.color_compression.experiment import run as compress_run
r=compress_run(load_functions('color_compression','演示'),sample_image())
fig,axes=plt.subplots(1,3,figsize=(12,4.4))
axes[0].imshow(r['image']);axes[0].set_title('原图');axes[0].axis('off')
axes[1].imshow(r['compressed']);axes[1].set_title('只用8种颜色');axes[1].axis('off')
axes[2].plot(r['curve'].colors,r['curve'].mse,'o-',color=colors[0]);axes[2].set(xlabel='颜色数',ylabel='MSE',title='颜色数量与失真',ylim=(0,None))
metrics['color_compression']=r['metrics'];save(fig,'color_compression')

from projects.recommender.experiment import run as recommend_run,FEATURES
r=recommend_run(load_functions('recommender','演示'),[8,3,7,4],[1])
fig,axes=plt.subplots(1,2,figsize=(12,4.4))
axes[0].barh(r['ranked']['食品'],r['ranked']['匹配分数'],color=colors[0]);axes[0].invert_yaxis();axes[0].set(xlim=(0,1),xlabel='余弦匹配分数',title='偏好决定推荐')
axes[1].bar(FEATURES,r['profile'],color=colors[1]);axes[1].set(ylim=(0,1),ylabel='偏好强度',title='当前口味偏好')
metrics['recommender']=r['metrics'];save(fig,'recommender')

from projects.anomaly.experiment import run as anomaly_run
r=anomaly_run(load_functions('anomaly','演示'))
fig,axes=plt.subplots(1,2,figsize=(12,4.4))
for flag,label,color in [(False,'正常',colors[0]),(True,'报警',colors[1])]:
    d=r['samples'][r['samples']['报警']==flag]
    axes[0].scatter(d['温度 / °C'],d['重量 / g'],s=20,color=color,label=label)
    axes[1].hist(d['异常分数'],bins=20,color=color,alpha=.6,label=label)
axes[0].set(xlabel='温度 / °C',ylabel='重量 / g',title='合成批次 · 异常报警');axes[0].legend(frameon=False)
axes[1].axvline(r['threshold'],ls='--',color='#333');axes[1].set(xlabel='异常分数',ylabel='批次数',title=f"误报 {r['metrics']['false_alarms']} · 漏报 {r['metrics']['missed']}")
metrics['anomaly']=r['metrics'];save(fig,'anomaly')

from projects.wine_classification.experiment import run as classification
r=classification(load_functions('wine_classification','演示'),['alcohol','total_phenols'],1.,3,42,True)
fig,axes=plt.subplots(1,2,figsize=(12,4.4))
ranges,z=r['grid']
axes[0].contourf(ranges[0],ranges[1],z,levels=[-.5,.5,1.5,2.5],cmap=ListedColormap(colors),alpha=.15)
for i in range(3):
    s=r['yv']==i
    axes[0].scatter(r['Xv'].loc[s,'alcohol'],r['Xv'].loc[s,'total_phenols'],s=30,c=colors[i],marker=['o','D','s'][i],label=f'类别 {i}')
axes[0].set(xlabel='alcohol',ylabel='total_phenols',title='两特征逻辑回归 · 验证样本')
axes[0].legend(frameon=False,fontsize=9)
score=r['scores']; x=np.arange(len(score))
axes[1].bar(x-.18,score.train_accuracy,.36,color=colors[0],label='训练')
axes[1].bar(x+.18,score.valid_accuracy,.36,color=colors[1],label='验证')
axes[1].set_xticks(x,['多数类','逻辑回归\n13特征','决策树\n13特征','逻辑回归\n2特征'])
axes[1].set(ylim=(0,1.08),ylabel='准确率',title='同一数据划分下的模型对比')
axes[1].legend(frameon=False)
metrics['wine_classification']=r['metrics'];save(fig,'wine_classification')

from projects.wine_regression.experiment import run as regression
from sklearn.datasets import load_wine
r=regression(load_functions('wine_regression','演示'),load_wine(as_frame=True).data.columns.drop('alcohol').tolist())
fig,axes=plt.subplots(1,2,figsize=(12,4.4))
s=r['samples'];axes[0].scatter(s.actual,s.predicted,s=22,color=colors[0],alpha=.7)
lim=[min(s.actual.min(),s.predicted.min()),max(s.actual.max(),s.predicted.max())]
axes[0].plot(lim,lim,'--',color='#777',lw=1)
axes[0].set(xlim=lim,ylim=lim,xlabel='实测酒精含量',ylabel='预测酒精含量',title='五折折外预测');axes[0].set_aspect('equal')
axes[1].scatter(s.predicted,s.residual,s=22,color=colors[0],alpha=.7);axes[1].axhline(0,color='#777',ls='--',lw=1)
axes[1].set(xlabel='预测酒精含量',ylabel='残差（实测 − 预测）',title='误差分布')
metrics['wine_regression']=r['metrics'];save(fig,'wine_regression')

from projects.clustering.experiment import run as clustering
r=clustering(load_functions('clustering','演示'),'二维点集',3,True,42,1,False)
fig,axes=plt.subplots(1,3,figsize=(12,4.4))
for ax,index in zip(axes,[0,min(2,len(r['frames'])-1),len(r['frames'])-1]):
    frame=r['frames'][index]
    for i in range(3):
        selected=frame['groups']==i
        ax.scatter(r['coords'][selected,0],r['coords'][selected,1],s=15,color=colors[i],marker=['o','D','s'][i])
        path=np.array([f['display_centers'][i] for f in r['frames'][:index+1]])
        ax.plot(path[:,0],path[:,1],':',color=colors[i])
    ax.scatter(frame['centers'][:,0],frame['centers'][:,1],s=90,c=colors,marker='X',edgecolors='white')
    ax.set(xlabel='标准化特征 1',ylabel='标准化特征 2',title=f"第 {index} 步 · 目标值 {frame['inertia']:.1f}",xlim=(-2.6,2.6),ylim=(-2.6,2.6));ax.set_aspect('equal')
metrics['clustering']=r['metrics'];save(fig,'clustering')

from projects.digits.experiment import train
r=train(load_functions('digits','演示'),'scikit-learn',32,30,.001,42)
fig=plt.figure(figsize=(12,4.6));grid=fig.add_gridspec(2,6)
ax=fig.add_subplot(grid[:,:3]);ax.plot(r['curves'].epoch,r['curves'].train_accuracy,color=colors[0],label='训练');ax.plot(r['curves'].epoch,r['curves'].valid_accuracy,color=colors[1],ls='--',label='验证')
ax.set(xlabel='训练轮',ylabel='准确率',ylim=(0,1),title='scikit-learn · 64 → 32 → 10');ax.legend(frameon=False)
wrong=r['samples'][r['samples'].actual!=r['samples'].predicted].head(6)
for j,(sample_id,row) in enumerate(wrong.iterrows()):
    ax=fig.add_subplot(grid[j//3,3+j%3]);ax.imshow(r['X'][sample_id].reshape(8,8),cmap='gray',vmin=0,vmax=1);ax.set_title(f'#{sample_id}: {row.actual} → {row.predicted}',fontsize=10);ax.axis('off')
metrics['digits']=r['metrics'];save(fig,'digits')

from projects.gridworld.experiment import run as navigation,MAPS
r=navigation(load_functions('gridworld','演示'),MAPS['小 · 4×4'])
fig,axes=plt.subplots(1,2,figsize=(12,4.4))
axes[0].imshow(np.where(r['grid']=='#',1,0),cmap=ListedColormap(['#f4f5f8','#647084']),vmin=0,vmax=1)
path=np.array(r['path']);axes[0].plot(path[:,1],path[:,0],'-o',color=colors[0],ms=6)
from matplotlib.patches import Rectangle, Circle
for row in range(r['grid'].shape[0]):
    for col in range(r['grid'].shape[1]):
        axes[0].add_patch(Rectangle((col-.5,row-.5),1,1,fill=False,edgecolor='#c6d1df',lw=1))
gy,gx=r['goal'];axes[0].plot([gx-.2,gx-.2],[gy+.3,gy-.3],color='#187953',lw=2)
for i in range(3):
    for j in range(4):axes[0].add_patch(Rectangle((gx-.2+j*.1,gy-.3+i*.1),.1,.1,color='#187953' if (i+j)%2 else 'white'))
sy,sx=r['start'];axes[0].add_patch(Rectangle((sx-.22,sy-.2),.44,.4,color=colors[0]))
for dx in [-.1,.1]:axes[0].add_patch(Circle((sx+dx,sy-.05),.035,color='white'))
axes[0].set(xlabel='列',ylabel='行',title=f"2000 回合后 · {r['metrics']['steps']} 步送达 / 最短 {r['metrics']['shortest']} 步")
axes[1].plot(r['curve'].episode,r['curve'].success_rate,color=colors[0]);axes[1].set(xlabel='训练回合',ylabel='最近 50 回合成功率',ylim=(0,1.02),title='从随机探索到稳定送达')
metrics['gridworld']=r['metrics'];save(fig,'gridworld')
(args.output/'lab-preview-metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2,default=json_default)+'\n')
print(json.dumps(metrics,ensure_ascii=False,default=json_default))
