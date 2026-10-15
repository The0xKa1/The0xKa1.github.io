---
title: 深度学习的来路与远方
comments: false
statistics: false
---

# 深度学习的来路与远方 {#history-and-horizons}

一个人能认出潦草的数字，却很难把辨认过程写成一套没有遗漏的规则。一条蛋白质序列可以被逐字记录，它在空间中怎样折叠，却曾让研究者耗费多年寻找答案。两类困难分属不同的仪器、学科和尺度，背后却是同一种计算愿望：从已经观察到的事物中学出规律，把规律用在尚未见过的对象上。

深度学习让这个愿望有了可反复使用的工程方法。多层网络逐层改变数据的表示，训练把预测误差传回这些变换，使中间表示也随任务调整。人不必事先写出每一种笔画、语义关系或空间相互作用的完整判别规则，仍然要决定观测什么、怎样表示输入、用什么目标学习，以及怎样判断结果可信。它扩大了能够交给计算机处理的问题范围；当同一个学出的表示可以迁移到许多任务时，重新开发一套系统的成本也随之改变。

这条道路跨过了八十多年。早期神经网络提供了形式模型和学习思想；今天的深度学习还依赖大规模数据、可训练的多层结构与计算基础设施。符号推理、搜索、统计建模和数值模拟也一直参与其中。几个最有说服力的突破，恰好发生在这些方法共同工作的地方。

本章史料核验截止于 2026 年 10 月 15 日（Asia/Shanghai）；年代指下文注明的论文发表、公开报告或实际事件时间。

## 早期神经网络 {#early-networks}

1943 年，Warren McCulloch 与 Walter Pitts 用形式神经元讨论神经活动与逻辑计算的关系。阈值、连接和离散状态，把一部分关于神经系统的问题变成可以推演的数学对象。论文问的是这样的网络能表达什么，还没有涉及怎样从样本中学出连接。[原论文：A Logical Calculus of the Ideas Immanent in Nervous Activity](https://www.cs.cmu.edu/~./epxing/Class/10715/reading/McCulloch.and.Pitts.pdf)。

到了 1950 年代，Frank Rosenblatt 把重点移到经验如何改变连接。1958 年的感知机论文把知觉、记忆与统计学习放进同一框架；后来建造的 Mark I Perceptron 则把学习落实为一台可以接收视觉输入、调整连接的装置。这台机器今天收藏在史密森尼美国国家历史博物馆。它所尝试的事情很具体：给机器呈现样例，让内部状态的改变影响下一次判断。[Rosenblatt（1958）](https://web.stanford.edu/class/psych209a/ReadingsByDate/01_30/Rosenblatt58Perceptron.pdf)；[Mark I 馆藏记录](https://americanhistory.si.edu/collections/object/nmah_334414)。

单层线性阈值分类器有明确的边界。若直接输入两个二进制数，异或要求把 $(0,1),(1,0)$ 判为一类，把 $(0,0),(1,1)$ 判为另一类，平面上的一条直线无法将两类分开。增加非线性中间层可以表达这个关系，困难随即变成：训练只告诉网络最后答错了，隐藏层里究竟哪些连接应该改？这是[多层网络](./network-composition.md)遇到的信用分配问题。

“模型表达不了”与“模型能够表达、却难以训练”是两种困难：前者要改变函数族，后者要靠学习算法、初始化和足够的计算。此后的许多进展，都沿着这条分界展开。

## 把误差送回隐藏层 {#backprop-history}

反向传播的历史包含几层工作。链式法则是微积分工具；把它组织成沿计算过程反向累积导数的算法，是自动微分的发展；再用这些导数调整多层网络的权重，才进入神经网络学习。Seppo Linnainmaa 在 1970 年的学位工作及 1976 年论文中研究计算过程的误差展开，形成了反向模式自动微分的早期系统表述。Paul Werbos 的 1974 年博士论文则研究模型拟合与预测的新方法，讨论它们在社会和生物科学中的应用。这些工作早于通常被记住的 1986 年。[Linnainmaa（1976）及其论文所列 1970 年学位文献](https://doi.org/10.1007/BF01931367)；[Werbos 学位论文馆藏记录](https://belinrae.inrae.fr/index.php?id=222547&lvl=notice_display)。

1986 年，David Rumelhart、Geoffrey Hinton 和 Ronald Williams 发表 *Learning representations by back-propagating errors*，展示隐藏单元怎样在误差驱动下形成有用的内部表示。这篇论文让多层网络的学习方法广为传播。[原论文作者存档](https://www.cs.toronto.edu/~hinton/absps/naturebp.pdf)。

[反向传播](./backprop-and-optimization.md)解决的是高效计算梯度：一次前向计算保存必要的中间量，再从损失向输入方向传递导数，各层得到自己参数的梯度。这个程序让最终任务能够反过来塑造早期特征。梯度算得出，模型却未必训练得好：深层链条仍会遭遇梯度衰减、糟糕的初始化和有限数据。

卷积网络把学习方法与图像结构结合了起来。局部连接让一个单元只处理附近像素，参数共享让同一种特征检测器在多个位置复用，逐层组合则扩大可见范围。LeCun、Bottou、Bengio 与 Haffner 的 1998 年文档识别论文系统呈现了 LeNet-5 和包含识别模块的文档处理系统。手写字符不必先被完整翻译成程序员列出的笔画规则，就能进入可训练的处理流程。[Gradient-Based Learning Applied to Document Recognition](https://leon.bottou.org/publications/pdf/ieee-1998.pdf)。

识字说明这条路线能够工作，普通照片却难得多：物体会旋转、被遮挡，背景会干扰，同一类别的外观差异也可能很大。模型需要更多样的例子，也需要足以处理这些例子的容量和训练时间。

## 数据与计算 {#imagenet-turn}

2006 年，Hinton、Osindero 和 Teh 提出逐层学习深度信念网络的方法，先为较深的模型建立可用的参数，再继续调整。它回应了当时深层网络难以训练的问题，也表明无标签数据可以参与表示学习。后来的大规模监督训练并未普遍沿用同一种逐层预训练流程，但“先学习表示，再服务于后续任务”的思想继续发展。[A Fast Learning Algorithm for Deep Belief Nets](https://www.cs.toronto.edu/~hinton/absps/fastnc.pdf)。

2012 年的 AlexNet 把几项已经积累的条件接到一起。ImageNet 竞赛提供约 120 万张训练图像和 1,000 个类别；GPU 承担大规模卷积；ReLU 改善训练速度；数据增强和 dropout 缓解过拟合。Krizhevsky、Sutskever 与 Hinton 报告，论文所述网络在两张各有 3 GB 显存的 GTX 580 上训练约五至六天。算法的进展在这里有了明确的物理条件：显存决定网络怎样拆分，运行时间决定一次实验要等待多久。[AlexNet 原论文 §2–5](https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)。

ILSVRC-2012 分类竞赛中，团队最终集成系统的 top-5 测试错误率为 **15.3%**，第二名为 **26.2%**。top-5 错误表示正确类别没有出现在模型概率最高的五个候选中。差距是 10.9 个百分点，相对错误率下降约 41.6%。论文表 2 中的单 CNN 验证错误率则是 18.2%；最终 15.3% 来自七个网络的集成，其中包含额外预训练的模型。[原论文 §6、表 2](https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)。

这次结果改变了视觉系统的建设重心。过去常由人设计特征，再训练分类器；端到端训练让特征本身也接受最终识别目标的检验。已有数据的价值因此增加：同一批图像既训练分类决策，也塑造前面的表示。这一结果同样离不开计算硬件、标注劳动和优化技巧。

继续加深网络又暴露了新的问题。2015 年公开的 ResNet 论文观察到，普通网络变深后，连训练误差也可能变差。残差连接让网络学习相对于输入的修正，使信息和梯度拥有更直接的通路。论文在 ImageNet 上评估到 152 层，展示了这种结构怎样让深度变得可用。[Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)。这一变化后来也进入语言模型：今天常见的[现代解码器 block](./modern-transformer.md#decoder-block)，仍然依靠残差通路组织大量层次的变换。

## 从辨认对象到生成与行动 {#generation-and-search}

分类回答“这是什么”，生成学习还要描述“怎样产生一个可能的样本”。2013 年公开的 VAE 用可优化的变分目标连接潜变量与观测；2014 年的 GAN 让生成器和判别器共同训练；2020 年的 DDPM 则把逐步去噪发展为高质量图像生成方法。它们使用不同的训练目标与采样过程，使网络能够生成具有训练数据统计结构的新结果。[VAE](https://arxiv.org/abs/1312.6114)、[GAN](https://arxiv.org/abs/1406.2661)、[DDPM](https://arxiv.org/abs/2006.11239)。

生成能力改变了视觉计算的输出：模型可以提出一张候选图、补全缺失区域，或者按照条件修改内容。2021 年公开、发表于 CVPR 2022 的潜空间扩散工作，把去噪过程移到压缩表示中，并支持文本等条件控制，降低了在高分辨率像素空间直接建模的计算负担。文本到图像由此获得了一条可扩展的技术路线。[High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752)。创作者开始能用描述提出视觉草案，再挑选、修改和组合；构图意图、叙事目的和作品好坏，仍由创作者在具体的创作过程中判断。关于采样与条件控制的机制，见[生成模型](./generative-models.md)。

行动问题的反馈更迟。棋手落下一子时，往往无法立即知道它对最终输赢的贡献。2016 年 AlphaGo 的论文把策略网络、价值网络与蒙特卡洛树搜索结合：网络建议值得探索的落子并估计局面，搜索再展开可能的后续对局。系统同时使用人类棋谱学习和自我对弈强化学习。学习到的判断缩小搜索范围，搜索又帮助做出当前决定。[Silver 等，2016 年论文](https://www.cs.cmu.edu/afs/cs.cmu.edu/academic/class/15780-s16/www/AlphaGo.nature16961.pdf)。

当年 3 月，AlphaGo 在首尔以 4 比 1 战胜李世石。1 月论文记录的是更早对樊麾的比赛，首尔对局属于下一阶段。[DeepMind 比赛记录](https://deepmind.google/research/alphago/)。2017 年的 AlphaGo Zero 进一步在给定围棋规则的环境中从自我对弈学习，不使用人类棋谱作为训练示范。[Mastering the Game of Go without Human Knowledge](https://www.nature.com/articles/nature24270)。

围棋给出了一个难得完整的实验世界：规则确定，动作可枚举，胜负能结算，大量试错不伤害现实中的人。它展示了学习与搜索结合的力量，也把下一个问题推到眼前：当环境只能部分观察、行动会付出真实代价、好坏要很久才能判断时，怎样获得同样有效的反馈？

## 语言成为通用接口 {#language-and-multimodality}

2017 年，Vaswani 等人从机器翻译出发提出 Transformer。自注意力允许序列位置直接交换信息，并使训练中的许多计算能够并行执行。它改变了序列建模的组织方式，为继续扩大模型与训练数据提供了合适结构。[Attention Is All You Need](https://arxiv.org/abs/1706.03762)。

预训练进一步改变了任务与模型的关系。BERT 在 2018 年通过遮蔽词预测等目标学习双向表示，再针对下游任务微调。GPT-3 在 2020 年展示，把任务说明和少量示例放进上下文，也能让同一个语言模型完成多种任务；示例只在推断时读入，权重并不更新。[BERT](https://arxiv.org/abs/1810.04805)；[Language Models Are Few-Shot Learners](https://arxiv.org/abs/2005.14165)。文本自身能提供大量训练目标，开发者不必为每项任务重新搜集同等规模的人工标签。随后，指令示范与人类偏好反馈又把“续写什么文字”的模型行为推向“怎样响应一个请求”。[InstructGPT，2022](https://arxiv.org/abs/2203.02155)。

语言能描述任务，也能描述图像和程序。2021 年的 CLIP 用成对图文学习共享的表示空间，使文字描述可以参与视觉识别；同年的 Codex 研究用代码训练语言模型，并通过执行测试评价生成程序。代码输出由此获得了直接的外部检查：程序能否运行，是否通过指定用例。[CLIP](https://arxiv.org/abs/2103.00020)；[Evaluating Large Language Models Trained on Code](https://arxiv.org/abs/2107.03374)。一个自然语言请求可以逐渐连接到检索、代码和可执行操作。[ReAct](https://arxiv.org/abs/2210.03629)在 2022 年公开的研究中，把语言推理步骤与环境动作交错组织，让工具返回的观察进入下一步决策。

2023 年的 GPT-4 技术报告描述了接收图像与文本、输出文本的多模态模型；2024 年的 Gemini 1.5 报告进一步研究长文档、音频和视频的长上下文处理。[多模态学习](./multimodal-learning.md#visual-tokens)让任务输入由一句提示扩展为一份资料、一段录音或一段连续影像，模型需要在不同形式的证据之间建立联系。[GPT-4 Technical Report](https://arxiv.org/abs/2303.08774)；[Gemini 1.5](https://arxiv.org/abs/2403.05530)。检索到某段内容、理解它在全文中的作用、据此作出正确决定，是需要分别评价的能力。

这些变化已经能在具体工作实验中测量。Noy 与 Zhang 于 2023 年发表的随机实验招募了 453 名受过大学教育的专业人士，研究中等难度的职业写作任务。获得 ChatGPT 辅助的实验条件下，平均完成时间下降 40%，输出质量评分提高 18%。结果限于研究设定的短篇写作任务和评分方式，不能直接换算成整个职业的劳动生产率。[原论文](https://doi.org/10.1126/science.adh2586)；[MIT 对实验设计的说明](https://news.mit.edu/2023/study-finds-chatgpt-boosts-worker-productivity-writing-0714)。

对知识工作的影响由此变得具体：整理材料和提出初稿可以更快，人的时间可以转向核对事实、处理例外和作出决定。对于缺少专业训练的人，自然语言接口也降低了调用程序与生成工具的门槛。收益是否真正留下来，要把审阅、纠错以及错误进入后续流程的成本一起算进去。

## 科学预测 {#science}

科学研究中，预测对象与实验之间的距离尤其重要。2020 年 CASP14 采用尚未公开的实验结构考核蛋白质结构预测。2021 年发表的 AlphaFold 2 论文报告，在其分析的 87 个蛋白质结构域上，覆盖 95% 残基的 Cα 主链均方根偏差中位数为 0.96 Å，下一最佳方法为 2.8 Å。这里比较的是特定盲测集合、特定结构对齐指标；$1\,\text{Å}=10^{-10}\,\text{m}$。[Jumper 等，图 1a](https://www.nature.com/articles/s41586-021-03819-2)。

![AlphaFold 2 原论文图 1：盲测结构误差、预测与实验结构的叠合，以及从序列和数据库信息到三维结构的网络流程](/images/deep-learning-done-right/history/af2-fig1.png)

图 1：Jumper 等（2021）原论文图 1，PDF 第 2 页、期刊第 584 页，原图未修改，依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 使用。左上 a 比较 CASP14 结构域误差；b–d 以蓝色表示预测、绿色表示实验结构，其中 d 是赛后预测示例；下方 e 显示多序列比对、成对表示与结构模块怎样连接。图把一个学习系统的输入、预测和实验核验放在了同一张纸上。

AlphaFold 2 从序列、进化相关信息和已有结构中提取约束，产生可供检查的三维模型。研究者因此能够先定位一个可能的结合区域，选择要测试的突变，或把预测结构作为解释实验数据的起点。2022 年 7 月，EMBL-EBI 与 DeepMind 将 AlphaFold 数据库扩展到超过两亿个预测结构，开放查询改变了结构信息的可获得性。[当时的数据库发布记录](https://www.ebi.ac.uk/jdispatcher/blog/2022-07-28-new-afdb-release)。这些记录都是预测，每一条能支持什么结论，仍要看置信度和实验结构。

2024 年的 AlphaFold 3 又改变了问题的单位。细胞中的蛋白质与 DNA、RNA、小分子及离子共同作用；模型开始联合预测包含这些分子的复合物结构。扩散方法在这里用于生成原子坐标，将生成模型接入了分子相互作用研究。[Abramson 等，2024](https://www.nature.com/articles/s41586-024-07487-w)。

![AlphaFold 3 原论文图 1：蛋白质与核酸等复合物的结构示例、分任务评估和包含扩散模块的推断架构](/images/deep-learning-done-right/history/af3-fig1.png)

图 2：Abramson 等（2024）原论文图 1，PDF 第 2 页、期刊第 494 页，原图未修改，依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 使用。a、b 展示复合物，c 分别评价配体、核酸、共价修饰和蛋白质相关任务，d 显示扩散模块生成坐标。c 的各任务采用不同判据、样本数和采样设置，柱高不能跨任务当作同一种“准确率”比较。

2026 年 1 月发表的 AlphaGenome 把观察尺度移向 DNA 调控。它接收约百万碱基长度的序列，预测基因表达、染色质可及性、剪接等实验信号；比较参考序列与变异序列的预测，可以估计变异造成的分子影响。论文使用人和小鼠数据训练，并在留出区域及变异效应任务上评价。[Avsec 等，Advancing Regulatory Variant Effect Prediction with AlphaGenome](https://www.nature.com/articles/s41586-025-10014-0)。这样一来，研究者能先对大量候选变异排序，再决定把有限的实验资源放在哪里。分子信号预测与一个人的疾病结局之间，还隔着细胞状态、环境和复杂的因果过程。

从结构预测走向相互作用，再走向序列变化的功能后果，深度学习逐渐参与科学问题的提出与筛选。数据的来源仍是长期积累的测序、结构测定和功能实验。新模型把这些积累重新组织，使过去只能逐个研究的问题能够先接受大规模计算筛选；实验再淘汰错误候选，并把新的观测带回下一轮研究。

## 推理计算 {#reasoning}

语言模型扩展以后，增加能力又出现了一条路线：在回答一道题时花费更多计算。它可以尝试不同解法、运行程序、检查约束，再选择答案。[训练时投入的计算](./scaling-and-experts.md#compute-budget)塑造模型，[推断时投入的计算](./alignment-and-reasoning.md#test-time-compute)则服务于眼前这一个问题。围棋搜索已经展示过后一种价值，现在它进入开放得多的语言任务。

2025 年的 DeepSeek-R1 工作提供了可研究的实例。R1-Zero 从已经预训练的基座出发，用强化学习和规则奖励训练可验证的推理任务；完整的 R1 还加入冷启动数据、监督微调等阶段。论文观察到更长的解题过程，以及检查和调整解法的行为。它把“怎样给过程提供有效反馈”推到了模型规模之外的研究中心。[2025 年 1 月技术报告](https://arxiv.org/abs/2501.12948)；[同年 9 月正式论文](https://www.nature.com/articles/s41586-025-09422-z)。

数学答案、程序测试和形式验证可以提供较明确的反馈，开放式研究与现实行动通常没有这么便宜的裁判。奖励能检查什么，模型就容易向什么优化。若测试漏掉边界条件，能够通过测试的程序仍可能有错；若评价只认可流畅解释，增加推理长度也未必增加正确性。有意义的比较应固定总计算预算，检查新题上的成功率、失败分布和验证成本。

## 尚未完成的扩展 {#horizons}

已经发生的变化给未来留下了几组具体实验。多模态模型能够接收更完整的情境，语言模型可以调用工具，科学模型能够产生实验候选；下一阶段是否有实质进步，取决于这些能力能否在陌生条件下共同工作。

长程任务需要可靠的反馈。 如果系统能在工具失败、资料过时或环境改变后识别问题并重新规划，它才可能承担更长的工作。可检验的实验应把任务放在训练之后产生的新环境中，保留失败与恢复记录，并统计人在中途接管的次数。一个能完成演示的系统与一个能持续交付的系统，差别会在这些记录里出现。对于机器人，碰撞、时间和能量的代价也必须进入评价；视频预测是否合理，最终要接受真实行动结果的检验。

科学候选需要走过实验。 如果结构、功能与实验反馈能够连接成稳定循环，模型可能缩短从提出假设到淘汰假设的时间。比较方法是提前登记候选选择规则，用相同预算进行盲测，报告验证成功率、失败候选和重复实验结果。AlphaFold 3 与 AlphaGenome 已经扩大了可计算的对象范围，未来能否提高发现效率，要看预测在实验室里省下了多少试错。

计算成本需要与正确性一起衡量。 更长的上下文、更多采样和更长的推理都要消耗资源。若[高效序列计算](./efficient-sequence-models.md#grouped-query)、小模型、蒸馏或有选择的工具调用能在相同可靠性下减少成本，更多人才能实际使用这些能力。应同时报告每个成功任务的延迟、能耗与费用，并观察语言、领域和设备变化后的表现。把错误答案生成得更便宜，并没有完成同一个任务。

人的能力与自主性也需要实验。 写作辅助已经能在短时任务中测出收益，长期学习却要另设考核：离开工具后还能否独立解释和解决问题，错误建议是否会被识别，使用者能否知道结论来自哪里。生产工具还涉及数据贡献者和创作者的权利、收益分配以及谁能承担纠错成本。技术的可用性与社会的受益范围，需要分别建设和评价。

1943 年的纸面神经元，1950 年代的学习装置，能读手写字符的卷积网络，两张显卡上训练的视觉模型，棋盘上的搜索，以及今天可以查询的分子结构，留下了一条逐渐扩大的工作记录。每一步都把某种原本难以写成规则的经验，变成了可以训练、复用和检查的计算。它们的成果来自研究者，也来自整理数据、制造仪器、编写软件和反复验证结果的人。

沿着这条记录望向未来，值得期待的是更多人能够提出过去无力处理的问题：让一份材料跨越语言，让一个设想变成可运行的程序，让一个关于生命的猜想获得值得进行的实验。这样的未来仍需要新的算法与装置，也需要保留判断、纠错和拒绝错误结果的能力。深度学习已经扩大了人类探索的范围；接下来要完成的工作，是让抵达更远处的能力，成为能够被更多人理解和使用的知识。

## 主要原始来源 {#sources}

| 年代 | 原始资料 | 本章使用位置 |
| --- | --- | --- |
| 1943、1958 | [McCulloch 与 Pitts](https://www.cs.cmu.edu/~./epxing/Class/10715/reading/McCulloch.and.Pitts.pdf)；[Rosenblatt](https://web.stanford.edu/class/psych209a/ReadingsByDate/01_30/Rosenblatt58Perceptron.pdf) | 形式神经元与早期学习模型 |
| 1974–1986 | [Werbos 学位记录](https://belinrae.inrae.fr/index.php?id=222547&lvl=notice_display)；[Linnainmaa](https://doi.org/10.1007/BF01931367)；[Rumelhart、Hinton 与 Williams](https://www.cs.toronto.edu/~hinton/absps/naturebp.pdf) | 求导、学习应用与传播的不同历史层次 |
| 1998、2006 | [LeCun 等](https://leon.bottou.org/publications/pdf/ieee-1998.pdf)；[Hinton、Osindero 与 Teh](https://www.cs.toronto.edu/~hinton/absps/fastnc.pdf) | 文档识别、深层模型的训练 |
| 2012、2015 | [AlexNet](https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)；[ResNet](https://arxiv.org/abs/1512.03385) | 视觉识别条件、集成结果与深度优化 |
| 2013–2022 | [VAE](https://arxiv.org/abs/1312.6114)、[GAN](https://arxiv.org/abs/1406.2661)、[DDPM](https://arxiv.org/abs/2006.11239)、[潜空间扩散](https://arxiv.org/abs/2112.10752) | 生成机制与条件创作 |
| 2016–2017 | [AlphaGo](https://www.cs.cmu.edu/afs/cs.cmu.edu/academic/class/15780-s16/www/AlphaGo.nature16961.pdf)；[AlphaGo Zero](https://www.nature.com/articles/nature24270) | 学习与搜索、自我对弈 |
| 2017–2022 | [Transformer](https://arxiv.org/abs/1706.03762)、[BERT](https://arxiv.org/abs/1810.04805)、[GPT-3](https://arxiv.org/abs/2005.14165)、[InstructGPT](https://arxiv.org/abs/2203.02155) | 预训练、上下文使用与偏好反馈 |
| 2021–2024 | [CLIP](https://arxiv.org/abs/2103.00020)、[Codex](https://arxiv.org/abs/2107.03374)、[ReAct](https://arxiv.org/abs/2210.03629)、[GPT-4](https://arxiv.org/abs/2303.08774)、[Gemini 1.5](https://arxiv.org/abs/2403.05530) | 语言、代码、多模态与工具 |
| 2021、2024、2026 | [AlphaFold 2](https://www.nature.com/articles/s41586-021-03819-2)、[AlphaFold 3](https://www.nature.com/articles/s41586-024-07487-w)、[AlphaGenome](https://www.nature.com/articles/s41586-025-10014-0) | 结构、相互作用与变异效应预测；图 1、图 2 |
| 2023、2025 | [Noy 与 Zhang](https://doi.org/10.1126/science.adh2586)；[DeepSeek-R1](https://www.nature.com/articles/s41586-025-09422-z) | 有条件的工作收益、可验证反馈与推理 |
