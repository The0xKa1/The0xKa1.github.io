#target illustrator
/* Native Illustrator source for the machine-learning guide.
 * Run with Illustrator's File > Scripts, or do javascript file.
 * Each figure is a named layer on a separate 1000 x 480 pt artboard.
 * Marks, connectors and labels are editable; portraits are embedded images.
 */
(function () {
    var ROOT = "/Users/zhangjinkai/workspace/The0xKa1.github.io";
    var SOURCE = ROOT + "/assets/ml-guide/learning-project-scenes.ai";
    var OUT = ROOT + "/apps/web/public/images/ml-guide";
    var LOG = ROOT + "/assets/ml-guide/illustrator-project-export-log.txt";
    var W = 1000, H = 480, GAP = 130;
    var doc, layer, left = 0, top = H, logLines = [], oldUI = app.userInteractionLevel;
    var names = ["project-study", "project-specimens", "project-prediction", "project-clusters", "project-digits", "project-gridworld"];
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
    function person(cx,cy,z) {
        var portrait = layer.placedItems.add();
        portrait.file = new File(ROOT + "/assets/ml-guide/source-images/kunkun.jpg");
        portrait.width = 140*z; portrait.height = 140*z;
        portrait.position = pt(cx-70*z,cy-70*z);
        portrait.embed();
        text('KunKun',cx,cy+80*z,22,C.ink,'center');
    }
    function projectScene(titleText,caption){header(titleText,'data');rect(30,103,185,324,C.blueFill,C.blueLine,22);person(118,229,1);text(caption,122,378,16,C.blue,'center');}
    function projectConnect(x,y){bezier([x,y],[x+20,y-18],[x+41,y-18],[x+60,y],C.green,3,true);}
    function studyProject(){
        projectScene('Where did my lab time go?','Lab schedule');
        rect(266,110,285,309,C.peachFill,C.peachLine,20);icon('table',410,169,1.0);
        var labels=['Prep','Lab','Report'];for(var i=0;i<3;i++){rect(291,230+i*51,236,37,C.white,null,7);text(labels[i],307,238+i*51,18,C.ink);text(['45 min','30 min','20 min'][i],510,238+i*51,18,C.peach,'right');}
        projectConnect(209,265);projectConnect(551,265);
        rect(611,110,359,309,C.greenFill,C.greenLine,20);text('Minutes by task',790,128,23,C.green,'center');
        for(i=0;i<3;i++){var h=[145,97,65][i];rect(660+i*92,347-h,51,h,[C.blue,C.purple,C.peach][i],null,6);text(labels[i],686+i*92,366,17,C.ink,'center');}
        
    }
    function bottle(cx,cy,z,color) {
        rect(cx-10*z,cy-47*z,20*z,23*z,C.greenLine,C.green,4*z);
        rect(cx-23*z,cy-27*z,46*z,74*z,C.greenFill,C.green,10*z);
        rect(cx-17*z,cy-3*z,34*z,29*z,color||C.purpleLine,null,4*z);
        line(cx-13*z,cy-17*z,cx-13*z,cy-7*z,C.white,3*z);
    }
    function specimenProject(){
        projectScene('Identify wine from its composition','Food analysis');
        rect(266,110,275,308,C.greenFill,C.greenLine,20);bottle(350,216,1.1,C.purpleLine);icon('table',465,211,0.8);
        text('13 measurements',403,310,22,C.green,'center');text('Alcohol, acids, phenols',403,359,17,C.muted,'center');
        projectConnect(209,265);projectConnect(541,265);
        rect(601,110,369,308,C.purpleFill,C.purpleLine,20);icon('model',666,181,0.9);text('Classify',812,167,25,C.purple,'center');
        for(var i=0;i<3;i++){bottle(665+i*117,285,0.6,[C.blueLine,C.purpleLine,C.peachLine][i]);text(['A','B','C'][i],665+i*117,344,20,C.ink,'center');}circle(782,285,39,null,C.green,2.5);
    }
    function predictionProject(){
        projectScene('Predict the alcohol measurement','Wine analysis');
        rect(267,110,285,309,C.blueFill,C.blueLine,20);text('Measured vs predicted',409,133,20,C.blue,'center');
        line(298,353,528,353,C.muted,1.5);line(298,353,298,181,C.muted,1.5);
        for(var i=0;i<6;i++){var x=326+i*36,y=328-i*22;circle(x,y,6,C.blue,C.white);line(x,y,x,y+[13,-19,8,24,-13,9][i],C.coral,2);circle(x,y+[13,-19,8,24,-13,9][i],5,C.white,C.green,2);}
        projectConnect(209,265);projectConnect(552,265);
        rect(612,110,358,309,C.peachFill,C.peachLine,20);text('Compare on the same test set',791,139,19,C.peach,'center');icon('chart',684,216,0.8);
        text('Mean baseline',750,208,20,C.ink);text('Ridge model',750,292,20,C.ink);icon('sliders',684,304,0.8);
        text('Error + residual pattern',791,373,19,C.peach,'center');
    }
    function clusteringProject(){
        projectScene('Do similar wines group together?','Hidden labels');
        rect(266,110,285,309,C.greenFill,C.greenLine,20);text('Measurements only',408,130,22,C.green,'center');
        for(var i=0;i<9;i++)bottle(327+(i%3)*82,210+Math.floor(i/3)*65,0.48,[C.blueLine,C.purpleLine,C.peachLine][i%3]);
        projectConnect(209,265);projectConnect(551,265);
        rect(611,110,359,309,C.purpleFill,C.purpleLine,20);text('Cluster, then reveal labels',790,130,21,C.purple,'center');
        for(i=0;i<24;i++){var k=i%3,a=i*2.4;circle([681,783,879][k]+Math.cos(a)*29,[240,318,235][k]+Math.sin(a)*32,5,[C.blue,C.purple,C.peach][k],C.white);}
        text('2D view of 13D data',790,378,19,C.muted,'center');
    }
    function digitProject(){
        projectScene('Read handwritten sample numbers','Sample records');
        rect(267,110,285,309,C.blueFill,C.blueLine,20);text('8 x 8 image',409,131,23,C.blue,'center');
        var rows=['00111100','01100110','00000110','00001100','00011000','00110000','01111110','00000000'];
        for(var r=0;r<8;r++)for(var c=0;c<8;c++)rect(309+c*26,187+r*26,22,22,rows[r].charAt(c)==='1'?C.blue:C.blueLine,null,3);
        projectConnect(209,265);projectConnect(552,265);
        rect(612,110,358,309,C.greenFill,C.greenLine,20);icon('network',686,206,1.0);text('64 -> 32 -> 10',812,196,24,C.green,'center');
        rect(720,276,141,82,C.white,C.greenLine,16);text('2',790,284,48,C.green,'center');text('Predicted digit',790,376,19,C.green,'center');
    }
    function gridProject(){
        projectScene('Deliver samples to the lab bench','Sample delivery');
        rect(265,100,440,327,C.greenFill,C.greenLine,20);var ox=339,oy=119,sz=72;
        for(var r=0;r<4;r++)for(var c=0;c<4;c++){var wall=(r===1&&(c===1||c===2))||(r===3&&c===1);rect(ox+c*sz,oy+r*sz,64,64,wall?C.ink:C.white,wall?C.ink:C.greenLine,8);}
        var points=[[ox+32,oy+32],[ox+104,oy+32],[ox+176,oy+32],[ox+248,oy+32],[ox+248,oy+104],[ox+248,oy+176],[ox+248,oy+248]];
        smooth(points,C.coral,4);arrowHead(points[6][0],points[6][1],0,1,C.coral,11);
        icon('model',ox+32,oy+32,0.5);icon('check',ox+248,oy+248,0.6);projectConnect(207,265);
        rect(751,100,219,327,C.peachFill,C.peachLine,20);icon('target',860,162,0.9);text('6 moves',860,233,27,C.peach,'center');text('5 x (-1) + 10',860,287,20,C.ink,'center');text('Reward = 5',860,337,23,C.peach,'center');
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
        var builders = [studyProject, specimenProject, predictionProject, clusteringProject, digitProject, gridProject];
        for (var i = 0; i < builders.length; i++) { newBoard(i); builders[i](); log("DRAW " + names[i]); }
        if (doc.rasterItems.length !== 6 || doc.placedItems.length !== 0) throw new Error("Expected six embedded portraits");
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
