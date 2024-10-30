const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = []
let itemArray = [backlogList, progressList, completeList, onHoldList]

// Drag Functionality
let draggedItem
let dragging = false
let currentColumn
let dragEventConter = 0

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ['Release the course', 'Sit back and relax'];
    progressListArray = ['Work on projects', 'Listen to music'];
    completeListArray = ['Being cool', 'Getting stuff done'];
    onHoldListArray = ['Being uncool'];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray]
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold']
  listArrays.forEach((array, index) => {
    localStorage.setItem(`${arrayNames[index]}Items`, JSON.stringify(array))
  });
}

// Create DOM Elements for each list item
function createItemEl(columnEl, column, item, index) {
  // List Item
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');
  listEl.textContent = item
  listEl.draggable = true
  listEl.setAttribute('ondragstart', 'drag(event)')
  listEl.contentEditable = true
  listEl.id = index
  listEl.setAttribute('onfocusout', `updateItem(${index}, ${column})`)
  // Appen
  columnEl.appendChild(listEl)
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns()
  }
  // Run getSavedColumns only once, Update Local Storage
  updatedOnLoad = true
  updateSavedColumns()

  // Backlog Column
  backlogList.textContent = ''
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogList, 0, backlogItem, index)
  })

  // Progress Column
  progressList.textContent = ''
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressList, 1, progressItem, index)
  })

  // Complete Column
  completeList.textContent = ''
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeList, 2, completeItem, index)
  })
  // On Hold Column
  onHoldList.textContent = ''
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldList, 3, onHoldItem, index)
  })
}

// Update Item - Delete if neccessary, or Update array Value
function updateItem(id, column) {
  const selectedArray = listArrays[column]
  const selectedCoulumnEl = listColumns[column].children
  if (!dragging) {
    if (!selectedCoulumnEl[id].textContent) {
      selectedArray.splice(id, 1)
    } else {
      selectedArray[id] = selectedCoulumnEl[id].textContent;
    }
    updateDOM()
  }
}

// When item Starts Dragging
function drag(e) {
  draggedItem = e.target
  // Dragging Start
  dragging = true
}

function dragHandler(isOnDragEnter, column) {
  if (isOnDragEnter) {
    dragEventConter++
    dragEnter(column)
  } else {
    dragEventConter--
    dragLeave(column)
  }
}

// Add to Column List, Reset Textbox
function addToColumn(column) {
  if (addItems[column].textContent !== '') {
    const itemText = addItems[column].textContent
    // addItems[column].textContent = ''
    const selectedArray = listArrays[column]
    selectedArray.push(itemText)
    updateDOM(); 
  } else {
    hideInputBoxes()
  }
}

// Show add item input Box
function showInputBox(column) {
  hideInputBoxes()
  addBtns[column].style.visibility = 'hidden'
  saveItemBtns[column].style.display = 'flex'
  addItemContainers[column].style.display = 'flex'
  addItemContainers[column].focus()
}

// Makes sure all input boxes are closed before opening a new one
function hideInputBoxes() {
  for (let i = 0; i < 4; i++) {
    addBtns[i].style.visibility = 'visible'
    saveItemBtns[i].style.display = 'none'
    addItemContainers[i].style.display = 'none'
    addItems[i].textContent = ''
  }
}

function saveInputText(column) {
  addToColumn(column)
  hideInputBoxes()
}

// Allow arrays to reflect Drag and Drop items
function rebuildArray() {
  listArrays.forEach((array, index) => {
    listArrays[index] = array
    array.length = 0
    for (let i = 0; i < itemArray[index].children.length; i++) {
      array.push(itemArray[index].children[i].textContent)    
    }
  })
  updateDOM()
}

// When item enters column area
function dragEnter(column) {
  listColumns[column].classList.add('over')
  currentColumn = column
}

function dragLeave(column) {
  if (dragEventConter === 0) {
    listColumns[column].classList.remove('over') 
  }
}

// Column Allows for item to drop
function allowDrop(e) {
  e.preventDefault()
}

// Dropping Item in Colum
function drop(e) {
  e.preventDefault()
  // Reset Drag Event Counter and remove color
  dragEventConter = 0
  dragLeave(currentColumn)
  // Add Item to Column
  const parent = listColumns[currentColumn]
  parent.appendChild(draggedItem)
  // Dragging complete
  dragging = false
  rebuildArray()
}

// On load
updateDOM()