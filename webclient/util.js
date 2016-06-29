// Generated by CoffeeScript 1.10.0

/*
Copyright 2016 Clemens Nylandsted Klokmose, Aarhus University

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

root.util = {};

root.util.elementAtPath = function(snapshot, path) {
  if (path.length > 0 && typeof path[path.length - 1] === 'string') {
    return null;
  }
  if (path.length === 0) {
    return snapshot;
  } else {
    return util.elementAtPath(snapshot[path[0]], path.slice(1, +path.length + 1 || 9e9));
  }
};

root.util.getNs = function(elem) {
  var ns;
  if (elem == null) {
    return void 0;
  }
  if (elem.getAttribute == null) {
    return void 0;
  }
  ns = elem.getAttribute("xmlns");
  if (ns != null) {
    return ns;
  }
  if (elem.parent === elem) {
    return void 0;
  }
  return root.util.getNs(elem.parent);
};

root.util.patch_to_ot = function(path, patches) {
  var diff, insertionPoint, j, k, len, len1, ops, patch, ref;
  ops = [];
  for (j = 0, len = patches.length; j < len; j++) {
    patch = patches[j];
    insertionPoint = patch.start1;
    ref = patch.diffs;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      diff = ref[k];
      if (diff[0] === 0) {
        insertionPoint += diff[1].length;
      }
      if (diff[0] === 1) {
        ops.push({
          si: diff[1],
          p: path.concat([insertionPoint])
        });
        insertionPoint += diff[1].length;
      }
      if (diff[0] === -1) {
        ops.push({
          sd: diff[1],
          p: path.concat([insertionPoint])
        });
      }
    }
  }
  return ops;
};

root.util.generateUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r, v;
    r = Math.random() * 16 | 0;
    v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

root.util.extractDomain = function(url) {
  var domain;
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  return domain;
};

root.util.getJsonMLPathFromPathNode = function(node) {
  var childIndex, j, len, ref, sibling;
  if (node.parent == null) {
    return [];
  } else {
    childIndex = 2;
    ref = node.parent.children;
    for (j = 0, len = ref.length; j < len; j++) {
      sibling = ref[j];
      if (sibling.id === node.id) {
        break;
      }
      childIndex += 1;
    }
    return util.getJsonMLPathFromPathNode(node.parent).concat([childIndex]);
  }
};

root.util.createPathTree = function(DOMNode, parentPathNode, overwrite) {
  var child, j, len, pathNode, ref;
  if (overwrite == null) {
    overwrite = false;
  }
  pathNode = {
    id: util.generateUUID(),
    children: [],
    parent: parentPathNode,
    DOMNode: DOMNode
  };
  if (overwrite) {
    DOMNode.__pathNodes = [pathNode];
  } else {
    if (DOMNode.__pathNodes == null) {
      DOMNode.__pathNodes = [];
    }
    DOMNode.__pathNodes.push(pathNode);
  }
  ref = DOMNode.childNodes;
  for (j = 0, len = ref.length; j < len; j++) {
    child = ref[j];
    pathNode.children.push(util.createPathTree(child, pathNode, overwrite));
  }
  return pathNode;
};

root.util.getPathNode = function(elem, parentElem) {
  var elemPathNode, j, k, len, len1, parentPathNode, ref, ref1;
  if ((parentElem != null) && (parentElem.__pathNodes != null) && (elem.__pathNodes != null)) {
    ref = parentElem.__pathNodes;
    for (j = 0, len = ref.length; j < len; j++) {
      parentPathNode = ref[j];
      ref1 = elem.__pathNodes;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        elemPathNode = ref1[k];
        if (elemPathNode.parent.id === parentPathNode.id) {
          return elemPathNode;
        }
      }
    }
  }
  if ((elem.__pathNodes != null) && elem.__pathNodes.length > 0) {
    return elem.__pathNodes[elem.__pathNodes.length - 1];
  }
  return null;
};

root.util.removePathNode = function(pathNode) {
  var child, j, len, ref;
  pathNode.parent = null;
  pathNode.DOMNode.__pathNodes.splice(pathNode.DOMNode.__pathNodes.indexOf(pathNode), 1);
  ref = pathNode.children;
  for (j = 0, len = ref.length; j < len; j++) {
    child = ref[j];
    util.removePathNode(child);
  }
  pathNode.children = null;
  return pathNode.DOMNode = null;
};

root.util.check = function(domNode, pathNode) {
  var childNode, definedChildDomNode, definedChildNodesInDom, domNodePathNode, i, j, len, results;
  if (domNode instanceof jQuery) {
    domNode = domNode[0];
  }
  if (domNode.__pathNodes.length > 1) {
    console.log(domNode, domNode.__pathNodes);
    window.alert("Webstrates has encountered an error. Please reload the page.");
    throw "Node has multiple paths";
  }
  domNodePathNode = domNode.__pathNodes[0];
  if (domNodePathNode.id !== pathNode.id) {
    console.log(domNode, pathNode);
    window.alert("Webstrates has encountered an error. Please reload the page.");
    throw "No id match";
  }
  definedChildNodesInDom = (function() {
    var j, len, ref, ref1, results;
    ref = domNode.childNodes;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      childNode = ref[j];
      if (((ref1 = childNode.__pathNodes) != null ? ref1.length : void 0) > 0) {
        results.push(childNode);
      }
    }
    return results;
  })();
  if (definedChildNodesInDom.length !== pathNode.children.length) {
    console.log(domNode, pathNode);
    window.alert("Webstrates has encountered an error. Please reload the page.");
    throw "Different amount of children";
  }
  if (definedChildNodesInDom.length !== domNode.childNodes.length) {
    console.log("Warning: found zombie nodes in DOM");
  }
  results = [];
  for (i = j = 0, len = definedChildNodesInDom.length; j < len; i = ++j) {
    definedChildDomNode = definedChildNodesInDom[i];
    results.push(util.check(definedChildDomNode, pathNode.children[i]));
  }
  return results;
};

//# sourceMappingURL=util.js.map