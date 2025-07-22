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

  useEffect(() => {
    saveBoards([board]);
  }, [board]);

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

  function editCard(listIdx, cardIdx) {
    const title = prompt("Edit card title", board.lists[listIdx].cards[cardIdx].title);
    if (title && title.trim()) {
      setBoard({
        ...board,
        lists: board.lists.map((l, j) => j === listIdx ? {
          ...l,
          cards: l.cards.map((c, k) => k === cardIdx ? { ...c, title: title.trim() } : c)
        } : l)
      });
    }
  }

  function deleteCard(listIdx, cardIdx) {
    setBoard({
      ...board,
      lists: board.lists.map((l, j) => j === listIdx ? {
        ...l,
        cards: l.cards.filter((_, k) => k !== cardIdx)
      } : l)
    });
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
