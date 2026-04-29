# 数学分析一，二的个人手写笔记


<div class="card file-block" markdown="1">
<div class="file-icon"><img src="./pdf.svg" style="height: 3em;"></div>
<div class="file-body">
<div class="file-title">数学分析（甲）Ⅰ（H）笔记</div>
<div class="file-meta"></div>
</div>
<a class="down-button" target="_blank" href="./math1.pdf"  markdown="1">:fontawesome-solid-download: 查看</a>
</div>


<!-- <div class="card file-block" markdown="1">
<div class="file-icon"><img src="https://raw.githubusercontent.com/kailqq/cdn_img/master/img/pdf.svg" style="height: 3em;"></div>
<div class="file-body">
<div class="file-title">数学分析（甲）Ⅱ（H）笔记</div>
<div class="file-meta"> </div>
</div>
<a class="down-button" target="_blank" href="./math2.pdf" markdown="1">:fontawesome-solid-download: 查看</a>
</div> -->


!!!idea "各类积分的总结"
    - 定义在整个空间上的积分
       - 定积分
       - 双重积分
       - 三重积分
    - 定义在曲线上的积分
       - 曲线积分
         - 第一类曲线积分，计算可以使用参数方程，将曲线微分表示出来即可
         - 第二类曲线积分，计算可以使用参数方程，将曲线微分表示出来，但是要根据方向来确定积分上下限；也可以使用Green公式和Stokes公式，将边界曲线积分转化为所围成曲面上的第一类面积分
       - 曲面积分
         - 第一类曲面积分，计算可以通过投影,通过计算法向量来计算投影角；从而将曲面积分转化为二重积分
         - 第二类曲面积分，计算可以通过投影,通过计算法向量来计算投影角；从而将曲面积分转化为二重积分，在这个基础之上多了一步定向即 **一投，二代，三定向** ；也可以使用Gauss公式，将曲面积分转化为所围成体积上的体积分

    !!!Note "Gauss,Green,Stokes公式"
        - Gauss公式：$\iint_S \vec{F}\cdot d\vec{S} = \iiint_V \nabla \cdot \vec{F}dV$
        - Green公式：$\oint_C Pdx + Qdy = \iint_D (\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y})dxdy$
        - Stokes公式：$\oint_C \vec{F}\cdot d\vec{r} = \iint_S \nabla \times \vec{F}\cdot d\vec{S}$
        实际上Green公式是Stokes公式在二维平面上的一个特例
