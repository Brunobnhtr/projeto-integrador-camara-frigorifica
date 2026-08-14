import { createContext, useContext } from 'react';

/**
 * Shared context for the panel canvas.
 * onTerminalClick(compNome, termNome) — called when user clicks a terminal square in read mode.
 * editMode — true when edit mode is active.
 */
export const PanelContext = createContext({ onTerminalClick: null, editMode: false });
export const usePanelContext = () => useContext(PanelContext);
