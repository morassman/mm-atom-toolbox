'use babel';

import { CompositeDisposable } from 'atom';
import { TreeViewTools } from './tree-view/tree-view-tools';
import { TypeScriptTools } from './type-script/type-script-tools';

export default {

  treeViewTools: TreeViewTools,
  typeScriptTools: TypeScriptTools,

  activate(state) {
    this.treeViewTools = new TreeViewTools();
    this.typeScriptTools = new TypeScriptTools();

    this.treeViewTools.activate();
    this.typeScriptTools.activate();
  },

  deactivate() {
    this.treeViewTools.deactivate();
    this.typeScriptTools.deactivate();
  },

};
