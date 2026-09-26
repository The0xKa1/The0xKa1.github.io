#target illustrator
/* Native Illustrator source for the machine-learning guide.
 * Run with Illustrator's File > Scripts, or do javascript file.
 * Each figure is a named layer on a separate 1000 x 480 pt artboard.
 * All marks, connectors and labels are editable vector/text objects.
 */
(function () {
    var ROOT = "/Users/zhangjinkai/workspace/The0xKa1.github.io";
    var SOURCE = ROOT + "/assets/ml-guide/learning-diagrams-expanded.ai";
    var OUT = ROOT + "/apps/web/public/images/ml-guide";
    var LOG = ROOT + "/assets/ml-guide/illustrator-expanded-export-log.txt";
    var W = 1000, H = 480, GAP = 130;
    var doc, layer, left = 0, top = H, logLines = [], oldUI = app.userInteractionLevel;
    var names = ["knn-svm", "pca-projection", "hmm-sequence", "attention-mix", "rl-interaction", "causal-fork", "experiment-protocol", "cross-validation", "confusion-matrix", "softmax-bars", "kernel-mapping", "em-mixture", "hierarchical-clustering", "convolution-patch", "recurrent-state", "mc-td-targets", "transfer-learning", "active-learning", "bayes-counts"];
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
    function pt(x, y) { return [left + x, top - y]; }
    function style(p, fill, stroke, width) {
        p.filled = !!fill; if (fill) p.fillColor = rgb(fill);
        p.stroked = !!stroke; if (stroke) { p.strokeColor = rgb(stroke); p.strokeWidth = width || 1.5; }
        try { p.strokeCap = StrokeCap.ROUNDENDCAP; p.strokeJoin = StrokeJoin.ROUNDENDJOIN; } catch (_) {}
        return p;
    }
    function rect(x, y, w, h, fill, stroke, radius) {
        var p = layer.pathItems.roundedRectangle(top - y, left + x, w, h, radius || 20, radius || 20);
        return style(p, fill, stroke, 1.7);
    }
    function circle(x, y, r, fill, stroke, width) {
        return style(layer.pathItems.ellipse(top - y + r, left + x - r, r * 2, r * 2), fill, stroke, width || 1.6);
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
        t.left = left + x; t.top = top - y;
        if (align === "center") t.left = left + x - t.width / 2;
        if (align === "right") t.left = left + x - t.width;
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
        left = (i % 4) * (W + GAP);
        top = H - Math.floor(i / 4) * (H + GAP);
        var bounds = [left, top, left + W, top - H];
        if (i === 0) doc.artboards[0].artboardRect = bounds; else doc.artboards.add(bounds);
        doc.artboards[i].name = names[i];
        layer = doc.layers.add(); layer.name = names[i]; doc.activeLayer = layer;
        var bg = layer.pathItems.rectangle(top, left, W, H); style(bg, C.white, null, 0); bg.name = "white-background";
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
            var leaf=layer.pathItems.ellipse(top-(cy+16*z),left+cx+1*z,19*z,8*z);style(leaf,C.greenLine,C.green,1.2);
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
    function classifierGeometry() {
        header('Nearest neighbours & margin','target');
        rect(35,97,445,335,C.blueFill,C.blueLine,22);rect(520,97,445,335,C.purpleFill,C.purpleLine,22);
        text('KNN',257,113,25,C.blue,'center');text('SVM',742,113,25,C.purple,'center');
        var pts=[[105,230],[155,175],[212,262],[282,189],[320,329],[155,339],[380,246]];
        for(var i=0;i<pts.length;i++)circle(pts[i][0],pts[i][1],10,i<4?C.blue:C.peach,C.white,2);
        circle(254,240,63,null,C.green,2);icon('target',254,240,0.45);
        bezier([250,228],[236,215],[225,200],[220,181],C.green,2,true);
        text('Vote among nearby samples',257,395,20,C.blue,'center');
        line(652,354,817,168,C.purple,3);line(615,340,780,154,C.purpleLine,2,true);line(689,368,854,182,C.purpleLine,2,true);
        var a=[[582,237],[624,168],[630,264],[684,211]],b=[[793,317],[855,246],[881,340],[805,367]];
        for(i=0;i<4;i++){circle(a[i][0],a[i][1],9,C.blue,C.white);circle(b[i][0],b[i][1],9,C.peach,C.white);}
        circle(684,211,15,null,C.green,2);circle(793,317,15,null,C.green,2);
        text('Wide separating margin',742,395,20,C.purple,'center');
    }
    function pcaProjection() {
        header('PCA: projection onto a useful direction','chart');
        rect(35,100,575,328,C.blueFill,C.blueLine,22);rect(665,100,300,328,C.greenFill,C.greenLine,22);
        var p=[[104,344],[154,338],[194,276],[244,291],[290,241],[340,242],[385,184],[441,195],[490,146],[532,156]];
        line(89,364,559,135,C.green,3);
        for(var i=0;i<p.length;i++){
            var xx=p[i][0],yy=p[i][1],vx=470,vy=-229,t=((xx-89)*vx+(yy-364)*vy)/(vx*vx+vy*vy);
            var qx=89+t*vx,qy=364+t*vy;
            line(xx,yy,qx,qy,C.purpleLine,1.4,true);circle(xx,yy,7,[C.blue,C.purple,C.peach][i%3],C.white);circle(qx,qy,3,C.green,null);
        }
        text('2 features',320,389,21,C.blue,'center');
        bezier([610,248],[631,227],[647,227],[665,248],C.green,3,true);
        icon('sliders',815,171,1.0);line(705,293,924,293,C.green,2);
        for(i=0;i<10;i++)circle(710+i*23,293,6,[C.blue,C.purple,C.peach][i%3],C.white);
        text('1 component',815,347,23,C.green,'center');
    }
    function hmmSequence() {
        header('Hidden states, visible observations','network');
        var xx=[185,500,815];
        for(var i=0;i<3;i++) {
            rect(xx[i]-125,105,250,120,C.blueFill,C.blueLine,20);
            icon(i===1?'gear':'target',xx[i]-68,162,0.8);text(['Sunny','Rainy','Rainy'][i],xx[i]+31,149,24,C.blue,'center');
            rect(xx[i]-125,304,250,113,C.greenFill,C.greenLine,20);
            icon('check',xx[i]-71,357,0.75);text(['No umbrella','Umbrella','Umbrella'][i],xx[i]+25,348,21,C.green,'center');
            bezier([xx[i],225],[xx[i]+25,250],[xx[i]+25,277],[xx[i],304],C.green,2.6,true);
            if(i<2)bezier([xx[i]+125,162],[xx[i]+145,145],[xx[i]+170,145],[xx[i+1]-125,162],C.purple,3,true);
        }
        text('Hidden weather',45,76,17,C.blue);text('Observed behaviour',45,275,17,C.green);
        
    }
    function attentionMix() {
        header('Attention: weighted information','network');
        rect(35,105,235,318,C.blueFill,C.blueLine,22);icon('model',152,190,1.2);text('Query',152,273,25,C.blue,'center');text('"it"',152,326,25,C.blue,'center');
        var yy=[145,260,375],weights=['0.7','0.2','0.1'],words=['cup','floor','fell'];
        for(var i=0;i<3;i++){
            bezier([270,258],[330,258],[329,yy[i]],[391,yy[i]], [C.green,C.purple,C.peach][i], [6,3,2][i],true);
            rect(395,yy[i]-40,200,80,[C.greenFill,C.purpleFill,C.peachFill][i],[C.greenLine,C.purpleLine,C.peachLine][i],18);
            text(words[i],465,yy[i]-14,23,C.ink,'center');text(weights[i],557,yy[i]-13,20,C.muted,'center');
            bezier([595,yy[i]],[666,yy[i]],[642,258],[717,258],[C.green,C.purple,C.peach][i],[6,3,2][i],true);
        }
        rect(720,105,245,318,C.greenFill,C.greenLine,22);icon('network',842,198,1.25);text('Weighted sum',842,285,23,C.green,'center');text('of value vectors',842,329,19,C.green,'center');
    }
    function rlInteraction() {
        header('Reinforcement learning','gear');
        rect(55,133,315,243,C.blueFill,C.blueLine,22);icon('model',211,211,1.35);text('Agent',211,299,28,C.blue,'center');
        rect(630,133,315,243,C.greenFill,C.greenLine,22);icon('tree',787,211,1.35);text('Environment',787,299,28,C.green,'center');
        bezier([370,204],[455,115],[545,115],[630,204],C.purple,4,true);
        rect(422,112,156,42,C.purpleFill,C.purpleLine,12);text('Action',500,120,22,C.purple,'center');
        bezier([630,304],[550,410],[450,410],[370,304],C.peach,4,true);
        rect(402,370,196,42,C.peachFill,C.peachLine,12);text('State + reward',500,379,20,C.peach,'center');
        
    }
    function causalFork() {
        header('Confounding: a shared cause','tree');
        rect(340,95,320,109,C.purpleFill,C.purpleLine,22);icon('data',395,145,0.8);text('Prior knowledge',530,132,24,C.purple,'center');
        rect(80,305,310,115,C.blueFill,C.blueLine,22);icon('table',132,359,0.75);text('Tutoring',268,346,25,C.blue,'center');
        rect(610,305,310,115,C.greenFill,C.greenLine,22);icon('chart',663,359,0.8);text('Exam score',785,346,25,C.green,'center');
        bezier([391,204],[320,228],[235,250],[235,305],C.purple,3,true);
        bezier([609,204],[680,228],[765,250],[765,305],C.purple,3,true);
        bezier([390,357],[465,325],[535,325],[610,357],C.blue,3,true);
        text('Effect of interest',500,312,18,C.blue,'center');
    }
    function experimentProtocol() {
        header('Model selection without test leakage','check');
        var xs=[35,280,525,770],types=['data','sliders','model','check'];
        var labels=['Split','Search','Refit','Test'];var sub=['Reserve test data','Training folds only','All training data','Final estimate'];
        for(var i=0;i<4;i++){
            rect(xs[i],120,195,267,[C.blueFill,C.purpleFill,C.greenFill,C.peachFill][i],[C.blueLine,C.purpleLine,C.greenLine,C.peachLine][i],22);
            icon(types[i],xs[i]+97,198,1.25);text(labels[i],xs[i]+97,278,25,C.ink,'center');text(sub[i],xs[i]+97,329,17,C.muted,'center');
            if(i<3)bezier([xs[i]+195,255],[xs[i]+208,237],[xs[i]+232,237],[xs[i+1],255],C.blue,3,true);
        }
        
    }
    function crossValidation() {
        header('Cross-validation','check');
        rect(35,95,690,337,C.blueFill,C.blueLine,20);rect(760,95,205,337,C.peachFill,C.peachLine,20);
        for(var r=0;r<5;r++){
            text('Fold '+(r+1),63,130+r*53,19,C.blue);
            for(var c=0;c<5;c++)rect(160+c*105,124+r*53,92,34,r===c?C.purple:C.greenLine,null,8);
        }
        icon('check',862,190,1.25);text('Test set',862,265,25,C.peach,'center');text('Held aside',862,308,19,C.peach,'center');
        circle(243,411,6,C.greenLine,null);text('Train',258,399,17,C.green);circle(413,411,6,C.purple,null);text('Validate',428,399,17,C.purple);
        
    }
    function confusionMatrix() {
        header('Confusion matrix','check');
        text('Predicted',330,90,23,C.blue,'center');text('Spam',262,131,22,C.blue,'center');text('Normal',420,131,22,C.blue,'center');
        text('Actual',73,202,19,C.muted);text('Spam',120,237,19,C.blue,'right');text('Normal',120,355,19,C.blue,'right');
        var nums=[3,1,2,14],labs=['TP','FN','FP','TN'];
        for(var i=0;i<4;i++){var x=180+(i%2)*160,y=175+Math.floor(i/2)*120;rect(x,y,145,106,(i===0||i===3)?C.greenFill:C.peachFill,(i===0||i===3)?C.greenLine:C.peachLine,15);text(String(nums[i]),x+72,y+16,34,C.ink,'center');text(labs[i],x+72,y+66,19,C.muted,'center');}
        rect(565,120,400,299,C.purpleFill,C.purpleLine,20);icon('target',624,174,0.75);
        text('Precision',765,150,25,C.purple,'center');text('3 / (3 + 2) = 0.60',765,195,22,C.purple,'center');
        icon('check',624,301,0.75);text('Recall',765,277,25,C.green,'center');text('3 / (3 + 1) = 0.75',765,322,22,C.green,'center');
    }
    function softmaxBars() {
        header('Softmax: scores to probabilities','chart');
        var xs=[35,380,725],labels=['Scores','Exponentials','Probabilities'];
        for(var i=0;i<3;i++){rect(xs[i],104,240,319,[C.blueFill,C.peachFill,C.greenFill][i],[C.blueLine,C.peachLine,C.greenLine][i],20);text(labels[i],xs[i]+120,126,24,C.ink,'center');
            var vals=i===0?[0,0,0.693]:(i===1?[1,1,2]:[0.25,0.25,0.5]);var captions=i===0?['0','0','ln 2']:(i===1?['1','1','2']:['0.25','0.25','0.50']);
            for(var j=0;j<3;j++){var h=i===0?vals[j]*130:vals[j]*(i===1?70:280);if(h>0)rect(xs[i]+35+j*61,337-h,39,h,[C.blue,C.purple,C.green][j],null,5);circle(xs[i]+54+j*61,337,3,C.muted,null);text(captions[j],xs[i]+54+j*61,354,18,C.ink,'center');}
        }
        bezier([275,250],[313,218],[342,218],[380,250],C.peach,3,true);text('exp',327,272,19,C.peach,'center');
        bezier([620,250],[658,218],[687,218],[725,250],C.green,3,true);text('/ sum',672,272,19,C.green,'center');
    }
    function kernelMapping() {
        header('Feature mapping: separating concentric groups','target');
        rect(35,99,415,327,C.blueFill,C.blueLine,20);rect(555,99,410,327,C.purpleFill,C.purpleLine,20);
        for(var i=0;i<16;i++){var a=i*Math.PI/8;circle(243+Math.cos(a)*109,265+Math.sin(a)*109,7,C.peach,C.white);}
        for(i=0;i<8;i++){a=i*Math.PI/4;circle(243+Math.cos(a)*35,265+Math.sin(a)*35,7,C.blue,C.white);}
        text('Original 2D space',242,113,22,C.blue,'center');
        bezier([450,256],[486,226],[519,226],[555,256],C.green,3,true);text('Map',503,285,20,C.green,'center');
        text('Radius squared',760,113,22,C.purple,'center');line(610,343,925,343,C.muted,2);
        line(770,185,770,354,C.green,2,true);text('Threshold',770,372,18,C.green,'center');
        for(i=0;i<8;i++){circle(634+i*10,258+(i%3)*22,7,C.blue,C.white);circle(822+i*10,258+(i%3)*22,7,C.peach,C.white);}
        text('x1 squared + x2 squared',760,161,18,C.muted,'center');
    }
    function emMixture() {
        header('Gaussian mixtures & EM','sliders');
        var xx=[35,380,725];var labels=['Initial model','Soft assignments','Updated model'];
        for(var k=0;k<3;k++){
            rect(xx[k],105,240,305,[C.blueFill,C.purpleFill,C.greenFill][k],[C.blueLine,C.purpleLine,C.greenLine][k],20);text(labels[k],xx[k]+120,123,21,C.ink,'center');
            var cx1=k<2?75:70,cx2=k<2?160:170;
            circle(xx[k]+cx1,263,52,null,C.blueLine,2);circle(xx[k]+cx2,267,55,null,C.peachLine,2);
            for(var i=0;i<18;i++){var a=i*2.4;var cx=i<9?68:171;circle(xx[k]+cx+Math.cos(a)*(15+i%4*8),267+Math.sin(a)*(20+i%5*6),5,k===0?C.muted:(i<9?C.blue:C.peach),C.white);}
            icon('target',xx[k]+cx1,263,0.27);icon('target',xx[k]+cx2,267,0.27);
        }
        bezier([275,252],[310,222],[345,222],[380,252],C.purple,3,true);text('E step',327,283,19,C.purple,'center');
        bezier([620,252],[655,222],[690,222],[725,252],C.green,3,true);text('M step',672,283,19,C.green,'center');
        text('P(A) = 0.6',500,355,18,C.blue,'center');text('P(B) = 0.4',500,381,18,C.peach,'center');
        circle(500,277,9,C.purple,C.white);
    }
    function hierarchyTree() {
        header('Hierarchical clustering','tree');
        var xx=[100,225,375,625,775,900];
        rect(35,96,930,334,C.blueFill,C.blueLine,20);
        for(var i=0;i<6;i++){icon(i<3?'flower':'flowerB',xx[i],369,0.75);text(String.fromCharCode(65+i),xx[i],398,17,C.muted,'center');}
        function merge(x1,y1,x2,y2,x,y,col){bezier([x1,y1],[x1,y],[x,y+25],[x,y],col,3,false);bezier([x2,y2],[x2,y],[x,y+25],[x,y],col,3,false);circle(x,y,5,col,null);}
        merge(100,340,225,340,162,284,C.blue);merge(162,284,375,340,270,226,C.blue);
        merge(775,340,900,340,838,284,C.purple);merge(625,340,838,284,730,226,C.purple);
        merge(270,226,730,226,500,143,C.green);
        line(65,195,935,195,C.coral,2,true);text('Cut: 2 clusters',756,157,21,C.coral,'center');
    }
    function convolutionPatch() {
        header('Convolution: local computation, shared weights','chart');
        rect(35,98,340,327,C.blueFill,C.blueLine,20);text('Input',205,115,24,C.blue,'center');
        for(var r=0;r<5;r++)for(var c=0;c<5;c++)rect(84+c*48,163+r*46,39,37,(r===c||r===c+1)?C.blue:C.blueLine,null,4);
        rect(126,201,146,139,null,C.coral,8);
        rect(425,146,160,238,C.peachFill,C.peachLine,18);text('Kernel',505,162,22,C.peach,'center');
        for(r=0;r<3;r++)for(c=0;c<3;c++)rect(450+c*37,217+r*37,30,30,[C.peachLine,C.coral,C.purpleLine][c],null,4);
        text('Multiply + sum',505,341,17,C.peach,'center');
        bezier([375,263],[393,245],[407,245],[425,263],C.peach,3,true);
        rect(645,98,320,327,C.greenFill,C.greenLine,20);text('Feature map',805,115,24,C.green,'center');
        for(r=0;r<3;r++)for(c=0;c<3;c++)rect(713+c*64,190+r*61,52,48,(r===1&&c===1)?C.coral:C.greenLine,null,6);
        bezier([585,263],[605,245],[625,245],[645,263],C.green,3,true);
    }
    function recurrentState() {
        header('RNN: a state passed through time','network');
        var xs=[180,500,820],words=['Today','is','sunny'];
        for(var i=0;i<3;i++){
            rect(xs[i]-120,126,240,130,C.purpleFill,C.purpleLine,20);icon('model',xs[i]-62,184,0.8);text('h'+(i+1),xs[i]+37,170,28,C.purple,'center');
            chip(xs[i]-85,338,170,words[i],C.blue,C.blueFill);
            bezier([xs[i],338],[xs[i]-18,309],[xs[i]-18,285],[xs[i],256],C.blue,3,true);
            if(i<2)bezier([xs[i]+120,184],[xs[i]+145,168],[xs[i]+175,168],[xs[i+1]-120,184],C.green,3,true);
        }
        text('Shared parameters at every time step',500,90,21,C.muted,'center');
    }
    function mcTdTargets() {
        header('Monte Carlo & temporal difference','grad');
        rect(35,107,930,133,C.blueFill,C.blueLine,20);rect(35,282,930,133,C.greenFill,C.greenLine,20);
        text('MC',86,150,28,C.blue,'center');text('TD',86,325,28,C.green,'center');
        for(var row=0;row<2;row++)for(var j=0;j<5;j++){
            var x=195+j*166,y=175+row*175;circle(x,y,21,j===4?C.peachLine:(row?C.greenLine:C.blueLine),C.white,2);
            if(j<4)bezier([x+23,y],[x+67,y-14],[x+99,y-14],[x+143,y],C.muted,2,true);
            text(j===4?'End':'s'+j,x,y-12,17,C.ink,'center');
        }
        bezier([859,151],[859,85],[195,85],[195,151],C.purple,3,true);text('Full observed return',530,77,19,C.purple,'center');
        bezier([361,326],[361,270],[195,270],[195,326],C.green,3,true);text('Reward + estimated V(s1)',592,302,19,C.green,'center');
    }
    function transferBranches() {
        header('Transfer learning','model');
        rect(35,170,250,190,C.blueFill,C.blueLine,20);icon('network',160,232,1.1);text('Pretrained model',160,304,23,C.blue,'center');
        var yy=[110,290];
        for(var i=0;i<2;i++){
            rect(400,yy[i],340,135,i?C.purpleFill:C.greenFill,i?C.purpleLine:C.greenLine,20);
            icon('model',457,yy[i]+60,0.9);icon('sliders',560,yy[i]+60,0.7);icon('flowerB',676,yy[i]+57,0.75);
            text(i?'Tune backbone + head':'Freeze backbone; train head',570,yy[i]+100,17,C.ink,'center');
            bezier([285,263],[337,263],[344,yy[i]+66],[400,yy[i]+66],i?C.purple:C.green,3,true);
            bezier([740,yy[i]+66],[763,yy[i]+47],[788,yy[i]+47],[811,yy[i]+66],C.peach,3,true);
            icon('check',884,yy[i]+66,1.0);
        }
        
    }
    function activeSampling() {
        header('Active learning','target');
        rect(35,101,340,326,C.blueFill,C.blueLine,20);text('Unlabelled pool',205,116,23,C.blue,'center');
        for(var r=0;r<3;r++)for(var c=0;c<4;c++)icon('flower',87+c*77,202+r*78,0.55);
        circle(241,280,29,null,C.coral,2);circle(164,358,29,null,C.coral,2);
        rect(450,140,195,241,C.peachFill,C.peachLine,20);icon('target',547,202,1.0);text('Select',547,271,24,C.peach,'center');text('Uncertain + diverse',547,323,16,C.peach,'center');
        rect(725,140,240,241,C.greenFill,C.greenLine,20);icon('check',845,202,1.0);text('Human labels',845,271,23,C.green,'center');
        bezier([375,260],[400,242],[425,242],[450,260],C.peach,3,true);bezier([645,260],[672,242],[698,242],[725,260],C.green,3,true);
        bezier([845,381],[845,452],[547,452],[547,381],C.purple,3,true);text('Retrain',687,419,19,C.purple,'center');
        
    }
    function bayesCounts() {
        header('Bayes: update after seeing evidence','data');
        rect(35,104,420,324,C.blueFill,C.blueLine,20);text('100 emails',245,123,24,C.blue,'center');
        for(var r=0;r<10;r++)for(var c=0;c<10;c++)rect(92+c*30,177+r*20,22,13,r<2?C.coral:C.blueLine,null,3);
        text('20 spam / 80 normal',245,391,20,C.ink,'center');
        bezier([455,264],[500,236],[526,236],[570,264],C.purple,3,true);text('"Prize"',511,298,20,C.purple,'center');
        rect(570,104,395,324,C.greenFill,C.greenLine,20);text('16 contain "prize"',767,123,23,C.green,'center');
        for(r=0;r<4;r++)for(c=0;c<4;c++)rect(645+c*62,193+r*36,47,24,r<3?C.coral:C.blueLine,null,5);
        text('12 / 16 = 75% spam',767,365,24,C.green,'center');
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
        var builders = [classifierGeometry, pcaProjection, hmmSequence, attentionMix, rlInteraction, causalFork, experimentProtocol, crossValidation, confusionMatrix, softmaxBars, kernelMapping, emMixture, hierarchyTree, convolutionPatch, recurrentState, mcTdTargets, transferBranches, activeSampling, bayesCounts];
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
