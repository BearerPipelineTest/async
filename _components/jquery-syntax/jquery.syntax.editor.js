// This file is part of the "jQuery.Syntax" project, and is distributed under the MIT License.
Syntax.Editor=function(a,b){this.container=a;this.current=this.getLines()};Syntax.Editor.prototype.getLines=function(){for(var a=this.container.childNodes,b=[],c=[],d="",f=0,e=0;e<a.length;e+=1){var g=Syntax.innerText([a[e]]).split("\n");if(1<g.length){g[0]=d+g[0];d=g.pop();for(var h=0;h<g.length;h+=1)c.push(f-b.length),b.push(g[h]);f=e+1}else d+=g[0]}""!=d?(c.push(f-b.length),b.push(d)):--f;c.push(f);console.log("getLines",c,b,a);return{lines:b,offsets:c}};
Syntax.Editor.prototype.updateChangedLines=function(){for(var a={},b=this.getLines(),c=0,d=0;c<this.current.lines.length&&d<b.lines.length;)if(this.current.lines[c]==b.lines[d])c+=1,d+=1;else break;a.start=d;c=this.current.lines.length;for(d=b.lines.length;c>a.start&&d>a.start;)if(this.current.lines[c-1]==b.lines[d-1])--c,--d;else break;a.end=d;a.originalEnd=c;for(a.difference=b.lines.length-this.current.lines.length;0<a.start&&b.offsets[a.start]!=b.offsets[a.start-1];)--a.start;if(0<a.difference)for(;a.end<
b.lines.length-1&&b.offsets[a.end-1]!=b.offsets[a.end];)a.end+=1,a.originalEnd+=1;this.current=b;return this.changed=a};Syntax.Editor.prototype.textForLines=function(a,b){return this.current.lines.slice(a,b).join("\n")+"\n"};
Syntax.Editor.prototype.updateLines=function(a,b){if(a.start!=a.end){var c=a.start;a=a.end;c+=this.current.offsets[c];a+=this.current.offsets[a];c=Array.prototype.slice.call(this.container.childNodes,c,a);$(c).replaceWith(b)}else 0==a.start?$(this.container).prepend(b):(c=a.start,c+=this.current.offsets[c],$(this.container.childNodes[c]).after(b))};
Syntax.Editor.getCharacterOffset=function(a){var b=0;if("undefined"!=typeof window.getSelection){b=window.getSelection().getRangeAt(0);var c=b.cloneRange();c.selectNodeContents(a);c.setEnd(b.endContainer,b.endOffset);b=c.toString().length}else"undefined"!=typeof document.selection&&"Control"!=document.selection.type&&(b=document.selection.createRange(),c=document.body.createTextRange(),c.moveToElementText(a),c.setEndPoint("EndToEnd",b),b=c.text.length);return b};
Syntax.Editor.getNodesForCharacterOffsets=function(a,b){b=document.createTreeWalker(b,NodeFilter.SHOW_TEXT,function(a){return NodeFilter.FILTER_ACCEPT},!1);for(var c=[],d=0,f=0;f<a.length&&b.nextNode();){for(var e=d+b.currentNode.length;f<a.length&&a[f]<e;)c.push([b.currentNode,d,e]),f+=1;d=e}return c};
Syntax.Editor.prototype.getClientState=function(){var a={},b=window.getSelection();0<b.rangeCount&&(a.range=b.getRangeAt(0));a.range&&(a.startOffset=Syntax.Editor.getCharacterOffset(this.container));return a};
Syntax.Editor.prototype.setClientState=function(a){if(a.startOffset){var b=Syntax.Editor.getNodesForCharacterOffsets([a.startOffset],this.container),c=document.createRange();c.setStart(b[0][0],a.startOffset-b[0][1]);c.setEnd(b[0][0],a.startOffset-b[0][1]);a=window.getSelection();a.removeAllRanges();a.addRange(c)}};
Syntax.layouts.editor=function(a,b){var c=jQuery('<div class="editor syntax highlighted" contentEditable="true">');c.append(b.children());var d=new Syntax.Editor(c.get(0)),f=function(b){var c=d.getClientState(),e=d.updateChangedLines();0>e.difference&&0<e.start&&--e.start;b=d.textForLines(e.start,e.end);e.start==e.end?d.updateLines(e,[]):Syntax.highlightText(b,a,function(a){d.updateLines(e,a.children().get());d.setClientState(c)})};c.bind("keyup",function(){f()});c.bind("paste",function(a){f()});
c.bind("keydown",function(a){9==a.keyCode?(a.preventDefault(),document.execCommand("insertHTML",!1,"    ")):13==a.keyCode&&(a.preventDefault(),document.execCommand("insertHTML",!1,"\n"))});return jQuery('<div class="syntax-container">').append(c)};