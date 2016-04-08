// Generated by CoffeeScript 1.10.0

/*
Copyright 2014 Clemens Nylandsted Klokmose, Aarhus University

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
var root;

root = typeof exports !== "undefined" && exports !== null ? exports : window;

root.DOM2Share = (function() {
  function DOM2Share(doc, targetDOMElement, callback) {
    var body;
    this.doc = doc;
    this.targetDOMElement = targetDOMElement;
    if (callback == null) {
      callback = function() {};
    }
    if (!this.doc.type) {
      console.log("Creating new doc", this.doc.name);
      this.doc.create('json0');
    }
    if (this.doc.type.name !== 'json0') {
      console.log("WRONG TYPE");
      return;
    }
    if (this.targetDOMElement.parentNode != null) {
      if (!this.doc.getSnapshot()) {
        body = [
          "div", {
            id: "doc_" + this.doc.name,
            "class": "document"
          }
        ];
        this.doc.submitOp([
          {
            "p": [],
            "oi": body
          }
        ]);
      }
    } else {
      if (!this.doc.getSnapshot()) {
        body = ["html", {}, ['body', {}]];
        this.doc.submitOp([
          {
            "p": [],
            "oi": body
          }
        ]);
      }
    }
    this.loadDocIntoDOM();
    callback(this.doc, this.rootDiv);
  }

  DOM2Share.prototype.loadDocIntoDOM = function() {
    this.targetDOMElement.appendChild($.jqml(this.doc.getSnapshot())[0]);
    this.rootDiv = $(this.targetDOMElement).children()[0];
    this.pathTree = util.createPathTree(this.rootDiv, null, true);
    this.dmp = new diff_match_patch();
    this.context = this.doc.createContext();
    this.context._onOp = (function(_this) {
      return function(ops) {
        var i, len, op;
        _this.observer.disconnect();
        for (i = 0, len = ops.length; i < len; i++) {
          op = ops[i];
          ot2dom.applyOp(op, _this.rootDiv);
        }
        util.check(_this.rootDiv, _this.pathTree);
        return _this.observer.observe(_this.rootDiv, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
          attributeOldValue: true,
          characterDataOldValue: true
        });
      };
    })(this);
    this.observer = new MutationObserver((function(_this) {
      return function(mutations) {
        return _this.handleMutations(mutations);
      };
    })(this));
    return this.observer.observe(this.rootDiv, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeOldValue: true,
      characterDataOldValue: true
    });
  };

  DOM2Share.prototype.disconnect = function() {
    this.observer.disconnect();
    return this.context.destroy();
  };

  DOM2Share.prototype.handleMutations = function(mutations) {
    var added, addedPathNode, changedPath, childIndex, element, error, error1, error2, error3, error4, i, insertPath, isComment, j, k, len, len1, len2, mutation, newPathNode, newText, oldText, op, p, path, prevSiblingIndex, previousSibling, ref, ref1, removed, removedPathNode, siblingPathNode, targetPathNode, value;
    if (this.doc == null) {
      return;
    }
    for (i = 0, len = mutations.length; i < len; i++) {
      mutation = mutations[i];
      targetPathNode = util.getPathNode(mutation.target);
      if (targetPathNode == null) {
        continue;
      }
      if (mutation.type === "attributes") {
        path = util.getJsonMLPathFromPathNode(targetPathNode);
        path.push(1);
        path.push(mutation.attributeName);
        value = $(mutation.target).attr(mutation.attributeName);
        if (value == null) {
          value = "";
        }
        op = {
          p: path,
          oi: value
        };
        try {
          this.context.submitOp(op);
        } catch (error1) {
          error = error1;
          window.alert("Webstrates has encountered an error. Please reload the page.");
          throw error;
        }
      } else if (mutation.type === "characterData") {
        isComment = mutation.target.nodeType === 8;
        changedPath = util.getJsonMLPathFromPathNode(targetPathNode);
        oldText = mutation.oldValue;
        newText = mutation.target.data;
        if (!isComment && util.elementAtPath(this.context.getSnapshot(), changedPath) !== oldText) {
          continue;
        }
        op = util.patch_to_ot(changedPath, this.dmp.patch_make(oldText, newText));
        if (isComment) {
          p = op[0].p;
          op[0].p = p.slice(0, p.length - 1).concat([1]).concat([p[p.length - 1]]);
        }
        try {
          this.context.submitOp(op);
        } catch (error2) {
          error = error2;
          window.alert("Webstrates has encountered an error. Please reload the page.");
          throw error;
        }
      } else if (mutation.type === "childList") {
        previousSibling = mutation.previousSibling;
        ref = mutation.addedNodes;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          added = ref[j];
          if ((added.__pathNodes != null) && added.__pathNodes.length > 0) {
            addedPathNode = util.getPathNode(added, mutation.target);
            if (targetPathNode.id === addedPathNode.parent.id) {
              continue;
            }
          }
          newPathNode = util.createPathTree(added, targetPathNode);
          if (previousSibling != null) {
            siblingPathNode = util.getPathNode(previousSibling, mutation.target);
            prevSiblingIndex = targetPathNode.children.indexOf(siblingPathNode);
            targetPathNode.children = (targetPathNode.children.slice(0, +prevSiblingIndex + 1 || 9e9).concat([newPathNode])).concat(targetPathNode.children.slice(prevSiblingIndex + 1, targetPathNode.children.length));
            previousSibling = added;
          } else if (mutation.nextSibling != null) {
            targetPathNode.children = [newPathNode].concat(targetPathNode.children);
          } else {
            targetPathNode.children.push(newPathNode);
          }
          insertPath = util.getJsonMLPathFromPathNode(util.getPathNode(added, mutation.target));
          op = {
            p: insertPath,
            li: JsonML.fromHTML(added)
          };
          try {
            this.context.submitOp(op);
          } catch (error3) {
            error = error3;
            window.alert("Webstrates has encountered an error. Please reload the page.");
            throw error;
          }
        }
        ref1 = mutation.removedNodes;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          removed = ref1[k];
          removedPathNode = util.getPathNode(removed, mutation.target);
          if (removedPathNode == null) {
            continue;
          }
          path = util.getJsonMLPathFromPathNode(removedPathNode);
          element = util.elementAtPath(this.context.getSnapshot(), path);
          op = {
            p: path,
            ld: element
          };
          try {
            this.context.submitOp(op);
          } catch (error4) {
            error = error4;
            window.alert("Webstrates has encountered an error. Please reload the page.");
            throw error;
          }
          childIndex = removedPathNode.parent.children.indexOf(removedPathNode);
          removedPathNode.parent.children.splice(childIndex, 1);
          root.util.removePathNode(removedPathNode);
        }
      }
    }
    return util.check(this.rootDiv, this.pathTree);
  };

  return DOM2Share;

})();

//# sourceMappingURL=dom2share.js.map
