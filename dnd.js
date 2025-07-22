// This script enables drag-and-drop for lists and cards in the Trello clone.
// It is loaded via CDN in index.html and exposes a global window.TrelloDnD object.
(function() {
  function onDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.dndId);
    window.TrelloDnD.dragged = e.target;
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function onDrop(e, cb) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    cb(id, e);
  }
  window.TrelloDnD = { onDragStart, onDragOver, onDrop };
})();
