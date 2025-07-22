import { DragAndDrop } from './utils.js';

const { useState } = React;

// Card component
export function Card({ card, onEdit, onDelete, onOpenModal, listIdx, cardIdx }) {
  const isOverdue = card.due && new Date(card.due) < new Date() && !card.checklist?.every(c => c.done);
  
  function handleClick(e) {
    // Don't open modal if dragging or clicking action buttons
    if (e.defaultPrevented) return;
    onOpenModal();
  }
  
  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.setData('application/json', JSON.stringify({
      cardId: card.id,
      listIdx: listIdx,
      cardIdx: cardIdx
    }));
  }
  
  return React.createElement('div', {
    className: `bg-white rounded-lg shadow-sm p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow group ${isOverdue ? 'border-l-4 border-red-500' : ''}`,
    draggable: true,
    'data-dnd-id': card.id,
    onDragStart: handleDragStart,
    onClick: handleClick
  },
    // Labels
    card.labels && card.labels.length > 0 && React.createElement('div', {
      className: "flex gap-1 mb-2"
    }, card.labels.map(color =>
      React.createElement('span', {
        key: color,
        className: `w-8 h-2 rounded-full ${color}`
      })
    )),
    // Title
    React.createElement('div', {
      className: "font-medium text-gray-900 mb-1"
    }, card.title),
    // Description preview
    card.desc && React.createElement('div', {
      className: "text-sm text-gray-600 mb-2 line-clamp-2"
    }, card.desc.substring(0, 60) + (card.desc.length > 60 ? '...' : '')),
    // Due date
    card.due && React.createElement('div', {
      className: `text-xs px-2 py-1 rounded inline-block mb-1 ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`
    }, `Due: ${new Date(card.due).toLocaleDateString()}`),
    // Checklist progress
    card.checklist && card.checklist.length > 0 && React.createElement('div', {
      className: "text-xs text-gray-500 mb-2"
    }, `☑ ${card.checklist.filter(c => c.done).length}/${card.checklist.length}`),
    // Action buttons
    React.createElement('div', {
      className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
      onClick: e => e.stopPropagation()
    },
      React.createElement('button', {
        className: "text-xs text-blue-500 hover:text-blue-700 px-1",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          onEdit();
        }
      }, "✏"),
      React.createElement('button', {
        className: "text-xs text-red-500 hover:text-red-700 px-1",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }
      }, "🗑")
    )
  );
}

// List component
export function List({ list, onAddCard, onEditCard, onDeleteCard, onEditList, onDeleteList, onMoveCard, onOpenCardModal, onCardDrop, listIdx }) {
  const [newCard, setNewCard] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);

  function handleAddCard() {
    if (newCard.trim()) {
      onAddCard(newCard.trim());
      setNewCard("");
      setIsAddingCard(false);
    }
  }

  function handleListDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId && cardId !== list.id) {
      onCardDrop(cardId, list.id);
    }
  }

  function handleCardDrop(e, targetCardIdx) {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      onCardDrop(cardId, list.id, targetCardIdx);
    }
  }

  return React.createElement('div', {
    className: "bg-gray-100 rounded-lg p-3 w-80 mr-4 flex-shrink-0 max-h-[calc(100vh-200px)] flex flex-col",
    onDragOver: e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: handleListDrop
  },
    // List header
    React.createElement('div', {
      className: "flex justify-between items-center mb-3"
    },
      React.createElement('h3', {
        className: "font-semibold text-gray-900"
      }, list.title),
      React.createElement('div', {
        className: "flex gap-1"
      },
        React.createElement('button', {
          className: "text-xs text-gray-500 hover:text-gray-700 px-1",
          onClick: onEditList
        }, "✏"),
        React.createElement('button', {
          className: "text-xs text-red-500 hover:text-red-700 px-1",
          onClick: onDeleteList
        }, "🗑")
      )
    ),
    // Cards container
    React.createElement('div', {
      className: "flex-1 overflow-y-auto space-y-2"
    },
      list.cards.map((card, idx) =>
        React.createElement('div', {
          key: card.id,
          onDragOver: e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          },
          onDrop: e => handleCardDrop(e, idx)
        },
          React.createElement(Card, {
            card,
            onEdit: () => onEditCard(idx),
            onDelete: () => onDeleteCard(idx),
            onOpenModal: () => onOpenCardModal(listIdx, idx),
            listIdx,
            cardIdx: idx
          })
        )
      )
    ),
    // Add card form
    isAddingCard ? React.createElement('form', {
      onSubmit: e => { e.preventDefault(); handleAddCard(); },
      className: "mt-3"
    },
      React.createElement('textarea', {
        className: "w-full p-2 border rounded-lg resize-none",
        placeholder: "Enter a title for this card...",
        value: newCard,
        onChange: e => setNewCard(e.target.value),
        autoFocus: true,
        rows: 3
      }),
      React.createElement('div', {
        className: "flex gap-2 mt-2"
      },
        React.createElement('button', {
          className: "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600",
          type: "submit"
        }, "Add card"),
        React.createElement('button', {
          className: "px-3 py-1 text-gray-600 hover:text-gray-800",
          type: "button",
          onClick: () => {
            setIsAddingCard(false);
            setNewCard("");
          }
        }, "✕")
      )
    ) : React.createElement('button', {
      className: "mt-3 w-full p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors",
      onClick: () => setIsAddingCard(true)
    }, "+ Add a card")
  );
}
