import { LABEL_COLORS } from './utils.js';

const { useState } = React;

// Card Details Modal
export function CardModal({ card, onClose, onSave }) {
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.desc || "");
  const [labels, setLabels] = useState(card.labels || []);
  const [due, setDue] = useState(card.due || "");
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newCheck, setNewCheck] = useState("");

  function toggleLabel(color) {
    setLabels(labels.includes(color) ? labels.filter(l => l !== color) : [...labels, color]);
  }
  
  function toggleCheck(idx) {
    setChecklist(checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c));
  }
  
  function addCheck() {
    if (newCheck.trim()) {
      setChecklist([...checklist, { text: newCheck, done: false }]);
      setNewCheck("");
    }
  }
  
  function removeCheck(idx) {
    setChecklist(checklist.filter((_, i) => i !== idx));
  }

  return React.createElement('div', {
    className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  },
    React.createElement('div', {
      className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
    },
      React.createElement('button', {
        className: "absolute top-2 right-2 text-gray-400 hover:text-black",
        onClick: onClose
      }, "✕"),
      React.createElement('h2', {
        className: "text-xl font-bold mb-4"
      }, "Edit Card"),
      React.createElement('input', {
        className: "w-full border rounded p-2 mb-3",
        value: title,
        onChange: e => setTitle(e.target.value),
        placeholder: "Card title..."
      }),
      React.createElement('textarea', {
        className: "w-full border rounded p-2 mb-3",
        rows: 3,
        placeholder: "Description...",
        value: desc,
        onChange: e => setDesc(e.target.value)
      }),
      React.createElement('div', { className: "mb-3" },
        React.createElement('div', { className: "font-semibold mb-2" }, "Labels:"),
        React.createElement('div', { className: "flex gap-2 flex-wrap" },
          LABEL_COLORS.map(color =>
            React.createElement('button', {
              key: color,
              className: `w-8 h-8 rounded-full border-2 ${color} ${labels.includes(color) ? 'border-black' : 'border-transparent'}`,
              onClick: () => toggleLabel(color)
            })
          )
        )
      ),
      React.createElement('div', { className: "mb-3" },
        React.createElement('div', { className: "font-semibold mb-2" }, "Due Date:"),
        React.createElement('input', {
          type: "date",
          className: "border rounded p-2",
          value: due,
          onChange: e => setDue(e.target.value)
        })
      ),
      React.createElement('div', { className: "mb-4" },
        React.createElement('div', { className: "font-semibold mb-2" }, "Checklist:"),
        React.createElement('ul', { className: "mb-3 space-y-2" },
          checklist.map((item, idx) =>
            React.createElement('li', {
              key: idx,
              className: "flex items-center gap-2"
            },
              React.createElement('input', {
                type: "checkbox",
                checked: item.done,
                onChange: () => toggleCheck(idx),
                className: "rounded"
              }),
              React.createElement('span', {
                className: item.done ? 'line-through text-gray-400 flex-1' : 'flex-1'
              }, item.text),
              React.createElement('button', {
                className: "text-xs text-red-400 hover:text-red-600",
                onClick: () => removeCheck(idx)
              }, "✕")
            )
          )
        ),
        React.createElement('form', {
          onSubmit: e => { e.preventDefault(); addCheck(); },
          className: "flex gap-2"
        },
          React.createElement('input', {
            className: "border rounded p-2 flex-1",
            placeholder: "Add checklist item...",
            value: newCheck,
            onChange: e => setNewCheck(e.target.value)
          }),
          React.createElement('button', {
            className: "px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
            type: "submit"
          }, "Add")
        )
      ),
      React.createElement('div', { className: "flex gap-2 pt-2" },
        React.createElement('button', {
          className: "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
          onClick: () => onSave({ ...card, title, desc, labels, due, checklist })
        }, "Save"),
        React.createElement('button', {
          className: "px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400",
          onClick: onClose
        }, "Cancel")
      )
    )
  );
}
