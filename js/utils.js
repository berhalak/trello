// Storage utilities
export function loadBoards() {
  try {
    return JSON.parse(localStorage.getItem('trello_boards')) || [];
  } catch {
    return [];
  }
}

export function saveBoards(boards) {
  localStorage.setItem('trello_boards', JSON.stringify(boards));
}

// Constants
export const LABEL_COLORS = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-gray-500'
];

// Drag and drop utilities
export const DragAndDrop = {
  onDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.dndId);
    window.draggedElement = e.target;
  },
  
  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  },
  
  onDrop(e, callback) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    callback(id, e);
  }
};

// ID generator
export function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}
