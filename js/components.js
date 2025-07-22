import { DragAndDrop, LABEL_COLORS } from './utils.js';

const { useState } = React;

// Card component
export function Card({ card, onEdit, onDelete, listId, onCardDrop, cardIndex, isSelected, onSelect, onNavigate }) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(card.title);
  const [lastClickTime, setLastClickTime] = useState(0);
  const cardRef = React.useRef(null);

  // Focus the card when it becomes selected
  React.useEffect(() => {
    if (isSelected && cardRef.current && !isEditing) {
      cardRef.current.focus();
    }
  }, [isSelected, isEditing]);

  function handleDragStart(e) {
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleClick(e) {
    e.stopPropagation();
    if (isEditing) return;
    
    // Always select the card when clicked
    onSelect(listId, cardIndex);
    
    const now = Date.now();
    if (now - lastClickTime < 300) {
      // Double click - start editing
      setIsEditing(true);
      setEditValue(card.title);
    }
    setLastClickTime(now);
  }

  function handleKeyDown(e) {
    if (isEditing) return;
    
    if (isSelected && e.target === e.currentTarget) {
      // Handle navigation keys
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('down');
      } else if (e.key.length === 1 || e.key === 'Backspace') {
        // Start editing when typing on the selected card
        e.preventDefault();
        setIsEditing(true);
        setEditValue(e.key === 'Backspace' ? '' : e.key);
      }
    }
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  function saveEdit() {
    if (editValue.trim() && editValue.trim() !== card.title) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(card.title);
    setIsEditing(false);
  }

  function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setContextPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  }

  function handleDeleteClick() {
    onDelete();
    setShowContextMenu(false);
  }

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    if (showContextMenu) {
      const closeMenu = () => setShowContextMenu(false);
      document.addEventListener('click', closeMenu);
      return () => document.removeEventListener('click', closeMenu);
    }
  }, [showContextMenu]);

  return React.createElement('div', {
    className: "relative"
  },
    React.createElement('div', {
      className: `bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
        isEditing ? 'ring-2 ring-blue-500' : ''
      } ${
        isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''
      }`,
      draggable: !isEditing,
      onDragStart: handleDragStart,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onContextMenu: handleContextMenu,
      tabIndex: 0,
      ref: cardRef
    },
      isEditing ? React.createElement('textarea', {
        className: "w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none resize-none",
        value: editValue,
        onChange: e => setEditValue(e.target.value),
        onBlur: saveEdit,
        onKeyDown: handleEditKeyDown,
        rows: Math.max(1, editValue.split('\n').length),
        autoFocus: true
      }) : React.createElement('div', {
        className: "text-sm font-medium text-gray-900 whitespace-pre-wrap"
      }, card.title)
    ),

    // Context menu
    showContextMenu && React.createElement('div', {
      className: "fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50",
      style: {
        left: `${contextPosition.x}px`,
        top: `${contextPosition.y}px`
      }
    },
      React.createElement('button', {
        className: "w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50",
        onClick: handleDeleteClick
      }, "Delete Card")
    )
  );
}

// List component
export function List({ list, onAddCard, onEditCard, onDeleteCard, onEditList, onDeleteList, onCardDrop, selectedCard, onSelectCard, onNavigateCard }) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  function handleAddCard() {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle.trim());
      setNewCardTitle("");
      setIsAddingCard(false);
    }
  }

  function handleAddCardKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleAddCard();
    }
  }

  function handleCardDrop(e, targetCardIdx) {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('text/plain');
    onCardDrop(cardId, list.id, targetCardIdx);
  }

  function handleListDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('text/plain');
    onCardDrop(cardId, list.id);
  }

  return React.createElement('div', {
    className: "bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0 h-fit mr-4",
    onDragOver: e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: handleListDrop
  },
    // List header
    React.createElement('div', {
      className: "flex items-center justify-between mb-3"
    },
      React.createElement('h3', {
        className: "font-semibold text-gray-800"
      }, list.title),
      React.createElement('div', {
        className: "flex gap-1"
      },
        React.createElement('button', {
          className: "text-gray-500 hover:text-gray-700 text-sm",
          onClick: onEditList
        }, "✏️"),
        React.createElement('button', {
          className: "text-gray-500 hover:text-red-600 text-sm",
          onClick: onDeleteList
        }, "🗑️")
      )
    ),

    // Cards
    React.createElement('div', {
      className: "space-y-2 mb-3"
    },
      list.cards.map((card, cardIdx) =>
        React.createElement('div', {
          key: card.id,
          onDragOver: e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          },
          onDrop: e => handleCardDrop(e, cardIdx)
        },
          React.createElement(Card, {
            card,
            listId: list.id,
            cardIndex: cardIdx,
            isSelected: selectedCard && selectedCard.listId === list.id && selectedCard.cardIndex === cardIdx,
            onSelect: onSelectCard,
            onNavigate: onNavigateCard,
            onEdit: (newTitle) => onEditCard(cardIdx, newTitle),
            onDelete: () => onDeleteCard(cardIdx),
            onCardDrop: onCardDrop
          })
        )
      )
    ),

    // Add card form
    isAddingCard ? React.createElement('div', {
      className: "mt-2"
    },
      React.createElement('form', {
        onSubmit: e => { e.preventDefault(); handleAddCard(); }
      },
        React.createElement('textarea', {
          className: "w-full p-2 border rounded-lg resize-none",
          placeholder: "Enter a title for this card...",
          value: newCardTitle,
          onChange: e => setNewCardTitle(e.target.value),
          onKeyDown: handleAddCardKeyDown,
          rows: 3,
          autoFocus: true
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
              setNewCardTitle("");
            }
          }, "✕")
        )
      )
    ) : React.createElement('button', {
      className: "w-full text-left text-gray-500 hover:text-gray-700 text-sm py-2",
      onClick: () => setIsAddingCard(true)
    }, "+ Add a card")
  );
}
