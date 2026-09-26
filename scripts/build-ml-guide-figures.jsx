#target illustrator
/* Native Illustrator source for the machine-learning guide.
 * Run with Illustrator's File > Scripts, or do javascript file.
 * Each figure is a named layer on a separate 1000 x 480 pt artboard.
 * All marks, connectors and labels are editable vector/text objects.
 */
(function () {
    var ROOT = "/Users/zhangjinkai/workspace/The0xKa1.github.io";
    var SOURCE = ROOT + "/assets/ml-guide/learning-diagrams.ai";
    var OUT = ROOT + "/apps/web/public/images/ml-guide";
    var LOG = ROOT + "/assets/ml-guide/illustrator-export-log.txt";
    var W = 1000, H = 480, GAP = 130;
    var doc, layer, top = H, logLines = [], oldUI = app.userInteractionLevel;
    var names = ["roadmap", "data-split", "linear-fit", "gradient-descent", "model-fit", "decision-tree", "neural-network", "training-loop"];
    var C = {
        ink: "35586A", blue: "5684A0", blueLine: "B7D1E2", blueFill: "F0F6FB",
        green: "388A72", greenLine: "AAD0BB", greenFill: "F0F7F2",
        purple: "7C58A1", purpleLine: "CCB7E3", purpleFill: "F6F1FA",
        peach: "BA8150", peachLine: "E3C398", peachFill: "FFF6E9",
        coral: "D87969", faint: "EDF1F2", white: "FFFFFF", muted: "657983"
    };
    function mkdir(path) {
        var f = new Folder(path);
        if (!f.exists) { if (!f.parent.exists) mkdir(f.parent.fsName); if (!f.create()) throw new Error("Cannot create " + path); }
        return f;
    }
    function log(s) {
        logLines.push(s);
        var f = new File(LOG); f.encoding = "UTF-8";
        if (f.open("w")) { f.write(logLines.join("\n") + "\n"); f.close(); }
    }
    function rgb(hex) {
        var c = new RGBColor();
        c.red = parseInt(hex.substr(0, 2), 16); c.green = parseInt(hex.substr(2, 2), 16); c.blue = parseInt(hex.substr(4, 2), 16);
        return c;
    }
    function pt(x, y) { return [x, top - y]; }
    function style(p, fill, stroke, width) {
        p.filled = !!fill; if (fill) p.fillColor = rgb(fill);
        p.stroked = !!stroke; if (stroke) { p.strokeColor = rgb(stroke); p.strokeWidth = width || 1.5; }
        try { p.strokeCap = StrokeCap.ROUNDENDCAP; p.strokeJoin = StrokeJoin.ROUNDENDJOIN; } catch (_) {}
        return p;
    }
    function rect(x, y, w, h, fill, stroke, radius) {
        var p = layer.pathItems.roundedRectangle(top - y, x, w, h, radius || 20, radius || 20);
        return style(p, fill, stroke, 1.7);
    }
    function circle(x, y, r, fill, stroke, width) {
        return style(layer.pathItems.ellipse(top - y + r, x - r, r * 2, r * 2), fill, stroke, width || 1.6);
    }
    function path(points, stroke, width, fill, closed) {
        var p = layer.pathItems.add(), v = [], i;
        for (i = 0; i < points.length; i++) v.push(pt(points[i][0], points[i][1]));
        p.setEntirePath(v); p.closed = !!closed; return style(p, fill, stroke, width);
    }
    function line(x1, y1, x2, y2, color, width, dashed) {
        var p = path([[x1, y1], [x2, y2]], color || C.blue, width || 2, null, false);
        if (dashed) p.strokeDashes = [6, 6]; return p;
    }
    function arrowHead(x, y, dx, dy, color, size) {
        size = size || 11; var d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
        return path([[x, y], [x - ux * size - uy * size * 0.44, y - uy * size + ux * size * 0.44],
            [x - ux * size + uy * size * 0.44, y - uy * size - ux * size * 0.44]], null, 0, color || C.blue, true);
    }
    function arrow(x1, y1, x2, y2, color, width) {
        line(x1, y1, x2, y2, color, width); arrowHead(x2, y2, x2 - x1, y2 - y1, color);
    }
    function bezier(p0, p1, p2, p3, color, width, head, dashed) {
        var p = layer.pathItems.add(); p.setEntirePath([pt(p0[0], p0[1]), pt(p3[0], p3[1])]);
        p.pathPoints[0].rightDirection = pt(p1[0], p1[1]);
        p.pathPoints[1].leftDirection = pt(p2[0], p2[1]);
        style(p, null, color || C.blue, width || 2.4);
        if (dashed) p.strokeDashes = [6, 6];
        if (head) arrowHead(p3[0], p3[1], p3[0] - p2[0], p3[1] - p2[1], color);
        return p;
    }
    function smooth(points, color, width) {
        var p = path(points, color, width || 3, null, false), i, a, b;
        for (i = 0; i < points.length; i++) {
            a = points[Math.max(0, i - 1)]; b = points[Math.min(points.length - 1, i + 1)];
            p.pathPoints[i].leftDirection = pt(points[i][0] - (b[0] - a[0]) / 6, points[i][1] - (b[1] - a[1]) / 6);
            p.pathPoints[i].rightDirection = pt(points[i][0] + (b[0] - a[0]) / 6, points[i][1] + (b[1] - a[1]) / 6);
        }
        return p;
    }
    function fontFrom(candidates) {
        for (var i = 0; i < candidates.length; i++) { try { return app.textFonts.getByName(candidates[i]); } catch (_) {} }
        return app.textFonts[0];
    }
    var cnFont, enFont;
    function text(s, x, y, size, color, align) {
        var t = layer.textFrames.add(); t.contents = s;
        var ca = t.textRange.characterAttributes;
        ca.textFont = enFont;
        ca.size = size || 26; ca.fillColor = rgb(color || C.ink);
        ca.autoLeading = false; ca.leading = (size || 26) * 1.3;
        t.left = x; t.top = top - y;
        if (align === "center") t.left = x - t.width / 2;
        if (align === "right") t.left = x - t.width;
        return t;
    }
    function title(s, sub) { text(s, 48, 31, 35, C.ink); if (sub) text(sub, 49, 79, 22, C.muted); }
    function note(s) { text(s, 500, 550, 22, C.muted, "center"); }
    function card(x, y, w, h, heading, subtitle, fill, stroke, ink) {
        rect(x, y, w, h, fill, stroke, 20);
        text(heading, x + w / 2, y + 23, 28, ink || C.ink, "center");
        if (subtitle) text(subtitle, x + w / 2, y + 66, 22, ink || C.muted, "center");
    }
    function axes(x, y, width, height, xlabel, ylabel) {
        arrow(x, y, x + width, y, C.muted, 1.6); arrow(x, y, x, y - height, C.muted, 1.6);
        if (xlabel) text(xlabel, x + width - 12, y + 18, 22, C.muted, "right");
        if (ylabel) text(ylabel, x - 8, y - height - 33, 22, C.muted);
    }
    function newBoard(i) {
        top = H - i * (H + GAP);
        var bounds = [0, top, W, top - H];
        if (i === 0) doc.artboards[0].artboardRect = bounds; else doc.artboards.add(bounds);
        doc.artboards[i].name = names[i];
        layer = doc.layers.add(); layer.name = names[i]; doc.activeLayer = layer;
        var bg = layer.pathItems.rectangle(top, 0, W, H); style(bg, C.white, null, 0); bg.name = "white-background";
    }
    // Filled, multi-colour pictograms. Geometry stays editable in Illustrator.
    function icon(kind, cx, cy, scale) {
        var z = scale || 1;
        function R(x,y,w,h,f,s,r){ return rect(cx+x*z,cy+y*z,w*z,h*z,f,s,(r||6)*z); }
        function O(x,y,r,f,s){ return circle(cx+x*z,cy+y*z,r*z,f,s,1.6*z); }
        function L(x1,y1,x2,y2,c,w){return line(cx+x1*z,cy+y1*z,cx+x2*z,cy+y2*z,c,(w||2)*z);}
        function B(a,b,c,d,col,w,head){return bezier([cx+a[0]*z,cy+a[1]*z],[cx+b[0]*z,cy+b[1]*z],[cx+c[0]*z,cy+c[1]*z],[cx+d[0]*z,cy+d[1]*z],col,(w||2)*z,head);}
        if (kind === 'table' || kind === 'data') {
            R(-25,-26,47,53,C.blueFill,C.blue,7); R(-20,-20,37,10,C.blueLine,null,3);
            var fills=[C.greenLine,C.peachLine,C.purpleLine];
            for(var a=0;a<3;a++) for(var b=0;b<3;b++)R(-19+b*12,-5+a*9,9,6,fills[(a+b)%3],null,2);
            O(24,22,11,C.green,C.white); L(18,22,22,26,C.white,2);L(22,26,29,17,C.white,2);
        } else if(kind === 'model') {
            R(-25,-24,50,48,C.purpleFill,C.purple,10);
            for(var k=0;k<3;k++){L(-33,-15+k*15,-25,-15+k*15,C.blue,3);L(25,-15+k*15,33,-15+k*15,C.blue,3);}
            B([-12,-11],[-5,-17],[7,16],[13,10],C.purple,2,false);
            B([-12,11],[-4,17],[4,-17],[13,-10],C.green,2,false);
            O(-12,-11,5,C.blue,C.white);O(-12,11,5,C.green,C.white);O(13,-10,5,C.peach,C.white);O(13,10,5,C.coral,C.white);O(0,0,5,C.purple,C.white);
        } else if(kind === 'chart') {
            R(-26,-26,52,52,C.white,C.blueLine,8);
            R(-18,7,9,12,C.blue,C.blue,2);R(-4,-5,9,24,C.green,C.green,2);R(10,-17,9,36,C.peachLine,C.peach,2);
            B([-18,-10],[-9,-29],[1,0],[19,-24],C.purple,2.5,true);
        } else if(kind === 'check') {
            R(-23,-25,46,51,C.greenFill,C.green,9);R(-12,-31,24,11,C.peachLine,C.peach,4);
            L(-11,-7,12,-7,C.greenLine,3);L(-11,2,5,2,C.greenLine,3);
            O(18,18,14,C.green,C.white);L(10,18,16,24,C.white,3);L(16,24,27,10,C.white,3);
        } else if(kind === 'sliders') {
            R(-26,-26,52,52,C.peachFill,C.peachLine,8);
            for(var j=0;j<3;j++){L(-18,-14+j*14,18,-14+j*14,C.peach,2);O([-8,11,-2][j],-14+j*14,5,[C.blue,C.green,C.purple][j],C.white);}
        } else if(kind === 'tree') {
            B([0,-15],[0,-2],[-20,-3],[-20,15],C.blue,3,false);
            B([0,-15],[0,-2],[20,-3],[20,15],C.blue,3,false);
            O(0,-21,9,C.purpleLine,C.purple);O(-20,20,10,C.greenLine,C.green);O(20,20,10,C.peachLine,C.peach);
        } else if(kind === 'network') {
            var yy=[-21,0,21];
            for(var q=0;q<3;q++)for(var v=0;v<2;v++)B([-24,-13+v*26],[-8,-13+v*26],[-8,yy[q]],[0,yy[q]],C.blueLine,1.7,false);
            for(q=0;q<3;q++)B([0,yy[q]],[14,yy[q]],[11,0],[27,0],C.purpleLine,1.7,false);
            O(-24,-13,6,C.blue,C.white);O(-24,13,6,C.green,C.white);
            for(q=0;q<3;q++)O(0,yy[q],6,[C.blue,C.purple,C.peach][q],C.white);
            O(27,0,9,C.coral,C.white);
        } else if(kind === 'flower' || kind === 'flowerB' || kind === 'flowerC') {
            var fc=kind==='flower'?C.blueLine:(kind==='flowerB'?C.purpleLine:C.peachLine);
            B([0,2],[-7,16],[7,23],[0,34],C.green,3,false);
            var leaf=layer.pathItems.ellipse(top-(cy+16*z),cx+1*z,19*z,8*z);style(leaf,C.greenLine,C.green,1.2);
            O(-10,-10,10,fc,C.blue);O(10,-10,10,fc,C.blue);O(-10,7,10,fc,C.blue);O(10,7,10,fc,C.blue);O(0,-2,9,C.peachLine,C.peach);
        } else if(kind === 'target') {
            O(0,0,26,C.purpleFill,C.purpleLine);O(0,0,17,C.white,C.purple);O(0,0,7,C.coral,C.white);
            B([30,-29],[22,-25],[13,-15],[3,-3],C.green,3,true);
        } else if(kind === 'gear') {
            for(var u=0;u<8;u++){var an=u*Math.PI/4;O(Math.cos(an)*23,Math.sin(an)*23,7,C.blueLine,C.blue);}
            O(0,0,23,C.blueLine,C.blue);O(0,0,12,C.white,C.blue);O(0,0,5,C.peachLine,C.peach);
        } else if(kind === 'loss') {
            R(-25,-24,50,48,C.peachFill,C.peachLine,8);
            L(-15,14,15,14,C.muted,2);L(-15,14,-15,-14,C.muted,2);
            B([-12,-9],[-6,7],[5,14],[17,1],C.coral,3,false);
            O(-9,-4,4,C.blue,C.white);O(7,7,4,C.green,C.white);
        } else if(kind === 'grad') {
            O(-21,17,8,C.blueLine,C.blue);O(0,-17,8,C.purpleLine,C.purple);O(23,16,8,C.peachLine,C.peach);
            B([0,-9],[-3,8],[-9,14],[-15,16],C.purple,3,true);
            B([18,10],[15,-4],[12,-14],[7,-16],C.coral,3,true);
        }
    }
    function chip(x,y,w,label,color,fill){rect(x,y,w,35,fill,color,12);text(label,x+w/2,y+6,20,color,'center');}
    function header(s,kind){icon(kind||'chart',52,47,0.60);text(s,90,25,32,C.ink);}
    function roadTile(x,y,kind,label,fill,stroke,ink){
        rect(x,y,274,152,fill,stroke,20);icon(kind,x+137,y+57,1.05);text(label,x+137,y+112,23,ink,'center');
    }
    function roadmap() {
        header('Machine learning','network');
        var xx=[40,363,686];
        roadTile(xx[0],91,'table','Data & Python',C.blueFill,C.blueLine,C.blue);
        roadTile(xx[1],91,'model','Data to models',C.greenFill,C.greenLine,C.green);
        roadTile(xx[2],91,'chart','Linear models',C.purpleFill,C.purpleLine,C.purple);
        roadTile(xx[2],278,'check','Evaluation',C.greenFill,C.greenLine,C.green);
        roadTile(xx[1],278,'tree','Trees & clustering',C.blueFill,C.blueLine,C.blue);
        roadTile(xx[0],278,'network','Neural networks',C.purpleFill,C.purpleLine,C.purple);
        bezier([314,165],[329,151],[348,151],[363,165],C.blue,3,true);
        bezier([637,165],[652,151],[671,151],[686,165],C.green,3,true);
        bezier([824,243],[854,250],[854,272],[824,278],C.purple,2.5,true);
        bezier([686,354],[670,366],[653,366],[637,354],C.green,3,true);
        bezier([363,354],[348,366],[329,366],[314,354],C.blue,3,true);
    }
    function dataSplit(){
        header('Train, validate, test','table');
        var xs=[40,363,686], fill=[C.blueFill,C.greenFill,C.purpleFill],border=[C.blueLine,C.greenLine,C.purpleLine], ink=[C.blue,C.green,C.purple];
        var labels=['TRAIN','VALIDATION','TEST'], kinds=['gear','sliders','check'], actions=['Learn parameters','Select a model','Final evaluation'];
        for(var i=0;i<3;i++){
            rect(xs[i],92,274,280,fill[i],border[i],21);text(labels[i],xs[i]+137,112,23,ink[i],'center');
            for(var r=0;r<3;r++)for(var c=0;c<5;c++)rect(xs[i]+61+c*31,157+r*21,25,14,[border[i],C.peachLine,C.greenLine][(r+c)%3],null,3);
            icon(kinds[i],xs[i]+137,272,0.94);text(actions[i],xs[i]+137,325,21,ink[i],'center');
        }
        chip(49,399,255,'Fit preprocessing',C.blue,C.blueFill);
        chip(373,399,255,'Transform',C.green,C.greenFill);
        chip(697,399,255,'Transform',C.purple,C.purpleFill);
        bezier([304,416],[327,400],[350,400],[373,416],C.blue,2.5,true);
        bezier([628,416],[649,400],[674,400],[697,416],C.blue,2.5,true);
        
    }
    function linearFit(){
        header('Linear regression','chart');
        rect(38,91,620,343,C.blueFill,C.blueLine,21);rect(683,91,279,343,C.peachFill,C.peachLine,21);
        axes(91,379,514,223,'Input','Target');
        var pts=[[122,353],[164,320],[207,337],[249,290],[293,294],[337,258],[382,271],[450,170],[508,218],[572,169]];
        var f=function(x){return 403-0.40*x;};line(112,f(112),596,f(596),C.green,4);
        for(var i=0;i<pts.length;i++)circle(pts[i][0],pts[i][1],6.2,[C.blue,C.green,C.purple][i%3],C.white,1.1);
        line(450,170,450,f(450),C.coral,3,true);circle(450,f(450),6,C.white,C.green,2);
        text('Residual',487,239,20,C.coral);
        icon('flower',755,165,0.95);text('Observed',873,150,22,C.peach,'center');
        icon('target',755,275,0.95);text('Predicted',873,260,22,C.peach,'center');
        bezier([450,167],[535,114],[627,119],[717,164],C.coral,2.3,true);
        chip(704,355,237,'y - prediction',C.peach,C.white);
        
    }
    function gradientDescent(){
        header('Gradient descent','gear');
        rect(38,91,650,343,C.greenFill,C.greenLine,21);rect(713,91,249,343,C.peachFill,C.peachLine,21);
        axes(89,390,546,226,'Parameter w','Loss');
        var f=function(x){return 354-0.0024*(x-441)*(x-441);},curve=[];
        for(var x=139;x<=630;x+=14)curve.push([x,f(x)]);smooth(curve,C.green,3.8);
        var px=[170,267,347],col=[C.coral,C.peach,C.blue];
        for(var i=0;i<3;i++){
            circle(px[i],f(px[i]),10,C.white,col[i],3);text('w'+i,px[i]-15,f(px[i])-38,21,col[i]);
            if(i<2)bezier([px[i]+12,f(px[i])+13],[px[i]+41,f(px[i])+51],[px[i+1]-34,f(px[i+1])-15],[px[i+1]-11,f(px[i+1])-4],C.coral,3,true);
        }
        icon('sliders',837,162,1.16);text('Learning rate',837,219,23,C.peach,'center');
        circle(758,281,6,C.blue,C.white);circle(785,281,6,C.blue,C.white);circle(812,281,6,C.blue,C.white);
        bezier([766,283],[770,276],[775,276],[778,283],C.blue,2,true);
        text('Small step',848,269,18,C.blue);
        circle(758,332,6,C.coral,C.white);circle(812,332,6,C.coral,C.white);
        bezier([766,332],[778,316],[794,316],[805,332],C.coral,2.3,true);
        text('Large step',848,320,18,C.coral);
        
    }
    function modelFit(){
        header('Underfitting & overfitting','target');
        var xs=[38,363,688],fills=[C.blueFill,C.greenFill,C.purpleFill],edges=[C.blueLine,C.greenLine,C.purpleLine],cols=[C.blue,C.green,C.purple],labels=['UNDERFIT','BALANCED','OVERFIT'];
        var noise=[10,-13,7,17,-14,11,-10,12,-11,9];
        for(var k=0;k<3;k++){
            var xx=xs[k];rect(xx,91,274,343,fills[k],edges[k],21);text(labels[k],xx+137,111,23,cols[k],'center');
            axes(xx+28,339,225,162,null,null);var pts=[],fit=[];
            for(var i=0;i<10;i++){var u=(i+0.4)/10;pts.push([xx+39+u*198,309-95*Math.sin(Math.PI*u)+noise[i]]);}
            if(k===0)line(xx+37,265,xx+243,257,cols[k],3.7);
            if(k===1){for(i=0;i<=22;i++){u=i/22;fit.push([xx+39+u*198,309-95*Math.sin(Math.PI*u)]);}smooth(fit,cols[k],3.7);}
            if(k===2){for(i=0;i<pts.length;i++){fit.push(pts[i]);if(i<pts.length-1)fit.push([(pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2+(i%2===0?-22:22)]);}smooth(fit,cols[k],2.8);}
            for(i=0;i<pts.length;i++)circle(pts[i][0],pts[i][1],5.2,[C.blue,C.peach,C.green][i%3],C.white,1);
            icon(['chart','check','sliders'][k],xx+58,385,0.59);text(['Missed pattern','Main trend','Sample noise'][k],xx+99,374,20,cols[k]);
        }
        
    }
    function decisionTree(){
        header('Decision tree','tree');
        icon('flower',107,161,1.12);
        rect(268,100,429,76,C.blueFill,C.blueLine,19);text('Petal length < 2 cm?',482,123,24,C.blue,'center');
        bezier([143,158],[192,158],[198,138],[268,138],C.blue,2.6,true);
        rect(45,290,241,133,C.greenFill,C.greenLine,19);icon('flower',112,349,0.91);text('Class A',212,338,23,C.green,'center');
        rect(493,217,425,72,C.purpleFill,C.purpleLine,19);text('Petal width < 1.8 cm?',705,238,23,C.purple,'center');
        rect(465,346,228,87,C.greenFill,C.greenLine,18);icon('flowerB',512,380,0.73);text('Class B',612,374,23,C.green,'center');
        rect(734,346,228,87,C.peachFill,C.peachLine,18);icon('flowerC',782,380,0.73);text('Class C',881,374,23,C.peach,'center');
        bezier([355,176],[309,205],[166,205],[165,290],C.blue,2.8,true);text('yes',235,216,21,C.green);
        bezier([598,176],[616,196],[680,190],[704,217],C.blue,2.8,true);text('no',689,185,21,C.purple);
        bezier([607,289],[603,313],[579,313],[579,346],C.purple,2.8,true);text('yes',539,304,20,C.green);
        bezier([807,289],[815,314],[849,316],[849,346],C.purple,2.8,true);text('no',864,307,20,C.peach);
        
    }
    function neuralNetwork(){
        header('Neural network','network');
        rect(38,91,260,343,C.blueFill,C.blueLine,21);rect(328,91,340,343,C.purpleFill,C.purpleLine,21);rect(698,91,264,343,C.greenFill,C.greenLine,21);
        text('4 inputs',168,107,23,C.blue,'center');text('8 hidden units',498,107,23,C.purple,'center');text('3 class scores',830,107,23,C.green,'center');
        var iy=[190,245,300,355],hy=[],oy=[216,275,334];for(var i=0;i<8;i++)hy.push(167+i*30);
        for(i=0;i<4;i++)for(var j=0;j<8;j++){var p=bezier([253,iy[i]],[327,iy[i]],[391,hy[j]],[480,hy[j]],C.blue,1.4,false);p.opacity=22;}
        for(i=0;i<8;i++)for(j=0;j<3;j++){p=bezier([514,hy[i]],[606,hy[i]],[632,oy[j]],[710,oy[j]],C.purple,1.4,false);p.opacity=22;}
        bezier([253,245],[327,245],[391,227],[480,227],C.peach,3,false);bezier([514,227],[606,227],[632,275],[710,275],C.green,3,false);
        icon('flower',113,241,1.1);text('Measurements',168,392,20,C.blue,'center');
        for(i=0;i<4;i++){circle(237,iy[i],16,C.white,C.blue,2);circle(237,iy[i],6,[C.blue,C.green,C.peach,C.purple][i],null,0);text('x'+(i+1),186,iy[i]-12,20,C.blue);}
        for(i=0;i<8;i++){circle(498,hy[i],15,C.white,C.purple,2);circle(498,hy[i],5,[C.blue,C.green,C.peach][i%3],null,0);}
        for(i=0;i<3;i++){circle(728,oy[i],17,C.white,C.green,2);rect(772,oy[i]-10,[53,112,72][i],19,[C.blueLine,C.green,C.peachLine][i],null,6);text(['A','B','C'][i],907,oy[i]-14,21,C.green);}
        text('Weighted sum + ReLU',498,392,20,C.purple,'center');text('Highest score',830,392,20,C.green,'center');
    }
    function trainingLoop(){
        header('Training loop','gear');
        var xs=[35,280,525,770],fill=[C.blueFill,C.peachFill,C.purpleFill,C.greenFill],edge=[C.blueLine,C.peachLine,C.purpleLine,C.greenLine],ink=[C.blue,C.peach,C.purple,C.green];
        var names=['Forward','Loss','Backward','Update'],kinds=['model','loss','grad','gear'],captions=['Input to scores','Prediction vs label','Compute gradients','Adjust weights'];
        for(var i=0;i<4;i++){
            rect(xs[i],114,195,272,fill[i],edge[i],22);icon(kinds[i],xs[i]+97,197,1.43);text(names[i],xs[i]+97,281,25,ink[i],'center');text(captions[i],xs[i]+97,328,18,ink[i],'center');
            if(i<3)bezier([xs[i]+195,248],[xs[i]+210,232],[xs[i]+230,232],[xs[i+1],248],ink[i],3,true);
        }
        bezier([864,386],[864,449],[134,449],[134,386],C.green,3,true);
        rect(373,402,260,37,C.white,null,12);text('New batch / reset gradients',503,410,18,C.green,'center');
    }
    try {
        mkdir(ROOT + "/assets/ml-guide"); mkdir(OUT);
        log("START " + new Date().toString() + " | Illustrator=" + app.version);
        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
        // Reruns replace only this generated source; unrelated documents stay open.
        for (var d = app.documents.length - 1; d >= 0; d--) {
            try { if (app.documents[d].fullName.fsName === new File(SOURCE).fsName) app.documents[d].close(SaveOptions.DONOTSAVECHANGES); } catch (_) {}
        }
        cnFont = fontFrom(["KaitiSC-Regular", "STKaiti", "Kaiti SC", "KaiTi", "PingFangSC-Regular", "ArialUnicodeMS"]);
        enFont = fontFrom(["ComicSansMS", "ComicSansMS-Bold", "ChalkboardSE-Regular", "ArialMT"]);
        log("Fonts: Chinese=" + cnFont.name + "; Latin=" + enFont.name);
        doc = app.documents.add(DocumentColorSpace.RGB, W, H);
        var builders = [roadmap, dataSplit, linearFit, gradientDescent, modelFit, decisionTree, neuralNetwork, trainingLoop];
        for (var i = 0; i < builders.length; i++) { newBoard(i); builders[i](); log("DRAW " + names[i]); }
        if (doc.rasterItems.length !== 0 || doc.placedItems.length !== 0) throw new Error("Unexpected raster or placed items");
        var save = new IllustratorSaveOptions(); save.pdfCompatible = true; save.compressed = true;
        doc.saveAs(new File(SOURCE), save);
        log("SAVED " + SOURCE + " | artboards=" + doc.artboards.length + " | pathItems=" + doc.pathItems.length + " | textFrames=" + doc.textFrames.length + " | rasterItems=" + doc.rasterItems.length + " | placedItems=" + doc.placedItems.length);
        var exp = new ExportOptionsPNG24();
        exp.antiAliasing = true; exp.artBoardClipping = true; exp.transparency = false;
        exp.horizontalScale = 200; exp.verticalScale = 200;
        exp.matte = true; exp.matteColor = rgb(C.white);
        for (i = 0; i < names.length; i++) {
            doc.artboards.setActiveArtboardIndex(i);
            // Illustrator appends .png to the extension-free export filename.
            doc.exportFile(new File(OUT + "/" + names[i]), ExportType.PNG24, exp);
            var png = new File(OUT + "/" + names[i] + ".png");
            if (!png.exists || png.length === 0) throw new Error("Export missing: " + png.fsName);
            log("PNG " + names[i] + ".png | bytes=" + png.length + " | scale=200% | clipping=true | transparency=false");
        }
        doc.artboards.setActiveArtboardIndex(0); doc.save();
        log("COMPLETE " + new Date().toString());
    } catch (e) {
        log("ERROR " + e.message + " | line=" + e.line);
        throw e;
    } finally {
        app.userInteractionLevel = oldUI;
    }
}());
