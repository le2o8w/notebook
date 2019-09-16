// Prevent XSS
marked.setOptions({
  sanitize: true
});

window.onload = () => {
  "use strict";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
};
const NOTES_STORAGE = "notes";
const SELECTED_ID = "currentNote";

const app = new Vue({
  el: "#app",
  name: "Notebook",
  data: {
    notes: [{id: 0, title: "Untitled", content: "# New note"}],
    selectedId: 0,
    searchText: "",
    isEditing: false
  },
  computed: {
    note() {
      for (let note of this.notes) {
        if (note.id === this.selectedId) {
          return note;
        }
      }
      // return this.notes.find(note => note.id === this.selectedId);
    },
    formatContent() {
      return marked(this.note.content);
    },
    filteredList() {
      //   if (!this.searchText) {
      //     return this.notes;
      //   } else {
      //     return this.notes.filter(note => note.title.includes(this.searchText));
      //   }

      const reg = new RegExp(this.searchText.trim().replace(/\s+/, "|"), "i");
      return this.notes.filter(note => reg.test(note.title) || reg.test(note.content));
    }
  },
  watch: {
    notes: {
      handler: "saveNote",
      deep: true
    },
    selectedId: "saveId"

    // notes(value, oldValue) {
    //     handler(value, oldValue) {
    //         this.saveNotes();
    //     },
    //  deep : true,
    // }
  },
  created() {
    this.load();
  },
  methods: {
    saveNote() {
      localStorage.setItem(NOTES_STORAGE, JSON.stringify(this.notes));
    },
    saveId() {
      localStorage.setItem(SELECTED_ID, this.selectedId);
    },
    load() {
      const data = localStorage.getItem(NOTES_STORAGE);
      if (data != null) {
        this.notes = JSON.parse(data);
      }
      const currentId = localStorage.getItem(SELECTED_ID);
      currentId ? (this.selectedId = parseInt(currentId)) : (this.selectedId = 0);
    },
    add() {
      this.isEditing = true;
      const newId = Math.max(-1, ...this.notes.map(item => item.id)) + 1;
      this.notes.push({
        id: newId,
        title: "New " + (newId + 1),
        content: "# Saisir texte"
      });
      this.selectedId = newId;
    },
    select(id = null) {
      if (id === null) {
        id = Math.min(...this.notes.map(n => n.id));
      }
      this.selectedId = id;
    },
    deleteItem() {
      const index = this.notes.findIndex(n => n.id === this.selectedId);
      this.notes.splice(index, 1);
      if (this.notes.length) {
        this.select();
      }
    },
    toggleEditor() {
      this.isEditing = !this.isEditing;
    }
  }
});
