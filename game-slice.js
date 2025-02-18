import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async () => {
    const response = await axios.get('/api/games');
    return response.data;
  }
);

export const createGameSession = createAsyncThunk(
  'games/createSession',
  async ({ gameId, settings }) => {
    const response = await axios.post('/api/games/sessions', {
      gameId,
      settings,
    });
    return response.data;
  }
);

export const joinGameSession = createAsyncThunk(
  'games/joinSession',
  async (sessionId) => {
    const response = await axios.post(`/api/games/sessions/${sessionId}/join`);
    return response.data;
  }
);

const initialState = {
  availableGames: [],
  activeSessions: [],
  currentGame: null,
  currentSession: null,
  loading: false,
  error: null,
  gameState: {
    status: 'idle',
    players: [],
    scores: {},
    round: 1,
    timeRemaining: null,
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action) => {
      state.gameState = {
        ...state.gameState,
        ...action.payload,
      };
    },
    updateScores: (state, action) => {
      state.gameState.scores = {
        ...state.gameState.scores,
        ...action.payload,
      };
    },
    setPlayers: (state, action) => {
      state.gameState.players = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.gameState.timeRemaining = action.payload;
    },
    resetGameState: (state) => {
      state.gameState = initialState.gameState;
    },
    leaveGame: (state) => {
      state.currentGame = null;
      state.currentSession = null;
      state.gameState = initialState.gameState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.availableGames = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createGameSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.activeSessions = [...state.activeSessions, action.payload];
      })
      .addCase(joinGameSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.currentGame = state.availableGames.find(
          (game) => game.id === action.payload.gameId
        );
      });
  },
});

export const {
  setGameState,
  updateScores,
  setPlayers,
  setTimeRemaining,
  resetGameState,
  leaveGame,
} = gameSlice.actions;

export default gameSlice.reducer;
