'use babel';
import SelectListView from 'atom-select-list'

export default class RequireView {

  constructor(serializedState, jsFiles, handleSelect, handleEsc) {
    // Create root element
    this.element = new SelectListView({
      items: jsFiles,
      elementForItem: (item) => {
        const li = document.createElement('li')
        li.textContent = item
        return li
      },
      didConfirmSelection: (item) => {
        handleSelect(item);
      }
    })
    this.element.element.querySelector('.editor').addEventListener('keydown', (evt) => {
      var isEscape = false;
      if ("key" in evt) {
          isEscape = (evt.key == "Escape" || evt.key == "Esc");
      } else {
          isEscape = (evt.keyCode == 27);
      }
      if (isEscape) {
          handleEsc();
      };
    })
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement(keyWord) {
    return this.element;
  }
}
