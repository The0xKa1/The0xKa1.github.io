import numpy as np
import pandas as pd
FEATURES=['甜味','酸味','酥脆','奶香']
NAMES=['草莓酸奶','原味曲奇','柠檬蛋糕','黑巧克力','焦糖布丁','苹果脆片','芝士饼干','葡萄冰沙','烤坚果','奶香吐司','蓝莓挞','黄瓜沙拉']
VALUES=[[.6,.7,.0,.8],[.7,.0,.9,.5],[.6,.8,.3,.3],[.3,.1,.6,.1],[.9,.1,.0,.9],[.5,.5,1.,0.],[.2,.2,.9,.8],[.8,.6,0.,0.],[.1,0.,1.,0.],[.4,0.,.3,.8],[.7,.7,.6,.4],[.0,.3,.8,0.]]

def catalog(): return pd.DataFrame(VALUES,columns=FEATURES).assign(食品=NAMES)

def run(fn,preferences,excluded,count=5):
    frame=catalog();profile=np.asarray(preferences,dtype=float)/10
    scores=fn.similarity(profile,frame[FEATURES].to_numpy())
    ids=np.asarray(fn.rank_items(scores,excluded,count),dtype=int)
    if len(set(ids))!=len(ids) or set(ids)&set(excluded) or np.any((ids<0)|(ids>=len(frame))): raise ValueError('推荐行号重复、越界或包含已选项')
    ranked=frame.iloc[ids].copy();ranked['匹配分数']=scores[ids]
    return dict(ranked=ranked,profile=profile,catalog=frame,metrics=dict(recommended=len(ids),top_score=float(scores[ids[0]]) if len(ids) else 0.))
