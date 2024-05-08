import { createStore } from "vuex";
import { filterNotes, findNote } from "./helperFunctions";

const localStoragePlugin = store => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('store', JSON.stringify(state));
  });
}

export const store = createStore({
  strict: true,
  state() {
    return {
      userNotes: [],
      favouriteNotes: [],
      trashedNotes: [],
      isNoteEmpty: true,
      isNoteNew: true,
      isNoteDialogVisible: false,
      noteId: "",
      noteTitle: "",
      noteText: "",
      notePreset: "important",
      noteTheme: "dark",
      noteFont: "glacial",
      noteIsFavourite: false
    }
  },

  mutations: {
    noteDialogIsVisible(state, payload) {
      state.isNoteDialogVisible = payload;
    },

    noteIsEmpty(state, payload) {
      state.isNoteEmpty = payload;
    },

    noteIsNew(state, payload) {
      state.isNoteNew = payload;
    },

    setNoteTitle(state, payload) {
      state.noteTitle = payload;
    },

    setNoteText(state, payload) {
      state.noteText = payload;
    },

    setNoteTheme(state, payload) {
      state.noteTheme = payload;
    },

    setNoteFont(state, payload) {
      state.noteFont = payload;
    },

    toggleFavourite(state) {
      state.noteIsFavourite = !state.noteIsFavourite;
    },

    setNotePreset(state, payload) {
      state.notePreset = payload;
    },

    createOrTrash(state, payload) {
      const newNote = {
        // id: new Date().toISOString(),
        id: `note-id-${new Date().getTime()}`,
        title: state.noteTitle.trim(),
        text: state.noteText,
        theme: state.noteTheme,
        font: state.noteFont,
        preset: state.notePreset,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        favourite: state.noteIsFavourite
      }

      if (payload === "create") {
        state.userNotes.unshift(newNote);
      } else if(payload === "trash"){
        state.trashedNotes.unshift(newNote);
      }
    },

    editNote(state, payload) {
      state.noteId = payload.id;
      state.noteTitle = payload.title;
      state.noteText = payload.text;
      state.noteTheme = payload.theme;
      state.notePreset = payload.preset;
      state.noteFont = payload.font;
      state.noteIsFavourite = payload.favourite;
    },

    updateNote(state) {
      const noteToUpdate = findNote(state.userNotes, state.noteId);
      Object.assign(noteToUpdate, {
        title: state.noteTitle.trim(),
        text: state.noteText,
        preset: state.notePreset,
        theme: state.noteTheme,
        font: state.noteFont,
        updateDate: new Date().toISOString(),
        favourite: state.noteIsFavourite
      });
    },

    resetNote(state) {
      state.noteId = "";
      state.noteTitle = "";
      state.noteText = "";
      state.noteTheme = "dark";
      state.noteFont = "glacial";
      state.notePreset = "important";
      state.noteIsFavourite = false;
    },

    trashNote(state) {
      const noteToTrash = findNote(state.userNotes, state.noteId);
      state.trashedNotes.unshift(noteToTrash);
      state.userNotes = filterNotes(state.userNotes, noteToTrash.id);
      state.favouriteNotes = state.userNotes.filter(note => note.favourite);
    },

    restoreNote(state) {
      const noteToRestore = findNote(state.trashedNotes, state.noteId);
      state.userNotes.unshift(noteToRestore);
      state.trashedNotes = filterNotes(state.trashedNotes, noteToRestore.id);
    },

    removeEmptyNote(state) {
      state.userNotes = filterNotes(state.userNotes, state.noteId);
    },

    deleteNotes(state, payload) {
      if (payload === "one") {
        state.trashedNotes = filterNotes(state.trashedNotes, state.noteId);
      } else if (payload === "all") {
        state.trashedNotes = [];
      }
    },

    addFavouriteNotes(state) {
      state.favouriteNotes = state.userNotes.filter(note => note.favourite);
    },

    initialiseStore(state) {
      if(localStorage.getItem('store')) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        );
      }
    }
  },

  actions: {
    moveToTrash({state, commit}) {
      if (state.isNoteNew) {
        commit("createOrTrash", "trash");
        commit("resetNote");
      } else {
        commit("updateNote");
        commit("trashNote");
      }

      commit("resetNote");
      commit("noteDialogIsVisible", false);
    },

    restoreFromTrash({commit}) {
      commit("restoreNote");
      commit("resetNote");
      commit("noteDialogIsVisible", false);
      commit("addFavouriteNotes");
    },

    exitNote({state, commit}, page) {
      if (page !== "trash") {
        if (!state.isNoteEmpty) {
          if (state.isNoteNew) {
            commit("createOrTrash", "create");
          } else {
            commit("updateNote");
          }
          commit("addFavouriteNotes");
        } else {
          if (!state.isNoteNew) {
            commit("removeEmptyNote");
            commit("addFavouriteNotes");
          }
        }
      }

      commit("resetNote");
      commit("noteDialogIsVisible", false);
    },

    emptyTrash({commit}, payload) {
      commit("deleteNotes", payload);
      commit("resetNote");
    }
  },

  plugins: [localStoragePlugin],
})
