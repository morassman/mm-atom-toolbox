'use babel';

import { CompositeDisposable } from 'atom';

export class TreeViewTools {

  subscriptions: null;

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'mm-atom-toolbox:collapse-tree-view': () => this.collapseTreeView()
    }));
  }

  deactivate() {
    this.subscriptions.dispose();
  }

  collapseTreeView() {
    const tvp = atom.packages.getActivePackage('tree-view');

    if (!tvp) {
      return;
    }

    const tv = tvp.mainModule.treeView;
    const expandedNodes = tv.roots.reduce((acc, rootNode) =>
      acc.concat(...rootNode.getElementsByClassName('expanded')), []
    );

    expandedNodes.reverse().forEach(node => node.collapse());
  }

}
