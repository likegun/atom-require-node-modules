'use babel';
import path from 'path';
import RequireView from './require-view';
import { CompositeDisposable } from 'atom';
import { readdir } from './filesystem.js';

export default {

  requireView: null,
  modalPanel: null,
  subscriptions: null,
  jsFiles: [],

  activate(state) {
    const projectPaths = atom.project.getPaths();
    for(let projectPath of projectPaths) {
      const files = readdir(projectPath, {
        filter: (file) =>  {
          return file.endsWith('.js') || path.dirname(file).endsWith('node_modules')
        }
      });
      this.jsFiles = [...this.jsFiles, ...files];
    }

    this.requireView = new RequireView(state.requireViewState, this.jsFiles, (item) => {
      this.insert(item);
    }, () => this.toggle());

    this.selectListView = this.requireView.getElement(this.jsFiles);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.selectListView,
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'require:toggle': () => this.toggle()
    }));

    // Register command that toggles this view
  },

  deactivate() {
    if(this.modalPanel) {
      this.modalPanel.destroy();
    }

    this.subscriptions.dispose();
    this.requireView.destroy();
  },

  serialize() {
    return {
      requireViewState: this.requireView.serialize()
    };
  },

  toggle() {
    const visible = this.modalPanel.isVisible();
    visible? this.modalPanel.hide() : this.modalPanel.show();

    if(!visible)
      this.selectListView.element.querySelector('.editor').focus();
    else {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        editor.element.focus();
      }
    }
  },

  insert(item) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      // 得到require路径
      let requirePath;
      if(path.dirname(item).endsWith('node_modules')) {
        requirePath = path.basename(item);
      }
      else {
        requirePath = path.relative(path.dirname(editor.buffer.file.path), item);
        requirePath = requirePath.startsWith('..')? requirePath : `./${requirePath}`;
        requirePath = requirePath.replace(/\\/g, '/');
      }

      //获得module名字
      let moduleName;
      if(item.endsWith('index.js')) {
        moduleName = path.basename(path.dirname(item));
      }
      else {
        moduleName = path.basename(item);
      }
      moduleName = moduleName.endsWith('.js')? moduleName.slice(0, moduleName.length -3) : moduleName;
      moduleName = moduleName.split('-').length === 1 ?
      moduleName :
      moduleName.split('-').reduce((ret, part) => {
        part = [part[0].toUpperCase(), ...part.slice(1)].join('');
        ret += part;
        return ret;
      }, '');
      const requireStr = `const ${moduleName} = require('${requirePath}');`;
      editor.insertText(requireStr);
      editor.element.focus();
    }

    this.modalPanel.isVisible() ?
    this.modalPanel.hide() :
    this.modalPanel.show()
  }
};
