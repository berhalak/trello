import { List } from './components.js';

const { useState } = React;

// Board component
export function Board({ board, onAddList, onEditList, onDeleteList, onAddCard, onEditCard, onDeleteCard, onCardDrop }) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  function handleAddList() {
    if (newListTitle.trim()) {
      onAddList(newListTitle.trim());
      setNewListTitle("");
      setIsAddingList(false);
    }
  }

  return React.createElement('div', {
    className: "h-full"
  },
    // Lists container
    React.createElement('div', {
      className: "flex overflow-x-auto pb-4 h-[calc(100vh-120px)]",
      onDragOver: e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      },
      onDrop: e => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        // This is for list reordering, not implemented yet
      }
    },
      // Lists
      board.lists.map((list, idx) =>
        React.createElement(List, {
          key: list.id,
          list,
          onAddCard: title => onAddCard(idx, title),
          onEditCard: cardIdx => onEditCard(idx, cardIdx),
          onDeleteCard: cardIdx => onDeleteCard(idx, cardIdx),
          onEditList: () => onEditList(idx),
          onDeleteList: () => onDeleteList(idx),
          onCardDrop: onCardDrop
        })
      ),
      // Add list form
      isAddingList ? React.createElement('div', {
        className: "bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0"
      },
        React.createElement('form', {
          onSubmit: e => { e.preventDefault(); handleAddList(); }
        },
          React.createElement('input', {
            className: "w-full p-2 border rounded-lg",
            placeholder: "Enter list title...",
            value: newListTitle,
            onChange: e => setNewListTitle(e.target.value),
            autoFocus: true
          }),
          React.createElement('div', {
            className: "flex gap-2 mt-2"
          },
            React.createElement('button', {
              className: "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600",
              type: "submit"
            }, "Add list"),
            React.createElement('button', {
              className: "px-3 py-1 text-gray-600 hover:text-gray-800",
              type: "button",
              onClick: () => {
                setIsAddingList(false);
                setNewListTitle("");
              }
            }, "✕")
          )
        )
      ) : React.createElement('button', {
        className: "bg-gray-200 hover:bg-gray-300 rounded-lg p-3 w-80 flex-shrink-0 text-gray-700 transition-colors",
        onClick: () => setIsAddingList(true)
      }, "+ Add another list")
    )
  );
}
