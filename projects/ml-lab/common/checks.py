"""小输入行为检查，不比较源码，也不要求唯一实现。"""
import numpy as np
import pandas as pd
from sklearn.datasets import load_wine
from common.runtime import source_path


def check_project(project, fn):
    reports = []
    def check(name, example, expected, action):
        try:
            detail = action()
            reports.append(dict(function=name, passed=True, message=f'通过。{detail or ""}'))
        except NotImplementedError as exc:
            reports.append(dict(function=name, passed=False, message=f'待完成：{exc}'))
        except Exception as exc:
            reports.append(dict(function=name, passed=False, message=f'输入：{example}；预期：{expected}；实际：{type(exc).__name__}: {exc}'))

    def equal(actual, expected):
        np.testing.assert_allclose(actual, expected, rtol=1e-5, atol=1e-6, err_msg=f'实际 {actual}，预期 {expected}')

    if project == 'wine_classification':
        def split():
            data = load_wine(as_frame=True)
            a, b, ya, yb = fn.split_data(data.data, data.target, 42)
            assert set(a.index).isdisjoint(b.index), '训练和验证行重叠'
            assert len(a)+len(b) == len(data.data), '有样本遗漏'
            assert len(b) == 45, f'验证样本数为 {len(b)}'
            assert set(yb) == {0, 1, 2}, '验证集缺类别'
            for label in range(3):
                assert abs((yb == label).mean() - (data.target == label).mean()) < .03, '类别比例偏差过大'
        def pipeline():
            model = fn.build_model(1.)
            from sklearn.pipeline import Pipeline
            from sklearn.preprocessing import StandardScaler
            assert isinstance(model, Pipeline), '需要管道'
            assert any(isinstance(step, StandardScaler) for _, step in model.steps), '缺少 StandardScaler'
            X = pd.DataFrame({'a': [0., 1., 3., 4.], 'b': [1., 0., 4., 3.]})
            model.fit(X, [0, 0, 1, 1])
            scaler = next(step for _, step in model.steps if isinstance(step, StandardScaler))
            before = scaler.mean_.copy(); model.predict(X * 100)
            equal(scaler.mean_, before)
        def report():
            r = fn.evaluate(np.array([0, 1, 2]), np.array([0, 2, 2]))
            equal(r['accuracy'], 2/3); equal(r['wrong'], [1])
            equal(r['matrix'], [[1,0,0], [0,0,1], [0,0,1]])
        def depths():
            data = load_wine(as_frame=True)
            X, y = data.data, data.target
            from sklearn.model_selection import train_test_split
            a, b, ya, yb = train_test_split(X, y, test_size=.25, stratify=y, random_state=42)
            result = fn.compare_depths(a, ya, b, yb, [1, 3], 42)
            assert len(result) == 2 and set(result.depth) == {1, 3}, str(result)
            assert result[['train_accuracy', 'valid_accuracy']].ge(0).all().all()
            assert result[['train_accuracy', 'valid_accuracy']].le(1).all().all()
        check('split_data', 'Wine 178 行', '133/45 行且分层、无重叠', split)
        check('build_model', '四行训练数据与放大100倍预测数据', '缩放只 fit 训练集', pipeline)
        check('evaluate', '[0,1,2] 对 [0,2,2]', '准确率 2/3、错位 [1]、3×3矩阵', report)
        check('compare_depths（进阶）', 'depths=[1,3]', '两行合法准确率', depths)
    elif project == 'wine_regression':
        def target():
            data = load_wine(as_frame=True).data
            X, y = fn.split_target(data)
            assert 'alcohol' not in X.columns and X.shape == (178,12), str(X.shape)
            equal(y, data.alcohol)
        def errors():
            r = fn.errors([1,3], [2,2]); equal(r['mae'],1); equal(r['residuals'],[-1,1])
        def model():
            from sklearn.pipeline import Pipeline
            from sklearn.preprocessing import StandardScaler
            from sklearn.linear_model import Ridge
            m = fn.build_model(10.)
            assert isinstance(m, Pipeline)
            assert isinstance(m[-1], Ridge) and m[-1].alpha == 10.
            assert any(isinstance(s, StandardScaler) for _,s in m.steps)
        check('split_target', 'Wine 成分表', '12 输入列且移除 alcohol', target)
        check('errors', '[1,3] 与 [2,2]', 'MAE=1，残差[-1,1]', errors)
        check('build_model', 'alpha=10', '标准化与 Ridge 管道', model)
        check('select_alpha', 'alpha=[.1,1,10], MAE=[2,1,3]', '选择1', lambda: equal(fn.select_alpha(pd.DataFrame({'alpha':[.1,1,10], 'valid_mae':[2,1,3]})),1))
    elif project == 'clustering':
        X = np.array([[0.,0.], [2.,0.], [9.,0.]])
        centers = np.array([[0.,0.], [10.,0.], [20.,0.]])
        check('distances', '[[0,0]] 到 [[3,4]]', '平方距离25', lambda: equal(fn.distances(np.array([[0.,0.]]),np.array([[3.,4.]])), [[25]]))
        check('assign_groups', '[[1,4],[3,0],[2,2]]', '编号[0,1,0]', lambda: equal(fn.assign_groups(np.array([[1,4],[3,0],[2,2]])), [0,1,0]))
        def update():
            old = centers.copy()
            equal(fn.update_centers(X, np.array([0,0,1]), centers), [[1,0],[9,0],[20,0]])
            equal(centers, old)
        check('update_centers', '第三簇为空', '中心为[1,0],[9,0],[20,0]，原数组不变', update)
        def stop():
            assert fn.converged(centers, centers.copy())
            assert not fn.converged(centers, centers+1)
        check('converged', '相同中心与移动1的中心', '分别True/False', stop)
        check('best_restart（进阶）', '[4,1,3]', '返回位置1', lambda: equal(fn.best_restart([4,1,3]),1))
    elif project == 'digits':
        def normalize():
            r = fn.normalize(np.full((2,8,8),16))
            equal(r, np.ones((2,64))); assert r.dtype == np.float32
            try:
                fn.normalize(np.zeros((2,7,7)))
            except ValueError:
                return
            raise AssertionError('非法形状未抛 ValueError')
        check('normalize', '2张全16的8×8图；非法7×7图', 'float32 (2,64)全1；拒绝非法形状', normalize)
        def network():
            import torch
            model = fn.build_network(8)
            assert tuple(model(torch.zeros(3,64)).shape) == (3,10)
        def step():
            import torch
            torch.manual_seed(42)
            model = torch.nn.Linear(64,10)
            optimizer = torch.optim.SGD(model.parameters(),lr=.01)
            before = [p.detach().clone() for p in model.parameters()]
            loss = fn.train_step(model, optimizer, torch.ones(2,64), torch.tensor([0,1]))
            assert np.isfinite(loss), str(loss)
            assert any(not torch.equal(a,b) for a,b in zip(before,model.parameters())), '参数没有更新'
        def evaluate():
            import torch
            model = torch.nn.Linear(64,10)
            before = [p.detach().clone() for p in model.parameters()]
            pred, probs = fn.evaluate(model, torch.ones(2,64))
            assert probs.shape == (2,10) and pred.shape == (2,)
            equal(probs.sum(1), [1,1]); equal(pred, probs.argmax(1))
            assert all(torch.equal(a,b) for a,b in zip(before,model.parameters())), '评价改变了参数'
        check('build_network', '3×64输入，hidden=8', '3×10输出；需要PyTorch', network)
        check('train_step', '两条训练样本', '参数更新、损失有限；需要PyTorch', step)
        check('evaluate', '两条评价样本', '概率和1、不更新参数；需要PyTorch', evaluate)
    elif project == 'gridworld':
        def choice():
            rng = np.random.default_rng(42)
            equal(fn.choose_action(np.array([0,5,0,0]),0,rng), 1)
            choices = {fn.choose_action(np.zeros(4),0,rng) for _ in range(100)}
            assert choices == {0,1,2,3}, f'平局只出现{choices}'
            choices = {fn.choose_action(np.array([0,5,0,0]),1,rng) for _ in range(100)}
            assert choices == {0,1,2,3}, f'探索只出现{choices}'
        def update():
            equal(fn.update_value(0,10,np.array([100]*4),True),2)
            equal(fn.update_value(0,-1,np.array([2]*4),False),.18)
        def rate():
            equal(fn.exploration_rate(0,100),1)
            equal(fn.exploration_rate(99,100),.05)
            rates = [fn.exploration_rate(i,100) for i in range(100)]
            assert all(.05 <= r <= 1 for r in rates) and all(a>=b for a,b in zip(rates,rates[1:]))
        check('choose_action', '唯一最大值、四值平局、epsilon=1', '贪心/随机平局/探索正确', choice)
        check('update_value', '终止奖励10；非终止奖励-1且下一价值2', '分别2和.18', update)
        check('exploration_rate', '100回合的首尾', '从1单调降到.05', rate)

    elif project == 'image_lab':
        check('grayscale','纯红与纯白像素','亮度 .2126 和 1',lambda:equal(fn.grayscale(np.array([[[1.,0.,0.],[1.,1.,1.]]])),[[.2126,1]]))
        check('adjust','[0,.5,1], 亮度 .2 对比度 2','裁剪为[0,.7,1]',lambda:equal(fn.adjust(np.array([0.,.5,1.]),.2,2),[0,.7,1]))
        check('mean_filter','3×3 中心值9的脉冲图','3×3均值为1',lambda:equal(fn.mean_filter(np.array([[0.,0,0],[0,9,0],[0,0,0]]),3),np.ones((3,3))))
        check('edge_strength','两列0与1','左列边缘1，右列0',lambda:equal(fn.edge_strength(np.array([[0.,1.],[0.,1.]])),[[1,0],[1,0]]))
    elif project == 'classification_arena':
        def models():
            from sklearn.pipeline import Pipeline
            from sklearn.preprocessing import StandardScaler
            X=np.array([[-1,-1],[-1,1],[1,-1],[1,1]]);y=[1,0,0,1]
            for kind in ['逻辑回归','决策树','RBF 核方法']:
                model=fn.build_model(kind,3.,42)
                assert isinstance(model,Pipeline) and any(isinstance(step,StandardScaler) for _,step in model.steps),'缺少标准化管道'
                model.fit(X,y);assert model.predict_proba(X).shape==(4,2)
            assert fn.build_model('RBF 核方法',10.,42).fit(X,y).score(X,y)==1,'核模型应能拟合四个交叉点'
        check('build_model','四个 XOR 点、三种模型','管道、概率输出、非线性拟合',models)
        check('accuracy','[0,1,1] 对 [0,0,1]','准确率2/3',lambda:equal(fn.accuracy([0,1,1],[0,0,1]),2/3))
    elif project == 'color_compression':
        def palette():
            r=fn.fit_palette(np.array([[0.,0,0],[0,0,0],[1,1,1],[1,1,1]]),2,42)
            assert r.shape==(2,3)
            equal(np.sort(r[:,0]),[0,1]);equal(r[:,0],r[:,1]);equal(r[:,1],r[:,2])
        check('fit_palette','黑白各两点 K=2','两种中心，允许编号互换',palette)
        check('reconstruct','像素 .1 与 .9；黑白调色板','替换为0与1',lambda:equal(fn.reconstruct(np.array([[[.1]*3,[.9]*3]]),np.array([[0.]*3,[1.]*3])),[[[0.]*3,[1.]*3]]))
        check('mse','全0与全1','均方误差1',lambda:equal(fn.mse(np.zeros((2,2,3)),np.ones((2,2,3))),1))
    elif project == 'recommender':
        check('similarity','偏好[1,0]；同向、正交、零向量','[1,0,0]',lambda:equal(fn.similarity(np.array([1.,0]),np.array([[2.,0],[0,1],[0,0]])),[1,0,0]))
        check('rank_items','分数[.5,.9,.5]，排除1，取5','[0,2]且稳定同分',lambda:equal(fn.rank_items([.5,.9,.5],[1],5),[0,2]))
    elif project == 'anomaly':
        def detector():
            X=np.random.default_rng(42).normal(size=(100,2));m=fn.fit_detector(X,42)
            assert np.isfinite(m.score_samples(X)).all()
            assert -m.score_samples([[50,50]])[0]>np.median(-m.score_samples(X)),'远离训练云的点应更异常'
        check('fit_detector','正常点云与远离点[50,50]','分数方向正确',detector)
        check('flag_anomalies','分数[.2,.5,.8],阈值.5','[False,True,True]',lambda:equal(fn.flag_anomalies([.2,.5,.8],.5),[False,True,True]))
        def evaluate():
            r=fn.evaluate([True,True,False],[True,False,True]);equal([r['precision'],r['recall']],[.5,.5])
            r=fn.evaluate([False],[False]);equal([r['precision'],r['recall']],[0,0])
        check('evaluate','一个真报、一个漏报、一个误报；全无报警','P/R=.5；零分母返回0',evaluate)
    return reports
