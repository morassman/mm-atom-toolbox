'use babel';

import path from 'path';
import SelectListView from 'atom-select-list';
import { CompositeDisposable, File } from 'atom';

export default {

  subscriptions: null,
  selectListView: null,
  previouslyFocusedElement: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'mm-atom-toolbox:insert-relative-path': () => this.insertRelativePath()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'mm-atom-toolbox:collapse-tree-view': () => this.collapseTreeView()
    }));
  },

  deactivate() {
    this.destroy();
    this.subscriptions.dispose();
  },

  serialize() {
  },

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
  },

  insertRelativePath() {
    const editor = atom.workspace.getActiveTextEditor();

    if (!editor) {
      return;
    }

    let word = editor.getSelectedText();

    if (word.length == 0) {
      word = editor.getWordUnderCursor();
    }

    if (word.length == 0) {
      atom.notifications.addWarning('Nothing selected to find a path for.');
      return;
    }

    const editorFile = new File(editor.getPath());
    const editorDir = editorFile.getParent();
    const fromPath = editorDir.getRealPathSync();

    const paths = [];
    let rx;

    try {
      rx = new RegExp('(class|interface)(\\s*)(' + word + ')', ['i']);
    } catch (e) {
      console.log(e);
      return;
    }

    atom.workspace.scan(rx, {}, (a) => {
      paths.push(a.filePath);
    }).then(() => {
      const relPaths = paths.map(p => path.relative(fromPath, p));

      if (relPaths.length == 0) {
        atom.notifications.addWarning('No paths found for \"' + word + "\".");
      } else if (relPaths.length == 1) {
        this.pathSelected(relPaths[0]);
      } else {
        this.choosePathToInsert(relPaths);
      }
    });
  },

  pathSelected(path) {
    atom.clipboard.write(path);
    atom.notifications.addInfo('Copied \"' + path + '\" to clipboard.');
  },

  choosePathToInsert(paths) {
    if (this.selectListView == null) {
      this.createSelectListView();
    }

    this.selectListView.update({items: paths});
    this.attach();
  },

  createSelectListView() {
    this.selectListView = new SelectListView({
      items: [],
      filterKeyForItem: (item) => item,
      elementForItem: (item) => {
        let element = document.createElement('li');
        element.innerHTML = item;
        return element;
      },
      didConfirmSelection: (item) => {
        this.cancel();
        this.pathSelected(item);
      },
      didCancelSelection: () => this.cancel()
    });
  },

  attach() {
    this.previouslyFocusedElement = document.activeElement;

    if (this.panel == null) {
      this.panel = atom.workspace.addModalPanel({item: this.selectListView});
    }

    this.selectListView.focus();
    this.selectListView.reset();
  },

  destroy() {
    this.cancel();

    if (this.selectListView != null) {
      this.selectListView.destroy();
    }
  },

  cancel() {
    if (this.panel != null) {
      this.panel.destroy();
    }

    this.panel = null;

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

};
