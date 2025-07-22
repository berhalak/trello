import { loadBoards, saveBoards, generateId } from './utils.js';
import { Board } from './board.js';
import { CardModal } from './modal.js';

const { useState, useEffect } = React;

// Search component
function SearchBar({ searchTerm, onSearchChange }) {
  return React.createElement('div', {
    className: "mb-4"
  },
    React.createElement('input', {
      type: "text",
      placeholder: "Search cards...",
      className: "w-full max-w-md px-3 py-2 border rounded-lg",
      value: searchTerm,
      onChange: e => onSearchChange(e.target.value)
    })
  );
}

// Main App
function App() {
  const [boards, setBoards] = useState(loadBoards());
  const [selected, setSelected] = useState(0);
  const [showBoardInput, setShowBoardInput] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    saveBoards(boards);
  }, [boards]);

  // Filter cards based on search term
  function filterBoard(board) {
    if (!searchTerm.trim()) return board;
    
    return {
      ...board,
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards.filter(card =>
          card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.desc && card.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (card.checklist && card.checklist.some(item => 
            item.text.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        )
      })).filter(list => list.cards.length > 0)
    };
  }

  // Board CRUD
  function addBoard(title) {
    const newBoard = { id: generateId(), title, lists: [] };
    setBoards([...boards, newBoard]);
    setSelected(boards.length);
  }

  function editBoard(idx) {
    const title = prompt("Edit board title", boards[idx].title);
    if (title && title.trim()) {
      setBoards(boards.map((b, i) => i === idx ? { ...b, title: title.trim() } : b));
    }
  }

  function deleteBoard(idx) {
    if (confirm("Delete this board? This action cannot be undone.")) {
      setBoards(boards.filter((_, i) => i !== idx));
      setSelected(Math.max(0, Math.min(selected, boards.length - 2)));
    }
  }

  // List CRUD
  function addList(listTitle) {
    setBoards(boards.map((b, i) => i === selected ? {
      ...b,
      lists: [...b.lists, { id: generateId(), title: listTitle, cards: [] }]
    } : b));
  }

  function editList(listIdx) {
    const title = prompt("Edit list title", boards[selected].lists[listIdx].title);
    if (title && title.trim()) {
      setBoards(boards.map((b, i) => i === selected ? {
        ...b,
        lists: b.lists.map((l, j) => j === listIdx ? { ...l, title: title.trim() } : l)
      } : b));
    }
  }

  function deleteList(listIdx) {
    if (confirm("Delete this list and all its cards?")) {
      setBoards(boards.map((b, i) => i === selected ? {
        ...b,
        lists: b.lists.filter((_, j) => j !== listIdx)
      } : b));
    }
  }

  function moveList(listIdx, dir) {
    setBoards(boards.map((b, i) => {
      if (i !== selected) return b;
      const lists = [...b.lists];
      const [moved] = lists.splice(listIdx, 1);
      lists.splice(listIdx + dir, 0, moved);
      return { ...b, lists };
    }));
  }

  // Card CRUD
  function addCard(listIdx, cardTitle) {
    setBoards(boards.map((b, i) => i === selected ? {
      ...b,
      lists: b.lists.map((l, j) => j === listIdx ? {
        ...l,
        cards: [...l.cards, {
          id: generateId(),
          title: cardTitle,
          desc: '',
          labels: [],
          checklist: [],
          due: ''
        }]
      } : l)
    } : b));
  }

  function editCard(listIdx, cardIdx) {
    const title = prompt("Edit card title", boards[selected].lists[listIdx].cards[cardIdx].title);
    if (title && title.trim()) {
      setBoards(boards.map((b, i) => i === selected ? {
        ...b,
        lists: b.lists.map((l, j) => j === listIdx ? {
          ...l,
          cards: l.cards.map((c, k) => k === cardIdx ? { ...c, title: title.trim() } : c)
        } : l)
      } : b));
    }
  }

  function deleteCard(listIdx, cardIdx) {
    if (confirm("Delete this card?")) {
      setBoards(boards.map((b, i) => i === selected ? {
        ...b,
        lists: b.lists.map((l, j) => j === listIdx ? {
          ...l,
          cards: l.cards.filter((_, k) => k !== cardIdx)
        } : l)
      } : b));
    }
  }

  function moveCard(listIdx, cardIdx, dir) {
    setBoards(boards.map((b, i) => {
      if (i !== selected) return b;
      const lists = [...b.lists];
      const cards = [...lists[listIdx].cards];
      const [moved] = cards.splice(cardIdx, 1);
      cards.splice(cardIdx + dir, 0, moved);
      lists[listIdx] = { ...lists[listIdx], cards };
      return { ...b, lists };
    }));
  }

  // Card Modal
  function openCardModal(listIdx, cardIdx) {
    setModal({ listIdx, cardIdx });
  }

  function saveCardModal(data) {
    setBoards(boards.map((b, i) => i === selected ? {
      ...b,
      lists: b.lists.map((l, j) => j === modal.listIdx ? {
        ...l,
        cards: l.cards.map((c, k) => k === modal.cardIdx ? data : c)
      } : l)
    } : b));
    setModal(null);
  }

  // Drag and drop
  function onCardDrop(cardId, targetListId, targetCardIdx) {
    setBoards(boards.map((b, i) => {
      if (i !== selected) return b;
      
      let card, fromListIdx, fromCardIdx;
      b.lists.forEach((l, li) => {
        l.cards.forEach((c, ci) => {
          if (c.id == cardId) {
            card = c;
            fromListIdx = li;
            fromCardIdx = ci;
          }
        });
      });
      
      if (!card) return b;
      
      let lists = b.lists.map(l => ({ ...l, cards: [...l.cards] }));
      lists[fromListIdx].cards.splice(fromCardIdx, 1);
      
      const toIdx = lists.findIndex(l => l.id == targetListId);
      if (toIdx === -1) return b;
      
      if (typeof targetCardIdx === 'number') {
        lists[toIdx].cards.splice(targetCardIdx, 0, card);
      } else {
        lists[toIdx].cards.push(card);
      }
      
      return { ...b, lists };
    }));
  }

  function onListDrop(listId) {
    setBoards(boards.map((b, i) => {
      if (i !== selected) return b;
      const idx = b.lists.findIndex(l => l.id == listId);
      if (idx === -1) return b;
      const lists = [...b.lists];
      const [moved] = lists.splice(idx, 1);
      lists.push(moved);
      return { ...b, lists };
    }));
  }

  const currentBoard = boards[selected];
  const displayBoard = currentBoard ? filterBoard(currentBoard) : null;

  return React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  },
    React.createElement('div', {
      className: "max-w-7xl mx-auto"
    },
      // Header
      React.createElement('header', {
        className: "mb-6"
      },
        React.createElement('h1', {
          className: "text-4xl font-bold text-center text-gray-900 mb-6"
        }, "Trello Clone"),
        
        // Board tabs
        React.createElement('div', {
          className: "flex gap-2 mb-4 flex-wrap justify-center"
        },
          boards.map((b, i) =>
            React.createElement('button', {
              key: b.id,
              className: `px-4 py-2 rounded-lg font-medium transition-colors ${
                i === selected 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`,
              onClick: () => setSelected(i)
            }, b.title)
          ),
          React.createElement('button', {
            className: "px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors",
            onClick: () => setShowBoardInput(true)
          }, "+ Add Board")
        ),

        // Search bar
        currentBoard && React.createElement(SearchBar, {
          searchTerm,
          onSearchChange: setSearchTerm
        })
      ),

      // Add board form
      showBoardInput && React.createElement('form', {
        className: "mb-6 flex gap-2 justify-center",
        onSubmit: e => {
          e.preventDefault();
          if (boardTitle.trim()) {
            addBoard(boardTitle.trim());
            setBoardTitle("");
            setShowBoardInput(false);
          }
        }
      },
        React.createElement('input', {
          className: "px-3 py-2 border rounded-lg w-64",
          placeholder: "Board title...",
          value: boardTitle,
          onChange: e => setBoardTitle(e.target.value),
          autoFocus: true
        }),
        React.createElement('button', {
          className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",
          type: "submit"
        }, "Add"),
        React.createElement('button', {
          className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400",
          type: "button",
          onClick: () => setShowBoardInput(false)
        }, "Cancel")
      ),

      // Main content
      displayBoard ? React.createElement(Board, {
        board: displayBoard,
        onAddList: addList,
        onEditList: editList,
        onDeleteList: deleteList,
        onAddCard: addCard,
        onEditCard: editCard,
        onDeleteCard: deleteCard,
        onMoveCard: moveCard,
        onEditBoard: () => editBoard(selected),
        onDeleteBoard: () => deleteBoard(selected),
        onMoveList: moveList,
        onOpenCardModal: openCardModal,
        onCardDrop: onCardDrop,
        onListDrop: onListDrop
      }) : React.createElement('div', {
        className: "text-center text-gray-500 py-12"
      },
        React.createElement('p', {
          className: "text-xl"
        }, "No boards yet. Create your first board to get started!")
      ),

      // Modal
      modal && currentBoard && currentBoard.lists[modal.listIdx] && currentBoard.lists[modal.listIdx].cards[modal.cardIdx] && React.createElement(CardModal, {
        card: currentBoard.lists[modal.listIdx].cards[modal.cardIdx],
        onClose: () => setModal(null),
        onSave: saveCardModal
      })
    )
  );
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
