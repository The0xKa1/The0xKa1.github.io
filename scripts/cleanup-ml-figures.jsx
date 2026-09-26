#target illustrator
(function () {
 var ROOT = "/Users/zhangjinkai/workspace/The0xKa1.github.io";
 var obsolete = ["Use training statistics for all three splits.", "Illustrative data", "Step sizes and loss curve are schematic.", "Illustrative fits. Compare training and validation errors.", "Illustrative thresholds, not a fitted Iris classifier.", "Schematic geometry; feature scale changes distances.", "Keep high-variance directions; some information is lost.", "Transitions connect states; emissions connect states to observations.", "Illustrative weights for one query; training determines the actual weights.", "A policy chooses actions to improve expected future return.", "Predictive association alone does not identify a causal effect.", "Fit preprocessing inside each fold; select settings before final testing.", "Each row trains a fresh model; preprocessing is fitted within that fold.", "Illustrative counts: 20 emails, including 4 spam messages.", "All probabilities are positive and sum to 1.", "A new feature makes these groups separable; kernels compute mapped similarities.", "E: estimate membership weights. M: refit using those weights. Repeat.", "Merge height represents dissimilarity; cutting lower gives finer groups.", "5 x 5 input, 3 x 3 kernel, stride 1, no padding: 3 x 3 output.", "Each new state combines the current input with the previous state.", "MC waits for the episode; one-step TD uses the next-state value estimate.", "Adapt using target-task training data; choose settings on validation data.", "Compare selection strategies using the same annotation budget.", "Illustrative counts: conditioning changes the denominator.", "Group records, sum durations, inspect the time allocation. Values are illustrative.", "Train on labelled examples; compare predictions with held-out labels.", "Public teaching data; the exercise evaluates a model, not a treatment decision.", "Cluster IDs can be permuted; compare group membership rather than ID numbers.", "Bundled digit images test classification; real cards also require image preprocessing.", "Illustrative shortest route on the actual project map; Q-learning learns by interaction."];
 var sources = ['learning-diagrams.ai', 'learning-diagrams-expanded.ai', 'learning-project-scenes.ai'];
 var oldUI = app.userInteractionLevel, logs = [], doc;
 var stamp = new Date().getTime();
 function log(s) { logs.push(s); var f=new File(ROOT+'/assets/ml-guide/illustrator-cleanup-log.txt'); f.open('w'); f.write(logs.join('\n')); f.close(); }
 try {
  app.userInteractionLevel=UserInteractionLevel.DONTDISPLAYALERTS;
  for(var f=0;f<sources.length;f++) {
   var source=new File(ROOT+'/assets/ml-guide/'+sources[f]);
   var backup=new File(ROOT+'/assets/ml-guide/'+sources[f]+'.'+stamp+'.bak');
   if(!source.copy(backup)) throw new Error('Backup failed: '+source.fsName);
   doc=app.open(source);
   var removed=0;
   for(var t=doc.textFrames.length-1;t>=0;t--) {
    for(var n=0;n<obsolete.length;n++) if(doc.textFrames[t].contents===obsolete[n]) {doc.textFrames[t].remove();removed++;break;}
   }
   if(f===2 && doc.rasterItems.length===0) {
    for(var a=0;a<doc.artboards.length;a++) {
     var board=doc.artboards[a], bounds=board.artboardRect;
     var layer=doc.layers.getByName(board.name), oldPaths=[];
     for(var p=0;p<layer.pathItems.length;p++) {
      var item=layer.pathItems[p], b=item.geometricBounds;
      var x1=b[0]-bounds[0], y1=bounds[1]-b[1], x2=b[2]-bounds[0], y2=bounds[1]-b[3];
      if(x1>=55 && x2<=185 && y1>=170 && y2<=290) oldPaths.push(item);
     }
     if(oldPaths.length!==8) throw new Error('Expected 8 avatar paths on '+board.name+', got '+oldPaths.length);
     for(p=oldPaths.length-1;p>=0;p--)oldPaths[p].remove();
     var portrait=layer.placedItems.add();portrait.file=new File(ROOT+'/assets/ml-guide/source-images/kunkun.jpg');
     portrait.width=140;portrait.height=140;portrait.position=[bounds[0]+48,bounds[1]-159];portrait.embed();
     for(t=0;t<layer.textFrames.length;t++)if(layer.textFrames[t].contents==='KunKun')layer.textFrames[t].top=bounds[1]-309;
    }
   }
   doc.save();
   var exp=new ExportOptionsPNG24();exp.antiAliasing=true;exp.artBoardClipping=true;exp.transparency=false;exp.horizontalScale=200;exp.verticalScale=200;
   var white=new RGBColor();white.red=255;white.green=255;white.blue=255;exp.matte=true;exp.matteColor=white;
   for(a=0;a<doc.artboards.length;a++) {doc.artboards.setActiveArtboardIndex(a);doc.exportFile(new File(ROOT+'/apps/web/public/images/ml-guide/'+doc.artboards[a].name),ExportType.PNG24,exp);}
   log(sources[f]+': removed '+removed+' footer(s); exported '+doc.artboards.length+' PNGs; embedded images '+doc.rasterItems.length);
   doc.close(SaveOptions.DONOTSAVECHANGES);
   doc=app.open(source);
   log('REOPEN '+sources[f]+': '+doc.artboards.length+' boards, '+doc.rasterItems.length+' embedded images');
   doc.close(SaveOptions.DONOTSAVECHANGES);
  }
  log('COMPLETE');
 } catch(e) {log('ERROR '+e.message+' line '+e.line);throw e;}
 finally {app.userInteractionLevel=oldUI;}
}());
