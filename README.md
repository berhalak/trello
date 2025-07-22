# Trello Clone

A full-featured Trello clone built with React, JavaScript, and Tailwind CSS from CDNs. All data is stored in localStorage with no backend required.

## Features

- **Multiple Boards**: Create and manage multiple boards
- **Drag & Drop**: Drag cards between lists and reorder lists
- **Rich Cards**: Cards support:
  - Titles and descriptions
  - Color labels
  - Due dates with overdue indicators
  - Checklists with progress tracking
- **Search**: Search across all cards in a board
- **Responsive Design**: Works on desktop and mobile
- **Persistent Storage**: All data saved to localStorage
- **No Dependencies**: Uses only CDN-loaded libraries

## Getting Started

1. Open `index.html` in your web browser
2. Create your first board
3. Add lists and cards
4. Start organizing!

## File Structure

```
/trello/
├── index.html          # Main HTML file
├── js/
│   ├── main.js        # Main app component and logic
│   ├── board.js       # Board component
│   ├── components.js  # Card and List components
│   ├── modal.js       # Card details modal
│   └── utils.js       # Utilities and constants
├── dnd.js             # Drag and drop helper (legacy)
└── README.md          # This file
```

## Usage

### Creating Boards
- Click "+ Add Board" to create a new board
- Switch between boards using the tabs at the top

### Managing Lists
- Click "+ Add another list" to create a new list
- Edit or delete lists using the buttons in the list header
- Drag lists to reorder them

### Managing Cards
- Click "+ Add a card" in any list to create a new card
- Click on a card to open the details modal where you can:
  - Edit title and description
  - Add color labels
  - Set due dates
  - Create checklists
- Drag cards between lists or reorder within a list

### Search
- Use the search bar to find cards by title, description, or checklist items
- Search filters cards in real-time

## Customization

- Modify `js/utils.js` to change label colors or add new ones
- Update Tailwind classes throughout the components for different styling
- Add new features by extending the component files

## Browser Compatibility

Works in all modern browsers that support:
- ES6 modules
- localStorage
- Drag and Drop API
- React 18

## License

Open source - feel free to modify and use as needed!
