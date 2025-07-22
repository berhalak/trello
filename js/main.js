import { loadBoards, saveBoards, generateId } from './utils.js';
import { Board } from './board.js';

const { useState, useEffect } = React;

// Main App
function App() {
  const [board, setBoard] = useState(() => {
    const saved = loadBoards();
    return saved.length > 0 ? saved[0] : { 
      id: generateId(), 
      title: 'My Board', 
      lists: [
        { id: generateId(), title: 'To Do', cards: [] },
        { id: generateId(), title: 'Doing', cards: [] },
        { id: generateId(), title: 'Done', cards: [] }
      ]
    };
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    saveBoards([board]);
  }, [board]);

  // Global keyboard handler for quick task entry
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      // Only handle if no card is selected but a list is selected, and focus is on body
      if (!selectedCard && selectedList && document.activeElement === document.body) {
        if (e.key.length === 1 || e.key === 'Backspace') {
          e.preventDefault();
          const listIdx = board.lists.findIndex(l => l.id === selectedList);
          if (listIdx !== -1) {
            startQuickAdd(listIdx, e.key === 'Backspace' ? '' : e.key);
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedCard, selectedList, board.lists]);

  function startQuickAdd(listIdx, initialChar) {
    // This will be handled by the List component
    const event = new CustomEvent('startQuickAdd', { 
      detail: { listIdx, initialChar } 
    });
    document.dispatchEvent(event);
  }

  // List CRUD
  function addList(listTitle) {
    setBoard({
      ...board,
      lists: [...board.lists, { id: generateId(), title: listTitle, cards: [] }]
    });
  }

  function editList(listIdx) {
    const title = prompt("Edit list title", board.lists[listIdx].title);
    if (title && title.trim()) {
      setBoard({
        ...board,
        lists: board.lists.map((l, j) => j === listIdx ? { ...l, title: title.trim() } : l)
      });
    }
  }

  function deleteList(listIdx) {
    if (confirm("Delete this list and all its cards?")) {
      setBoard({
        ...board,
        lists: board.lists.filter((_, j) => j !== listIdx)
      });
    }
  }

  // Card CRUD
  function addCard(listIdx, cardTitle) {
    setBoard({
      ...board,
      lists: board.lists.map((l, j) => j === listIdx ? {
        ...l,
        cards: [...l.cards, {
          id: generateId(),
          title: cardTitle
        }]
      } : l)
    });
  }

  function editCard(listIdx, cardIdx, newTitle) {
    if (newTitle && newTitle.trim()) {
      setBoard({
        ...board,
        lists: board.lists.map((l, j) => j === listIdx ? {
          ...l,
          cards: l.cards.map((c, k) => k === cardIdx ? { ...c, title: newTitle.trim() } : c)
        } : l)
      });
    }
  }

  function deleteCard(listIdx, cardIdx) {
    // Clear selection if we're deleting the selected card
    if (selectedCard && 
        selectedCard.listId === board.lists[listIdx].id && 
        selectedCard.cardIndex === cardIdx) {
      setSelectedCard(null);
    } else if (selectedCard && 
               selectedCard.listId === board.lists[listIdx].id && 
               selectedCard.cardIndex > cardIdx) {
      // Adjust selection index if deleting a card before the selected one
      setSelectedCard({
        ...selectedCard,
        cardIndex: selectedCard.cardIndex - 1
      });
    }
    
    setBoard({
      ...board,
      lists: board.lists.map((l, j) => j === listIdx ? {
        ...l,
        cards: l.cards.filter((_, k) => k !== cardIdx)
      } : l)
    });
  }

  // Card selection and navigation
  function selectCard(listId, cardIndex) {
    setSelectedCard({ listId, cardIndex });
    setSelectedList(listId); // Always set active lane when selecting a card
  }

  function clearCardSelection() {
    setSelectedCard(null);
    // Keep selectedList (active lane) when clearing card selection
  }

  function setActiveLane(listId) {
    setSelectedList(listId);
  }

  function navigateCard(direction) {
    if (direction === 'clear') {
      setSelectedCard(null);
      return;
    }
    
    if (!selectedCard) return;
    
    const currentListIdx = board.lists.findIndex(l => l.id === selectedCard.listId);
    if (currentListIdx === -1) return;
    
    const currentList = board.lists[currentListIdx];
    const card = currentList.cards[selectedCard.cardIndex];
    if (!card) return;
    
    let newBoard = { ...board };
    let newSelection = { ...selectedCard };
    
    switch (direction) {
      case 'up':
        // Move card up in the same list
        if (selectedCard.cardIndex > 0) {
          const lists = newBoard.lists.map(l => ({ ...l, cards: [...l.cards] }));
          const cards = lists[currentListIdx].cards;
          // Swap with card above
          [cards[selectedCard.cardIndex], cards[selectedCard.cardIndex - 1]] = 
          [cards[selectedCard.cardIndex - 1], cards[selectedCard.cardIndex]];
          newBoard.lists = lists;
          newSelection.cardIndex = selectedCard.cardIndex - 1;
        }
        break;
        
      case 'down':
        // Move card down in the same list
        if (selectedCard.cardIndex < currentList.cards.length - 1) {
          const lists = newBoard.lists.map(l => ({ ...l, cards: [...l.cards] }));
          const cards = lists[currentListIdx].cards;
          // Swap with card below
          [cards[selectedCard.cardIndex], cards[selectedCard.cardIndex + 1]] = 
          [cards[selectedCard.cardIndex + 1], cards[selectedCard.cardIndex]];
          newBoard.lists = lists;
          newSelection.cardIndex = selectedCard.cardIndex + 1;
        }
        break;
        
      case 'left':
        // Move card to the list on the left
        if (currentListIdx > 0) {
          const lists = newBoard.lists.map(l => ({ ...l, cards: [...l.cards] }));
          // Remove card from current list
          const [movedCard] = lists[currentListIdx].cards.splice(selectedCard.cardIndex, 1);
          // Add to the end of the left list
          lists[currentListIdx - 1].cards.push(movedCard);
          newBoard.lists = lists;
          newSelection = {
            listId: board.lists[currentListIdx - 1].id,
            cardIndex: lists[currentListIdx - 1].cards.length - 1
          };
          // Set the target lane as active
          setSelectedList(board.lists[currentListIdx - 1].id);
        }
        break;
        
      case 'right':
        // Move card to the list on the right
        if (currentListIdx < board.lists.length - 1) {
          const lists = newBoard.lists.map(l => ({ ...l, cards: [...l.cards] }));
          // Remove card from current list
          const [movedCard] = lists[currentListIdx].cards.splice(selectedCard.cardIndex, 1);
          // Add to the end of the right list
          lists[currentListIdx + 1].cards.push(movedCard);
          newBoard.lists = lists;
          newSelection = {
            listId: board.lists[currentListIdx + 1].id,
            cardIndex: lists[currentListIdx + 1].cards.length - 1
          };
          // Set the target lane as active
          setSelectedList(board.lists[currentListIdx + 1].id);
        }
        break;
    }
    
    setBoard(newBoard);
    setSelectedCard(newSelection);
  }

  // Drag and drop
  function onCardDrop(cardId, targetListId, targetCardIdx) {
    let card, fromListIdx, fromCardIdx;
    board.lists.forEach((l, li) => {
      l.cards.forEach((c, ci) => {
        if (c.id === cardId) {
          card = c;
          fromListIdx = li;
          fromCardIdx = ci;
        }
      });
    });
    
    if (!card) return;
    
    let lists = board.lists.map(l => ({ ...l, cards: [...l.cards] }));
    
    // Remove card from source
    lists[fromListIdx].cards.splice(fromCardIdx, 1);
    
    // Find target list
    const toIdx = lists.findIndex(l => l.id === targetListId);
    if (toIdx === -1) return;
    
    // Insert card at target position
    if (typeof targetCardIdx === 'number' && targetCardIdx >= 0) {
      lists[toIdx].cards.splice(targetCardIdx, 0, card);
    } else {
      lists[toIdx].cards.push(card);
    }
    
    setBoard({ ...board, lists });
  }

  return React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  },
    React.createElement('div', {
      className: "max-w-full"
    },
      // Header
      React.createElement('header', {
        className: "mb-6"
      },
        React.createElement('h1', {
          className: "text-4xl font-bold text-gray-900 mb-2"
        }, board.title)
      ),

      // Main content
      React.createElement(Board, {
        board: board,
        selectedCard: selectedCard,
        selectedList: selectedList,
        onSelectCard: selectCard,
        onClearCardSelection: clearCardSelection,
        onSetActiveLane: setActiveLane,
        onNavigateCard: navigateCard,
        onAddList: addList,
        onEditList: editList,
        onDeleteList: deleteList,
        onAddCard: addCard,
        onEditCard: editCard,
        onDeleteCard: deleteCard,
        onCardDrop: onCardDrop
      })
    )
  );
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
